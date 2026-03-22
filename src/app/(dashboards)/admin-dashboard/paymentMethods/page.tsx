"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaFilter,
    FaSync,
    FaEllipsisV,
    FaCreditCard,
} from "react-icons/fa";
import { z } from "zod";

import { PaymentMethodsApi } from "@/api/paymentMethods.api";
import { IPaymentMethod } from "@/lib/models/paymentMethod.model";
import { PaymentMethodType } from "@/lib/enums/paymentMethodType.enum";
import CustomLoader from "@/components/features/CustomLoader";
import EmptyState from "@/components/features/EmptyState";
import ConfirmationModal from "@/components/features/ConfirmationModal";

// UI Components
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableHeader,
} from "@/components/ui/table/Table";
import { Badge } from "@/components/ui/badge/Badge";
import { Pagination } from "@/components/ui/pagination/Pagination";
import { Modal } from "@/components/ui/modal/Modal";
import { Button } from "@/components/ui/button/Button";
import { TextInput } from "@/components/ui/input/TextInput";
import { NumberInput } from "@/components/ui/input/NumberInput";
import { Card } from "@/components/ui/card/Card";
import { Collapse } from "@/components/ui/collapse/Collapse";
import { Menu } from "@/components/ui/menu/Menu";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { Switch } from "@/components/ui/switch/Switch";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

/**
 * IMPORTANT FIX:
 * We still keep a single form schema for UI validation, but we DO NOT send irrelevant fields to the API.
 * We build a clean payload based on `type` that omits crypto fields for bank, etc.
 */

const PaymentMethodSchema = z.object({
    type: z.nativeEnum(PaymentMethodType),

    // Crypto Wallet fields
    cryptocurrency: z.string().optional(),
    network: z.string().optional(),
    walletAddress: z.string().optional(),
    qrCode: z.string().url().optional().or(z.literal("")),

    // Bank Account fields
    bankName: z.string().optional(),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    swiftCode: z.string().optional(),

    // Mobile Payment fields
    provider: z.string().optional(),
    handle: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),

    // Common fields
    status: z.boolean().default(true),
    processingTime: z.string().default("1-3 business days"),
    fee: z.coerce.number().default(0),
    isDefault: z.boolean().default(false),
});

type PaymentMethodFormData = z.infer<typeof PaymentMethodSchema>;

const pageSize = 10;

const TYPE_COLORS: Record<PaymentMethodType, string> = {
    CRYPTO_WALLET: "purple",
    BANK_ACCOUNT: "blue",
    MOBILE_PAYMENT: "green",
};

function cleanString(v: unknown): string | undefined {
    if (typeof v !== "string") return undefined;
    const trimmed = v.trim();
    return trimmed.length ? trimmed : undefined;
}

function cleanUrl(v: unknown): string | undefined {
    const s = cleanString(v);
    return s; // let backend validate URL; we just omit empty
}

function cleanNumber(v: unknown): number | undefined {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    return undefined;
}

/**
 * Build API payload that ONLY contains fields relevant to the selected type.
 * This prevents Joi string.empty errors caused by sending "", null, etc. for unrelated fields.
 */
function buildPaymentMethodPayload(data: PaymentMethodFormData) {
    const common = {
        type: data.type,
        status: !!data.status,
        processingTime: cleanString(data.processingTime) ?? "1-3 business days",
        fee: cleanNumber(data.fee) ?? 0,
        isDefault: !!data.isDefault,
    };

    if (data.type === PaymentMethodType.BANK_ACCOUNT) {
        return {
            ...common,
            bankName: cleanString(data.bankName),
            accountName: cleanString(data.accountName),
            accountNumber: cleanString(data.accountNumber),
            routingNumber: cleanString(data.routingNumber),
            swiftCode: cleanString(data.swiftCode),
        };
    }

    if (data.type === PaymentMethodType.CRYPTO_WALLET) {
        return {
            ...common,
            cryptocurrency: cleanString(data.cryptocurrency),
            network: cleanString(data.network),
            walletAddress: cleanString(data.walletAddress),
            qrCode: cleanUrl(data.qrCode),
        };
    }

    if (data.type === PaymentMethodType.MOBILE_PAYMENT) {
        return {
            ...common,
            provider: cleanString(data.provider),
            handle: cleanString(data.handle),
            email: cleanString(data.email),
        };
    }

    return common;
}

