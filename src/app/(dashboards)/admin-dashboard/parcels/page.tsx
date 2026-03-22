"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/api/axios";
import {
    ActionIcon,
    Badge,
    Button,
    Center,
    Divider,
    FileButton,
    Group,
    Modal,
    Pagination,
    ScrollArea,
    SimpleGrid,
    Table,
    Text,
    TextInput,
    Textarea,
    Tooltip,
    Menu,
    Select,
    NumberInput,
    Paper,
    ThemeIcon,
    Switch,
    Tabs,
    Stack,
    Card,
    Anchor,
    CopyButton,
    Progress,
} from "@mantine/core";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { IParcel } from "@/lib/models/parcel.model";
import ConfirmationModal from "@/components/features/ConfirmationModal";
import CustomLoader from "@/components/features/CustomLoader";
import Logo from "@/components/common/Logo";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
    LuEye,
    LuExternalLink,
    LuCopy,
    LuImage,
    LuMap,
    LuPackageSearch,
    LuPlus,
    LuTrash2,
    LuPencil,
    LuArrowUp,
    LuArrowDown,
    LuUser,
    LuMail,
    LuPhone,
    LuInfo,
    LuClock,
    LuBox,
    LuTruck,
    LuCalendarClock,
    LuCheck,
} from "react-icons/lu";
import { RiMapPinTimeLine } from "react-icons/ri";
import { FaEllipsisV } from "react-icons/fa";
import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type StatusKey =
    | "PENDING"
    | "DISPATCHED"
    | "IN_TRANSIT"
    | "ARRIVED"
    | "CUSTOMS"
    | "DELIVERED"
    | "CANCELLED"
    | string;

const STATUS_COLOR: Partial<Record<StatusKey, string>> = {
    PENDING: "gray",
    DISPATCHED: "blue",
    IN_TRANSIT: "indigo",
    ARRIVED: "yellow",
    CUSTOMS: "orange",
    DELIVERED: "green",
    CANCELLED: "red",
};

const STATUS_STEP: Record<string, number> = {
    PENDING: 15,
    DISPATCHED: 30,
    IN_TRANSIT: 60,
    ARRIVED: 75,
    CUSTOMS: 85,
    DELIVERED: 100,
    CANCELLED: 0,
};

type TMOption = { value: string; label: string };

type ImageAsset =
    | string
    | {
        _id?: string;
        url: string;
        alt?: string;
        label?: string;
        order?: number;
        uploadedAt?: string | Date;
    };

type TimelineItem = {
    _id?: string;
    status: StatusKey;
    message: string;
    timelineDate: string | Date;
    location?: string;
    sendEmail?: boolean;
};

type LiveRouteItem = {
    _id?: string;
    latitude: number;
    longitude: number;
    timestamp: string | Date;
    visible: boolean;
    sendEmail?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                               Zod Form Schemas                             */
/* -------------------------------------------------------------------------- */

const ContactZ = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
});

const CreateParcelSchema = z.object({
    sender: ContactZ,
    receiver: ContactZ,
    description: z.string().min(1, "Description is required"),
    weight: z.coerce.number().positive("Weight must be positive"),
    dimensions: z.string().min(1, "Dimensions are required"),
    imageUrls: z.array(z.string().url()).default([]),
    transportMeans: z.string().min(1, "Transport means is required"),
    pickupDate: z.string().min(1, "Pickup date is required"),
    estimatedDeliveryDate: z.string().min(1, "ETA is required"),
    fromLocation: z.string().min(1, "From location is required"),
    toLocation: z.string().min(1, "To location is required"),
});
type CreateParcelFormData = z.infer<typeof CreateParcelSchema>;

const PartialContactZ = ContactZ.partial();

const UpdateParcelSchema = z.object({
    sender: PartialContactZ.optional(),
    receiver: PartialContactZ.optional(),
    description: z.string().optional(),
    weight: z.coerce.number().positive().optional(),
    dimensions: z.string().optional(),
    transportMeans: z.string().optional(),
    pickupDate: z.string().optional(),
    estimatedDeliveryDate: z.string().optional(),
    actualDeliveryDate: z.string().optional(),
    fromLocation: z.string().optional(),
    toLocation: z.string().optional(),
    currentStatus: z
        .enum([
            "PENDING",
            "DISPATCHED",
            "IN_TRANSIT",
            "ARRIVED",
            "CUSTOMS",
            "DELIVERED",
            "CANCELLED",
        ])
        .optional(),
});
type UpdateParcelFormData = z.infer<typeof UpdateParcelSchema>;

const TimelineFormSchema = z.object({
    status: z.enum([
        "PENDING",
        "DISPATCHED",
        "IN_TRANSIT",
        "ARRIVED",
        "CUSTOMS",
        "DELIVERED",
        "CANCELLED",
    ]),
    message: z.string().min(1, "Message is required"),
    timelineDate: z
        .string()
        .min(1, "Date is required")
        .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
    location: z.string().optional(),
    sendEmail: z.coerce.boolean().default(false),
});
type TimelineFormData = z.infer<typeof TimelineFormSchema>;

const RouteFormSchema = z.object({
    latitude: z
        .coerce.number()
        .refine((n) => !Number.isNaN(n), "Latitude must be a number")
        .refine((n) => n >= -90 && n <= 90, "Latitude must be between -90 and 90"),
    longitude: z
        .coerce.number()
        .refine((n) => !Number.isNaN(n), "Longitude must be a number")
        .refine((n) => n >= -180 && n <= 180, "Longitude must be between -180 and 180"),
    timestamp: z
        .string()
        .min(1, "Timestamp is required")
        .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
    visible: z.coerce.boolean().default(true),
    sendEmail: z.coerce.boolean().default(false),
});
type RouteFormData = z.infer<typeof RouteFormSchema>;

