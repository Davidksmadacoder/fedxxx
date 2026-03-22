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
  FaExclamationTriangle,
  FaCheckCircle,
  FaCopy,
  FaCheck,
  FaUpload,
  FaMoneyBillWave,
} from "react-icons/fa";
import { z } from "zod";
import Link from "next/link";

import { IssuesApi } from "@/api/issues.api";
import { ParcelsApi } from "@/api/parcels.api";
import { PaymentMethodsApi } from "@/api/paymentMethods.api";
import { IIssue } from "@/lib/models/issue.model";
import { IParcel } from "@/lib/models/parcel.model";
import { IPaymentMethod } from "@/lib/models/paymentMethod.model";
import { PaymentMethodType } from "@/lib/enums/paymentMethodType.enum";
import { IssueType, IssueStatus } from "@/lib/enums/issueType.enum";
import CustomLoader from "@/components/features/CustomLoader";
import EmptyState from "@/components/features/EmptyState";
import ConfirmationModal from "@/components/features/ConfirmationModal";
import { handleApiError } from "@/utils/error-handler";
import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";

// Custom Components
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
import { Textarea } from "@/components/ui/textarea/Textarea";
import { Card } from "@/components/ui/card/Card";
import { Collapse } from "@/components/ui/collapse/Collapse";
import { Menu } from "@/components/ui/menu/Menu";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { Switch } from "@/components/ui/switch/Switch";
import { Select } from "@/components/ui/select/Select";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const IssueSchema = z.object({
  parcelId: z.string().min(1, "Parcel ID is required"),
  type: z.nativeEnum(IssueType),
  status: z.nativeEnum(IssueStatus),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  reportedBy: z.string().optional(),
  adminNotes: z.string().optional(),
  resolutionAmount: z.number().min(0).optional(),
  resolutionPaymentDescription: z.string().optional(),
  attachments: z.array(z.string().url()).optional(),
  showToCustomer: z.boolean().default(true),
});

type IssueFormData = z.infer<typeof IssueSchema>;

const pageSize = 10;

const TYPE_COLORS: Partial<Record<IssueType, string>> = {
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

const STATUS_COLORS: Record<IssueStatus, string> = {
  OPEN: "red",
  IN_PROGRESS: "yellow",
  RESOLVED: "green",
  CLOSED: "gray",
  ESCALATED: "orange",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "gray",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
};

interface ParcelOption {
  value: string;
  label: string;
}

/** Safely normalizes Mongo-like ids or populated objects into a string id. */
function normalizeId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;

  // Populated object that contains _id
  if (typeof value === "object" && value !== null) {
    const anyVal = value as any;
    if (anyVal._id) return normalizeId(anyVal._id);
  }

  // Fallback to toString for ObjectId-ish values
  try {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const s = (value as any).toString?.();
    return typeof s === "string" ? s : "";
  } catch {
    return "";
  }
}

function shortId(id: string, chars = 8) {
  if (!id) return "";
  return id.length <= chars ? id : id.slice(-chars);
}

type ParcelDisplay = {
  parcelId: string;
  trackingId?: string;
  senderName?: string;
  receiverName?: string;
};

