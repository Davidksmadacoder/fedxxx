"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Loader, Alert, Progress } from "@mantine/core";
import {
  MdSearch,
  MdLocationOn,
  MdLocalShipping,
  MdCheckCircle,
  MdSchedule,
  MdDirectionsCar,
  MdWarehouse,
  MdAssignment,
  MdErrorOutline,
  MdRefresh,
} from "react-icons/md";
import dynamic from "next/dynamic";
import Layout1 from "@/components/layout/Layout1";
import Input1 from "@/components/ui/input/Input1";
import Button1 from "@/components/ui/button/Button1";
import { api } from "@/api/axios";
import toast from "react-hot-toast";
import { IParcel } from "@/lib/models/parcel.model";
import { ShipmentStatus } from "@/lib/enums/shipment.enum";
import { IssuesApi } from "@/api/issues.api";
import { IIssue } from "@/lib/models/issue.model";
import { IssueType, IssueStatus } from "@/lib/enums/issueType.enum";
import { Badge } from "@/components/ui/badge/Badge";
import { Button } from "@/components/ui/button/Button";
import Link from "next/link";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCopy,
  FaUpload,
  FaMoneyBillWave,
  FaTrash,
} from "react-icons/fa";
import { handleApiError } from "@/utils/error-handler";
import { PaymentMethodsApi } from "@/api/paymentMethods.api";
import { IPaymentMethod } from "@/lib/models/paymentMethod.model";
import { PaymentMethodType } from "@/lib/enums/paymentMethodType.enum";
import { Modal } from "@/components/ui/modal/Modal";
import { Select } from "@/components/ui/select/Select";
import { TextInput } from "@/components/ui/input/TextInput";
import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";
import { Card } from "@/components/ui/card/Card";
import SmartsuppChat from "@/components/features/SmartsuppChat";

// Client-only map
const TrackingMap = dynamic(() => import("@/components/features/TrackingMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
            <Loader size="lg" />
        </div>
    ),
});