/* -------------------------------------------------------------------------- */
/*                               Helper Components                            */
/* -------------------------------------------------------------------------- */

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
    height = 140,
}: {
    src: string;
    alt: string;
    className?: string;
    height?: number;
}) {
    const [imgSrc, setImgSrc] = useState(src);
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

const fmtDT = (d?: string | Date) => (d ? new Date(d).toLocaleString() : "—");

function FieldLine({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value?: React.ReactNode;
}) {
    return (
        <Group gap="xs" align="center" wrap="nowrap">
            <ThemeIcon variant="light" size="sm">
                {icon}
            </ThemeIcon>
            <Text size="sm" c="dimmed" w={115}>
                {label}
            </Text>
            <Text size="sm" fw={600} className="truncate">
                {value ?? "—"}
            </Text>
        </Group>
    );
}

function EmptyState({
    icon,
    title,
    subtitle,
    cta,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    cta?: React.ReactNode;
}) {
    return (
        <Center className="py-12">
            <div className="text-center max-w-md">
                <div className="mx-auto mb-4 h-14 w-14 rounded-2xl flex items-center justify-center bg-[var(--bg-general-light)]/60">
                    {icon}
                </div>
                <h3 className="text-base font-semibold mb-1 custom-black-white-theme-switch-text">
                    {title}
                </h3>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                {cta && <div className="mt-3">{cta}</div>}
            </div>
        </Center>
    );
}

/* ----------------------------- small utilities ----------------------------- */

function toISOorUndef(v?: string): string | undefined {
    if (!v) return undefined;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toISOString();
}

function pruneEmpty<T = any>(obj: T): T {
    if (Array.isArray(obj)) {
        return obj.map(pruneEmpty).filter((v) => v !== undefined) as any;
    }
    if (obj && typeof obj === "object") {
        const out: any = {};
        Object.entries(obj as any).forEach(([k, v]) => {
            const pv = pruneEmpty(v as any);
            const isEmptyString = pv === "";
            const isUndef = pv === undefined;
            if (!isUndef && !isEmptyString) out[k] = pv;
        });
        return out;
    }
    return obj as any;
}

function getErrMsg(err: any) {
    return (
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again."
    );
}

/** Structured error logger for quick backend tracing */
function logErr(tag: string, err: any, extra?: Record<string, any>) {
    const payload = {
        tag,
        message: getErrMsg(err),
        status: err?.response?.status,
        url: err?.config?.url,
        method: err?.config?.method,
        extra,
    };
    // eslint-disable-next-line no-console
    console.log("[ParcelsPage.error]", payload);
}

/** Tiny keyed loading manager so each button can spin independently */
function useKeyedLoading() {
    const [map, setMap] = useState<Record<string, boolean>>({});

    const set = (key: string, val: boolean) =>
        setMap((m) => {
            if (val) return { ...m, [key]: true };
            const next = { ...m };
            delete next[key];
            return next;
        });

    const is = (key: string) => !!map[key];

    return { is, set };
}

/* ------------------------------ data extractors ----------------------------- */

function getParcelTimeline(p: IParcel): TimelineItem[] {
    const anyP: any = p as any;
    const raw =
        anyP?.timeline ||
        anyP?.timelines ||
        anyP?.trackingTimeline ||
        anyP?.events ||
        [];
    if (!Array.isArray(raw)) return [];
    return raw
        .map((x: any) => ({
            _id: x?._id,
            status: x?.status ?? "IN_TRANSIT",
            message: x?.message ?? "",
            timelineDate: x?.timelineDate ?? x?.date ?? x?.timestamp ?? x?.createdAt ?? new Date().toISOString(),
            location: x?.location,
            sendEmail: x?.sendEmail,
        }))
        .filter((x: TimelineItem) => !!x.message || !!x.status);
}

function getParcelRoutes(p: IParcel): LiveRouteItem[] {
    const anyP: any = p as any;
    const raw =
        anyP?.locations ||
        anyP?.liveRoutes ||
        anyP?.routeLocations ||
        anyP?.routePoints ||
        [];
    if (!Array.isArray(raw)) return [];
    return raw
        .map((x: any) => ({
            _id: x?._id,
            latitude: Number(x?.latitude ?? 0),
            longitude: Number(x?.longitude ?? 0),
            timestamp: x?.timestamp ?? x?.date ?? x?.createdAt ?? new Date().toISOString(),
            visible: Boolean(x?.visible ?? true),
            sendEmail: x?.sendEmail,
        }))
        .filter((x: LiveRouteItem) => !Number.isNaN(x.latitude) && !Number.isNaN(x.longitude));
}

function normalizeImages(arr: any[]): ImageAsset[] {
    return (arr || []).map((x) => (typeof x === "string" ? { url: x } : x));
}

function safeStr(v: any) {
    if (v === null || v === undefined) return "—";
    if (typeof v === "string" && v.trim().length === 0) return "—";
    return String(v);
}

function mapsLink(lat: number, lng: number) {
    const q = `${lat},${lng}`;
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}`;
}

/* -------------------------------------------------------------------------- */
/*                                Main Component                              */
/* -------------------------------------------------------------------------- */

export default function ParcelsPage() {
    const [parcels, setParcels] = useState<IParcel[]>([]);
    const [loading, setLoading] = useState(false);

    const { is: isLoading, set: setLoadingKey } = useKeyedLoading();

    // search + pagination
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 12;

    // modals
    const [detailsParcel, setDetailsParcel] = useState<IParcel | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState<null | IParcel>(null);

    // subresource modals
    const [imagesOpen, setImagesOpen] = useState<null | IParcel>(null);
    const [timelineOpen, setTimelineOpen] = useState<null | IParcel>(null);
    const [routesOpen, setRoutesOpen] = useState<null | IParcel>(null);

    // confirmations
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [parcelToDelete, setParcelToDelete] = useState<string | null>(null);

    const [confirmEditSave, setConfirmEditSave] = useState(false);
    const [pendingEditData, setPendingEditData] = useState<UpdateParcelFormData | null>(null);
    const [editError, setEditError] = useState<string | null>(null);

    const [confirmTimelineDelete, setConfirmTimelineDelete] = useState<{
        parcelId: string;
        timelineId: string;
    } | null>(null);

    const [confirmRouteDelete, setConfirmRouteDelete] = useState<{
        parcelId: string;
        locationId: string;
    } | null>(null);

    const [confirmTimelineSubmit, setConfirmTimelineSubmit] = useState(false);
    const [pendingTLData, setPendingTLData] = useState<TimelineFormData | null>(null);
    const [timelineError, setTimelineError] = useState<string | null>(null);

    const [confirmRouteSubmit, setConfirmRouteSubmit] = useState(false);
    const [pendingRTData, setPendingRTData] = useState<RouteFormData | null>(null);
    const [routeError, setRouteError] = useState<string | null>(null);

    const [confirmToggle, setConfirmToggle] = useState<{ parcelId: string; locationId: string } | null>(null);

    // image delete
    const [pendingImageDelete, setPendingImageDelete] = useState<{ parcelId: string; imageId: string } | null>(null);
    const [imageDeleteError, setImageDeleteError] = useState<string | null>(null);

    // transport means
    const [tmOptions, setTmOptions] = useState<TMOption[]>([]);
    const SELECT_COMBOBOX_PROPS = { withinPortal: true, zIndex: 4000 };

    /* ----------------------------- Fetch & Helpers ---------------------------- */

    const fetchAll = async () => {
        const key = "fetch-parcels";
        setLoading(true);
        setLoadingKey(key, true);
        try {
            const res = await api.get("/parcel");
            setParcels(res.data.parcels || []);
        } catch (e: any) {
            logErr("fetchAll", e);
            toast.error(getErrMsg(e));
        } finally {
            setLoading(false);
            setLoadingKey(key, false);
        }
    };

    const fetchTM = async () => {
        const key = "fetch-transport-means";
        setLoadingKey(key, true);
        try {
            const res = await api.get("/transportMeans");
            const list: any[] = res.data.transportMeans || [];
            setTmOptions(list.map((t) => ({ value: t._id, label: `${t.name} — ${t.type}` })));
        } catch (e: any) {
            logErr("fetchTM", e);
        } finally {
            setLoadingKey(key, false);
        }
    };

    useEffect(() => {
        fetchAll();
        fetchTM();
    }, []);

    // keep open modals in sync when list refreshes
    useEffect(() => {
        const sync = (opened: IParcel | null, setOpened: (p: IParcel | null) => void) => {
            if (!opened?._id) return;
            const updated = parcels.find((x) => String(x._id) === String(opened._id));
            if (updated) setOpened(updated);
        };

        sync(detailsParcel, setDetailsParcel);
        sync(imagesOpen, setImagesOpen);
        sync(timelineOpen, setTimelineOpen);
        sync(routesOpen, setRoutesOpen);
        sync(editOpen, setEditOpen);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parcels]);

    const refreshParcelOnly = async (id: string) => {
        try {
            const res = await api.get(`/parcel/${id}`);
            const updated = res.data.parcel as IParcel;
            setParcels((prev) => prev.map((x) => (String(x._id) === String(id) ? updated : x)));
            return updated;
        } catch (e: any) {
            logErr("refreshParcelOnly", e, { id });
            return null;
        }
    };

    const afterSuccess = async (message: string) => {
        toast.success(message);
        await fetchAll();
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return parcels;
        return parcels.filter((p) => {
            const tid = (p.trackingId ?? "").toLowerCase();
            const s = (p.sender?.name ?? "").toLowerCase();
            const r = (p.receiver?.name ?? "").toLowerCase();
            const st = (p.currentStatus ?? "").toLowerCase();
            return tid.includes(q) || s.includes(q) || r.includes(q) || st.includes(q);
        });
    }, [parcels, query]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const slice = useMemo(
        () => filtered.slice((page - 1) * pageSize, page * pageSize),
        [filtered, page]
    );

    const copy = async (text: string) => {
        const key = `copy-${text}`;
        setLoadingKey(key, true);
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Copied");
        } catch (e: any) {
            logErr("copy", e, { text });
            toast.error("Copy failed");
        } finally {
            setLoadingKey(key, false);
        }
    };

    const transportLabel = (p: IParcel) => {
        const tm: any = (p as any)?.transportMeans;
        if (!tm) return "—";
        if (typeof tm === "string") {
            const match = tmOptions.find((x) => x.value === tm);
            return match?.label ?? "Transport Means";
        }
        return `${tm?.name ?? "Transport"} — ${tm?.type ?? "—"}`;
    };

    const extractImages = (p: IParcel): ImageAsset[] => {
        const arr: any[] = Array.isArray((p as any).imageUrls) ? (p as any).imageUrls : [];
        return normalizeImages(arr)
            .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))
            .map((x: any) => (typeof x === "string" ? { url: x } : x));
    };

    const sortedTimeline = (p: IParcel) => {
        const list = getParcelTimeline(p);
        return list.sort((a, b) => new Date(b.timelineDate).getTime() - new Date(a.timelineDate).getTime());
    };

    const sortedRoutes = (p: IParcel) => {
        const list = getParcelRoutes(p);
        return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };

    /* -------------------------------------------------------------------------- */
    /*                            Create / Update Parcel                          */
    /* -------------------------------------------------------------------------- */

    const {
        control: cCreate,
        handleSubmit: hCreate,
        formState: { errors: eCreate },
        reset: rCreate,
        setValue: svCreate,
        watch: wCreate,
    } = useForm<CreateParcelFormData>({
        resolver: zodResolver(CreateParcelSchema),
        defaultValues: {
            sender: { name: "", email: "", phone: "", address: "", city: "", state: "", postalCode: "", country: "" },
            receiver: { name: "", email: "", phone: "", address: "", city: "", state: "", postalCode: "", country: "" },
            description: "",
            weight: 0,
            dimensions: "",
            imageUrls: [],
            transportMeans: "",
            pickupDate: "",
            estimatedDeliveryDate: "",
            fromLocation: "",
            toLocation: "",
        },
    });

    const onCreate = async (data: CreateParcelFormData) => {
        const key = "create-parcel";
        setLoadingKey(key, true);
        try {
            const payload = {
                ...data,
                pickupDate: toISOorUndef(data.pickupDate),
                estimatedDeliveryDate: toISOorUndef(data.estimatedDeliveryDate),
            };
            const res = await api.post("/parcel", payload);
            const created = res.data.parcel;
            setParcels((prev) => [created, ...prev]);
            toast.success("Parcel created");
            setCreateOpen(false);
            rCreate();
            await fetchAll();
        } catch (e: any) {
            logErr("onCreate", e, { data });
            toast.error(getErrMsg(e));
        } finally {
            setLoadingKey(key, false);
        }
    };

    const {
        control: cEdit,
        handleSubmit: hEdit,
        formState: { errors: eEdit },
        reset: rEdit,
    } = useForm<UpdateParcelFormData>({
        resolver: zodResolver(UpdateParcelSchema),
        defaultValues: {
            sender: { name: "", email: "", phone: "", address: "", city: "", state: "", postalCode: "", country: "" },
            receiver: { name: "", email: "", phone: "", address: "", city: "", state: "", postalCode: "", country: "" },
        },
    });

    const openEdit = (p: IParcel) => {
        setEditError(null);
        setPendingEditData(null);
        setEditOpen(p);

        const toLocal = (d?: string | Date) => (d ? new Date(d).toISOString().slice(0, 16) : undefined);

        rEdit({
            description: p.description,
            weight: p.weight as any,
            dimensions: p.dimensions,
            transportMeans:
                typeof p.transportMeans === "string" ? p.transportMeans : (p.transportMeans as any)?._id,
            pickupDate: toLocal(p.pickupDate),
            estimatedDeliveryDate: toLocal(p.estimatedDeliveryDate),
            actualDeliveryDate: toLocal(p.actualDeliveryDate),
            fromLocation: p.fromLocation,
            toLocation: p.toLocation,
            currentStatus: p.currentStatus as any,
            sender: {
                name: p.sender?.name || "",
                email: p.sender?.email || "",
                phone: p.sender?.phone || "",
                address: p.sender?.address || "",
                city: p.sender?.city || "",
                state: p.sender?.state || "",
                postalCode: p.sender?.postalCode || "",
                country: p.sender?.country || "",
            },
            receiver: {
                name: p.receiver?.name || "",
                email: p.receiver?.email || "",
                phone: p.receiver?.phone || "",
                address: p.receiver?.address || "",
                city: p.receiver?.city || "",
                state: p.receiver?.state || "",
                postalCode: p.receiver?.postalCode || "",
                country: p.receiver?.country || "",
            },
        });
    };

    const performUpdate = async (rawData: UpdateParcelFormData) => {
        if (!editOpen?._id) return;
        const key = `update-parcel-${editOpen._id}`;
        setLoadingKey(key, true);
        setEditError(null);

        try {
            const payload = pruneEmpty({
                ...rawData,
                pickupDate: toISOorUndef(rawData.pickupDate),
                estimatedDeliveryDate: toISOorUndef(rawData.estimatedDeliveryDate),
                actualDeliveryDate: toISOorUndef(rawData.actualDeliveryDate),
            });

            const res = await api.put(`/parcel/${editOpen._id}`, payload);
            const updated = res.data.parcel;

            setParcels((prev) => prev.map((x) => (String(x._id) === String(editOpen._id) ? updated : x)));
            toast.success("Parcel updated");
            setConfirmEditSave(false);
            setPendingEditData(null);
            setEditOpen(null);
            await fetchAll();
        } catch (e: any) {
            logErr("performUpdate", e, { rawData, id: editOpen?._id });
            const msg = getErrMsg(e);
            setEditError(msg);
            toast.error(msg);
        } finally {
            setLoadingKey(key, false);
        }
    };

    /* -------------------------------------------------------------------------- */
    /*                               Delete Parcel                               */
    /* -------------------------------------------------------------------------- */

    const askDeleteParcel = (id: string) => {
        setParcelToDelete(id);
        setConfirmOpen(true);
    };

    const doDeleteParcel = async () => {
        if (!parcelToDelete) return;
        const key = `delete-parcel-${parcelToDelete}`;
        setLoadingKey(key, true);

        try {
            await api.delete(`/parcel/${parcelToDelete}`);
            setParcels((prev) => prev.filter((p) => String(p._id) !== String(parcelToDelete)));
            toast.success("Parcel deleted");
            setConfirmOpen(false);
            setParcelToDelete(null);
            await fetchAll();
        } catch (e: any) {
            logErr("doDeleteParcel", e, { id: parcelToDelete });
            toast.error(getErrMsg(e));
        } finally {
            setLoadingKey(key, false);
        }
    };

    /* -------------------------------------------------------------------------- */
    /*                               Images Manager                               */
    /* -------------------------------------------------------------------------- */

    const addImages = async (parcelId: string, images: { url: string; alt?: string; label?: string }[]) => {
        await api.post(`/parcel/${parcelId}/images`, { images });
    };

    const reorderImages = async (parcelId: string, order: { _id: string; order: number }[]) => {
        await api.put(`/parcel/${parcelId}/images`, { order });
    };

    const deleteImage = async (parcelId: string, imageId: string) => {
        await api.delete(`/parcel/${parcelId}/images/${imageId}`);
    };

    /* -------------------------------------------------------------------------- */
    /*                               Timelines CRUD                               */
    /* -------------------------------------------------------------------------- */

    const addTimeline = async (parcelId: string, item: TimelineItem) => {
        const body = {
            status: item.status,
            message: item.message,
            timelineDate: toISOorUndef(item.timelineDate as any)!,
            location: item.location,
            sendEmail: !!item.sendEmail,
        };
        await api.post(`/parcel/${parcelId}/timeline`, body);
    };

    const updateTimeline = async (parcelId: string, timelineId: string, patch: Partial<TimelineItem>) => {
        const body: any = { ...patch };
        if (body.timelineDate) body.timelineDate = toISOorUndef(body.timelineDate);
        await api.patch(`/parcel/${parcelId}/timeline/${timelineId}`, pruneEmpty(body));
    };

    const deleteTimeline = async (parcelId: string, timelineId: string) => {
        await api.delete(`/parcel/${parcelId}/timeline/${timelineId}`);
    };

    /* -------------------------------------------------------------------------- */
    /*                              Live Routes CRUD                              */
    /* -------------------------------------------------------------------------- */

    const addRoute = async (parcelId: string, item: LiveRouteItem) => {
        const body = {
            latitude: item.latitude,
            longitude: item.longitude,
            timestamp: toISOorUndef(item.timestamp as any)!,
            visible: item.visible,
            sendEmail: !!item.sendEmail,
        };
        await api.post(`/parcel/${parcelId}/locations`, body);
    };

    const updateRoute = async (parcelId: string, locationId: string, patch: Partial<LiveRouteItem>) => {
        const body: any = { ...patch };
        if (body.timestamp) body.timestamp = toISOorUndef(body.timestamp);
        await api.patch(`/parcel/${parcelId}/locations/${locationId}`, pruneEmpty(body));
    };

    const deleteRoute = async (parcelId: string, locationId: string) => {
        await api.delete(`/parcel/${parcelId}/locations/${locationId}`);
    };

    const toggleRouteVisibility = async (parcelId: string, locationId: string) => {
        await api.post(`/parcel/${parcelId}/locations/${locationId}`); // toggle
    };

    /* --------------------------- Timeline Add/Edit forms --------------------------- */

    const {
        control: cTL,
        handleSubmit: hTL,
        reset: rTL,
        formState: { errors: eTL },
        setValue: svTL,
    } = useForm<TimelineFormData>({
        resolver: zodResolver(TimelineFormSchema),
        defaultValues: {
            status: "IN_TRANSIT",
            message: "",
            timelineDate: new Date().toISOString().slice(0, 16),
            location: "",
            sendEmail: false,
        },
    });

    const [editTL, setEditTL] = useState<{ parcelId: string; item: TimelineItem } | null>(null);

    const startEditTimeline = (parcelId: string, item: TimelineItem) => {
        setTimelineError(null);
        setPendingTLData(null);
        setConfirmTimelineSubmit(false);

        setEditTL({ parcelId, item });

        svTL("status", (item.status as any) || "IN_TRANSIT");
        svTL("message", item.message || "");
        svTL("timelineDate", new Date(item.timelineDate).toISOString().slice(0, 16));
        svTL("location", item.location || "");
        svTL("sendEmail", false);
    };

    const submitTL = async (data: TimelineFormData) => {
        if (!timelineOpen?._id) return;

        const isEdit = !!editTL?.item?._id;
        const key = `${isEdit ? "update" : "create"}-timeline-${timelineOpen._id}-${editTL?.item?._id || "new"}`;
        setLoadingKey(key, true);
        setTimelineError(null);

        try {
            if (isEdit) {
                await updateTimeline(String(timelineOpen._id), String(editTL!.item._id), {
                    status: data.status,
                    message: data.message,
                    location: data.location || undefined,
                    timelineDate: data.timelineDate,
                });

                await refreshParcelOnly(String(timelineOpen._id));
                toast.success("Timeline updated");

                setConfirmTimelineSubmit(false);
                setPendingTLData(null);
                setEditTL(null);
                rTL();
            } else {
                await addTimeline(String(timelineOpen._id), {
                    status: data.status,
                    message: data.message,
                    location: data.location || undefined,
                    timelineDate: data.timelineDate,
                    sendEmail: data.sendEmail,
                });

                await refreshParcelOnly(String(timelineOpen._id));
                toast.success("Timeline added");

                setEditTL(null);
                rTL();
            }
        } catch (e: any) {
            logErr("submitTL", e, { data, parcelId: timelineOpen?._id, editId: editTL?.item?._id });
            const msg = getErrMsg(e);
            setTimelineError(msg);
            toast.error(msg);
        } finally {
            setLoadingKey(key, false);
        }
    };

    /* ---------------------------- Routes Add/Edit forms --------------------------- */

    const {
        control: cRT,
        handleSubmit: hRT,
        reset: rRT,
        formState: { errors: eRT },
        setValue: svRT,
    } = useForm<RouteFormData>({
        resolver: zodResolver(RouteFormSchema),
        defaultValues: {
            latitude: 0,
            longitude: 0,
            timestamp: new Date().toISOString().slice(0, 16),
            visible: true,
            sendEmail: false,
        },
    });

    const [editRT, setEditRT] = useState<{ parcelId: string; item: LiveRouteItem } | null>(null);

    const startEditRoute = (parcelId: string, item: LiveRouteItem) => {
        setRouteError(null);
        setPendingRTData(null);
        setConfirmRouteSubmit(false);

        setEditRT({ parcelId, item });

        svRT("latitude", Number(item.latitude ?? 0));
        svRT("longitude", Number(item.longitude ?? 0));
        svRT("timestamp", new Date(item.timestamp).toISOString().slice(0, 16));
        svRT("visible", Boolean(item.visible ?? true));
        svRT("sendEmail", false);
    };

    const submitRT = async (data: RouteFormData) => {
        if (!routesOpen?._id) return;

        const isEdit = !!editRT?.item?._id;
        const key = `${isEdit ? "update" : "create"}-route-${routesOpen._id}-${editRT?.item?._id || "new"}`;
        setLoadingKey(key, true);
        setRouteError(null);

        try {
            if (isEdit) {
                await updateRoute(String(routesOpen._id), String(editRT!.item._id), {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    timestamp: data.timestamp,
                    visible: data.visible,
                });

                await refreshParcelOnly(String(routesOpen._id));
                toast.success("Location updated");

                setConfirmRouteSubmit(false);
                setPendingRTData(null);
                setEditRT(null);
                rRT();
            } else {
                await addRoute(String(routesOpen._id), {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    timestamp: data.timestamp,
                    visible: data.visible,
                    sendEmail: data.sendEmail,
                });

                await refreshParcelOnly(String(routesOpen._id));
                toast.success("Location added");

                setEditRT(null);
                rRT();
            }
        } catch (e: any) {
            logErr("submitRT", e, { data, parcelId: routesOpen?._id, editId: editRT?.item?._id });
            const msg = getErrMsg(e);
            setRouteError(msg);
            toast.error(msg);
        } finally {
            setLoadingKey(key, false);
        }
    };

    /* -------------------------------------------------------------------------- */
    /*                                   Render                                   */
    /* -------------------------------------------------------------------------- */

    return (
        <div className="admin-page-container custom-black-white-theme-switch-bg">
            <CustomLoader
                loading={
                    loading ||
                    isLoading("fetch-parcels") ||
                    isLoading("fetch-transport-means")
                }
            />

            <AdminPageHeader
                title="Parcels"
                description="Manage all shipments and track parcel status. Create, update, and monitor delivery progress."
                primaryAction={{
                    label: "Create Parcel",
                    onClick: () => setCreateOpen(true),
                    icon: <LuPlus />,
                    loading: isLoading("open-create"),
                }}
                breadcrumbs={[
                    { label: "Admin Dashboard", href: "/admin-dashboard" },
                    { label: "Parcels" },
                ]}
                searchProps={{
                    value: query,
                    onChange: (e) => {
                        setPage(1);
                        setQuery(e.currentTarget.value);
                    },
                    placeholder: "Search by tracking ID, sender/receiver, or status",
                }}
            />

            {!loading && filtered.length === 0 ? (
                <EmptyState
                    icon={<LuPackageSearch className="h-7 w-7 opacity-70" />}
                    title="No parcels found"
                    subtitle="Add your first parcel to start tracking shipments and timelines."
                    cta={
                        <Button
                            color="brandOrange"
                            leftSection={<LuPlus />}
                            onClick={() => setCreateOpen(true)}
                        >
                            Create Parcel
                        </Button>
                    }
                />
            ) : (
                <>
                    <Table.ScrollContainer minWidth={900} className="custom_table_scroll">
                        <Table
                            highlightOnHover
                            withRowBorders
                            className="custom_table"
                            data={{
                                head: ["Tracking ID", "Sender → Receiver", "Status", "Actions"],
                                body: slice.map((p) => [
                                    p.description ? (
                                        <Tooltip key="tid" label={p.description} withArrow>
                                            <Text fw={600} style={{ textDecoration: "underline" }}>
                                                {p.trackingId}
                                            </Text>
                                        </Tooltip>
                                    ) : (
                                        <Text key="tid-plain" fw={600}>
                                            {p.trackingId}
                                        </Text>
                                    ),
                                    `${p.sender?.name ?? "—"} → ${p.receiver?.name ?? "—"}`,
                                    <Badge
                                        key="status"
                                        variant="light"
                                        color={STATUS_COLOR[p.currentStatus as StatusKey] ?? "gray"}
                                    >
                                        {p.currentStatus ?? "—"}
                                    </Badge>,
                                    <Menu
                                        key={`${p._id}-menu`}
                                        shadow="md"
                                        width={240}
                                        position="bottom-end"
                                        withinPortal
                                    >
                                        <Menu.Target>
                                            <Button variant="subtle" size="xs">
                                                <FaEllipsisV />
                                            </Button>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item leftSection={<LuEye />} onClick={() => setDetailsParcel(p)}>
                                                View details
                                            </Menu.Item>
                                            <Menu.Item leftSection={<LuExternalLink />} onClick={() => openEdit(p)}>
                                                Edit parcel
                                            </Menu.Item>
                                            <Menu.Item leftSection={<LuImage />} onClick={() => setImagesOpen(p)}>
                                                Manage images
                                            </Menu.Item>
                                            <Menu.Item leftSection={<RiMapPinTimeLine />} onClick={() => setTimelineOpen(p)}>
                                                Manage timeline
                                            </Menu.Item>
                                            <Menu.Item leftSection={<LuMap />} onClick={() => setRoutesOpen(p)}>
                                                Manage live routes
                                            </Menu.Item>
                                            <Menu.Divider />
                                            <Menu.Item
                                                onClick={() => askDeleteParcel(String(p._id))}
                                                style={{ color: "var(--mantine-color-red-6)" }}
                                                leftSection={<LuTrash2 />}
                                            >
                                                Delete
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>,
                                ]),
                            }}
                        />
                    </Table.ScrollContainer>

                    <div className="flex mt-4 pt-2 border-t border-[var(--bg-general-light)]">
                        <Pagination total={totalPages} value={page} onChange={setPage} color="brandOrange" />
                    </div>
                </>
            )}

            {/* Delete Confirmation */}
            <ConfirmationModal
                opened={confirmOpen}
                onClose={() => {
                    if (parcelToDelete && isLoading(`delete-parcel-${parcelToDelete}`)) return;
                    setConfirmOpen(false);
                    setParcelToDelete(null);
                }}
                onConfirm={doDeleteParcel}
                title="Delete parcel?"
                message="Are you sure you want to delete this parcel? This action cannot be undone."
                loading={parcelToDelete ? isLoading(`delete-parcel-${parcelToDelete}`) : false}
                confirmColor="#e03131"
                zIndex={10000}
            />

            {/* =========================== Create Parcel ============================ */}
            <Modal
                opened={createOpen}
                onClose={() => {
                    if (isLoading("create-parcel") || isLoading("upload-create-images")) return;
                    setCreateOpen(false);
                    rCreate();
                }}
                centered
                size="xl"
                title={<Logo size="large" />}
                withinPortal
                zIndex={3000}
            >
                <form onSubmit={hCreate((d) => onCreate(d))}>
                    <Group justify="space-between" mb="sm">
                        <Text fw={700} size="lg">
                            Create Parcel
                        </Text>
                        <Badge variant="light" color="gray">
                            New shipment
                        </Badge>
                    </Group>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                        <div>
                            <Text fw={600} mb={6}>
                                Sender
                            </Text>
                            {(
                                [
                                    ["sender.name", "Full name*", "e.g. John Adewale"],
                                    ["sender.email", "Email*", "name@example.com"],
                                    ["sender.phone", "Phone*", "+234 801 234 5678"],
                                    ["sender.address", "Address*", "Street & number"],
                                    ["sender.city", "City*", "Lagos"],
                                    ["sender.state", "State*", "Lagos"],
                                    ["sender.postalCode", "Postal Code*", "100001"],
                                    ["sender.country", "Country*", "Nigeria"],
                                ] as const
                            ).map(([name, label, ph]) => (
                                <Controller
                                    key={name}
                                    name={name as any}
                                    control={cCreate}
                                    render={({ field }) => (
                                        <TextInput
                                            label={label}
                                            placeholder={ph}
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={(eCreate as any)?.sender?.[name.split(".")[1]]?.message}
                                            mt="xs"
                                            required
                                        />
                                    )}
                                />
                            ))}
                        </div>

                        <div>
                            <Text fw={600} mb={6}>
                                Receiver
                            </Text>
                            {(
                                [
                                    ["receiver.name", "Full name*", "e.g. Mary Uche"],
                                    ["receiver.email", "Email*", "name@example.com"],
                                    ["receiver.phone", "Phone*", "+44 20 7946 0958"],
                                    ["receiver.address", "Address*", "Street & number"],
                                    ["receiver.city", "City*", "London"],
                                    ["receiver.state", "State/Region*", "Greater London"],
                                    ["receiver.postalCode", "Postal Code*", "SW1A 1AA"],
                                    ["receiver.country", "Country*", "United Kingdom"],
                                ] as const
                            ).map(([name, label, ph]) => (
                                <Controller
                                    key={name}
                                    name={name as any}
                                    control={cCreate}
                                    render={({ field }) => (
                                        <TextInput
                                            label={label}
                                            placeholder={ph}
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={(eCreate as any)?.receiver?.[name.split(".")[1]]?.message}
                                            mt="xs"
                                            required
                                        />
                                    )}
                                />
                            ))}
                        </div>
                    </SimpleGrid>

                    <Divider my="md" />

                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                        <Controller
                            name="description"
                            control={cCreate}
                            render={({ field }) => (
                                <Textarea
                                    label="Description*"
                                    placeholder="Briefly describe the shipment contents"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={eCreate.description?.message}
                                    autosize={false}
                                    minRows={4}
                                />
                            )}
                        />
                        <Controller
                            name="weight"
                            control={cCreate}
                            render={({ field }) => (
                                <NumberInput
                                    label="Weight (kg)*"
                                    placeholder="e.g. 12.5"
                                    value={field.value as any}
                                    onChange={(v) => field.onChange(v ?? 0)}
                                    error={eCreate.weight?.message}
                                    min={0}
                                />
                            )}
                        />
                        <Controller
                            name="dimensions"
                            control={cCreate}
                            render={({ field }) => (
                                <TextInput
                                    label="Dimensions*"
                                    placeholder="e.g. 40 × 30 × 20 cm"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={eCreate.dimensions?.message}
                                />
                            )}
                        />
                    </SimpleGrid>

                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mt="sm">
                        <Controller
                            name="fromLocation"
                            control={cCreate}
                            render={({ field }) => (
                                <TextInput
                                    label="From*"
                                    placeholder="e.g. Ikeja, Lagos"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={eCreate.fromLocation?.message}
                                />
                            )}
                        />
                        <Controller
                            name="toLocation"
                            control={cCreate}
                            render={({ field }) => (
                                <TextInput
                                    label="To*"
                                    placeholder="e.g. Heathrow, London"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={eCreate.toLocation?.message}
                                />
                            )}
                        />
                        <Controller
                            name="transportMeans"
                            control={cCreate}
                            render={({ field }) => (
                                <Select
                                    comboboxProps={SELECT_COMBOBOX_PROPS}
                                    label="Transport Means*"
                                    placeholder="Select"
                                    data={tmOptions}
                                    value={field.value}
                                    onChange={(v) => field.onChange(v || "")}
                                    error={eCreate.transportMeans?.message}
                                />
                            )}
                        />
                    </SimpleGrid>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mt="sm">
                        <Controller
                            name="pickupDate"
                            control={cCreate}
                            render={({ field }) => (
                                <TextInput
                                    label="Pickup Date*"
                                    type="datetime-local"
                                    placeholder="Select date/time"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={eCreate.pickupDate?.message}
                                />
                            )}
                        />
                        <Controller
                            name="estimatedDeliveryDate"
                            control={cCreate}
                            render={({ field }) => (
                                <TextInput
                                    label="Estimated Delivery Date*"
                                    type="datetime-local"
                                    placeholder="Select date/time"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={eCreate.estimatedDeliveryDate?.message}
                                />
                            )}
                        />
                    </SimpleGrid>

                    <div className="mt-md">
                        <Text fw={600} mb={6}>
                            Package Images (upload to Cloudinary)
                        </Text>
                        <Group gap="xs" align="center">
                            <FileButton
                                accept="image/*"
                                multiple
                                onChange={async (files) => {
                                    if (!files || !files.length) return;
                                    const key = "upload-create-images";
                                    setLoadingKey(key, true);
                                    const uploaded: string[] = [];
                                    try {
                                        for (const f of files) {
                                            const res = await uploadToCloudinary(f, { onProgress: () => { } });
                                            uploaded.push(res.url);
                                        }
                                        const curr = wCreate("imageUrls") || [];
                                        svCreate("imageUrls", [...curr, ...uploaded]);
                                        toast.success(`Uploaded ${uploaded.length} image(s)`);
                                    } catch (e: any) {
                                        logErr("upload-create-images", e, { count: files?.length });
                                        toast.error(getErrMsg(e));
                                    } finally {
                                        setLoadingKey(key, false);
                                    }
                                }}
                            >
                                {(props) => (
                                    <Button
                                        {...props}
                                        variant="light"
                                        leftSection={<LuImage />}
                                        loading={isLoading("upload-create-images")}
                                    >
                                        Upload images
                                    </Button>
                                )}
                            </FileButton>
                            <Text size="sm" c="dimmed">
                                Uploaded URLs are saved with the parcel.
                            </Text>
                        </Group>

                        {wCreate("imageUrls")?.length ? (
                            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" mt="sm">
                                {wCreate("imageUrls").map((u, i) => (
                                    <div key={i} className="relative">
                                        <a href={u} target="_blank" rel="noreferrer">
                                            <SafeImage src={u} alt={`image ${i + 1}`} />
                                        </a>
                                        <ActionIcon
                                            variant="light"
                                            color="red"
                                            className="absolute top-2 right-2"
                                            onClick={() => {
                                                const curr = [...(wCreate("imageUrls") || [])];
                                                curr.splice(i, 1);
                                                svCreate("imageUrls", curr);
                                            }}
                                            aria-label="Remove"
                                        >
                                            <LuTrash2 />
                                        </ActionIcon>
                                    </div>
                                ))}
                            </SimpleGrid>
                        ) : null}
                    </div>

                    <Group justify="flex-end" mt="xl">
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (isLoading("create-parcel") || isLoading("upload-create-images")) return;
                                setCreateOpen(false);
                                rCreate();
                            }}
                            color="brandOrange"
                            disabled={isLoading("create-parcel") || isLoading("upload-create-images")}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" color="brandOrange" loading={isLoading("create-parcel")}>
                            Create
                        </Button>
                    </Group>
                </form>
            </Modal>

            {/* ============================ Edit Parcel ============================= */}
            <Modal
                opened={!!editOpen}
                onClose={() => {
                    if (editOpen && isLoading(`update-parcel-${editOpen._id}`)) return;
                    setEditOpen(null);
                    setConfirmEditSave(false);
                    setPendingEditData(null);
                    setEditError(null);
                }}
                centered
                size="xl"
                title={<Logo size="large" />}
                withinPortal
                zIndex={3000}
            >
                <form
                    onSubmit={hEdit((data) => {
                        setEditError(null);
                        setPendingEditData(data);
                        setConfirmEditSave(true);
                    })}
                >
                    <Group justify="space-between" mb="xs">
                        <Text fw={700} size="lg">
                            Edit Parcel
                        </Text>
                        {editOpen?.trackingId ? (
                            <Badge variant="light" color="gray">
                                {editOpen.trackingId}
                            </Badge>
                        ) : null}
                    </Group>

                    {editError ? (
                        <Text c="red" fw={600} size="sm" mb="sm">
                            {editError}
                        </Text>
                    ) : null}

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                        <Paper withBorder p="md" radius="md">
                            <Group mb={6}>
                                <ThemeIcon variant="light">
                                    <LuUser />
                                </ThemeIcon>
                                <Text fw={700}>Sender</Text>
                            </Group>
                            {(
                                [
                                    ["sender.name", "Full name", "—"],
                                    ["sender.email", "Email", "—"],
                                    ["sender.phone", "Phone", "—"],
                                    ["sender.address", "Address", "—"],
                                    ["sender.city", "City", "—"],
                                    ["sender.state", "State", "—"],
                                    ["sender.postalCode", "Postal Code", "—"],
                                    ["sender.country", "Country", "—"],
                                ] as const
                            ).map(([name, label, ph]) => (
                                <Controller
                                    key={name}
                                    name={name as any}
                                    control={cEdit}
                                    render={({ field }) => (
                                        <TextInput
                                            label={label}
                                            placeholder={ph}
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                            error={(eEdit as any)?.sender?.[name.split(".")[1]]?.message}
                                            mt="xs"
                                        />
                                    )}
                                />
                            ))}
                        </Paper>

                        <Paper withBorder p="md" radius="md">
                            <Group mb={6}>
                                <ThemeIcon variant="light">
                                    <LuUser />
                                </ThemeIcon>
                                <Text fw={700}>Receiver</Text>
                            </Group>
                            {(
                                [
                                    ["receiver.name", "Full name", "—"],
                                    ["receiver.email", "Email", "—"],
                                    ["receiver.phone", "Phone", "—"],
                                    ["receiver.address", "Address", "—"],
                                    ["receiver.city", "City", "—"],
                                    ["receiver.state", "State/Region", "—"],
                                    ["receiver.postalCode", "Postal Code", "—"],
                                    ["receiver.country", "Country", "—"],
                                ] as const
                            ).map(([name, label, ph]) => (
                                <Controller
                                    key={name}
                                    name={name as any}
                                    control={cEdit}
                                    render={({ field }) => (
                                        <TextInput
                                            label={label}
                                            placeholder={ph}
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                            error={(eEdit as any)?.receiver?.[name.split(".")[1]]?.message}
                                            mt="xs"
                                        />
                                    )}
                                />
                            ))}
                        </Paper>
                    </SimpleGrid>

                    <Divider my="md" />

                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                        <Controller
                            name="description"
                            control={cEdit}
                            render={({ field }) => (
                                <Textarea
                                    label="Description"
                                    placeholder="Describe the shipment"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    error={eEdit.description?.message}
                                    autosize={false}
                                    minRows={4}
                                />
                            )}
                        />
                        <Controller
                            name="weight"
                            control={cEdit}
                            render={({ field }) => (
                                <NumberInput
                                    label="Weight (kg)"
                                    placeholder="e.g. 10.2"
                                    value={field.value as any}
                                    onChange={(v) => field.onChange(v ?? undefined)}
                                    error={eEdit.weight?.message}
                                    min={0}
                                />
                            )}
                        />
                        <Controller
                            name="dimensions"
                            control={cEdit}
                            render={({ field }) => (
                                <TextInput
                                    label="Dimensions"
                                    placeholder="e.g. 30 × 20 × 15 cm"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    error={eEdit.dimensions?.message}
                                />
                            )}
                        />
                    </SimpleGrid>

                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mt="sm">
                        <Controller
                            name="fromLocation"
                            control={cEdit}
                            render={({ field }) => (
                                <TextInput
                                    label="From"
                                    placeholder="Origin"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    error={eEdit.fromLocation?.message}
                                />
                            )}
                        />
                        <Controller
                            name="toLocation"
                            control={cEdit}
                            render={({ field }) => (
                                <TextInput
                                    label="To"
                                    placeholder="Destination"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    error={eEdit.toLocation?.message}
                                />
                            )}
                        />
                        <Controller
                            name="transportMeans"
                            control={cEdit}
                            render={({ field }) => (
                                <Select
                                    comboboxProps={SELECT_COMBOBOX_PROPS}
                                    label="Transport Means"
                                    placeholder="Select"
                                    data={tmOptions}
                                    value={field.value || undefined}
                                    onChange={(v) => field.onChange(v || undefined)}
                                    error={eEdit.transportMeans?.message}
                                />
                            )}
                        />
                    </SimpleGrid>

                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mt="sm">
                        <Controller
                            name="pickupDate"
                            control={cEdit}
                            render={({ field }) => (
                                <TextInput
                                    label="Pickup Date"
                                    type="datetime-local"
                                    placeholder="Select date/time"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    error={eEdit.pickupDate?.message}
                                />
                            )}
                        />
                        <Controller
                            name="estimatedDeliveryDate"
                            control={cEdit}
                            render={({ field }) => (
                                <TextInput
                                    label="Estimated Delivery"
                                    type="datetime-local"
                                    placeholder="Select date/time"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    error={eEdit.estimatedDeliveryDate?.message}
                                />
                            )}
                        />
                        <Controller
                            name="actualDeliveryDate"
                            control={cEdit}
                            render={({ field }) => (
                                <TextInput
                                    label="Actual Delivery"
                                    type="datetime-local"
                                    placeholder="Select date/time"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    error={eEdit.actualDeliveryDate?.message}
                                />
                            )}
                        />
                    </SimpleGrid>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mt="sm">
                        <Controller
                            name="currentStatus"
                            control={cEdit}
                            render={({ field }) => (
                                <Select
                                    comboboxProps={SELECT_COMBOBOX_PROPS}
                                    label="Current Status"
                                    placeholder="Select"
                                    data={[
                                        "PENDING",
                                        "DISPATCHED",
                                        "IN_TRANSIT",
                                        "ARRIVED",
                                        "CUSTOMS",
                                        "DELIVERED",
                                        "CANCELLED",
                                    ].map((s) => ({ value: s, label: s.replaceAll("_", " ") }))}
                                    value={(field.value as any) || undefined}
                                    onChange={(v) => field.onChange(v || undefined)}
                                    error={eEdit.currentStatus?.message}
                                />
                            )}
                        />
                    </SimpleGrid>

                    <Group justify="flex-end" mt="xl">
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (editOpen && isLoading(`update-parcel-${editOpen._id}`)) return;
                                setEditOpen(null);
                                setConfirmEditSave(false);
                                setPendingEditData(null);
                                setEditError(null);
                            }}
                            color="brandOrange"
                            disabled={editOpen ? isLoading(`update-parcel-${editOpen._id}`) : false}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            color="brandOrange"
                            loading={editOpen ? isLoading(`update-parcel-${editOpen._id}`) : false}
                        >
                            Save
                        </Button>
                    </Group>
                </form>
            </Modal>

            {/* Confirm before saving edits (parcel) */}
            <ConfirmationModal
                opened={confirmEditSave}
                onClose={() => {
                    if (editOpen && isLoading(`update-parcel-${editOpen._id}`)) return;
                    setConfirmEditSave(false);
                }}
                onConfirm={() => {
                    const data = pendingEditData;
                    if (!data) {
                        setEditError("No changes found to submit.");
                        return;
                    }
                    return performUpdate(data);
                }}
                title="Apply changes?"
                message="You're about to update important shipment details. Proceed?"
                loading={editOpen ? isLoading(`update-parcel-${editOpen._id}`) : false}
                error={editError}
                zIndex={10000}
            />

            {/* ============================ Details Modal =========================== */}
            <Modal
                opened={!!detailsParcel}
                onClose={() => setDetailsParcel(null)}
                centered
                size="xl"
                withinPortal
                zIndex={3000}
                title={
                    <Group gap="sm" align="center" wrap="nowrap">
                        <Logo size="large" />
                        <div style={{ flex: 1 }}>
                            <Text fw={800} size="lg" className="truncate">
                                {detailsParcel ? `Parcel — ${detailsParcel.trackingId}` : "Parcel details"}
                            </Text>
                            <Text size="sm" c="dimmed" className="truncate">
                                {detailsParcel?.description || "Shipment details & tracking overview"}
                            </Text>
                        </div>
                        {detailsParcel && (
                            <Badge
                                variant="light"
                                color={STATUS_COLOR[detailsParcel.currentStatus as StatusKey] ?? "gray"}
                            >
                                {detailsParcel.currentStatus}
                            </Badge>
                        )}
                    </Group>
                }
            >
                {detailsParcel ? (
                    <Stack gap="md">
                        {/* top summary */}
                        <Card withBorder radius="lg" p="md">
                            <Group justify="space-between" align="flex-start">
                                <div style={{ flex: 1 }}>
                                    <Group gap="xs" align="center" wrap="nowrap">
                                        <Text fw={800} size="xl" className="truncate">
                                            {detailsParcel.trackingId}
                                        </Text>

                                        <CopyButton value={detailsParcel.trackingId || ""}>
                                            {({ copied, copy }) => (
                                                <ActionIcon
                                                    variant="light"
                                                    onClick={() => {
                                                        copy();
                                                        toast.success(copied ? "Copied" : "Copied");
                                                    }}
                                                    aria-label="Copy tracking id"
                                                >
                                                    {copied ? <LuCheck /> : <LuCopy />}
                                                </ActionIcon>
                                            )}
                                        </CopyButton>

                                        <Badge variant="light" color="gray">
                                            {safeStr((detailsParcel as any)?._id)}
                                        </Badge>
                                    </Group>

                                    <Text size="sm" c="dimmed" mt={4}>
                                        From <b>{safeStr(detailsParcel.fromLocation)}</b> → To{" "}
                                        <b>{safeStr(detailsParcel.toLocation)}</b>
                                    </Text>

                                    <div className="mt-2">
                                        <Text size="sm" c="dimmed" mb={6}>
                                            Delivery progress
                                        </Text>
                                        <Progress
                                            value={STATUS_STEP[String(detailsParcel.currentStatus || "PENDING")] ?? 20}
                                            color="brandOrange"
                                            radius="xl"
                                            size="lg"
                                        />
                                    </div>
                                </div>

                                <Group gap="xs">
                                    <Button
                                        variant="light"
                                        leftSection={<LuImage />}
                                        onClick={() => setImagesOpen(detailsParcel)}
                                    >
                                        Images
                                    </Button>
                                    <Button
                                        variant="light"
                                        leftSection={<RiMapPinTimeLine />}
                                        onClick={() => setTimelineOpen(detailsParcel)}
                                    >
                                        Timeline
                                    </Button>
                                    <Button
                                        variant="light"
                                        leftSection={<LuMap />}
                                        onClick={() => setRoutesOpen(detailsParcel)}
                                    >
                                        Live routes
                                    </Button>
                                </Group>
                            </Group>
                        </Card>

                        <Tabs defaultValue="overview" radius="xl">
                            <Tabs.List>
                                <Tabs.Tab value="overview" leftSection={<LuInfo />}>
                                    Overview
                                </Tabs.Tab>
                                <Tabs.Tab value="timeline" leftSection={<RiMapPinTimeLine />}>
                                    Timeline
                                </Tabs.Tab>
                                <Tabs.Tab value="routes" leftSection={<LuMap />}>
                                    Live Routes
                                </Tabs.Tab>
                                <Tabs.Tab value="images" leftSection={<LuImage />}>
                                    Images
                                </Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="overview" pt="md">
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                    <Paper withBorder p="md" radius="lg">
                                        <Group mb="xs">
                                            <ThemeIcon variant="light">
                                                <LuUser />
                                            </ThemeIcon>
                                            <Text fw={800}>Sender</Text>
                                        </Group>

                                        <Stack gap="xs">
                                            <FieldLine icon={<LuUser />} label="Name" value={detailsParcel.sender?.name} />
                                            <FieldLine
                                                icon={<LuMail />}
                                                label="Email"
                                                value={
                                                    detailsParcel.sender?.email ? (
                                                        <Anchor href={`mailto:${detailsParcel.sender.email}`}>
                                                            {detailsParcel.sender.email}
                                                        </Anchor>
                                                    ) : (
                                                        "—"
                                                    )
                                                }
                                            />
                                            <FieldLine
                                                icon={<LuPhone />}
                                                label="Phone"
                                                value={
                                                    detailsParcel.sender?.phone ? (
                                                        <Anchor href={`tel:${detailsParcel.sender.phone}`}>
                                                            {detailsParcel.sender.phone}
                                                        </Anchor>
                                                    ) : (
                                                        "—"
                                                    )
                                                }
                                            />
                                            <Divider />
                                            <Text size="sm" fw={700}>
                                                Address
                                            </Text>
                                            <Text size="sm" c="dimmed">
                                                {detailsParcel.sender?.address || "—"}
                                            </Text>
                                            <Text size="sm">
                                                {detailsParcel.sender?.city || "—"},{" "}
                                                {detailsParcel.sender?.state || "—"}{" "}
                                                {detailsParcel.sender?.postalCode || ""}
                                            </Text>
                                            <Text size="sm">{detailsParcel.sender?.country || "—"}</Text>
                                        </Stack>
                                    </Paper>

                                    <Paper withBorder p="md" radius="lg">
                                        <Group mb="xs">
                                            <ThemeIcon variant="light">
                                                <LuUser />
                                            </ThemeIcon>
                                            <Text fw={800}>Receiver</Text>
                                        </Group>

                                        <Stack gap="xs">
                                            <FieldLine icon={<LuUser />} label="Name" value={detailsParcel.receiver?.name} />
                                            <FieldLine
                                                icon={<LuMail />}
                                                label="Email"
                                                value={
                                                    detailsParcel.receiver?.email ? (
                                                        <Anchor href={`mailto:${detailsParcel.receiver.email}`}>
                                                            {detailsParcel.receiver.email}
                                                        </Anchor>
                                                    ) : (
                                                        "—"
                                                    )
                                                }
                                            />
                                            <FieldLine
                                                icon={<LuPhone />}
                                                label="Phone"
                                                value={
                                                    detailsParcel.receiver?.phone ? (
                                                        <Anchor href={`tel:${detailsParcel.receiver.phone}`}>
                                                            {detailsParcel.receiver.phone}
                                                        </Anchor>
                                                    ) : (
                                                        "—"
                                                    )
                                                }
                                            />
                                            <Divider />
                                            <Text size="sm" fw={700}>
                                                Address
                                            </Text>
                                            <Text size="sm" c="dimmed">
                                                {detailsParcel.receiver?.address || "—"}
                                            </Text>
                                            <Text size="sm">
                                                {detailsParcel.receiver?.city || "—"},{" "}
                                                {detailsParcel.receiver?.state || "—"}{" "}
                                                {detailsParcel.receiver?.postalCode || ""}
                                            </Text>
                                            <Text size="sm">{detailsParcel.receiver?.country || "—"}</Text>
                                        </Stack>
                                    </Paper>
                                </SimpleGrid>

                                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mt="sm">
                                    <Paper withBorder p="md" radius="lg">
                                        <Group mb="xs">
                                            <ThemeIcon variant="light">
                                                <LuBox />
                                            </ThemeIcon>
                                            <Text fw={800}>Shipment</Text>
                                        </Group>

                                        <Stack gap="xs">
                                            <FieldLine icon={<LuBox />} label="Weight" value={detailsParcel.weight ? `${detailsParcel.weight} kg` : "—"} />
                                            <FieldLine icon={<LuInfo />} label="Dimensions" value={detailsParcel.dimensions} />
                                            <FieldLine icon={<LuTruck />} label="Transport" value={transportLabel(detailsParcel)} />
                                        </Stack>
                                    </Paper>

                                    <Paper withBorder p="md" radius="lg">
                                        <Group mb="xs">
                                            <ThemeIcon variant="light">
                                                <LuCalendarClock />
                                            </ThemeIcon>
                                            <Text fw={800}>Dates</Text>
                                        </Group>

                                        <Stack gap="xs">
                                            <FieldLine icon={<LuClock />} label="Pickup" value={fmtDT(detailsParcel.pickupDate)} />
                                            <FieldLine icon={<LuClock />} label="ETA" value={fmtDT(detailsParcel.estimatedDeliveryDate)} />
                                            <FieldLine icon={<LuCheck />} label="Delivered" value={fmtDT(detailsParcel.actualDeliveryDate)} />
                                        </Stack>
                                    </Paper>

                                    <Paper withBorder p="md" radius="lg">
                                        <Group mb="xs">
                                            <ThemeIcon variant="light">
                                                <LuInfo />
                                            </ThemeIcon>
                                            <Text fw={800}>Quick stats</Text>
                                        </Group>

                                        <Stack gap="xs">
                                            <FieldLine
                                                icon={<LuImage />}
                                                label="Images"
                                                value={`${extractImages(detailsParcel).length}`}
                                            />
                                            <FieldLine
                                                icon={<RiMapPinTimeLine />}
                                                label="Timeline"
                                                value={`${sortedTimeline(detailsParcel).length}`}
                                            />
                                            <FieldLine
                                                icon={<LuMap />}
                                                label="Routes"
                                                value={`${sortedRoutes(detailsParcel).length}`}
                                            />
                                        </Stack>
                                    </Paper>
                                </SimpleGrid>

                                <Group justify="flex-end" mt="md">
                                    <Button
                                        leftSection={<LuPencil />}
                                        variant="light"
                                        onClick={() => openEdit(detailsParcel)}
                                    >
                                        Edit Parcel
                                    </Button>
                                    <Button
                                        leftSection={<LuTrash2 />}
                                        color="red"
                                        variant="light"
                                        onClick={() => askDeleteParcel(String(detailsParcel._id))}
                                    >
                                        Delete
                                    </Button>
                                </Group>
                            </Tabs.Panel>

                            <Tabs.Panel value="timeline" pt="md">
                                {sortedTimeline(detailsParcel).length === 0 ? (
                                    <EmptyState
                                        icon={<RiMapPinTimeLine className="h-6 w-6 opacity-70" />}
                                        title="No timeline updates yet"
                                        subtitle="Add shipment events (e.g. Dispatched, In Transit, Customs) to keep customers informed."
                                        cta={
                                            <Button
                                                color="brandOrange"
                                                leftSection={<LuPlus />}
                                                onClick={() => setTimelineOpen(detailsParcel)}
                                            >
                                                Add timeline event
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <Stack gap="sm">
                                        {sortedTimeline(detailsParcel).slice(0, 8).map((t, idx) => (
                                            <Paper key={t._id || idx} withBorder p="md" radius="lg">
                                                <Group justify="space-between" align="flex-start">
                                                    <div style={{ flex: 1 }}>
                                                        <Group gap="xs" mb={4} wrap="nowrap">
                                                            <Badge
                                                                variant="light"
                                                                color={STATUS_COLOR[t.status as StatusKey] ?? "gray"}
                                                            >
                                                                {String(t.status).replaceAll("_", " ")}
                                                            </Badge>
                                                            <Text size="sm" c="dimmed">
                                                                {fmtDT(t.timelineDate)}
                                                            </Text>
                                                            {t.location ? (
                                                                <Badge variant="light" color="gray">
                                                                    {t.location}
                                                                </Badge>
                                                            ) : null}
                                                        </Group>
                                                        <Text fw={700}>{t.message}</Text>
                                                    </div>

                                                    <Group gap={6}>
                                                        <ActionIcon
                                                            variant="light"
                                                            onClick={() => {
                                                                setTimelineOpen(detailsParcel);
                                                                startEditTimeline(String(detailsParcel._id), t);
                                                            }}
                                                            aria-label="Edit"
                                                        >
                                                            <LuPencil />
                                                        </ActionIcon>
                                                        <ActionIcon
                                                            variant="light"
                                                            color="red"
                                                            onClick={() => {
                                                                if (!t._id) return toast.error("Missing timeline id");
                                                                setConfirmTimelineDelete({
                                                                    parcelId: String(detailsParcel._id),
                                                                    timelineId: String(t._id),
                                                                });
                                                            }}
                                                            aria-label="Delete"
                                                        >
                                                            <LuTrash2 />
                                                        </ActionIcon>
                                                    </Group>
                                                </Group>
                                            </Paper>
                                        ))}

                                        {sortedTimeline(detailsParcel).length > 8 ? (
                                            <Text size="sm" c="dimmed">
                                                Showing latest 8 events. Use <b>Manage timeline</b> to view all.
                                            </Text>
                                        ) : null}
                                    </Stack>
                                )}
                            </Tabs.Panel>

                            <Tabs.Panel value="routes" pt="md">
                                {sortedRoutes(detailsParcel).length === 0 ? (
                                    <EmptyState
                                        icon={<LuMap className="h-6 w-6 opacity-70" />}
                                        title="No live route points yet"
                                        subtitle="Add tracking locations (latitude & longitude) to create a live movement history."
                                        cta={
                                            <Button
                                                color="brandOrange"
                                                leftSection={<LuPlus />}
                                                onClick={() => setRoutesOpen(detailsParcel)}
                                            >
                                                Add location
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <Stack gap="sm">
                                        {sortedRoutes(detailsParcel).slice(0, 8).map((r, idx) => (
                                            <Paper key={r._id || idx} withBorder p="md" radius="lg">
                                                <Group justify="space-between" align="flex-start">
                                                    <div style={{ flex: 1 }}>
                                                        <Group gap="xs" mb={4} wrap="nowrap">
                                                            <Badge variant="light" color={r.visible ? "green" : "gray"}>
                                                                {r.visible ? "Visible" : "Hidden"}
                                                            </Badge>
                                                            <Text size="sm" c="dimmed">
                                                                {fmtDT(r.timestamp)}
                                                            </Text>
                                                        </Group>

                                                        <Text fw={700}>
                                                            {r.latitude.toFixed(6)}, {r.longitude.toFixed(6)}
                                                        </Text>

                                                        <Anchor
                                                            href={mapsLink(r.latitude, r.longitude)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            size="sm"
                                                        >
                                                            Open in Google Maps
                                                        </Anchor>
                                                    </div>

                                                    <Group gap={6}>
                                                        <ActionIcon
                                                            variant="light"
                                                            onClick={() => {
                                                                setRoutesOpen(detailsParcel);
                                                                startEditRoute(String(detailsParcel._id), r);
                                                            }}
                                                            aria-label="Edit"
                                                        >
                                                            <LuPencil />
                                                        </ActionIcon>
                                                        <ActionIcon
                                                            variant="light"
                                                            onClick={() => {
                                                                if (!r._id) return toast.error("Missing route id");
                                                                setConfirmToggle({
                                                                    parcelId: String(detailsParcel._id),
                                                                    locationId: String(r._id),
                                                                });
                                                            }}
                                                            aria-label="Toggle visibility"
                                                        >
                                                            <LuExternalLink />
                                                        </ActionIcon>
                                                        <ActionIcon
                                                            variant="light"
                                                            color="red"
                                                            onClick={() => {
                                                                if (!r._id) return toast.error("Missing route id");
                                                                setConfirmRouteDelete({
                                                                    parcelId: String(detailsParcel._id),
                                                                    locationId: String(r._id),
                                                                });
                                                            }}
                                                            aria-label="Delete"
                                                        >
                                                            <LuTrash2 />
                                                        </ActionIcon>
                                                    </Group>
                                                </Group>
                                            </Paper>
                                        ))}

                                        {sortedRoutes(detailsParcel).length > 8 ? (
                                            <Text size="sm" c="dimmed">
                                                Showing latest 8 route points. Use <b>Manage live routes</b> to view all.
                                            </Text>
                                        ) : null}
                                    </Stack>
                                )}
                            </Tabs.Panel>

                            <Tabs.Panel value="images" pt="md">
                                {extractImages(detailsParcel).length === 0 ? (
                                    <EmptyState
                                        icon={<LuImage className="h-6 w-6 opacity-70" />}
                                        title="No images uploaded"
                                        subtitle="Add package images for proof of packaging, inspection, or content confirmation."
                                        cta={
                                            <Button
                                                color="brandOrange"
                                                leftSection={<LuPlus />}
                                                onClick={() => setImagesOpen(detailsParcel)}
                                            >
                                                Upload images
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                                        {extractImages(detailsParcel).slice(0, 12).map((img: any, idx: number) => (
                                            <a
                                                key={img._id || img.url || idx}
                                                href={img.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block"
                                            >
                                                <SafeImage
                                                    src={img.url}
                                                    alt={img.alt || img.label || `image ${idx + 1}`}
                                                    height={120}
                                                />
                                            </a>
                                        ))}
                                    </SimpleGrid>
                                )}

                                <Group justify="flex-end" mt="md">
                                    <Button
                                        variant="light"
                                        leftSection={<LuImage />}
                                        onClick={() => setImagesOpen(detailsParcel)}
                                    >
                                        Manage images
                                    </Button>
                                </Group>
                            </Tabs.Panel>
                        </Tabs>
                    </Stack>
                ) : null}
            </Modal>

            {/* ============================ Images Modal ============================ */}
            <Modal
                opened={!!imagesOpen}
                onClose={() => setImagesOpen(null)}
                centered
                size="lg"
                withinPortal
                zIndex={3000}
                title={
                    <Group gap="sm" align="center">
                        <LuImage />
                        <Text fw={800}>Manage Images</Text>
                    </Group>
                }
            >
                {imagesOpen && (
                    <>
                        <Group mb="sm" gap="xs" justify="space-between" align="center">
                            <div>
                                <Text fw={700}>Parcel: {imagesOpen.trackingId}</Text>
                                <Text size="sm" c="dimmed">
                                    Add, reorder, and remove parcel images.
                                </Text>
                            </div>

                            <FileButton
                                accept="image/*"
                                multiple
                                onChange={async (files) => {
                                    if (!files || !files.length) return;
                                    const key = `upload-images-${imagesOpen._id}`;
                                    setLoadingKey(key, true);
                                    try {
                                        const payload: { url: string; alt?: string; label?: string }[] = [];
                                        for (const f of files) {
                                            const res = await uploadToCloudinary(f);
                                            payload.push({ url: res.url });
                                        }
                                        await addImages(String(imagesOpen._id), payload);
                                        await refreshParcelOnly(String(imagesOpen._id));
                                        toast.success("Images added");
                                    } catch (e: any) {
                                        logErr("addImages", e, { parcelId: imagesOpen._id, count: files?.length });
                                        toast.error(getErrMsg(e));
                                    } finally {
                                        setLoadingKey(key, false);
                                    }
                                }}
                            >
                                {(props) => (
                                    <Button
                                        {...props}
                                        variant="light"
                                        leftSection={<LuPlus />}
                                        loading={isLoading(`upload-images-${imagesOpen._id}`)}
                                    >
                                        Add images
                                    </Button>
                                )}
                            </FileButton>
                        </Group>

                        {extractImages(imagesOpen).length === 0 ? (
                            <EmptyState icon={<LuImage className="h-6 w-6 opacity-70" />} title="No images yet" />
                        ) : (
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                {extractImages(imagesOpen).map((img: any, idx: number) => {
                                    const keyUp = `reorder-up-${imagesOpen._id}-${img._id || idx}`;
                                    const keyDown = `reorder-down-${imagesOpen._id}-${img._id || idx}`;

                                    return (
                                        <div key={img._id || img.url || idx} className="border rounded-xl p-2">
                                            <a href={img.url} target="_blank" rel="noreferrer">
                                                <SafeImage
                                                    src={img.url}
                                                    alt={img.alt || img.label || `image ${idx + 1}`}
                                                    height={120}
                                                />
                                            </a>

                                            <Group justify="space-between" mt="xs">
                                                <Group gap={4}>
                                                    <ActionIcon
                                                        variant="light"
                                                        onClick={async () => {
                                                            const arr = extractImages(imagesOpen) as any[];
                                                            if (idx === 0) return;

                                                            [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                                                            const order = arr
                                                                .map((a, i) => ({ _id: a._id, order: i }))
                                                                .filter((o) => o._id);

                                                            setLoadingKey(keyUp, true);
                                                            try {
                                                                await reorderImages(String(imagesOpen._id), order);
                                                                await refreshParcelOnly(String(imagesOpen._id));
                                                                toast.success("Order updated");
                                                            } catch (e: any) {
                                                                logErr("reorderImages-up", e, { parcelId: imagesOpen._id });
                                                                toast.error(getErrMsg(e));
                                                            } finally {
                                                                setLoadingKey(keyUp, false);
                                                            }
                                                        }}
                                                        aria-label="Move up"
                                                        loading={isLoading(keyUp)}
                                                    >
                                                        <LuArrowUp />
                                                    </ActionIcon>

                                                    <ActionIcon
                                                        variant="light"
                                                        onClick={async () => {
                                                            const arr = extractImages(imagesOpen) as any[];
                                                            if (idx >= arr.length - 1) return;

                                                            [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                                                            const order = arr
                                                                .map((a, i) => ({ _id: a._id, order: i }))
                                                                .filter((o) => o._id);

                                                            setLoadingKey(keyDown, true);
                                                            try {
                                                                await reorderImages(String(imagesOpen._id), order);
                                                                await refreshParcelOnly(String(imagesOpen._id));
                                                                toast.success("Order updated");
                                                            } catch (e: any) {
                                                                logErr("reorderImages-down", e, { parcelId: imagesOpen._id });
                                                                toast.error(getErrMsg(e));
                                                            } finally {
                                                                setLoadingKey(keyDown, false);
                                                            }
                                                        }}
                                                        aria-label="Move down"
                                                        loading={isLoading(keyDown)}
                                                    >
                                                        <LuArrowDown />
                                                    </ActionIcon>
                                                </Group>

                                                <ActionIcon
                                                    variant="light"
                                                    color="red"
                                                    onClick={() => {
                                                        if (!img._id) return toast.error("Missing image id");
                                                        setImageDeleteError(null);
                                                        setPendingImageDelete({
                                                            parcelId: String(imagesOpen._id),
                                                            imageId: String(img._id),
                                                        });
                                                    }}
                                                    aria-label="Delete"
                                                >
                                                    <LuTrash2 />
                                                </ActionIcon>
                                            </Group>
                                        </div>
                                    );
                                })}
                            </SimpleGrid>
                        )}
                    </>
                )}
            </Modal>

            {/* Image delete confirmation */}
            <ConfirmationModal
                opened={!!pendingImageDelete}
                onClose={() => {
                    if (!pendingImageDelete) return;
                    const key = `delete-image-${pendingImageDelete.parcelId}-${pendingImageDelete.imageId}`;
                    if (isLoading(key)) return;
                    setPendingImageDelete(null);
                    setImageDeleteError(null);
                }}
                onConfirm={async () => {
                    if (!pendingImageDelete) return;
                    const { parcelId, imageId } = pendingImageDelete;
                    const key = `delete-image-${parcelId}-${imageId}`;
                    setLoadingKey(key, true);
                    setImageDeleteError(null);
                    try {
                        await deleteImage(parcelId, imageId);
                        await refreshParcelOnly(parcelId);
                        toast.success("Image deleted");
                        setPendingImageDelete(null);
                    } catch (e: any) {
                        logErr("deleteImage", e, { parcelId, imageId });
                        const msg = getErrMsg(e);
                        setImageDeleteError(msg);
                        toast.error(msg);
                    } finally {
                        setLoadingKey(key, false);
                    }
                }}
                title="Delete image?"
                message="This image will be permanently removed from the parcel."
                confirmColor="#e03131"
                loading={
                    pendingImageDelete
                        ? isLoading(`delete-image-${pendingImageDelete.parcelId}-${pendingImageDelete.imageId}`)
                        : false
                }
                error={imageDeleteError}
                zIndex={10000}
            />

            {/* ============================ Timeline Modal =========================== */}
            <Modal
                opened={!!timelineOpen}
                onClose={() => {
                    setTimelineOpen(null);
                    setEditTL(null);
                    setConfirmTimelineSubmit(false);
                    setPendingTLData(null);
                    setTimelineError(null);
                    rTL();
                }}
                centered
                size="lg"
                withinPortal
                zIndex={3000}
                title={
                    <Group gap="sm" align="center">
                        <RiMapPinTimeLine />
                        <Text fw={800}>Manage Timeline</Text>
                    </Group>
                }
            >
                {timelineOpen ? (
                    <>
                        <Paper withBorder p="md" radius="md" mb="md">
                            <Group justify="space-between" mb="xs">
                                <div>
                                    <Text fw={800}>Parcel: {timelineOpen.trackingId}</Text>
                                    <Text size="sm" c="dimmed">
                                        Add shipment status updates and customer-visible messages.
                                    </Text>
                                </div>

                                {editTL ? (
                                    <Badge variant="light" color="blue">
                                        Editing
                                    </Badge>
                                ) : (
                                    <Badge variant="light" color="gray">
                                        Add new
                                    </Badge>
                                )}
                            </Group>

                            {timelineError ? (
                                <Text c="red" fw={600} size="sm" mb="sm">
                                    {timelineError}
                                </Text>
                            ) : null}

                            <form
                                onSubmit={hTL((data) => {
                                    setTimelineError(null);
                                    if (editTL) {
                                        setPendingTLData(data);
                                        setConfirmTimelineSubmit(true);
                                        return;
                                    }
                                    return submitTL(data);
                                })}
                            >
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                    <Controller
                                        name="status"
                                        control={cTL}
                                        render={({ field }) => (
                                            <Select
                                                comboboxProps={SELECT_COMBOBOX_PROPS}
                                                label="Status"
                                                placeholder="Select status"
                                                data={[
                                                    "PENDING",
                                                    "DISPATCHED",
                                                    "IN_TRANSIT",
                                                    "ARRIVED",
                                                    "CUSTOMS",
                                                    "DELIVERED",
                                                    "CANCELLED",
                                                ].map((s) => ({ value: s, label: s.replaceAll("_", " ") }))}
                                                value={field.value}
                                                onChange={(v) => field.onChange(v || "IN_TRANSIT")}
                                                error={eTL.status?.message}
                                                required
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="timelineDate"
                                        control={cTL}
                                        render={({ field }) => (
                                            <TextInput
                                                label="Date/Time"
                                                type="datetime-local"
                                                placeholder="Select date/time"
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={eTL.timelineDate?.message}
                                                required
                                            />
                                        )}
                                    />
                                </SimpleGrid>

                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mt="xs">
                                    <Controller
                                        name="message"
                                        control={cTL}
                                        render={({ field }) => (
                                            <Textarea
                                                label="Message"
                                                placeholder="What changed?"
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={eTL.message?.message}
                                                autosize
                                                minRows={2}
                                                required
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="location"
                                        control={cTL}
                                        render={({ field }) => (
                                            <TextInput
                                                label="Location (optional)"
                                                placeholder="e.g. Lagos Warehouse"
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                error={eTL.location?.message}
                                            />
                                        )}
                                    />
                                </SimpleGrid>

                                {!editTL && (
                                    <Controller
                                        name="sendEmail"
                                        control={cTL}
                                        render={({ field }) => (
                                            <Group mt="xs">
                                                <Switch
                                                    checked={field.value}
                                                    onChange={(e) => field.onChange(e.currentTarget.checked)}
                                                    label="Email customer about this update"
                                                />
                                            </Group>
                                        )}
                                    />
                                )}

                                <Group justify="flex-end" mt="md">
                                    {editTL ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setEditTL(null);
                                                setConfirmTimelineSubmit(false);
                                                setPendingTLData(null);
                                                setTimelineError(null);
                                                rTL();
                                            }}
                                        >
                                            Cancel edit
                                        </Button>
                                    ) : (
                                        <Button variant="outline" onClick={() => rTL()}>
                                            Reset
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        color="brandOrange"
                                        loading={isLoading(
                                            `${editTL ? "update" : "create"}-timeline-${timelineOpen._id}-${editTL?.item?._id || "new"}`
                                        )}
                                    >
                                        {editTL ? "Save changes" : "Add event"}
                                    </Button>
                                </Group>
                            </form>
                        </Paper>

                        <Divider my="sm" />

                        <Group justify="space-between" align="center" mb="xs">
                            <Text fw={800}>Timeline events</Text>
                            <Badge variant="light" color="gray">
                                {sortedTimeline(timelineOpen).length} total
                            </Badge>
                        </Group>

                        {sortedTimeline(timelineOpen).length === 0 ? (
                            <EmptyState
                                icon={<RiMapPinTimeLine className="h-6 w-6 opacity-70" />}
                                title="No timeline yet"
                                subtitle="Create your first timeline event above."
                            />
                        ) : (
                            <ScrollArea h={320} type="auto">
                                <Stack gap="sm" pr="xs">
                                    {sortedTimeline(timelineOpen).map((t, idx) => (
                                        <Paper key={t._id || idx} withBorder p="md" radius="lg">
                                            <Group justify="space-between" align="flex-start">
                                                <div style={{ flex: 1 }}>
                                                    <Group gap="xs" wrap="nowrap" mb={4}>
                                                        <Badge
                                                            variant="light"
                                                            color={STATUS_COLOR[t.status as StatusKey] ?? "gray"}
                                                        >
                                                            {String(t.status).replaceAll("_", " ")}
                                                        </Badge>
                                                        <Text size="sm" c="dimmed">
                                                            {fmtDT(t.timelineDate)}
                                                        </Text>
                                                        {t.location ? (
                                                            <Badge variant="light" color="gray">
                                                                {t.location}
                                                            </Badge>
                                                        ) : null}
                                                    </Group>

                                                    <Text fw={700}>{t.message}</Text>
                                                </div>

                                                <Group gap={6}>
                                                    <ActionIcon
                                                        variant="light"
                                                        onClick={() => startEditTimeline(String(timelineOpen._id), t)}
                                                        aria-label="Edit"
                                                    >
                                                        <LuPencil />
                                                    </ActionIcon>

                                                    <ActionIcon
                                                        variant="light"
                                                        color="red"
                                                        onClick={() => {
                                                            if (!t._id) return toast.error("Missing timeline id");
                                                            setConfirmTimelineDelete({
                                                                parcelId: String(timelineOpen._id),
                                                                timelineId: String(t._id),
                                                            });
                                                        }}
                                                        aria-label="Delete"
                                                    >
                                                        <LuTrash2 />
                                                    </ActionIcon>
                                                </Group>
                                            </Group>
                                        </Paper>
                                    ))}
                                </Stack>
                            </ScrollArea>
                        )}
                    </>
                ) : null}
            </Modal>

            {/* Confirm: submit TL when editing */}
            <ConfirmationModal
                opened={confirmTimelineSubmit}
                onClose={() => {
                    if (
                        timelineOpen &&
                        editTL &&
                        isLoading(`update-timeline-${timelineOpen._id}-${editTL.item._id}`)
                    )
                        return;
                    setConfirmTimelineSubmit(false);
                }}
                onConfirm={() => {
                    if (!pendingTLData) {
                        setTimelineError("No changes found to submit.");
                        return;
                    }
                    return submitTL(pendingTLData);
                }}
                title="Update timeline event?"
                message="You're about to modify an existing timeline event."
                loading={
                    timelineOpen && editTL
                        ? isLoading(`update-timeline-${timelineOpen._id}-${editTL.item._id}`)
                        : false
                }
                error={timelineError}
                zIndex={10000}
            />

            {/* ============================= Routes Modal ============================ */}
            <Modal
                opened={!!routesOpen}
                onClose={() => {
                    setRoutesOpen(null);
                    setEditRT(null);
                    setConfirmRouteSubmit(false);
                    setPendingRTData(null);
                    setRouteError(null);
                    rRT();
                }}
                centered
                size="lg"
                withinPortal
                zIndex={3000}
                title={
                    <Group gap="sm" align="center">
                        <LuMap />
                        <Text fw={800}>Manage Live Routes</Text>
                    </Group>
                }
            >
                {routesOpen ? (
                    <>
                        <Paper withBorder p="md" radius="md" mb="md">
                            <Group justify="space-between" mb="xs">
                                <div>
                                    <Text fw={800}>Parcel: {routesOpen.trackingId}</Text>
                                    <Text size="sm" c="dimmed">
                                        Add and manage tracking locations (latitude & longitude).
                                    </Text>
                                </div>

                                {editRT ? (
                                    <Badge variant="light" color="blue">
                                        Editing
                                    </Badge>
                                ) : (
                                    <Badge variant="light" color="gray">
                                        Add new
                                    </Badge>
                                )}
                            </Group>

                            {routeError ? (
                                <Text c="red" fw={600} size="sm" mb="sm">
                                    {routeError}
                                </Text>
                            ) : null}

                            <form
                                onSubmit={hRT((data) => {
                                    setRouteError(null);
                                    if (editRT) {
                                        setPendingRTData(data);
                                        setConfirmRouteSubmit(true);
                                        return;
                                    }
                                    return submitRT(data);
                                })}
                            >
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                    <Controller
                                        name="latitude"
                                        control={cRT}
                                        render={({ field }) => (
                                            <NumberInput
                                                label="Latitude"
                                                placeholder="e.g. 6.5244"
                                                value={field.value as any}
                                                onChange={(v) => field.onChange(v ?? 0)}
                                                error={eRT.latitude?.message}
                                                step={0.0001}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="longitude"
                                        control={cRT}
                                        render={({ field }) => (
                                            <NumberInput
                                                label="Longitude"
                                                placeholder="e.g. 3.3792"
                                                value={field.value as any}
                                                onChange={(v) => field.onChange(v ?? 0)}
                                                error={eRT.longitude?.message}
                                                step={0.0001}
                                            />
                                        )}
                                    />
                                </SimpleGrid>

                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mt="xs">
                                    <Controller
                                        name="timestamp"
                                        control={cRT}
                                        render={({ field }) => (
                                            <TextInput
                                                label="Date/Time"
                                                type="datetime-local"
                                                placeholder="Select date/time"
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={eRT.timestamp?.message}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="visible"
                                        control={cRT}
                                        render={({ field }) => (
                                            <Group align="end" gap="xs">
                                                <Switch
                                                    checked={field.value}
                                                    onChange={(e) => field.onChange(e.currentTarget.checked)}
                                                    label="Visible to customers"
                                                />
                                            </Group>
                                        )}
                                    />
                                </SimpleGrid>

                                {!editRT && (
                                    <Controller
                                        name="sendEmail"
                                        control={cRT}
                                        render={({ field }) => (
                                            <Group mt="xs">
                                                <Switch
                                                    checked={field.value}
                                                    onChange={(e) => field.onChange(e.currentTarget.checked)}
                                                    label="Email customer about this location"
                                                />
                                            </Group>
                                        )}
                                    />
                                )}

                                <Group justify="flex-end" mt="md">
                                    {editRT ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setEditRT(null);
                                                setConfirmRouteSubmit(false);
                                                setPendingRTData(null);
                                                setRouteError(null);
                                                rRT();
                                            }}
                                        >
                                            Cancel edit
                                        </Button>
                                    ) : (
                                        <Button variant="outline" onClick={() => rRT()}>
                                            Reset
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        color="brandOrange"
                                        loading={isLoading(
                                            `${editRT ? "update" : "create"}-route-${routesOpen._id}-${editRT?.item?._id || "new"}`
                                        )}
                                    >
                                        {editRT ? "Save changes" : "Add location"}
                                    </Button>
                                </Group>
                            </form>
                        </Paper>

                        <Divider my="sm" />

                        <Group justify="space-between" align="center" mb="xs">
                            <Text fw={800}>Route points</Text>
                            <Badge variant="light" color="gray">
                                {sortedRoutes(routesOpen).length} total
                            </Badge>
                        </Group>

                        {sortedRoutes(routesOpen).length === 0 ? (
                            <EmptyState
                                icon={<LuMap className="h-6 w-6 opacity-70" />}
                                title="No live routes yet"
                                subtitle="Create your first route point above."
                            />
                        ) : (
                            <ScrollArea h={320} type="auto">
                                <Stack gap="sm" pr="xs">
                                    {sortedRoutes(routesOpen).map((r, idx) => (
                                        <Paper key={r._id || idx} withBorder p="md" radius="lg">
                                            <Group justify="space-between" align="flex-start">
                                                <div style={{ flex: 1 }}>
                                                    <Group gap="xs" wrap="nowrap" mb={4}>
                                                        <Badge variant="light" color={r.visible ? "green" : "gray"}>
                                                            {r.visible ? "Visible" : "Hidden"}
                                                        </Badge>
                                                        <Text size="sm" c="dimmed">
                                                            {fmtDT(r.timestamp)}
                                                        </Text>
                                                    </Group>

                                                    <Text fw={700}>
                                                        {r.latitude.toFixed(6)}, {r.longitude.toFixed(6)}
                                                    </Text>

                                                    <Group gap="xs" mt={4}>
                                                        <Anchor
                                                            href={mapsLink(r.latitude, r.longitude)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            size="sm"
                                                        >
                                                            Open in Maps
                                                        </Anchor>
                                                        <Text size="sm" c="dimmed">
                                                            •
                                                        </Text>
                                                        <Anchor
                                                            href="#"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                copy(`${r.latitude},${r.longitude}`);
                                                            }}
                                                        >
                                                            Copy coords
                                                        </Anchor>
                                                    </Group>
                                                </div>

                                                <Group gap={6}>
                                                    <ActionIcon
                                                        variant="light"
                                                        onClick={() => startEditRoute(String(routesOpen._id), r)}
                                                        aria-label="Edit"
                                                    >
                                                        <LuPencil />
                                                    </ActionIcon>

                                                    <ActionIcon
                                                        variant="light"
                                                        onClick={() => {
                                                            if (!r._id) return toast.error("Missing route id");
                                                            setConfirmToggle({
                                                                parcelId: String(routesOpen._id),
                                                                locationId: String(r._id),
                                                            });
                                                        }}
                                                        aria-label="Toggle visibility"
                                                    >
                                                        <LuExternalLink />
                                                    </ActionIcon>

                                                    <ActionIcon
                                                        variant="light"
                                                        color="red"
                                                        onClick={() => {
                                                            if (!r._id) return toast.error("Missing route id");
                                                            setConfirmRouteDelete({
                                                                parcelId: String(routesOpen._id),
                                                                locationId: String(r._id),
                                                            });
                                                        }}
                                                        aria-label="Delete"
                                                    >
                                                        <LuTrash2 />
                                                    </ActionIcon>
                                                </Group>
                                            </Group>
                                        </Paper>
                                    ))}
                                </Stack>
                            </ScrollArea>
                        )}
                    </>
                ) : null}
            </Modal>

            {/* Confirm: submit Route when editing */}
            <ConfirmationModal
                opened={confirmRouteSubmit}
                onClose={() => {
                    if (routesOpen && editRT && isLoading(`update-route-${routesOpen._id}-${editRT.item._id}`)) return;
                    setConfirmRouteSubmit(false);
                }}
                onConfirm={() => {
                    if (!pendingRTData) {
                        setRouteError("No changes found to submit.");
                        return;
                    }
                    return submitRT(pendingRTData);
                }}
                title="Update location?"
                message="You're about to modify an existing live route location."
                loading={routesOpen && editRT ? isLoading(`update-route-${routesOpen._id}-${editRT.item._id}`) : false}
                error={routeError}
                zIndex={10000}
            />

            {/* Confirm: toggle visibility */}
            <ConfirmationModal
                opened={!!confirmToggle}
                onClose={() => setConfirmToggle(null)}
                onConfirm={async () => {
                    if (!confirmToggle) return;
                    const { parcelId, locationId } = confirmToggle;
                    const key = `toggle-visibility-${parcelId}-${locationId}`;
                    setLoadingKey(key, true);
                    try {
                        await toggleRouteVisibility(parcelId, locationId);
                        await refreshParcelOnly(parcelId);
                        toast.success("Visibility toggled");
                    } catch (e: any) {
                        logErr("toggleVisibility", e, { parcelId, locationId });
                        toast.error(getErrMsg(e));
                    } finally {
                        setLoadingKey(key, false);
                        setConfirmToggle(null);
                    }
                }}
                title="Change visibility?"
                message="This will toggle whether this route point is visible to customers."
                loading={
                    confirmToggle
                        ? isLoading(`toggle-visibility-${confirmToggle.parcelId}-${confirmToggle.locationId}`)
                        : false
                }
                zIndex={10000}
            />

            {/* Confirm: delete TL */}
            <ConfirmationModal
                opened={!!confirmTimelineDelete}
                onClose={() => setConfirmTimelineDelete(null)}
                onConfirm={async () => {
                    if (!confirmTimelineDelete) return;
                    const key = `delete-timeline-${confirmTimelineDelete.parcelId}-${confirmTimelineDelete.timelineId}`;
                    setLoadingKey(key, true);
                    try {
                        await deleteTimeline(confirmTimelineDelete.parcelId, confirmTimelineDelete.timelineId);
                        await refreshParcelOnly(confirmTimelineDelete.parcelId);
                        toast.success("Timeline deleted");
                    } catch (e: any) {
                        logErr("deleteTimeline", e, { ...confirmTimelineDelete });
                        toast.error(getErrMsg(e));
                    } finally {
                        setLoadingKey(key, false);
                        setConfirmTimelineDelete(null);
                    }
                }}
                title="Delete timeline event?"
                message="This update will be removed permanently."
                confirmColor="#e03131"
                loading={
                    confirmTimelineDelete
                        ? isLoading(`delete-timeline-${confirmTimelineDelete.parcelId}-${confirmTimelineDelete.timelineId}`)
                        : false
                }
                zIndex={10000}
            />

            {/* Confirm: delete route */}
            <ConfirmationModal
                opened={!!confirmRouteDelete}
                onClose={() => setConfirmRouteDelete(null)}
                onConfirm={async () => {
                    if (!confirmRouteDelete) return;
                    const key = `delete-route-${confirmRouteDelete.parcelId}-${confirmRouteDelete.locationId}`;
                    setLoadingKey(key, true);
                    try {
                        await deleteRoute(confirmRouteDelete.parcelId, confirmRouteDelete.locationId);
                        await refreshParcelOnly(confirmRouteDelete.parcelId);
                        toast.success("Location deleted");
                    } catch (e: any) {
                        logErr("deleteRoute", e, { ...confirmRouteDelete });
                        toast.error(getErrMsg(e));
                    } finally {
                        setLoadingKey(key, false);
                        setConfirmRouteDelete(null);
                    }
                }}
                title="Delete location?"
                message="This live route point will be removed permanently."
                confirmColor="#e03131"
                loading={
                    confirmRouteDelete
                        ? isLoading(`delete-route-${confirmRouteDelete.parcelId}-${confirmRouteDelete.locationId}`)
                        : false
                }
                zIndex={10000}
            />
        </div>
    );
}