/**
 * Optional: when switching types, clear other type fields in the form state
 * (so UX stays clean and you don't see old values come back when toggling types).
 */
function getTypeClearedValues(type: PaymentMethodType) {
    const cleared = {
        cryptocurrency: "",
        network: "",
        walletAddress: "",
        qrCode: "",
        bankName: "",
        accountName: "",
        accountNumber: "",
        routingNumber: "",
        swiftCode: "",
        provider: "",
        handle: "",
        email: "",
    };

    // Keep only the relevant group potentially filled later by the user;
    // we still clear everything on type switch to avoid stale data.
    return { ...cleared, type };
}

export default function PaymentMethodsPage() {
    const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<IPaymentMethod | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [detailsPaymentMethod, setDetailsPaymentMethod] = useState<IPaymentMethod | null>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        getValues,
    } = useForm<PaymentMethodFormData>({
        resolver: zodResolver(PaymentMethodSchema),
        defaultValues: {
            type: PaymentMethodType.BANK_ACCOUNT,

            // Keep defaults for UI; payload builder will omit irrelevant fields.
            cryptocurrency: "",
            network: "",
            walletAddress: "",
            qrCode: "",

            bankName: "",
            accountName: "",
            accountNumber: "",
            routingNumber: "",
            swiftCode: "",

            provider: "",
            handle: "",
            email: "",

            status: true,
            processingTime: "1-3 business days",
            fee: 0,
            isDefault: false,
        },
    });

    const selectedType = watch("type");

    const fetchPaymentMethods = async () => {
        setLoading(true);
        try {
            const result = await PaymentMethodsApi.list({
                page: currentPage,
                limit: pageSize,
            });
            setPaymentMethods(result.items);
        } catch (error) {
            console.log(error);
            toast.error("Failed to load payment methods.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const filteredPaymentMethods = useMemo(() => {
        let filtered = paymentMethods;

        if (search.trim()) {
            const q = search.toLowerCase();
            filtered = filtered.filter(
                (pm) =>
                    pm.type.toLowerCase().includes(q) ||
                    pm.bankName?.toLowerCase().includes(q) ||
                    pm.accountName?.toLowerCase().includes(q) ||
                    pm.accountNumber?.toLowerCase().includes(q) ||
                    pm.provider?.toLowerCase().includes(q) ||
                    pm.cryptocurrency?.toLowerCase().includes(q) ||
                    pm.walletAddress?.toLowerCase().includes(q)
            );
        }

        if (typeFilter !== "all") {
            filtered = filtered.filter((pm) => pm.type === typeFilter);
        }

        if (statusFilter === "active") {
            filtered = filtered.filter((pm) => pm.status);
        } else if (statusFilter === "inactive") {
            filtered = filtered.filter((pm) => !pm.status);
        }

        return filtered.sort((a, b) => {
            if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [paymentMethods, search, typeFilter, statusFilter]);

    const paginatedPaymentMethods = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPaymentMethods.slice(start, start + pageSize);
    }, [filteredPaymentMethods, currentPage]);

    const totalPages = Math.ceil(filteredPaymentMethods.length / pageSize);

    const openModal = (paymentMethod?: IPaymentMethod) => {
        if (paymentMethod) {
            setSelectedPaymentMethod(paymentMethod);

            // Set form values from the record. Even if values are set for all fields, payload builder will omit irrelevant ones.
            setValue("type", paymentMethod.type);

            setValue("cryptocurrency", paymentMethod.cryptocurrency || "");
            setValue("network", paymentMethod.network || "");
            setValue("walletAddress", paymentMethod.walletAddress || "");
            setValue("qrCode", paymentMethod.qrCode || "");

            setValue("bankName", paymentMethod.bankName || "");
            setValue("accountName", paymentMethod.accountName || "");
            setValue("accountNumber", paymentMethod.accountNumber || "");
            setValue("routingNumber", paymentMethod.routingNumber || "");
            setValue("swiftCode", paymentMethod.swiftCode || "");

            setValue("provider", paymentMethod.provider || "");
            setValue("handle", paymentMethod.handle || "");
            setValue("email", paymentMethod.email || "");

            setValue("status", paymentMethod.status);
            setValue("processingTime", paymentMethod.processingTime);
            setValue("fee", paymentMethod.fee);
            setValue("isDefault", paymentMethod.isDefault);
        } else {
            setSelectedPaymentMethod(null);
            reset();
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedPaymentMethod(null);
        reset();
    };

    const onSubmit = async (data: PaymentMethodFormData) => {
        setLoading(true);
        try {
            const payload = buildPaymentMethodPayload(data);

            if (selectedPaymentMethod) {
                const updated = await PaymentMethodsApi.update(selectedPaymentMethod._id.toString(), payload as any);
                setPaymentMethods((prev) =>
                    prev.map((pm) => (pm._id.toString() === selectedPaymentMethod._id.toString() ? updated : pm))
                );
                toast.success("Payment method updated successfully");
            } else {
                const created = await PaymentMethodsApi.create(payload as any);
                setPaymentMethods((prev) => [created, ...prev]);
                toast.success("Payment method created successfully");
            }

            closeModal();
        } catch (error) {
            console.log(error);
            toast.error("Failed to save payment method.");
        } finally {
            setLoading(false);
        }
    };

    const openDeleteConfirmation = (id: string) => {
        setPaymentMethodToDelete(id);
        setConfirmModalOpen(true);
    };

    const handleDelete = async () => {
        if (!paymentMethodToDelete) return;
        setLoading(true);
        try {
            await PaymentMethodsApi.delete(paymentMethodToDelete);
            setPaymentMethods((prev) => prev.filter((pm) => pm._id.toString() !== paymentMethodToDelete));
            toast.success("Payment method deleted successfully");
            setConfirmModalOpen(false);
            setPaymentMethodToDelete(null);
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete payment method.");
        } finally {
            setLoading(false);
        }
    };

    const getDisplayName = (pm: IPaymentMethod): string => {
        if (pm.type === PaymentMethodType.BANK_ACCOUNT) {
            return `${pm.bankName || "Bank"} - ${pm.accountNumber?.slice(-4) || ""}`;
        } else if (pm.type === PaymentMethodType.CRYPTO_WALLET) {
            return `${pm.cryptocurrency || "Crypto"} - ${pm.walletAddress?.slice(0, 8) || ""}...`;
        } else if (pm.type === PaymentMethodType.MOBILE_PAYMENT) {
            return `${pm.provider || "Mobile"} - ${pm.handle || pm.email || ""}`;
        }
        return pm.type;
    };

    const handleTypeChange = (nextType: PaymentMethodType) => {
        // Clear other fields to avoid stale values in UI; not required for API safety (payload builder already handles that)
        const current = getValues();
        reset({
            ...current,
            ...getTypeClearedValues(nextType),
            // keep common values:
            status: current.status ?? true,
            processingTime: current.processingTime ?? "1-3 business days",
            fee: current.fee ?? 0,
            isDefault: current.isDefault ?? false,
        });
    };

    return (
        <div className="admin-page-container custom-black-white-theme-switch-bg">
            <CustomLoader loading={loading} />

            {/* Header */}
            <AdminPageHeader
                title="Payment Methods"
                description="Manage payment methods and configurations. Set up bank accounts, crypto wallets, and mobile payment options."
                primaryAction={{
                    label: "Add Payment Method",
                    onClick: () => openModal(),
                    icon: <FaPlus />,
                }}
                breadcrumbs={[
                    { label: "Admin Dashboard", href: "/admin-dashboard" },
                    { label: "Payment Methods" },
                ]}
            />

            {/* Filters */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Button variant="light" leftSection={<FaFilter />} onClick={() => setFiltersOpen(!filtersOpen)} size="sm">
                        Filters
                    </Button>
                    <Button
                        variant="subtle"
                        leftSection={<FaSync />}
                        onClick={fetchPaymentMethods}
                        size="sm"
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </div>
                <Collapse in={filtersOpen}>
                    <Card className="mb-4" withBorder>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <TextInput
                                label="Search"
                                placeholder="Search by type, bank, provider..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                leftSection={<FaFilter size={14} />}
                            />
                            <div>
                                <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">Type</label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => {
                                        setTypeFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                                >
                                    <option value="all">All Types</option>
                                    {Object.values(PaymentMethodType).map((type) => (
                                        <option key={type} value={type}>
                                            {type.replace("_", " ")}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                                >
                                    <option value="all">All</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </Card>
                </Collapse>
            </div>

            {/* Table / Empty state */}
            {loading && paymentMethods.length === 0 ? (
                <div className="space-y-2">
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                </div>
            ) : filteredPaymentMethods.length === 0 ? (
                <EmptyState
                    icon={<FaCreditCard size={48} />}
                    title="No payment methods found"
                    description={
                        search || typeFilter !== "all" || statusFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Add your first payment method to get started."
                    }
                    action={
                        !search && typeFilter === "all" && statusFilter === "all"
                            ? {
                                label: "Add Payment Method",
                                onClick: () => openModal(),
                            }
                            : undefined
                    }
                />
            ) : (
                <>
                    <div className="overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Name</TableHeader>
                                    <TableHeader>Type</TableHeader>
                                    <TableHeader>Details</TableHeader>
                                    <TableHeader>Fee</TableHeader>
                                    <TableHeader>Processing Time</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Default</TableHeader>
                                    <TableHeader>Actions</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedPaymentMethods.map((pm) => (
                                    <TableRow key={pm._id.toString()}>
                                        <TableCell>
                                            <span className="font-medium custom-black-white-theme-switch-text">{getDisplayName(pm)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge color={TYPE_COLORS[pm.type] as any} variant="light" size="sm">
                                                {pm.type.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="custom-black-white-theme-switch-text text-sm">
                                            {pm.type === PaymentMethodType.BANK_ACCOUNT &&
                                                `${pm.bankName || ""} ${pm.accountNumber?.slice(-4) || ""}`}
                                            {pm.type === PaymentMethodType.CRYPTO_WALLET && `${pm.cryptocurrency || ""} ${pm.network || ""}`}
                                            {pm.type === PaymentMethodType.MOBILE_PAYMENT &&
                                                `${pm.provider || ""} ${pm.handle || pm.email || ""}`}
                                        </TableCell>
                                        <TableCell className="custom-black-white-theme-switch-text">${pm.fee.toFixed(2)}</TableCell>
                                        <TableCell className="custom-black-white-theme-switch-text text-sm">{pm.processingTime}</TableCell>
                                        <TableCell>
                                            <Badge color={pm.status ? "green" : "gray"} variant="light" size="sm">
                                                {pm.status ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {pm.isDefault ? (
                                                <Badge color="blue" variant="light" size="sm">
                                                    Default
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Menu
                                                items={[
                                                    {
                                                        label: "View Details",
                                                        icon: <FaEye size={14} />,
                                                        onClick: () => {
                                                            setDetailsPaymentMethod(pm);
                                                            setDetailsModalOpen(true);
                                                        },
                                                    },
                                                    {
                                                        label: "Edit",
                                                        icon: <FaEdit size={14} />,
                                                        onClick: () => openModal(pm),
                                                    },
                                                    {
                                                        label: "Delete",
                                                        icon: <FaTrash size={14} />,
                                                        onClick: () => openDeleteConfirmation(pm._id.toString()),
                                                        color: "#ef4444",
                                                    },
                                                ]}
                                            >
                                                <Button variant="subtle" size="xs">
                                                    <FaEllipsisV />
                                                </Button>
                                            </Menu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-4 pt-4 border-t border-[var(--bg-general-light)]">
                            <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} color="brandOrange" />
                        </div>
                    )}
                </>
            )}

            {/* Create / Update Modal */}
            <Modal
                opened={modalOpen}
                onClose={closeModal}
                title={selectedPaymentMethod ? "Update Payment Method" : "Create Payment Method"}
                description={
                    selectedPaymentMethod ? "Update payment method configuration." : "Add a new payment method option."
                }
                size="xl"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">Type</label>
                        <select
                            value={selectedType || PaymentMethodType.BANK_ACCOUNT}
                            onChange={(e) => handleTypeChange(e.target.value as PaymentMethodType)}
                            className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                        >
                            {Object.values(PaymentMethodType).map((type) => (
                                <option key={type} value={type}>
                                    {type.replace("_", " ")}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Crypto Wallet Fields */}
                    {selectedType === PaymentMethodType.CRYPTO_WALLET && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                    name="cryptocurrency"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            label="Cryptocurrency"
                                            placeholder="e.g., Bitcoin, Ethereum"
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            error={errors.cryptocurrency?.message as any}
                                        />
                                    )}
                                />
                                <Controller
                                    name="network"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            label="Network"
                                            placeholder="e.g., Mainnet"
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            error={errors.network?.message as any}
                                        />
                                    )}
                                />
                            </div>
                            <Controller
                                name="walletAddress"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        label="Wallet Address"
                                        placeholder="Wallet address"
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        required
                                        error={errors.walletAddress?.message as any}
                                    />
                                )}
                            />
                            <Controller
                                name="qrCode"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        label="QR Code URL"
                                        placeholder="https://example.com/qr.png"
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        error={errors.qrCode?.message as any}
                                    />
                                )}
                            />
                        </>
                    )}

                    {/* Bank Account Fields */}
                    {selectedType === PaymentMethodType.BANK_ACCOUNT && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                    name="bankName"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            label="Bank Name"
                                            placeholder="Bank name"
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            required
                                            error={errors.bankName?.message as any}
                                        />
                                    )}
                                />
                                <Controller
                                    name="accountName"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            label="Account Name"
                                            placeholder="Account holder name"
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            error={errors.accountName?.message as any}
                                        />
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                    name="accountNumber"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            label="Account Number"
                                            placeholder="Account number"
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            required
                                            error={errors.accountNumber?.message as any}
                                        />
                                    )}
                                />
                                <Controller
                                    name="routingNumber"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            label="Routing Number"
                                            placeholder="Routing number"
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            error={errors.routingNumber?.message as any}
                                        />
                                    )}
                                />
                            </div>
                            <Controller
                                name="swiftCode"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        label="SWIFT Code"
                                        placeholder="SWIFT code"
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        error={errors.swiftCode?.message as any}
                                    />
                                )}
                            />
                        </>
                    )}

                    {/* Mobile Payment Fields */}
                    {selectedType === PaymentMethodType.MOBILE_PAYMENT && (
                        <>
                            <Controller
                                name="provider"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        label="Provider"
                                        placeholder="e.g., M-Pesa, PayPal, Venmo"
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        required
                                        error={errors.provider?.message as any}
                                    />
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                    name="handle"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            label="Handle/Phone"
                                            placeholder="Phone number or handle"
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            error={errors.handle?.message as any}
                                        />
                                    )}
                                />
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            label="Email"
                                            type="email"
                                            placeholder="email@example.com"
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            error={errors.email?.message as any}
                                        />
                                    )}
                                />
                            </div>
                        </>
                    )}

                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="processingTime"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Processing Time"
                                    placeholder="e.g., 1-3 business days"
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    error={errors.processingTime?.message as any}
                                />
                            )}
                        />
                        <Controller
                            name="fee"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Fee"
                                    value={field.value ?? 0}
                                    onChange={(v) => field.onChange(v === "" ? 0 : (v as number))}
                                    min={0}
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <Switch
                                    label="Active Status"
                                    checked={!!field.value}
                                    onChange={field.onChange}
                                    color="brandOrange"
                                />
                            )}
                        />
                        <Controller
                            name="isDefault"
                            control={control}
                            render={({ field }) => (
                                <Switch
                                    label="Set as Default"
                                    checked={!!field.value}
                                    onChange={field.onChange}
                                    color="brandOrange"
                                />
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={closeModal} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading} color="brandOrange">
                            {selectedPaymentMethod ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Details Modal */}
            <Modal
                opened={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false);
                    setDetailsPaymentMethod(null);
                }}
                title={`Payment Method Details — ${detailsPaymentMethod ? getDisplayName(detailsPaymentMethod) : ""}`}
                size="lg"
            >
                {detailsPaymentMethod && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Type</p>
                                <Badge color={TYPE_COLORS[detailsPaymentMethod.type] as any} variant="light">
                                    {detailsPaymentMethod.type.replace("_", " ")}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                                <Badge color={detailsPaymentMethod.status ? "green" : "gray"} variant="light">
                                    {detailsPaymentMethod.status ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>

                        {detailsPaymentMethod.type === PaymentMethodType.CRYPTO_WALLET && (
                            <>
                                {detailsPaymentMethod.cryptocurrency && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cryptocurrency</p>
                                        <p className="custom-black-white-theme-switch-text">{detailsPaymentMethod.cryptocurrency}</p>
                                    </div>
                                )}
                                {detailsPaymentMethod.network && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Network</p>
                                        <p className="custom-black-white-theme-switch-text">{detailsPaymentMethod.network}</p>
                                    </div>
                                )}
                                {detailsPaymentMethod.walletAddress && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Wallet Address</p>
                                        <p className="custom-black-white-theme-switch-text font-mono text-sm">
                                            {detailsPaymentMethod.walletAddress}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {detailsPaymentMethod.type === PaymentMethodType.BANK_ACCOUNT && (
                            <>
                                {detailsPaymentMethod.bankName && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bank Name</p>
                                        <p className="custom-black-white-theme-switch-text">{detailsPaymentMethod.bankName}</p>
                                    </div>
                                )}
                                {detailsPaymentMethod.accountName && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Account Name</p>
                                        <p className="custom-black-white-theme-switch-text">{detailsPaymentMethod.accountName}</p>
                                    </div>
                                )}
                                {detailsPaymentMethod.accountNumber && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Account Number</p>
                                        <p className="custom-black-white-theme-switch-text font-mono">{detailsPaymentMethod.accountNumber}</p>
                                    </div>
                                )}
                            </>
                        )}

                        {detailsPaymentMethod.type === PaymentMethodType.MOBILE_PAYMENT && (
                            <>
                                {detailsPaymentMethod.provider && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Provider</p>
                                        <p className="custom-black-white-theme-switch-text">{detailsPaymentMethod.provider}</p>
                                    </div>
                                )}
                                {detailsPaymentMethod.handle && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Handle/Phone</p>
                                        <p className="custom-black-white-theme-switch-text">{detailsPaymentMethod.handle}</p>
                                    </div>
                                )}
                                {detailsPaymentMethod.email && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                                        <p className="custom-black-white-theme-switch-text">{detailsPaymentMethod.email}</p>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-4 border-t border-[var(--bg-general-light)] pt-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fee</p>
                                <p className="custom-black-white-theme-switch-text font-semibold">
                                    ${detailsPaymentMethod.fee.toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Processing Time</p>
                                <p className="custom-black-white-theme-switch-text">{detailsPaymentMethod.processingTime}</p>
                            </div>
                        </div>

                        {detailsPaymentMethod.isDefault && (
                            <div>
                                <Badge color="blue" variant="light">
                                    Default Payment Method
                                </Badge>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmationModal
                opened={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setPaymentMethodToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Delete Payment Method?"
                message={
                    <div className="text-sm custom-black-white-theme-switch-text">
                        Are you sure you want to delete this payment method? This action cannot be undone.
                    </div>
                }
                loading={loading}
            />
        </div>
    );
}