/* -------------------------------- SafeImage -------------------------------- */
const FALLBACK_SVG =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="18" font-family="Arial, sans-serif">
        Image unavailable
      </text>
    </svg>`
    );

function SafeImage({
    src,
    alt,
    className = "",
    height = 200,
}: {
    src: string;
    alt: string;
    className?: string;
    height?: number;
}) {
    const [imgSrc, setImgSrc] = useState(src);
    useEffect(() => setImgSrc(src), [src]);
    return (
        <img
            src={imgSrc}
            alt={alt}
            loading="lazy"
            onError={() => setImgSrc(FALLBACK_SVG)}
            className={`w-full rounded-xl object-cover !filter-none !invert-0 !mix-blend-normal ${className}`}
            style={{ height }}
        />
    );
}

/* ---------------------------- Status presentation --------------------------- */
const statusConfig = {
    PENDING: { color: "bg-yellow-500", icon: MdSchedule, label: "Pending" },
    DISPATCHED: { color: "bg-blue-500", icon: MdDirectionsCar, label: "Dispatched" },
    IN_TRANSIT: { color: "bg-orange-500", icon: MdLocalShipping, label: "In Transit" },
    ARRIVED: { color: "bg-purple-500", icon: MdWarehouse, label: "Arrived" },
    CUSTOMS: { color: "bg-red-500", icon: MdWarehouse, label: "Customs Clearance" },
    DELIVERED: { color: "bg-green-500", icon: MdCheckCircle, label: "Delivered" },
    CANCELLED: { color: "bg-gray-500", icon: MdCheckCircle, label: "Cancelled" },
} as const;

/* -------------------------------- Utilities -------------------------------- */
const formatDate = (date: string | Date) =>
    new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));

const formatMoney = (n: number) => {
    const v = Number.isFinite(n) ? n : 0;
    return `$${v.toFixed(2)}`;
};

const normalizeImages = (arr: any[] | undefined | null): string[] =>
    (arr || [])
        .map((x: any) => (typeof x === "string" ? x : x?.url))
        .filter(Boolean);

const normalizeRoutes = (arr: any[] | undefined | null) =>
    (arr || [])
        .map((r: any) => ({
            latitude: Number(r?.latitude),
            longitude: Number(r?.longitude),
            timestamp: r?.timestamp,
            _id: r?._id,
            visible: r?.visible !== false, // default to visible
            sendEmail: Boolean(r?.sendEmail ?? r?.sentEmail),
        }))
        .filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude));

const normalizeSendEmailFlag = (t: any) => Boolean(t?.sendEmail ?? t?.sentEmail);

const transportDisplay = (tm: any) => {
    if (!tm) return { name: "—", type: "—" };
    if (typeof tm === "string") return { name: tm, type: "—" };
    return { name: tm?.name ?? "—", type: tm?.type ?? "—" };
};

function isLikelyImageFile(file: File) {
    return file.type.startsWith("image/");
}

/* -------------------------------- Component -------------------------------- */
export default function TrackingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [parcelData, setParcelData] = useState<IParcel | null>(null);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<IIssue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [backgroundAttachment, setBackgroundAttachment] = useState<"fixed" | "scroll">("scroll");

  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedIssueForPayment, setSelectedIssueForPayment] = useState<IIssue | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<IPaymentMethod | null>(null);

  // Proof of payment upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [proofOfPaymentFile, setProofOfPaymentFile] = useState<File | null>(null);
  const [proofOfPaymentUrl, setProofOfPaymentUrl] = useState<string>("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const [uploadPct, setUploadPct] = useState<number>(0);

  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [copySuccess, setCopySuccess] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      trackingId: "",
    },
  });

  const trackingId = watch("trackingId");

    const fetchIssues = async (parcelId: string) => {
        setLoadingIssues(true);
        try {
            const issuesList = await IssuesApi.getByParcel(parcelId);
            setIssues(issuesList.filter((issue) => issue.showToCustomer));
        } catch (error) {
            console.error("Failed to fetch issues:", error);
        } finally {
            setLoadingIssues(false);
        }
    };

    const getIssueTypeColor = (type: IssueType): string => {
        const colors: Record<string, string> = {
            ADDRESS_RECIPIENT: "red",
            PICKUP: "yellow",
            PACKAGING_DAMAGE: "orange",
            PROHIBITED_RESTRICTED: "red",
            PAYMENT_FRAUD: "red",
            OPERATIONAL_HUB: "blue",
            DELIVERY_PROOF: "yellow",
            RETURNS: "purple",
            INSURANCE_CLAIMS: "blue",
            COMPLIANCE: "orange",
            PARTNER_LINEHAUL: "blue",
            TECH_RELIABILITY: "purple",
            OTHER: "gray",
        };
        return colors[type] || "gray";
    };

    const getIssueStatusIcon = (status: IssueStatus) => {
        switch (status) {
            case IssueStatus.RESOLVED:
                return <FaCheckCircle className="text-green-500" size={16} />;
            case IssueStatus.IN_PROGRESS:
                return <FaClock className="text-yellow-500" size={16} />;
            case IssueStatus.CLOSED:
                return <FaTimesCircle className="text-gray-500" size={16} />;
            default:
                return <FaExclamationTriangle className="text-red-500" size={16} />;
        }
    };

    const handleTrack = async (data: { trackingId: string }) => {
        if (!data.trackingId?.trim()) return;

        setIsLoading(true);
        setError("");
        setParcelData(null);

        try {
            const res = await api.get(`/tracking/${encodeURIComponent(data.trackingId.trim())}`);
            const parcel: IParcel = res.data.parcel;
            setParcelData(parcel);

            // Fetch issues for this parcel
            if (parcel._id) {
                fetchIssues(parcel._id.toString());
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                "Tracking ID not found. Please check your tracking number and try again.";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        const IconComponent = (statusConfig as any)[status]?.icon || MdSchedule;
        return <IconComponent className="text-white" size={20} />;
    };

    const getProgressPercentage = () => {
        if (!parcelData) return 0;
        const statusOrder = ["PENDING", "DISPATCHED", "IN_TRANSIT", "ARRIVED", "CUSTOMS", "DELIVERED"];
        const idx = statusOrder.indexOf(String(parcelData.currentStatus));
        if (idx < 0) return 10;
        return Math.max(10, ((idx + 1) / statusOrder.length) * 100);
    };

    const requiresCustomsClearance = useMemo(() => {
        if (!parcelData) return false;
        if (parcelData.currentStatus === ShipmentStatus.CUSTOMS) return true;
        return (parcelData.timelines || []).some((t: any) => t?.status === ShipmentStatus.CUSTOMS);
    }, [parcelData]);

    const handleCopy = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess((prev) => ({ ...prev, [key]: true }));
            toast.success("Copied to clipboard!");
            setTimeout(() => {
                setCopySuccess((prev) => ({ ...prev, [key]: false }));
            }, 1500);
        } catch (error) {
            toast.error("Failed to copy");
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const methods = await PaymentMethodsApi.getActive();

            // Extra safety: only show active ones (in case API returns mixed)
            const active = (methods || []).filter((m) => m?.status !== false);
            setPaymentMethods(active);

            if (active.length > 0) {
                const defaultMethod = active.find((pm) => pm.isDefault);
                setSelectedPaymentMethodId(
                    defaultMethod?._id.toString() || active[0]._id.toString()
                );
            } else {
                setSelectedPaymentMethodId("");
            }
        } catch (error) {
            console.error("Failed to fetch payment methods:", error);
            setPaymentMethods([]);
            setSelectedPaymentMethodId("");
        }
    };

    // Only set client-side values after mount to prevent hydration mismatch
    useEffect(() => {
        setIsClient(true);
        const updateBackgroundAttachment = () => {
            setBackgroundAttachment(window.innerWidth >= 1024 ? "fixed" : "scroll");
        };
        updateBackgroundAttachment();
        window.addEventListener("resize", updateBackgroundAttachment);
        return () => window.removeEventListener("resize", updateBackgroundAttachment);
    }, []);

    useEffect(() => {
        if (paymentModalOpen) fetchPaymentMethods();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentModalOpen]);

    useEffect(() => {
        if (selectedPaymentMethodId) {
            const method = paymentMethods.find((pm) => pm._id.toString() === selectedPaymentMethodId);
            setSelectedPaymentMethod(method || null);
        } else {
            setSelectedPaymentMethod(null);
        }
    }, [selectedPaymentMethodId, paymentMethods]);

    const resetPaymentModalState = () => {
        setPaymentModalOpen(false);
        setSelectedIssueForPayment(null);
        setSelectedPaymentMethodId("");
        setSelectedPaymentMethod(null);
        setProofOfPaymentFile(null);
        setProofOfPaymentUrl("");
        setUploadingProof(false);
        setUploadPct(0);
        setCopySuccess({});
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const validateProofFile = (file: File) => {
        // Keep it strict + professional
        const MAX_MB = 10;
        const maxBytes = MAX_MB * 1024 * 1024;

        if (!isLikelyImageFile(file)) {
            toast.error("Please upload an image file (JPG, PNG, WEBP).");
            return false;
        }
        if (file.size > maxBytes) {
            toast.error(`Image is too large. Max size is ${MAX_MB}MB.`);
            return false;
        }
        return true;
    };

    const handleProofUpload = async (file: File) => {
        if (!validateProofFile(file)) return;

        setUploadingProof(true);
        setUploadPct(0);

        try {
            const result = await uploadToCloudinary(file, {
                onProgress: (pct) => setUploadPct(pct),
            });

            setProofOfPaymentUrl(result.url);
            toast.success("Proof of payment uploaded successfully");
        } catch (error) {
            // Most common reason in Next.js: missing NEXT_PUBLIC_ env vars or invalid preset
            handleApiError(
                error,
                "Failed to upload proof of payment. Please try again or paste a direct image URL."
            );
            setProofOfPaymentUrl("");
        } finally {
            setUploadingProof(false);
            setTimeout(() => setUploadPct(0), 600);
        }
    };

    const handleSubmitPayment = async () => {
        if (!selectedIssueForPayment) {
            toast.error("No issue selected.");
            return;
        }
        if (!selectedPaymentMethodId) {
            toast.error("Please select a payment method.");
            return;
        }
        if (!proofOfPaymentUrl?.trim()) {
            toast.error("Please upload proof of payment or paste a valid image URL.");
            return;
        }

        setSubmittingPayment(true);
        try {
            await IssuesApi.submitPayment(
                selectedIssueForPayment._id.toString(),
                selectedPaymentMethodId,
                proofOfPaymentUrl.trim()
            );

            toast.success("Payment submitted successfully! Awaiting admin verification.");

            // Refresh issues
            if (parcelData) await fetchIssues(parcelData._id.toString());

            // Close + reset modal
            resetPaymentModalState();
        } catch (error) {
            handleApiError(error, "Failed to submit payment.");
        } finally {
            setSubmittingPayment(false);
        }
    };

    // Normalize data from API
    const mapRoutes = useMemo(
        () => normalizeRoutes((parcelData as any)?.liveRoutes).filter((r) => r.visible),
        [parcelData]
    );
    const images = useMemo(() => normalizeImages((parcelData as any)?.imageUrls), [parcelData]);
    const { name: carrierName, type: carrierType } = transportDisplay((parcelData as any)?.transportMeans);

    // Payment calculation variables
    const paymentFeePercent = selectedPaymentMethod?.fee || 0; // assumed percent
    const resolutionAmount = selectedIssueForPayment?.resolutionAmount || 0;
    const paymentFeeAmount = resolutionAmount > 0 ? (resolutionAmount * paymentFeePercent) / 100 : 0;
    const totalAmount = resolutionAmount + paymentFeeAmount;

    /* ------------------------ Payment Method Detail UI ------------------------ */
    const FieldRow = ({
        label,
        value,
        copyKey,
        mono,
    }: {
        label: string;
        value?: string | number | null;
        copyKey: string;
        mono?: boolean;
    }) => {
        const v = value === undefined || value === null || String(value).trim() === "" ? "—" : String(value);

        return (
            <div className="flex items-start justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
                    <p
                        className={`font-medium text-gray-900 dark:text-white break-words ${mono ? "font-mono text-sm" : ""
                            }`}
                    >
                        {v}
                    </p>
                </div>

                <Button
                    type="button"
                    variant="subtle"
                    size="xs"
                    onClick={() => (v === "—" ? toast.error("Nothing to copy") : handleCopy(v, copyKey))}
                    leftSection={copySuccess[copyKey] ? <FaCheckCircle size={12} /> : <FaCopy size={12} />}
                >
                    {copySuccess[copyKey] ? "Copied" : "Copy"}
                </Button>
            </div>
        );
    };

    const PaymentDetailsCard = ({ pm }: { pm: IPaymentMethod }) => {
        return (
            <Card className="border border-gray-200 dark:border-gray-700" withBorder>
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Payment Details</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Use the details below to complete your payment, then upload your proof.
                            </p>
                        </div>
                        <Badge color={pm.status ? "green" : "red"} variant="light" size="sm">
                            {pm.status ? "Active" : "Inactive"}
                        </Badge>
                    </div>

                    {/* Common helpful fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FieldRow
                            label="Processing Time"
                            value={pm.processingTime || "—"}
                            copyKey="processingTime"
                        />
                        {/* <FieldRow
                            label="Fee"
                            value={pm.fee ? `${pm.fee}%` : "0%"}
                            copyKey="fee"
                        /> */}
                    </div>

                    <div className="space-y-3">
                        {pm.type === PaymentMethodType.CRYPTO_WALLET && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FieldRow
                                        label="Cryptocurrency"
                                        value={pm.cryptocurrency}
                                        copyKey="cryptocurrency"
                                    />
                                    <FieldRow label="Network" value={pm.network} copyKey="network" />
                                </div>

                                <FieldRow
                                    label="Wallet Address"
                                    value={pm.walletAddress}
                                    copyKey="walletAddress"
                                    mono
                                />

                                {pm.qrCode && (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">QR Code</p>
                                                <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                    Scan to pay
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="subtle"
                                                size="xs"
                                                onClick={() => handleCopy(pm.qrCode as any, "qrCode")}
                                                leftSection={copySuccess.qrCode ? <FaCheckCircle size={12} /> : <FaCopy size={12} />}
                                            >
                                                {copySuccess.qrCode ? "Copied" : "Copy Link"}
                                            </Button>
                                        </div>
                                        <SafeImage src={pm.qrCode} alt="Crypto QR Code" height={180} className="max-w-[320px]" />
                                    </div>
                                )}
                            </>
                        )}

                        {pm.type === PaymentMethodType.BANK_ACCOUNT && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FieldRow label="Bank Name" value={pm.bankName} copyKey="bankName" />
                                    <FieldRow label="Account Name" value={pm.accountName} copyKey="accountName" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FieldRow
                                        label="Account Number"
                                        value={pm.accountNumber}
                                        copyKey="accountNumber"
                                        mono
                                    />
                                    <FieldRow
                                        label="Routing Number"
                                        value={pm.routingNumber}
                                        copyKey="routingNumber"
                                        mono
                                    />
                                </div>

                                <FieldRow label="SWIFT Code" value={pm.swiftCode} copyKey="swiftCode" mono />
                            </>
                        )}

                        {pm.type === PaymentMethodType.MOBILE_PAYMENT && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FieldRow label="Provider" value={pm.provider} copyKey="provider" />
                                    <FieldRow label="Handle" value={pm.handle} copyKey="handle" mono />
                                </div>
                                <FieldRow label="Email" value={pm.email} copyKey="email" />
                            </>
                        )}
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <Layout1>
            {/* Smartsupp live chat widget */}
            <SmartsuppChat />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Hero */}
                <section className="relative py-24 lg:py-32 overflow-hidden min-h-[700px] flex items-center">
                    {/* Background Image with proper fallback */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: "url('/images/tracking.jpg')",
                            backgroundAttachment: isClient ? backgroundAttachment : "scroll",
                            backgroundSize: "cover",
                        }}
                    >
                        {/* Dim overlay to make image visible while keeping text readable */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                        {/* Subtle pattern overlay */}
                        <div className="absolute inset-0 bg-[url('/images/shape/grid-01.svg')] opacity-[0.05]"></div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-20 left-0 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-[var(--accent-primary-on-dark)]/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-0 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                        {/* Hero Content */}
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-white/90 text-sm font-medium">Real-time Tracking Available</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
                                Track Your{" "}
                                <span
                                    style={{ color: "var(--accent-primary-on-dark)" }}
                                    className="bg-gradient-to-r from-[var(--accent-primary-on-dark)] to-[var(--accent-secondary-on-dark)] bg-clip-text text-transparent"
                                >
                                    Shipment
                                </span>
                            </h1>
                            <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 mb-4 max-w-3xl mx-auto leading-relaxed">
                                Enter your tracking number to see live route points, timeline, and delivery estimate.
                            </p>
                            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
                                Get real-time updates on your package location and delivery status
                            </p>
                        </div>

                        {/* Main Card */}
                        <div className="max-w-5xl mx-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-3xl border border-white/40 dark:border-gray-700/50 shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
                            <div className="p-8 lg:p-10">
                                {/* Top summary */}
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-16 h-16 ${parcelData
                                                    ? (statusConfig as any)[parcelData.currentStatus]?.color
                                                    : "bg-gradient-to-br from-gray-400 to-gray-500"
                                                } rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110`}
                                        >
                                            {parcelData ? (
                                                getStatusIcon(String(parcelData.currentStatus))
                                            ) : (
                                                <MdSearch className="text-white" size={24} />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {parcelData
                                                        ? (statusConfig as any)[parcelData.currentStatus]?.label ||
                                                        parcelData.currentStatus
                                                        : "Enter Tracking ID"}
                                                </h2>
                                                {parcelData && (
                                                    <Badge
                                                        color="blue"
                                                        variant="filled"
                                                        size="lg"
                                                        className="font-sans font-semibold px-3 py-1"
                                                    >
                                                        {parcelData.trackingId}
                                                    </Badge>
                                                )}
                                            </div>
                                            {/* <p className="text-gray-600 dark:text-gray-300 text-base">
                                                {parcelData ? (
                                                    <span className="flex items-center gap-2">
                                                        <MdSchedule className="text-[var(--bg-general)]" size={18} />
                                                        Estimated Delivery: {formatDate(parcelData.estimatedDeliveryDate as any)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500">Example: TRK-1760188433908-D7HUJU</span>
                                                )}
                                            </p> */}
                                        </div>
                                    </div>

                                    {/* {parcelData && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center w-full lg:w-auto">
                                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300 hover:scale-105">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                    Weight
                                                </p>
                                                <p className="font-bold text-gray-900 dark:text-white text-lg">
                                                    {parcelData.weight} kg
                                                </p>
                                            </div>
                                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300 hover:scale-105">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                    Dimensions
                                                </p>
                                                <p className="font-bold text-gray-900 dark:text-white text-lg">
                                                    {parcelData.dimensions}
                                                </p>
                                            </div>
                                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300 hover:scale-105">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                    Mode
                                                </p>
                                                <p className="font-bold text-gray-900 dark:text-white text-lg">{carrierType}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300 hover:scale-105">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                    Transport
                                                </p>
                                                <p className="font-bold text-gray-900 dark:text-white text-lg">{carrierName}</p>
                                            </div>
                                        </div>
                                    )} */}
                                </div>

                                {/* Search */}
                                <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50 mb-6">
                                    <form onSubmit={handleSubmit(handleTrack)}>
                                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                                            <div className="flex-1 w-full">
                                                <div className="[&>div]:mb-0">
                                                    <Input1
                                                        id="trackingId"
                                                        label="Tracking Number"
                                                        placeholder="Enter tracking number (e.g., TRK-1760188433908-D7HUJU)"
                                                        Icon={MdSearch}
                                                        register={register}
                                                        error={errors.trackingId?.message as string}
                                                        type="text"
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-full sm:w-auto sm:min-w-[200px] flex">
                                                <Button1
                                                    type="submit"
                                                    isLoading={isLoading}
                                                    loadingText="Tracking…"
                                                    text={parcelData ? "Track Another" : "Track Package"}
                                                />
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {/* Mini progress */}
                                {/* {parcelData && (
                                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-100 dark:border-green-800/50">
                                        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">
                                            <span className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <MdLocationOn className="text-green-600 dark:text-green-400 flex-shrink-0" size={18} />
                                                <span className="truncate font-semibold">{parcelData.fromLocation}</span>
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <span className="truncate font-semibold">{parcelData.toLocation}</span>
                                                <MdLocationOn className="text-red-600 dark:text-red-400 flex-shrink-0" size={18} />
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                            </span>
                                        </div>
                                        <Progress value={getProgressPercentage()} color="brandOrange" size="lg" radius="xl" className="mb-2" />
                                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                                            <span className="font-medium">Departure</span>
                                            <span className="font-bold text-[var(--bg-general)]">
                                                {Math.round(getProgressPercentage())}% Complete
                                            </span>
                                            <span className="font-medium">Destination</span>
                                        </div>
                                    </div>
                                )} */}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Results */}
                <section className="py-12 lg:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {error && (
                            <div className="max-w-3xl mx-auto mb-8">
                                <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-red-200 dark:border-red-800/50 shadow-2xl overflow-hidden">
                                    <div className="relative p-8 lg:p-12">
                                        <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-red-100 dark:bg-red-900/20 rounded-full -translate-y-16 sm:-translate-y-32 translate-x-16 sm:translate-x-32 blur-3xl opacity-50"></div>
                                        <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-orange-100 dark:bg-orange-900/20 rounded-full translate-y-12 sm:translate-y-24 -translate-x-12 sm:-translate-x-24 blur-3xl opacity-50"></div>

                                        <div className="relative z-10">
                                            <div className="flex justify-center mb-6">
                                                <div className="relative">
                                                    <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl transform transition-all duration-300 hover:scale-110">
                                                        <MdErrorOutline className="text-white" size={48} />
                                                    </div>
                                                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                                                </div>
                                            </div>

                                            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
                                                Tracking ID Not Found
                                            </h3>

                                            <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
                                                {error}
                                            </p>

                                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-600">
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                                                    What to check:
                                                </h4>
                                                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                                    <li className="flex items-start gap-3">
                                                        <div className="w-2 h-2 bg-[var(--bg-general)] rounded-full mt-2 flex-shrink-0"></div>
                                                        <span>Verify the tracking number is entered correctly</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <div className="w-2 h-2 bg-[var(--bg-general)] rounded-full mt-2 flex-shrink-0"></div>
                                                        <span>Check for any extra spaces or characters</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <div className="w-2 h-2 bg-[var(--bg-general)] rounded-full mt-2 flex-shrink-0"></div>
                                                        <span>Ensure the shipment has been processed and assigned a tracking ID</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <div className="w-2 h-2 bg-[var(--bg-general)] rounded-full mt-2 flex-shrink-0"></div>
                                                        <span>Wait a few hours if the shipment was just created</span>
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                <Button
                                                    onClick={() => {
                                                        setError("");
                                                        reset();
                                                        const input = document.getElementById("trackingId") as HTMLInputElement;
                                                        if (input) input.focus();
                                                    }}
                                                    leftSection={<MdRefresh size={20} />}
                                                    size="lg"
                                                    color="brandOrange"
                                                    className="font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                                                >
                                                    Try Again
                                                </Button>
                                                <Link href="/contact">
                                                    <Button
                                                        variant="outline"
                                                        size="lg"
                                                        className="font-semibold border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                                                    >
                                                        Contact Support
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="text-center py-12">
                                <div className="flex justify-center mb-4">
                                    <div className="relative">
                                        <Loader size="xl" color="brandOrange" />
                                        <div className="absolute inset-0 animate-ping">
                                            <Loader size="xl" color="brandOrange" />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Tracking Your Package
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">Fetching real-time tracking information…</p>
                            </div>
                        )}

                        {parcelData && (
                            <div className="space-y-8">
                                {/* Status Overview */}
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-10 border border-gray-200 dark:border-gray-700">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-20 h-20 ${(statusConfig as any)[parcelData.currentStatus]?.color} rounded-2xl flex items-center justify-center transform transition-transform hover:scale-105`}
                                            >
                                                {(() => {
                                                    const Icon = (statusConfig as any)[parcelData.currentStatus]?.icon || MdSchedule;
                                                    return <Icon className="text-white" size={28} />;
                                                })()}
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        {(statusConfig as any)[parcelData.currentStatus]?.label || parcelData.currentStatus}
                                                    </h2>
                                                    <Badge color="blue" variant="filled" className="font-sans font-semibold">
                                                        {parcelData.trackingId}
                                                    </Badge>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    Estimated Delivery: {formatDate(parcelData.estimatedDeliveryDate as any)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Weight</p>
                                                <p className="font-bold text-gray-900 dark:text-white text-lg">{parcelData.weight} kg</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Dimensions</p>
                                                <p className="font-bold text-gray-900 dark:text-white text-lg">{parcelData.dimensions}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Shipping Mode</p>
                                                <p className="font-bold text-gray-900 dark:text-white text-lg">{carrierType}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Carrier</p>
                                                <p className="font-bold text-gray-900 dark:text-white text-lg">{carrierName}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            <span className="flex items-center gap-2">
                                                <MdLocationOn className="text-green-500" />
                                                {parcelData.fromLocation}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                {parcelData.toLocation}
                                                <MdLocationOn className="text-red-500" />
                                            </span>
                                        </div>
                                        <Progress value={getProgressPercentage()} color="brandOrange" size="lg" radius="xl" />
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            <span>Departure</span>
                                            <span>{Math.round(getProgressPercentage())}% Complete</span>
                                            <span>Destination</span>
                                        </div>
                                    </div>

                                    {/* Customs notice */}
                                    {requiresCustomsClearance && (
                                        <Alert
                                            color="orange"
                                            className="rounded-xl border-l-4 border-orange-500"
                                            icon={<MdWarehouse size={20} />}
                                        >
                                            <div className="flex justify-between items-center gap-3">
                                                <div>
                                                    <h4 className="font-semibold">Customs Clearance</h4>
                                                    <p className="text-sm">This shipment is/was undergoing customs processing.</p>
                                                </div>
                                                <Button variant="light" color="orange" size="sm">
                                                    View Details
                                                </Button>
                                            </div>
                                        </Alert>
                                    )}
                                </div>

                                <div className="grid lg:grid-cols-3 gap-8">
                                    {/* Main column */}
                                    <div className="lg:col-span-2 space-y-8">
                                        {/* Live Route Tracking */}
                                        {mapRoutes.length > 0 && (
                                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent-primary-on-dark)] to-[var(--accent-secondary-on-dark)] rounded-xl flex items-center justify-center">
                                                            <MdLocationOn className="text-white" size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Live Route Tracking</h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                Real-time location updates
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge color="green" variant="light" size="lg" className="font-semibold px-3 py-1">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                            Real-time
                                                        </span>
                                                    </Badge>
                                                </div>

                                                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                        📍 Tracking {mapRoutes.length} location point{mapRoutes.length !== 1 ? "s" : ""} from your shipment's journey
                                                    </p>
                                                </div>

                                                <div className="relative">
                                                    <TrackingMap
                                                        routes={mapRoutes}
                                                        center={
                                                            mapRoutes.length
                                                                ? { lat: mapRoutes[mapRoutes.length - 1].latitude, lng: mapRoutes[mapRoutes.length - 1].longitude }
                                                                : undefined
                                                        }
                                                        showPolyline
                                                        height={500}
                                                        rounded
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Package Images */}
                                        {images.length > 0 && (
                                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                                        <MdAssignment className="text-white" size={20} />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Package Photos</h3>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {images.map((url, i) => (
                                                        <a key={`${url}-${i}`} href={url} target="_blank" rel="noreferrer" className="block">
                                                            <div className="relative group">
                                                                <SafeImage src={url} alt={`Package content ${i + 1}`} height={180} />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-xl" />
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Issues Section */}
                                        {loadingIssues ? (
                                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader size="md" color="brandOrange" />
                                                </div>
                                            </div>
                                        ) : issues.length > 0 ? (
                                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                                                        <FaExclamationTriangle className="text-white" size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Reported Issues</h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Issues related to this parcel</p>
                                                    </div>
                                                    <Badge color="red" variant="light" size="lg" className="font-semibold">
                                                        {issues.length} {issues.length === 1 ? "Issue" : "Issues"}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-4">
                                                    {issues.map((issue) => (
                                                        <div
                                                            key={issue._id.toString()}
                                                            className={`border-2 rounded-xl p-6 transition-all duration-300 ${issue.status === IssueStatus.RESOLVED
                                                                    ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                                                                    : issue.status === IssueStatus.IN_PROGRESS
                                                                        ? "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20"
                                                                        : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        {getIssueStatusIcon(issue.status)}
                                                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{issue.title}</h4>
                                                                    </div>

                                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                                        <Badge color={getIssueTypeColor(issue.type) as any} variant="light" size="sm">
                                                                            {issue.type.replace(/_/g, " ")}
                                                                        </Badge>
                                                                        <Badge
                                                                            color={
                                                                                issue.status === IssueStatus.RESOLVED
                                                                                    ? "green"
                                                                                    : issue.status === IssueStatus.IN_PROGRESS
                                                                                        ? "yellow"
                                                                                        : "red"
                                                                            }
                                                                            variant="light"
                                                                            size="sm"
                                                                        >
                                                                            {issue.status.replace(/_/g, " ")}
                                                                        </Badge>
                                                                        <Badge
                                                                            color={
                                                                                issue.priority === "URGENT"
                                                                                    ? "red"
                                                                                    : issue.priority === "HIGH"
                                                                                        ? "orange"
                                                                                        : issue.priority === "MEDIUM"
                                                                                            ? "yellow"
                                                                                            : "gray"
                                                                            }
                                                                            variant="light"
                                                                            size="sm"
                                                                        >
                                                                            {issue.priority}
                                                                        </Badge>
                                                                    </div>

                                                                    <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                                                                        {issue.description}
                                                                    </p>

                                                                    {/* Payment Required Section */}
                                                                    {issue.resolutionAmount &&
                                                                        issue.resolutionAmount > 0 &&
                                                                        issue.paymentStatus !== "VERIFIED" && (
                                                                            <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                                                                <div className="flex items-center gap-2 mb-3">
                                                                                    <FaMoneyBillWave className="text-orange-500" size={16} />
                                                                                    <h5 className="font-semibold text-orange-700 dark:text-orange-300">
                                                                                        Payment Required
                                                                                    </h5>
                                                                                </div>

                                                                                {issue.resolutionPaymentDescription && (
                                                                                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 leading-relaxed">
                                                                                        {issue.resolutionPaymentDescription}
                                                                                    </p>
                                                                                )}

                                                                                <div className="mb-3">
                                                                                    <div className="flex items-center justify-between mb-2">
                                                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Required Amount:</span>
                                                                                        <span className="font-bold text-orange-600 dark:text-orange-400">
                                                                                            {formatMoney(issue.resolutionAmount)}
                                                                                        </span>
                                                                                    </div>

                                                                                    {issue.paymentStatus === "PAID" && (
                                                                                        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                                                                                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                                                                                Payment submitted. Awaiting admin verification.
                                                                                            </p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                {issue.paymentStatus !== "PAID" && (
                                                                                    <Button
                                                                                        onClick={() => {
                                                                                            setSelectedIssueForPayment(issue);
                                                                                            setPaymentModalOpen(true);
                                                                                        }}
                                                                                        color="brandOrange"
                                                                                        className="w-full"
                                                                                    >
                                                                                        Process Payment
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                    {issue.resolution && (
                                                                        <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg border border-green-200 dark:border-green-800">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <FaCheckCircle className="text-green-500" size={16} />
                                                                                <h5 className="font-semibold text-green-700 dark:text-green-300">Resolution</h5>
                                                                            </div>
                                                                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                                                {issue.resolution}
                                                                            </p>
                                                                            {issue.resolutionAmount &&
                                                                                issue.resolutionAmount > 0 &&
                                                                                issue.paymentStatus === "VERIFIED" && (
                                                                                    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                                                                                        <div className="flex items-center justify-between">
                                                                                            <span className="text-sm text-gray-600 dark:text-gray-400">Resolution Amount:</span>
                                                                                            <span className="font-bold text-green-600 dark:text-green-400">
                                                                                                {formatMoney(issue.resolutionAmount)}
                                                                                            </span>
                                                                                        </div>
                                                                                        {issue.totalAmount && issue.totalAmount > issue.resolutionAmount && (
                                                                                            <div className="flex items-center justify-between mt-1">
                                                                                                <span className="text-sm text-gray-600 dark:text-gray-400">Total (incl. fees):</span>
                                                                                                <span className="font-bold text-gray-900 dark:text-white">
                                                                                                    {formatMoney(issue.totalAmount)}
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                                <span>Reported: {new Date(issue.reportedAt).toLocaleDateString()}</span>
                                                                {issue.resolvedAt && <span>Resolved: {new Date(issue.resolvedAt).toLocaleDateString()}</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {issues.some((i) => i.status !== IssueStatus.RESOLVED) && (
                                                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                                            <strong>Need Help?</strong> If you have concerns about any unresolved issues, please{" "}
                                                            <Link href="/contact" className="underline font-semibold hover:text-blue-900 dark:hover:text-blue-100">
                                                                contact our support team
                                                            </Link>
                                                            .
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}

                                        {/* Timeline */}
                                        {(parcelData.timelines || []).length > 0 && (
                                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center gap-3 mb-8">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                                                        <MdSchedule className="text-white" size={20} />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Shipment Timeline</h3>
                                                </div>

                                                <div className="space-y-6">
                                                    {[...(parcelData.timelines as any)]
                                                        .sort(
                                                            (a: any, b: any) =>
                                                                new Date(b.timelineDate).getTime() - new Date(a.timelineDate).getTime()
                                                        )
                                                        .map((event: any, index: number) => {
                                                            const cfg = (statusConfig as any)[event.status] || {};
                                                            return (
                                                                <div
                                                                    key={`${event._id || index}`}
                                                                    className="flex gap-4 group hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl p-4 transition-colors duration-300"
                                                                >
                                                                    <div className="flex flex-col items-center">
                                                                        <div
                                                                            className={`w-4 h-4 ${cfg.color || "bg-gray-400"} rounded-full group-hover:scale-125 transition-transform duration-300`}
                                                                        />
                                                                        {index < (parcelData.timelines as any).length - 1 && (
                                                                            <div className="w-0.5 h-full bg-gradient-to-b from-gray-300 to-gray-100 dark:from-gray-600 dark:to-gray-800 mt-2" />
                                                                        )}
                                                                    </div>

                                                                    <div className="flex-1">
                                                                        <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                                                            <div className="flex items-center gap-3">
                                                                                <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                                                                                    {cfg.label || event.status}
                                                                                </h4>
                                                                                {normalizeSendEmailFlag(event) && (
                                                                                    <Badge color="green" size="sm" className="font-sans font-semibold">
                                                                                        Notified
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                                                {formatDate(event.timelineDate)}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-gray-600 dark:text-gray-300 mb-3">{event.message}</p>
                                                                        {event.location && (
                                                                            <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                                                                                <MdLocationOn size={16} className="text-blue-500" />
                                                                                <span>{event.location}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sidebar */}
                                    <div className="space-y-6">
                                        {/* Contact */}
                                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                                    <MdLocationOn className="text-white" size={20} />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Contact Information</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
                                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Receiver</h4>
                                                    <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                                                        <p className="font-semibold text-base">{parcelData.receiver?.name}</p>
                                                        <p className="flex items-center gap-2">
                                                            <span className="text-blue-600 dark:text-blue-400">📧</span>
                                                            {parcelData.receiver?.email}
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                            <span className="text-blue-600 dark:text-blue-400">📞</span>
                                                            {parcelData.receiver?.phone}
                                                        </p>
                                                        <p className="text-xs opacity-75 mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                                                            {parcelData.receiver?.address}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Sender</h4>
                                                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                                        <p className="font-semibold text-base">{parcelData.sender?.name}</p>
                                                        <p className="flex items-center gap-2">
                                                            <span className="text-gray-500 dark:text-gray-400">📧</span>
                                                            {parcelData.sender?.email}
                                                        </p>
                                                        <p className="text-xs opacity-75 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                                            {parcelData.sender?.address}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Package details */}
                                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                                                    <MdLocalShipping className="text-white" size={20} />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Package Details</h3>
                                            </div>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex flex-col justify-between gap-3 py-3 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-b border-gray-100 dark:border-gray-600">
                                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Description:</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {parcelData.description}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col justify-between gap-3 py-3 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-b border-gray-100 dark:border-gray-600">
                                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Weight:</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">{parcelData.weight} kg</span>
                                                </div>
                                                <div className="flex flex-col justify-between gap-3 py-3 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-b border-gray-100 dark:border-gray-600">
                                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Dimensions:</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">{parcelData.dimensions}</span>
                                                </div>
                                                <div className="flex flex-col justify-between gap-3 py-3 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-b border-gray-100 dark:border-gray-600">
                                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Shipping Mode:</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">{carrierType}</span>
                                                </div>
                                                <div className="flex flex-col justify-between gap-3 py-3 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Transport:</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">{carrierName}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Help */}
                                        <div className="bg-gradient-to-br from-[var(--accent-primary-on-dark)] via-[var(--brand-secondary)] to-[var(--brand-secondary-dark)] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                                        <MdAssignment className="text-white" size={24} />
                                                    </div>
                                                    <h3 className="text-2xl font-bold">Need Help?</h3>
                                                </div>
                                                <p className="text-orange-50 text-sm mb-6 leading-relaxed">
                                                    Our support team is available 24/7 to assist you with your shipment.
                                                </p>
                                                <div className="space-y-3">
                                                    <Link href="/contact" className="block">
                                                        <Button
                                                            fullWidth
                                                            variant="outline"
                                                            size="md"
                                                            className="font-semibold hover:shadow-xl transition-all"
                                                        >
                                                            Contact Support
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        fullWidth
                                                        variant="outline"
                                                        color="white"
                                                        size="md"
                                                        onClick={() => {
                                                            if (parcelData) window.location.href = `/tracking/${parcelData._id}/report-issue`;
                                                        }}
                                                        className="font-semibold border-2 hover:bg-white hover:text-orange-600 transition-all"
                                                    >
                                                        Report an Issue
                                                    </Button>
                                                    {parcelData && parcelData.paymentStatus === "PENDING" && (
                                                        <Button
                                                            fullWidth
                                                            variant="outline"
                                                            color="white"
                                                            size="md"
                                                            onClick={() => {
                                                                if (parcelData) window.location.href = `/tracking/${parcelData._id}/payment`;
                                                            }}
                                                            className="font-semibold border-2 hover:bg-white hover:text-orange-600 transition-all"
                                                        >
                                                            Make Payment
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {!parcelData && !isLoading && !error && (
                            <div className="max-w-3xl mx-auto">
                                <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl">
                                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MdSearch size={40} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        No item is being tracked currently
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Enter a valid tracking number above to view shipment details.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Payment Modal */}
            <Modal
                opened={paymentModalOpen}
                onClose={resetPaymentModalState}
                title="Process Payment"
                description={
                    selectedIssueForPayment
                        ? `Submit payment for issue: "${selectedIssueForPayment.title}"`
                        : "Submit payment for this issue"
                }
                size="lg"
            >
                <div className="space-y-6">
                    {!selectedIssueForPayment ? (
                        <div className="text-sm text-gray-600 dark:text-gray-300">No issue selected.</div>
                    ) : (
                        <>
                            {/* Amount + context */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Required Amount:</span>
                                    <span className="font-bold text-orange-600 dark:text-orange-400">
                                        {formatMoney(resolutionAmount)}
                                    </span>
                                </div>
                                {selectedIssueForPayment.resolutionPaymentDescription && (
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                        {selectedIssueForPayment.resolutionPaymentDescription}
                                    </p>
                                )}
                                {parcelData?.trackingId && (
                                    <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                                        Reference: <span className="font-mono font-semibold">{parcelData.trackingId}</span>
                                    </div>
                                )}
                            </div>

                            {/* Payment method select */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-900 dark:text-white">
                                    Select Payment Method <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    placeholder={paymentMethods.length ? "Choose payment method" : "No active payment methods"}
                                    data={paymentMethods.map((pm) => ({
                                        value: pm._id.toString(),
                                        label: `${pm.type.replace(/_/g, " ")} (${pm.fee > 0 ? `+${pm.fee}% fee` : "No fee"})`,
                                    }))}
                                    value={selectedPaymentMethodId}
                                    onChange={(val) => setSelectedPaymentMethodId(val || "")}
                                    required
                                    disabled={!paymentMethods.length}
                                />
                                {!paymentMethods.length && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                        Payment is currently unavailable. Please contact support.
                                    </p>
                                )}
                            </div>

                            {/* Payment details */}
                            {selectedPaymentMethod && <PaymentDetailsCard pm={selectedPaymentMethod} />}

                            {/* Proof of Payment */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-900 dark:text-white">
                                    Proof of Payment <span className="text-red-500">*</span>
                                </label>

                                <div className="flex items-center gap-2">
                                    <TextInput
                                        value={proofOfPaymentUrl}
                                        onChange={(e) => setProofOfPaymentUrl(e.target.value)}
                                        placeholder="Paste image URL, or upload proof"
                                        className="flex-1"
                                        required
                                        disabled={uploadingProof || submittingPayment}
                                    />

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploadingProof || submittingPayment}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            setProofOfPaymentFile(file);
                                            handleProofUpload(file);
                                        }}
                                    />

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        loading={uploadingProof}
                                        disabled={uploadingProof || submittingPayment}
                                        leftSection={<FaUpload size={14} />}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Upload
                                    </Button>
                                </div>

                                {/* Upload progress */}
                                {uploadingProof && (
                                    <div className="mt-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                                            <span>Uploading proof…</span>
                                            <span className="font-semibold">{uploadPct ? `${uploadPct}%` : "—"}</span>
                                        </div>
                                        <Progress value={uploadPct || 5} color="brandOrange" size="sm" radius="xl" />
                                    </div>
                                )}

                                {/* Preview + remove */}
                                {(proofOfPaymentUrl || proofOfPaymentFile) && (
                                    <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                {proofOfPaymentFile ? (
                                                    <>
                                                        Selected file:{" "}
                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                            {proofOfPaymentFile.name}
                                                        </span>
                                                    </>
                                                ) : (
                                                    "Preview"
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="xs"
                                                onClick={() => {
                                                    setProofOfPaymentFile(null);
                                                    setProofOfPaymentUrl("");
                                                    setUploadPct(0);
                                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                                }}
                                                leftSection={<FaTrash size={12} />}
                                                disabled={uploadingProof || submittingPayment}
                                            >
                                                Remove
                                            </Button>
                                        </div>

                                        {proofOfPaymentUrl ? (
                                            <SafeImage src={proofOfPaymentUrl} alt="Proof of Payment" height={180} />
                                        ) : (
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                Upload finished URL will appear here…
                                            </div>
                                        )}
                                    </div>
                                )}

                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                                    Accepted: JPG/PNG/WEBP. Max 10MB. Make sure the receipt/screenshot is clear.
                                </p>
                            </div>

                            {/* Summary */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between text-sm text-gray-900 dark:text-white">
                                    <span>Resolution Amount:</span>
                                    <span>{formatMoney(resolutionAmount)}</span>
                                </div>
                                {paymentFeeAmount > 0 && (
                                    <div className="flex justify-between text-sm text-gray-900 dark:text-white">
                                        <span>Payment Method Fee ({paymentFeePercent}%):</span>
                                        <span>+{formatMoney(paymentFeeAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                                    <span>Total Amount:</span>
                                    <span>{formatMoney(totalAmount)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={resetPaymentModalState}
                                    disabled={submittingPayment || uploadingProof}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmitPayment}
                                    loading={submittingPayment || uploadingProof}
                                    disabled={!paymentMethods.length}
                                    color="brandOrange"
                                >
                                    Submit Payment
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </Layout1>
    );
}