function buildParcelDisplayFromIssueParcel(
  issueParcel: unknown
): ParcelDisplay | null {
  if (!issueParcel || typeof issueParcel !== "object") return null;
  const p = issueParcel as any;

  // Some APIs return populated parcel object in issue.parcelId
  const parcelId = normalizeId(p._id ?? p.id ?? p);
  if (!parcelId) return null;

  const trackingId = typeof p.trackingId === "string" ? p.trackingId : undefined;
  const senderName =
    typeof p.sender?.name === "string" ? p.sender.name : undefined;
  const receiverName =
    typeof p.receiver?.name === "string" ? p.receiver.name : undefined;

  return { parcelId, trackingId, senderName, receiverName };
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<IIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Parcels (for correct Parcel display + selection)
  const [parcelOptions, setParcelOptions] = useState<ParcelOption[]>([]);
  const [parcelsById, setParcelsById] = useState<Record<string, IParcel>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<IIssue | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsIssue, setDetailsIssue] = useState<IIssue | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<string | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [issueToResolve, setIssueToResolve] = useState<string | null>(null);
  const [issueToResolveData, setIssueToResolveData] = useState<IIssue | null>(null);
  const [resolutionText, setResolutionText] = useState("");
  const [resolutionAmount, setResolutionAmount] = useState<number>(0);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<IPaymentMethod | null>(null);
  const [proofOfPaymentFile, setProofOfPaymentFile] = useState<File | null>(null);
  const [proofOfPaymentUrl, setProofOfPaymentUrl] = useState<string>("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [copySuccess, setCopySuccess] = useState<Record<string, boolean>>({});

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<IssueFormData>({
    resolver: zodResolver(IssueSchema),
    defaultValues: {
      parcelId: "",
      type: IssueType.OTHER,
      status: IssueStatus.OPEN,
      priority: "MEDIUM",
      title: "",
      description: "",
      reportedBy: "",
      adminNotes: "",
      showToCustomer: true,
    },
  });

  const formType = watch("type");
  const formStatus = watch("status");
  const formPriority = watch("priority");

  const fetchParcels = async () => {
    try {
      const result = await ParcelsApi.list();
      const map: Record<string, IParcel> = {};
      for (const p of result.items) {
        const id = normalizeId((p as any)?._id ?? (p as any)?.id);
        if (id) map[id] = p;
      }
      setParcelsById(map);

      setParcelOptions(
        result.items.map((p) => {
          const id = normalizeId((p as any)?._id ?? (p as any)?.id);
          const trackingId =
            typeof (p as any)?.trackingId === "string"
              ? (p as any).trackingId
              : shortId(id);

          const senderName =
            typeof (p as any)?.sender?.name === "string"
              ? (p as any).sender.name
              : "Unknown";
          const receiverName =
            typeof (p as any)?.receiver?.name === "string"
              ? (p as any).receiver.name
              : "Unknown";

          return {
            value: id,
            label: `${trackingId} — ${senderName} → ${receiverName}`,
          };
        })
      );
    } catch (error) {
      console.error("Failed to load parcels:", error);
      toast.error("Failed to load parcels.");
    }
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const result = await IssuesApi.list();
      setIssues(result.items);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load issues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchParcels();
    fetchPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const result = await PaymentMethodsApi.getActive();
      setPaymentMethods(result);
    } catch (error) {
      console.error("Failed to load payment methods:", error);
    }
  };

  /** Resolves a professional parcel display (trackingId + fallback) from issue.parcelId. */
  const getParcelDisplay = (issue: IIssue): ParcelDisplay | null => {
    // case 1: issue.parcelId is populated parcel object
    const fromPopulated = buildParcelDisplayFromIssueParcel((issue as any).parcelId);
    if (fromPopulated?.parcelId) return fromPopulated;

    // case 2: issue.parcelId is plain id / ObjectId-ish
    const parcelId = normalizeId((issue as any).parcelId);
    if (!parcelId) return null;

    const parcel = parcelsById[parcelId];
    if (!parcel) return { parcelId };

    const trackingId =
      typeof (parcel as any)?.trackingId === "string"
        ? (parcel as any).trackingId
        : undefined;

    const senderName =
      typeof (parcel as any)?.sender?.name === "string"
        ? (parcel as any).sender.name
        : undefined;
    const receiverName =
      typeof (parcel as any)?.receiver?.name === "string"
        ? (parcel as any).receiver.name
        : undefined;

    return { parcelId, trackingId, senderName, receiverName };
  };

  const filteredIssues = useMemo(() => {
    let filtered = issues;

    if (search.trim()) {
      const q = search.toLowerCase();

      filtered = filtered.filter((i) => {
        const parcelDisplay = getParcelDisplay(i);
        const parcelIdStr = parcelDisplay?.parcelId ?? normalizeId((i as any).parcelId);
        const trackingIdStr = parcelDisplay?.trackingId ?? "";

        return (
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          parcelIdStr.toLowerCase().includes(q) ||
          trackingIdStr.toLowerCase().includes(q) ||
          (i.reportedBy?.toLowerCase().includes(q) ?? false)
        );
      });
    }

    if (typeFilter !== "all") filtered = filtered.filter((i) => i.type === typeFilter);
    if (statusFilter !== "all") filtered = filtered.filter((i) => i.status === statusFilter);
    if (priorityFilter !== "all") filtered = filtered.filter((i) => i.priority === priorityFilter);

    return filtered.sort(
      (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issues, search, typeFilter, statusFilter, priorityFilter, parcelsById]);

  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIssues.slice(start, start + pageSize);
  }, [filteredIssues, currentPage]);

  const totalPages = Math.ceil(filteredIssues.length / pageSize);

  const analytics = useMemo(() => {
    const total = filteredIssues.length;
    const open = filteredIssues.filter((i) => i.status === IssueStatus.OPEN).length;
    const inProgress = filteredIssues.filter((i) => i.status === IssueStatus.IN_PROGRESS).length;
    const resolved = filteredIssues.filter((i) => i.status === IssueStatus.RESOLVED).length;
    return [
      { title: "Total Issues", value: total, icon: <FaExclamationTriangle size={20} />, color: "blue" },
      { title: "Open", value: open, icon: <FaExclamationTriangle size={20} />, color: "red" },
      { title: "In Progress", value: inProgress, icon: <FaExclamationTriangle size={20} />, color: "yellow" },
      { title: "Resolved", value: resolved, icon: <FaCheckCircle size={20} />, color: "green" },
    ];
  }, [filteredIssues]);

  const openModal = (issue?: IIssue) => {
    if (issue) {
      setSelectedIssue(issue);

      const parcelId = normalizeId((issue as any).parcelId);
      setValue("parcelId", parcelId);

      setValue("type", issue.type);
      setValue("status", issue.status);
      setValue("priority", issue.priority);
      setValue("title", issue.title);
      setValue("description", issue.description);
      setValue("reportedBy", issue.reportedBy || "");
      setValue("adminNotes", issue.adminNotes || "");
      setValue("resolutionAmount", issue.resolutionAmount || undefined);
      setValue("resolutionPaymentDescription", issue.resolutionPaymentDescription || "");
      setValue("attachments", issue.attachments || []);
      setValue("showToCustomer", issue.showToCustomer);
    } else {
      setSelectedIssue(null);
      reset();
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedIssue(null);
    reset();
  };

  const onSubmit = async (data: IssueFormData) => {
    setLoading(true);
    try {
      if (selectedIssue) {
        // For update, only include fields allowed by UpdateIssueDto (reportedBy is NOT allowed)
        const updateData: any = {
          type: data.type,
          status: data.status,
          priority: data.priority,
          title: data.title,
          description: data.description,
          adminNotes: data.adminNotes || undefined,
          resolutionAmount: data.resolutionAmount || undefined,
          resolutionPaymentDescription: data.resolutionPaymentDescription || undefined,
          attachments: data.attachments || undefined,
          showToCustomer: data.showToCustomer,
        };

        const updated = await IssuesApi.update(selectedIssue._id.toString(), updateData);
        setIssues((prev) =>
          prev.map((i) => (i._id.toString() === selectedIssue._id.toString() ? updated : i))
        );
        toast.success("Issue updated successfully");
      } else {
        // For create, exclude resolution (not allowed in CreateIssueDto)
        const createData: any = {
          parcelId: data.parcelId,
          type: data.type,
          status: data.status,
          priority: data.priority,
          title: data.title,
          description: data.description,
          reportedBy: data.reportedBy || undefined,
          showToCustomer: data.showToCustomer,
        };

        const created = await IssuesApi.create(createData);
        setIssues((prev) => [created, ...prev]);
        toast.success("Issue created successfully");
      }
      closeModal();
    } catch (error) {
      handleApiError(error, "Failed to save issue.");
    } finally {
      setLoading(false);
    }
  };

  const openResolveModal = (id: string) => {
    const issue = issues.find((i) => i._id.toString() === id);
    setIssueToResolve(id);
    setIssueToResolveData(issue || null);
    setResolutionText("");
    setResolutionAmount(0);
    setSelectedPaymentMethodId("");
    setSelectedPaymentMethod(null);
    setProofOfPaymentFile(null);
    setProofOfPaymentUrl("");
    setCopySuccess({});
    setResolveModalOpen(true);
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess((prev) => ({ ...prev, [key]: true }));
      toast.success("Copied to clipboard!");
      setTimeout(() => {
        setCopySuccess((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handleProofUpload = async (file: File) => {
    setUploadingProof(true);
    try {
      const result = await uploadToCloudinary(file);
      setProofOfPaymentUrl(result.url);
      toast.success("Proof of payment uploaded successfully");
    } catch (error) {
      handleApiError(error, "Failed to upload proof of payment.");
    } finally {
      setUploadingProof(false);
    }
  };

  const handleResolve = async () => {
    if (!issueToResolve || !resolutionText.trim()) {
      toast.error("Please provide a resolution.");
      return;
    }

    // Check if payment is required and verified
    const issue = issueToResolveData;
    if (issue?.resolutionAmount && issue.resolutionAmount > 0) {
      if (issue.paymentStatus !== 'VERIFIED') {
        toast.error("Cannot resolve: Payment must be verified before resolution. Current status: " + (issue.paymentStatus || 'PENDING'));
        return;
      }
    }

    setLoading(true);
    try {
      const updated = await IssuesApi.resolve(
        issueToResolve,
        resolutionText
      );

      setIssues((prev) => prev.map((i) => (i._id.toString() === issueToResolve ? updated : i)));
      toast.success("Issue resolved successfully");
      setResolveModalOpen(false);
      setIssueToResolve(null);
      setIssueToResolveData(null);
      setResolutionText("");
    } catch (error) {
      console.error(error);
      handleApiError(error, "Failed to resolve issue.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (issueId: string, paymentStatus: 'VERIFIED' | 'FAILED', showToCustomer?: boolean) => {
    setLoading(true);
    try {
      const updated = await IssuesApi.updatePaymentStatus(issueId, paymentStatus, showToCustomer);
      setIssues((prev) => prev.map((i) => (i._id.toString() === issueId ? updated : i)));
      toast.success(`Payment ${paymentStatus === 'VERIFIED' ? 'verified' : 'marked as failed'} successfully`);
    } catch (error) {
      handleApiError(error, "Failed to update payment status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPaymentMethodId) {
      const method = paymentMethods.find((pm) => pm._id.toString() === selectedPaymentMethodId);
      setSelectedPaymentMethod(method || null);
    } else {
      setSelectedPaymentMethod(null);
    }
  }, [selectedPaymentMethodId, paymentMethods]);

  const paymentFeePercent = selectedPaymentMethod?.fee || 0;
  const paymentFeeAmount = resolutionAmount > 0 ? (resolutionAmount * paymentFeePercent) / 100 : 0;
  const totalAmount = resolutionAmount + paymentFeeAmount;

  const openDeleteConfirmation = (id: string) => {
    setIssueToDelete(id);
    setConfirmModalOpen(true);
  };

  const handleDelete = async () => {
    if (!issueToDelete) return;
    setLoading(true);
    try {
      await IssuesApi.delete(issueToDelete);
      setIssues((prev) => prev.filter((i) => i._id.toString() !== issueToDelete));
      toast.success("Issue deleted successfully");
      setConfirmModalOpen(false);
      setIssueToDelete(null);
    } catch (error) {
      handleApiError(error, "Failed to delete issue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container custom-black-white-theme-switch-bg">
      <CustomLoader loading={loading} />

      {/* Header */}
      <AdminPageHeader
        title="Issues"
        description="Manage customer issues and support tickets. Track, resolve, and monitor all reported problems."
        primaryAction={{
          label: "Add Issue",
          onClick: () => openModal(),
          icon: <FaPlus />,
        }}
        breadcrumbs={[
          { label: "Admin Dashboard", href: "/admin-dashboard" },
          { label: "Issues" },
        ]}
      />

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="light"
            leftSection={<FaFilter />}
            onClick={() => setFiltersOpen(!filtersOpen)}
            size="sm"
          >
            Filters
          </Button>
          <Button
            variant="subtle"
            leftSection={<FaSync />}
            onClick={fetchIssues}
            size="sm"
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        <Collapse in={filtersOpen}>
          <Card className="mb-4" withBorder>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <TextInput
                label="Search"
                placeholder="Search by title, description, parcel tracking ID / ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                leftSection={<FaFilter size={14} />}
              />

              <div>
                <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                >
                  <option value="all">All Types</option>
                  {Object.values(IssueType).map((type) => (
                    <option key={type} value={type}>
                      {type.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                >
                  <option value="all">All Statuses</option>
                  {Object.values(IssueStatus).map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                >
                  <option value="all">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
          </Card>
        </Collapse>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {analytics.map((item, index) => (
          <Card key={index} className="border border-[var(--bg-general-light)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{item.title}</p>
                <p className="text-2xl font-bold custom-black-white-theme-switch-text">
                  {item.value}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${item.color}20`, color: item.color }}
              >
                {item.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table / Empty state */}
      {loading && issues.length === 0 ? (
        <div className="space-y-2">
          <Skeleton height={50} />
          <Skeleton height={50} />
          <Skeleton height={50} />
        </div>
      ) : filteredIssues.length === 0 ? (
        <EmptyState
          icon={<FaExclamationTriangle size={48} />}
          title="No issues found"
          description={
            search || typeFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all"
              ? "Try adjusting your filters"
              : "No issues reported yet."
          }
          action={
            !search && typeFilter === "all" && statusFilter === "all" && priorityFilter === "all"
              ? { label: "Add Issue", onClick: () => openModal() }
              : undefined
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Parcel</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Priority</TableHeader>
                  <TableHeader>Reported</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedIssues.map((issue) => {
                  const parcelDisplay = getParcelDisplay(issue);
                  const parcelId = parcelDisplay?.parcelId ?? normalizeId((issue as any).parcelId);
                  const trackingId = parcelDisplay?.trackingId;
                  const senderName = parcelDisplay?.senderName;
                  const receiverName = parcelDisplay?.receiverName;

                  // Use trackingId for search when available (better UX), fallback to parcelId
                  const parcelSearchValue = trackingId || parcelId;

                  return (
                    <TableRow key={issue._id.toString()}>
                      <TableCell>
                        <span className="font-medium custom-black-white-theme-switch-text">
                          {issue.title}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge
                          color={(TYPE_COLORS[issue.type] || "gray") as any}
                          variant="light"
                          size="sm"
                        >
                          {issue.type.replaceAll("_", " ")}
                        </Badge>
                      </TableCell>

                      {/* ✅ FIXED: Proper parcel display (trackingId + fallback + safe id normalization) */}
                      <TableCell>
                        {parcelId ? (
                          <Link
                            href={`/admin-dashboard/parcels?search=${encodeURIComponent(
                              parcelSearchValue
                            )}`}
                            className="group inline-flex flex-col"
                            title={parcelId}
                          >
                            <span className="text-blue-600 dark:text-blue-400 group-hover:underline font-medium">
                              {trackingId || shortId(parcelId)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {trackingId ? `ID: ${shortId(parcelId)}` : `Full ID: ${parcelId}`}
                              {senderName || receiverName
                                ? ` • ${senderName || "Unknown"} → ${receiverName || "Unknown"}`
                                : ""}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge color={STATUS_COLORS[issue.status] as any} variant="light" size="sm">
                          {issue.status.replaceAll("_", " ")}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          color={PRIORITY_COLORS[issue.priority] as any}
                          variant="light"
                          size="sm"
                        >
                          {issue.priority}
                        </Badge>
                      </TableCell>

                      <TableCell className="custom-black-white-theme-switch-text text-sm">
                        {new Date(issue.reportedAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <Menu
                          items={[
                            {
                              label: "View Details",
                              icon: <FaEye size={14} />,
                              onClick: () => {
                                setDetailsIssue(issue);
                                setDetailsModalOpen(true);
                              },
                            },
                            {
                              label: "Edit",
                              icon: <FaEdit size={14} />,
                              onClick: () => openModal(issue),
                            },
                            ...(issue.resolutionAmount && issue.resolutionAmount > 0 && issue.paymentStatus === 'PAID'
                              ? [
                                  {
                                    label: "Verify Payment",
                                    icon: <FaCheckCircle size={14} />,
                                    onClick: () => handleVerifyPayment(issue._id.toString(), 'VERIFIED'),
                                    color: "#28a745",
                                  },
                                  {
                                    label: "Reject Payment",
                                    icon: <FaExclamationTriangle size={14} />,
                                    onClick: () => handleVerifyPayment(issue._id.toString(), 'FAILED'),
                                    color: "#ef4444",
                                  },
                                ]
                              : []),
                            {
                              label: "Resolve",
                              icon: <FaCheckCircle size={14} />,
                              onClick: () => openResolveModal(issue._id.toString()),
                              disabled: issue.resolutionAmount && issue.resolutionAmount > 0 && issue.paymentStatus !== 'VERIFIED',
                            },
                            {
                              label: "Delete",
                              icon: <FaTrash size={14} />,
                              onClick: () => openDeleteConfirmation(issue._id.toString()),
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
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 pt-4 border-t border-[var(--bg-general-light)]">
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={setCurrentPage}
                color="brandOrange"
              />
            </div>
          )}
        </>
      )}

      {/* Create / Update Modal */}
      <Modal
        opened={modalOpen}
        onClose={closeModal}
        title={selectedIssue ? "Update Issue" : "Create Issue"}
        description={selectedIssue ? "Update issue details and status." : "Create a new issue ticket."}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="parcelId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Parcel*"
                  placeholder="Select a parcel"
                  data={parcelOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v || "")}
                  searchable
                />
              )}
            />
            {errors.parcelId && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.parcelId.message}</p>
            )}

            <div>
              <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                Type
              </label>
              <select
                value={formType || IssueType.OTHER}
                onChange={(e) => setValue("type", e.target.value as IssueType)}
                className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
              >
                {Object.values(IssueType).map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                Status
              </label>
              <select
                value={formStatus || IssueStatus.OPEN}
                onChange={(e) => setValue("status", e.target.value as IssueStatus)}
                className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
              >
                {Object.values(IssueStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                Priority
              </label>
              <select
                value={formPriority || "MEDIUM"}
                onChange={(e) => setValue("priority", e.target.value as any)}
                className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Title"
                placeholder="Issue title"
                error={errors.title?.message}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                required
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                label="Description"
                placeholder="Issue description"
                error={errors.description?.message}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                minRows={4}
                required
              />
            )}
          />

          <Controller
            name="reportedBy"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Reported By"
                placeholder="Reporter name or email"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />

          <Controller
            name="adminNotes"
            control={control}
            render={({ field }) => (
              <Textarea
                label="Admin Notes (Internal)"
                placeholder="Internal notes"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                minRows={2}
              />
            )}
          />

          {/* Payment Resolution Fields */}
          <div className="border-t border-[var(--bg-general-light)] pt-4">
            <h3 className="text-lg font-semibold custom-black-white-theme-switch-text mb-4">
              Payment Resolution (Optional)
            </h3>
            <div className="space-y-4">
              <Controller
                name="resolutionAmount"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    label="Resolution Amount"
                    placeholder="0.00"
                    value={field.value}
                    onChange={(val) => field.onChange(typeof val === "number" ? val : undefined)}
                    min={0}
                    step={0.01}
                  />
                )}
              />

              <Controller
                name="resolutionPaymentDescription"
                control={control}
                render={({ field }) => (
                  <Textarea
                    label="Payment Description"
                    placeholder="Explain why payment is required (e.g., 'Additional handling fee for damaged packaging', 'Customs clearance fee', etc.)"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    minRows={3}
                  />
                )}
              />
            </div>
          </div>

          <Controller
            name="showToCustomer"
            control={control}
            render={({ field }) => (
              <Switch
                label="Show to Customer"
                checked={field.value}
                onChange={field.onChange}
                color="brandOrange"
              />
            )}
          />

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={closeModal} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} color="brandOrange">
              {selectedIssue ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Resolve Modal with Payment Flow */}
      <Modal
        opened={resolveModalOpen}
        onClose={() => {
          setResolveModalOpen(false);
          setIssueToResolve(null);
          setIssueToResolveData(null);
          setResolutionText("");
          setResolutionAmount(0);
          setSelectedPaymentMethodId("");
          setSelectedPaymentMethod(null);
          setProofOfPaymentFile(null);
          setProofOfPaymentUrl("");
          setCopySuccess({});
        }}
        title="Resolve Issue"
        description={
          issueToResolveData
            ? `Resolve "${issueToResolveData.title}" - Complete the resolution details and payment information below.`
            : "Complete the resolution details and payment information below."
        }
        size="xl"
      >
        <div className="space-y-6">
          {/* Resolution Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold custom-black-white-theme-switch-text border-b border-[var(--bg-general-light)] pb-2">
              Resolution Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-1.5 custom-black-white-theme-switch-text">
                Resolution Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Describe how this issue was resolved..."
                minRows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 custom-black-white-theme-switch-text">
                Resolution Amount (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaMoneyBillWave className="text-gray-400" size={16} />
                </div>
                <NumberInput
                  value={resolutionAmount}
                  onChange={(val) => setResolutionAmount(typeof val === "number" ? val : 0)}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the amount required to resolve this issue (if any)
              </p>
            </div>
          </div>

          {/* Payment Information - Only show if amount > 0 */}
          {resolutionAmount > 0 && (
            <div className="space-y-4 border-t border-[var(--bg-general-light)] pt-6">
              <h3 className="text-lg font-semibold custom-black-white-theme-switch-text border-b border-[var(--bg-general-light)] pb-2">
                Payment Information
              </h3>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium mb-1.5 custom-black-white-theme-switch-text">
                  Select Payment Method <span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder="Choose a payment method..."
                  data={paymentMethods
                    .filter((pm) => pm.status)
                    .map((pm) => ({
                      value: pm._id.toString(),
                      label: `${pm.type.replace("_", " ")}${pm.bankName ? ` - ${pm.bankName}` : ""}${pm.cryptocurrency ? ` - ${pm.cryptocurrency}` : ""}${pm.provider ? ` - ${pm.provider}` : ""} (Fee: ${pm.fee}%)`,
                    }))}
                  value={selectedPaymentMethodId}
                  onChange={(val) => setSelectedPaymentMethodId(val || "")}
                  searchable
                  clearable={false}
                  required
                />
              </div>

              {/* Payment Details Display with Copy Buttons */}
              {selectedPaymentMethod && (
                <Card className="border border-[var(--bg-general-light)]" withBorder>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--bg-general-light)] pb-2">
                      <h4 className="font-semibold custom-black-white-theme-switch-text">
                        Payment Details
                      </h4>
                      <Badge color="blue" variant="light" size="sm">
                        {selectedPaymentMethod.type.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {/* Crypto Wallet Details */}
                      {selectedPaymentMethod.type === PaymentMethodType.CRYPTO_WALLET && (
                        <>
                          {selectedPaymentMethod.cryptocurrency && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Cryptocurrency</p>
                                <p className="font-medium custom-black-white-theme-switch-text">{selectedPaymentMethod.cryptocurrency}</p>
                              </div>
                              <Button
                                variant="subtle"
                                size="xs"
                                leftSection={copySuccess[`crypto-${selectedPaymentMethod._id}`] ? <FaCheck /> : <FaCopy />}
                                onClick={() => handleCopy(selectedPaymentMethod.cryptocurrency!, `crypto-${selectedPaymentMethod._id}`)}
                              >
                                {copySuccess[`crypto-${selectedPaymentMethod._id}`] ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                          )}
                          {selectedPaymentMethod.network && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Network</p>
                                <p className="font-medium custom-black-white-theme-switch-text">{selectedPaymentMethod.network}</p>
                              </div>
                              <Button
                                variant="subtle"
                                size="xs"
                                leftSection={copySuccess[`network-${selectedPaymentMethod._id}`] ? <FaCheck /> : <FaCopy />}
                                onClick={() => handleCopy(selectedPaymentMethod.network!, `network-${selectedPaymentMethod._id}`)}
                              >
                                {copySuccess[`network-${selectedPaymentMethod._id}`] ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                          )}
                          {selectedPaymentMethod.walletAddress && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Wallet Address</p>
                                <p className="font-medium custom-black-white-theme-switch-text font-mono text-sm break-all">{selectedPaymentMethod.walletAddress}</p>
                              </div>
                              <Button
                                variant="subtle"
                                size="xs"
                                leftSection={copySuccess[`wallet-${selectedPaymentMethod._id}`] ? <FaCheck /> : <FaCopy />}
                                onClick={() => handleCopy(selectedPaymentMethod.walletAddress!, `wallet-${selectedPaymentMethod._id}`)}
                              >
                                {copySuccess[`wallet-${selectedPaymentMethod._id}`] ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                          )}
                          {selectedPaymentMethod.qrCode && (
                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-center">
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">QR Code</p>
                              <img src={selectedPaymentMethod.qrCode} alt="Payment QR Code" className="max-w-[200px] mx-auto rounded" />
                            </div>
                          )}
                        </>
                      )}

                      {/* Bank Account Details */}
                      {selectedPaymentMethod.type === PaymentMethodType.BANK_ACCOUNT && (
                        <>
                          {selectedPaymentMethod.bankName && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Bank Name</p>
                                <p className="font-medium custom-black-white-theme-switch-text">{selectedPaymentMethod.bankName}</p>
                              </div>
                              <Button
                                variant="subtle"
                                size="xs"
                                leftSection={copySuccess[`bank-${selectedPaymentMethod._id}`] ? <FaCheck /> : <FaCopy />}
                                onClick={() => handleCopy(selectedPaymentMethod.bankName!, `bank-${selectedPaymentMethod._id}`)}
                              >
                                {copySuccess[`bank-${selectedPaymentMethod._id}`] ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                          )}
                          {selectedPaymentMethod.accountName && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Account Name</p>
                                <p className="font-medium custom-black-white-theme-switch-text">{selectedPaymentMethod.accountName}</p>
                              </div>
                              <Button
                                variant="subtle"
                                size="xs"
                                leftSection={copySuccess[`accname-${selectedPaymentMethod._id}`] ? <FaCheck /> : <FaCopy />}
                                onClick={() => handleCopy(selectedPaymentMethod.accountName!, `accname-${selectedPaymentMethod._id}`)}
                              >
                                {copySuccess[`accname-${selectedPaymentMethod._id}`] ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                          )}
                          {selectedPaymentMethod.accountNumber && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Account Number</p>
                                <p className="font-medium custom-black-white-theme-switch-text font-mono">{selectedPaymentMethod.accountNumber}</p>
                              </div>
                              <Button
                                variant="subtle"
                                size="xs"
                                leftSection={copySuccess[`accnum-${selectedPaymentMethod._id}`] ? <FaCheck /> : <FaCopy />}
                                onClick={() => handleCopy(selectedPaymentMethod.accountNumber!, `accnum-${selectedPaymentMethod._id}`)}
                              >
                                {copySuccess[`accnum-${selectedPaymentMethod._id}`] ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                          )}
                          {selectedPaymentMethod.routingNumber && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Routing Number</p>
                                <p className="font-medium custom-black-white-theme-switch-text font-mono">{selectedPaymentMethod.routingNumber}</p>
                              </div>
                              <Button
                                variant="subtle"
                                size="xs"
                                leftSection={copySuccess[`routing-${selectedPaymentMethod._id}`] ? <FaCheck /> : <FaCopy />}
                                onClick={() => handleCopy(selectedPaymentMethod.routingNumber!, `routing-${selectedPaymentMethod._id}`)}
                              >
                                {copySuccess[`routing-${selectedPaymentMethod._id}`] ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                          )}
                          {selectedPaymentMethod.swiftCode && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">SWIFT Code</p>
                                <p className="font-medium custom-black-white-theme-switch-text font-mono">{selectedPaymentMethod.swiftCode}</p>
                              </div>
                              <Button
                                variant="subtle"
                                size="xs"
                                leftSection={copySuccess[`swift-${selectedPaymentMethod._id}`] ? <FaCheck /> : <FaCopy />}
                                onClick={() => handleCopy(selectedPaymentMethod.swiftCode!, `swift-${selectedPaymentMethod._id}`)}
                              >
                                {copySuccess[`swift-${selectedPaymentMethod._id}`] ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                          )}
                        </>
                      )}

                      {/* Mobile Payment Details */}
                      {selectedPaymentMethod.type === PaymentMethodType.MOBILE_PAYMENT && (
                        <>
                          {selectedPaymentMethod.provider && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Provider</p>
                                <p className="font-medium custom-black-white-theme-switch-text">{selectedPaymentMethod.provider}</p>
                              </div>
                              <Button
                                variant="subtle"
                                size="xs"
                                leftSection={copySuccess[`provider-${selectedPaymentMethod._id}`] ? <FaCheck /> : <FaCopy />}
                                onClick={() => handleCopy(selectedPaymentMethod.provider!, `provider-${selectedPaymentMethod._id}`)}
                              >
                                {copySuccess[`provider-${selectedPaymentMethod._id}`] ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                          )}
                          {selectedPaymentMethod.handle && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Handle / Phone</p>
                                <p className="font-medium custom-black-white-theme-switch-text">{selectedPaymentMethod.handle}</p>
                              </div>
                              <Button
                                variant="subtle"
                                size="xs"
                                leftSection={copySuccess[`handle-${selectedPaymentMethod._id}`] ? <FaCheck /> : <FaCopy />}
                                onClick={() => handleCopy(selectedPaymentMethod.handle!, `handle-${selectedPaymentMethod._id}`)}
                              >
                                {copySuccess[`handle-${selectedPaymentMethod._id}`] ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                          )}
                          {selectedPaymentMethod.email && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Email</p>
                                <p className="font-medium custom-black-white-theme-switch-text">{selectedPaymentMethod.email}</p>
                              </div>
                              <Button
                                variant="subtle"
                                size="xs"
                                leftSection={copySuccess[`email-${selectedPaymentMethod._id}`] ? <FaCheck /> : <FaCopy />}
                                onClick={() => handleCopy(selectedPaymentMethod.email!, `email-${selectedPaymentMethod._id}`)}
                              >
                                {copySuccess[`email-${selectedPaymentMethod._id}`] ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                          )}
                        </>
                      )}

                      {selectedPaymentMethod.processingTime && (
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            <strong>Processing Time:</strong> {selectedPaymentMethod.processingTime}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Amount Summary */}
              {selectedPaymentMethod && (
                <Card className="border border-[var(--bg-general-light)] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20" withBorder>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Resolution Amount:</span>
                      <span className="font-semibold custom-black-white-theme-switch-text">
                        ${resolutionAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Payment Fee ({paymentFeePercent}%):
                      </span>
                      <span className="font-semibold custom-black-white-theme-switch-text">
                        ${paymentFeeAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-[var(--bg-general-light)] pt-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold custom-black-white-theme-switch-text">
                          Total Amount:
                        </span>
                        <span className="text-lg font-bold text-[var(--bg-general)]">
                          ${totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Proof of Payment Upload */}
              <div>
                <label className="block text-sm font-medium mb-1.5 custom-black-white-theme-switch-text">
                  Proof of Payment <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {proofOfPaymentUrl ? (
                    <div className="relative p-3 border border-green-300 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaCheck className="text-green-600 dark:text-green-400" />
                          <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                            Proof of payment uploaded successfully
                          </span>
                        </div>
                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => {
                            setProofOfPaymentUrl("");
                            setProofOfPaymentFile(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                      <img
                        src={proofOfPaymentUrl}
                        alt="Proof of payment"
                        className="mt-2 max-w-full h-auto max-h-48 rounded border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="proof-of-payment-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setProofOfPaymentFile(file);
                            handleProofUpload(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="proof-of-payment-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-[var(--bg-general)] transition-colors bg-gray-50 dark:bg-gray-800"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FaUpload className="text-gray-400 mb-2" size={24} />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                  {uploadingProof && (
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      Uploading proof of payment...
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Upload a screenshot or image showing proof of payment
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--bg-general-light)]">
            <Button
              variant="outline"
              onClick={() => {
                setResolveModalOpen(false);
                setIssueToResolve(null);
                setIssueToResolveData(null);
                setResolutionText("");
                setResolutionAmount(0);
                setSelectedPaymentMethodId("");
                setSelectedPaymentMethod(null);
                setProofOfPaymentFile(null);
                setProofOfPaymentUrl("");
                setCopySuccess({});
              }}
              disabled={loading || uploadingProof}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              loading={loading || uploadingProof}
              color="brandOrange"
              disabled={
                !resolutionText.trim() ||
                (resolutionAmount > 0 && (!selectedPaymentMethodId || !proofOfPaymentUrl))
              }
            >
              {resolutionAmount > 0 ? "Resolve & Mark as Paid" : "Resolve Issue"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        opened={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setDetailsIssue(null);
        }}
        title={`Issue Details — ${detailsIssue?.title ?? ""}`}
        size="lg"
      >
        {detailsIssue && (() => {
          const parcelDisplay = getParcelDisplay(detailsIssue);
          const parcelId = parcelDisplay?.parcelId ?? normalizeId((detailsIssue as any).parcelId);
          const trackingId = parcelDisplay?.trackingId;
          const parcelSearchValue = trackingId || parcelId;

          return (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Type</p>
                  <Badge color={(TYPE_COLORS[detailsIssue.type] || "gray") as any} variant="light">
                    {detailsIssue.type.replaceAll("_", " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <Badge color={STATUS_COLORS[detailsIssue.status] as any} variant="light">
                    {detailsIssue.status.replaceAll("_", " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Priority</p>
                  <Badge color={PRIORITY_COLORS[detailsIssue.priority] as any} variant="light">
                    {detailsIssue.priority}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-[var(--bg-general-light)] pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                <p className="custom-black-white-theme-switch-text whitespace-pre-wrap leading-relaxed">
                  {detailsIssue.description}
                </p>
              </div>

              {detailsIssue.resolution && (
                <div className="border-t border-[var(--bg-general-light)] pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Resolution</p>
                  <p className="custom-black-white-theme-switch-text whitespace-pre-wrap leading-relaxed">
                    {detailsIssue.resolution}
                  </p>
                </div>
              )}

              {detailsIssue.adminNotes && (
                <div className="border-t border-[var(--bg-general-light)] pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Admin Notes</p>
                  <p className="custom-black-white-theme-switch-text whitespace-pre-wrap leading-relaxed">
                    {detailsIssue.adminNotes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-[var(--bg-general-light)] pt-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Parcel</p>
                  {parcelId ? (
                    <Link
                      href={`/admin-dashboard/parcels?search=${encodeURIComponent(parcelSearchValue)}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      title={parcelId}
                    >
                      {trackingId ? `${trackingId} (ID: ${shortId(parcelId)})` : parcelId}
                    </Link>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">—</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reported</p>
                  <p className="custom-black-white-theme-switch-text">
                    {new Date(detailsIssue.reportedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {detailsIssue.resolvedAt && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Resolved</p>
                  <p className="custom-black-white-theme-switch-text">
                    {new Date(detailsIssue.resolvedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        opened={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setIssueToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete issue?"
        message={
          <div className="text-sm custom-black-white-theme-switch-text">
            Are you sure you want to delete this issue? This action cannot be undone.
          </div>
        }
        loading={loading}
      />
    </div>
  );
}
