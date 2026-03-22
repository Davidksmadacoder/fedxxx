"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
    FaEllipsisV,
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaSync,
} from "react-icons/fa";
import { LuPackageSearch } from "react-icons/lu";

import { TransportMeansApi } from "@/api/transportMeans.api";
import { ITransportMeans } from "@/lib/models/transportMeans.model";
import Logo from "@/components/common/Logo";
import ConfirmationModal from "@/components/features/ConfirmationModal";
import CustomLoader from "@/components/features/CustomLoader";
import EmptyState from "@/components/features/EmptyState";
import {
    CreateTransportMeansFormData,
    CreateTransportMeansSchema,
} from "@/utils/schemas/schemas";

// Custom UI Components
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
import { Textarea } from "@/components/ui/textarea/Textarea";
import { Switch } from "@/components/ui/switch/Switch";
import { NumberInput } from "@/components/ui/input/NumberInput";
import { Card } from "@/components/ui/card/Card";
import { Menu } from "@/components/ui/menu/Menu";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

/* =========================================================================================
   Helpers: robust number & currency formatters
   ========================================================================================= */
const nfNumber = new Intl.NumberFormat("en-US");
const nfCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function formatNumber(n?: number | null): string {
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    return nfNumber.format(n);
}

function formatCurrency(n?: number | null): string {
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    return nfCurrency.format(n);
}

function parseNumericString(input: string): number | "" {
    if (input.trim() === "") return "";
    const cleaned = input.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    if (cleaned === "" || cleaned === ".") return "";
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : "";
}

function formatCurrencyDisplay(n: number | "", forceTwoDecimals = false): string {
    if (n === "") return "";
    if (forceTwoDecimals) return nfCurrency.format(n);
    const [intPart, decPart = ""] = String(n).split(".");
    const intFmt = nfNumber.format(Number(intPart));
    return `$${intFmt}${decPart !== "" ? "." + decPart.slice(0, 2) : ""}`;
}

function formatNumberDisplay(n: number | ""): string {
    if (n === "") return "";
    const [intPart, decPart = ""] = String(n).split(".");
    const intFmt = nfNumber.format(Number(intPart));
    return decPart ? `${intFmt}.${decPart}` : intFmt;
}

type CurrencyInputProps = {
    label: string;
    placeholder?: string;
    error?: string;
    required?: boolean;
    value: number | "" | undefined;
    onChange: (v: number | "") => void;
    onBlur?: () => void;
    className?: string;
};

function CurrencyInput({
    label,
    placeholder,
    error,
    required,
    value,
    onChange,
    onBlur,
    className = "",
}: CurrencyInputProps) {
    const [display, setDisplay] = useState("");

    useEffect(() => {
        if (value === "" || value === undefined) {
            setDisplay("");
        } else {
            setDisplay(formatCurrencyDisplay(value, false));
        }
    }, [value]);

    return (
        <div className={className}>
            <TextInput
                label={label}
                placeholder={placeholder ?? "$0.00"}
                error={error}
                required={required}
                value={display}
                onChange={(e) => {
                    const raw = e.currentTarget.value;
                    const parsed = parseNumericString(raw);
                    setDisplay(raw);
                    onChange(parsed);
                }}
                onBlur={() => {
                    const pretty =
                        value === "" || value === undefined ? "" : formatCurrencyDisplay(value, true);
                    setDisplay(pretty);
                    onBlur?.();
                }}
                leftSection={<span className="font-bold">$</span>}
            />
        </div>
    );
}

type ThousandsNumberInputProps = {
    label: string;
    placeholder?: string;
    error?: string;
    required?: boolean;
    value: number | "" | undefined;
    onChange: (v: number | "") => void;
    onBlur?: () => void;
    className?: string;
};

function ThousandsNumberInput({
    label,
    placeholder,
    error,
    required,
    value,
    onChange,
    className = "",
}: ThousandsNumberInputProps) {
    const [display, setDisplay] = useState("");

    useEffect(() => {
        if (value === "" || value === undefined) {
            setDisplay("");
        } else {
            setDisplay(formatNumberDisplay(value));
        }
    }, [value]);

    // We keep display state for parity + future enhancements, but the UI component already formats.
    useEffect(() => {
        void display;
    }, [display]);

    return (
        <div className={className}>
            <NumberInput
                label={label}
                placeholder={placeholder ?? "0"}
                error={error}
                required={required}
                value={value === "" ? "" : (value as number)}
                onChange={(v) => onChange(v === "" ? "" : (v as number))}
                thousandSeparator
            />
        </div>
    );
}

const pageSize = 10;

/* ------------------------------ Small Tile UI ------------------------------ */
function StatTile({
    label,
    value,
    hint,
}: {
    label: string;
    value: React.ReactNode;
    hint?: React.ReactNode;
}) {
    return (
        <div
            className="rounded-2xl p-4 border border-[var(--bg-general-lighter)] custom-black-white-theme-switch-bg"
            style={{ background: "var(--card-bg, transparent)" }}
        >
            <div className="text-sm custom-black-white-theme-switch-text">{label}</div>
            <div className="mt-2 text-2xl font-semibold custom-black-white-theme-switch-text">
                {value}
            </div>
            {hint ? (
                <div className="mt-1 text-xs custom-black-white-theme-switch-text">{hint}</div>
            ) : null}
        </div>
    );
}

const TransportMeansPage: React.FC = () => {
    const [rows, setRows] = useState<ITransportMeans[]>([]);
    const [loading, setLoading] = useState(false);

    // search + pagination
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Create/Update modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTM, setSelectedTM] = useState<ITransportMeans | null>(null);

    // Details modal
    const [detailsTM, setDetailsTM] = useState<ITransportMeans | null>(null);

    // Delete confirmation
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [tmToDelete, setTmToDelete] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<CreateTransportMeansFormData>({
        resolver: zodResolver(CreateTransportMeansSchema),
        defaultValues: {
            name: "",
            type: "",
            description: "",
            capacity: undefined as unknown as number,
            estimatedTime: "",
            costPerKm: undefined as unknown as number,
            active: true,
            availabilityDate: "",
            lastMaintenanceDate: "",
        },
    });

    const fetchAll = async () => {
        setLoading(true);
        try {
            const result = await TransportMeansApi.list();
            setRows(result.items);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            toast.error("Failed to load transport means.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const toLocal = (d?: string | Date) => (d ? new Date(d).toLocaleString() : "—");
    const toInputDT = (d?: string | Date) => (d ? new Date(d).toISOString().slice(0, 16) : "");

    const openModal = (tm?: ITransportMeans) => {
        if (tm) {
            setSelectedTM(tm);
            setValue("name", tm.name);
            setValue("type", tm.type);
            setValue("description", tm.description || "");
            setValue("capacity", (tm.capacity as unknown) as any);
            setValue("estimatedTime", tm.estimatedTime);
            setValue("costPerKm", (tm.costPerKm as unknown) as any);
            setValue("active", tm.active);
            setValue("availabilityDate", toInputDT(tm.availabilityDate));
            setValue("lastMaintenanceDate", toInputDT(tm.lastMaintenanceDate));
        } else {
            setSelectedTM(null);
            reset();
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedTM(null);
        reset();
    };

    const onSubmit = async (data: CreateTransportMeansFormData) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                capacity:
                    (data.capacity as unknown as any) === ("" as any)
                        ? undefined
                        : Number(data.capacity),
                costPerKm:
                    (data.costPerKm as unknown as any) === ("" as any)
                        ? undefined
                        : Number(data.costPerKm),
                availabilityDate: data.availabilityDate ? new Date(data.availabilityDate) : undefined,
                lastMaintenanceDate: data.lastMaintenanceDate
                    ? new Date(data.lastMaintenanceDate)
                    : undefined,
            };

            if (selectedTM) {
                const updated = await TransportMeansApi.update(selectedTM._id.toString(), payload);
                setRows((prev) =>
                    prev.map((r) =>
                        r._id.toString() === selectedTM._id.toString() ? updated : r
                    )
                );
                toast.success("Transport means updated successfully");
            } else {
                const created = await TransportMeansApi.create(payload);
                setRows((prev) => [created, ...prev]);
                toast.success("Transport means created successfully");
            }

            closeModal();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            toast.error("Failed to save transport means.");
        } finally {
            setLoading(false);
        }
    };

    const openDeleteConfirmation = (id: string) => {
        setTmToDelete(id);
        setConfirmModalOpen(true);
    };

    const handleDelete = async () => {
        if (!tmToDelete) return;
        setLoading(true);
        try {
            await TransportMeansApi.delete(tmToDelete);
            setRows((prev) => prev.filter((r) => r._id.toString() !== tmToDelete));
            toast.success("Transport means deleted successfully");
            setConfirmModalOpen(false);
            setTmToDelete(null);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            toast.error("Failed to delete transport means.");
        } finally {
            setLoading(false);
        }
    };

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((tm) => {
            const name = (tm.name ?? "").toLowerCase();
            const type = (tm.type ?? "").toLowerCase();
            const desc = (tm.description ?? "").toLowerCase();
            return name.includes(q) || type.includes(q) || desc.includes(q);
        });
    }, [rows, search]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

    const paginatedRows = useMemo(
        () => filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [filteredRows, currentPage]
    );

    // Stats (similar “dashboard tiles” feel)
    const stats = useMemo(() => {
        const total = rows.length;
        const active = rows.filter((x) => !!x.active).length;
        const inactive = total - active;

        const costs = rows
            .map((x) => Number(x.costPerKm))
            .filter((n) => Number.isFinite(n)) as number[];
        const avgCost = costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : 0;

        const caps = rows
            .map((x) => Number(x.capacity))
            .filter((n) => Number.isFinite(n)) as number[];
        const totalCap = caps.length ? caps.reduce((a, b) => a + b, 0) : 0;

        return { total, active, inactive, avgCost, totalCap };
    }, [rows]);

    // Keep page valid when filtering shrinks results
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalPages]);

    return (
        <div className="admin-page-container custom-black-white-theme-switch-bg">
            <CustomLoader loading={loading} />

            {/* Header (matches Parcels/AdminOverview pattern) */}
            <AdminPageHeader
                title="Transport Means"
                description="Manage your transportation assets and resources. Configure vehicles, carriers, and transport options for shipments."
                primaryAction={{
                    label: "Add Transport Means",
                    onClick: () => openModal(),
                    icon: <FaPlus />,
                }}
                breadcrumbs={[
                    { label: "Admin Dashboard", href: "/admin-dashboard" },
                    { label: "Transport Means" },
                ]}
                searchProps={{
                    value: search,
                    onChange: (e: any) => {
                        setSearch(e.currentTarget.value);
                        setCurrentPage(1);
                    },
                    placeholder: "Search by name, type, or description",
                }}
            />

            {/* Top actions + stats */}
            <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs custom-black-white-theme-switch-text">
                    Showing{" "}
                    <span className="font-semibold custom-black-white-theme-switch-text">
                        {filteredRows.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold custom-black-white-theme-switch-text">
                        {rows.length}
                    </span>{" "}
                    transport means
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="subtle"
                        leftSection={<FaSync />}
                        onClick={fetchAll}
                        size="sm"
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatTile label="Total Transport Means" value={stats.total} />
                <StatTile
                    label="Active"
                    value={stats.active}
                    hint={<span>Inactive: {stats.inactive}</span>}
                />
                <StatTile label="Total Capacity" value={formatNumber(stats.totalCap)} />
                <StatTile label="Avg Cost / Km" value={formatCurrency(stats.avgCost)} />
            </div>

            {/* Table / Empty state */}
            {loading && rows.length === 0 ? (
                <div className="space-y-2">
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                </div>
            ) : filteredRows.length === 0 ? (
                <EmptyState
                    icon={<LuPackageSearch size={48} />}
                    title="No transport means found"
                    description={
                        search
                            ? "Try adjusting your search."
                            : "Add your first transport asset to start managing capacity, costs, and availability."
                    }
                    action={
                        !search
                            ? {
                                label: "Add Transport Means",
                                onClick: () => openModal(),
                            }
                            : undefined
                    }
                />
            ) : (
                <div
                    className="rounded-2xl border border-[var(--bg-general-lighter)] custom-black-white-theme-switch-bg overflow-hidden"
                    style={{ background: "var(--card-bg, transparent)" }}
                >
                    <div className="overflow-x-auto custom-scrollbar custom_table_scroll">
                        <Table className="custom_table">
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Name</TableHeader>
                                    <TableHeader>Type</TableHeader>
                                    <TableHeader>Capacity</TableHeader>
                                    <TableHeader>Cost/Km</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Actions</TableHeader>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {paginatedRows.map((tm) => (
                                    <TableRow key={tm._id.toString()}>
                                        <TableCell>
                                            <span className="font-medium custom-black-white-theme-switch-text">
                                                {tm.name}
                                            </span>
                                            {tm.description ? (
                                                <div className="text-xs custom-black-white-theme-switch-text line-clamp-1 mt-1">
                                                    {tm.description}
                                                </div>
                                            ) : null}
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant="light" size="sm">
                                                {tm.type}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="custom-black-white-theme-switch-text">
                                            {formatNumber(tm.capacity)}
                                        </TableCell>

                                        <TableCell className="font-semibold custom-black-white-theme-switch-text">
                                            {formatCurrency(tm.costPerKm)}
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                color={tm.active ? "green" : "red"}
                                                variant="light"
                                                size="sm"
                                            >
                                                {tm.active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <Menu
                                                items={[
                                                    {
                                                        label: "View Details",
                                                        icon: <FaEye size={14} />,
                                                        onClick: () => setDetailsTM(tm),
                                                    },
                                                    {
                                                        label: "Edit",
                                                        icon: <FaEdit size={14} />,
                                                        onClick: () => openModal(tm),
                                                    },
                                                    {
                                                        label: "Delete",
                                                        icon: <FaTrash size={14} />,
                                                        onClick: () => openDeleteConfirmation(tm._id.toString()),
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

                    {totalPages > 1 ? (
                        <div className="flex justify-center mt-4 pt-4 border-t border-[var(--bg-general-light)] px-3 pb-3">
                            <Pagination
                                total={totalPages}
                                value={currentPage}
                                onChange={setCurrentPage}
                                color="brandOrange"
                            />
                        </div>
                    ) : null}
                </div>
            )}

            {/* Create / Update Modal */}
            <Modal
                opened={modalOpen}
                onClose={closeModal}
                title={<Logo size="large" />}
                description={
                    selectedTM
                        ? "Update transport means configuration."
                        : "Add a new transportation asset or resource."
                }
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold custom-black-white-theme-switch-text">
                                {selectedTM ? "Update Transport Means" : "Create Transport Means"}
                            </h2>
                            <p className="text-sm custom-black-white-theme-switch-text">
                                {selectedTM
                                    ? "Edit the details below and save changes."
                                    : "Fill in the details below to create a new transport means."}
                            </p>
                        </div>
                    </div>

                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <TextInput
                                label="Name"
                                placeholder="e.g., Air Freight A330"
                                error={errors.name?.message}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                required
                            />
                        )}
                    />

                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <TextInput
                                label="Type"
                                placeholder="e.g., Air, Sea, Road"
                                error={errors.type?.message}
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
                                placeholder="Short description (optional)"
                                error={errors.description?.message}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                minRows={2}
                            />
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="capacity"
                            control={control}
                            render={({ field }) => (
                                <ThousandsNumberInput
                                    label="Capacity"
                                    placeholder="e.g., 12,000"
                                    error={errors.capacity?.message}
                                    value={
                                        field.value === ("" as any)
                                            ? ""
                                            : (field.value as unknown as number | "")
                                    }
                                    onChange={(v) => field.onChange(v === "" ? ("" as any) : Number(v))}
                                    required
                                />
                            )}
                        />

                        <Controller
                            name="estimatedTime"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Estimated Time"
                                    placeholder="e.g., 6h 30m"
                                    error={errors.estimatedTime?.message}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    required
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="costPerKm"
                            control={control}
                            render={({ field }) => (
                                <CurrencyInput
                                    label="Cost per Km"
                                    placeholder="$0.00"
                                    error={errors.costPerKm?.message}
                                    value={
                                        field.value === ("" as any)
                                            ? ""
                                            : (field.value as unknown as number | "")
                                    }
                                    onChange={(v) => field.onChange(v === "" ? ("" as any) : Number(v))}
                                    required
                                />
                            )}
                        />

                        <Controller
                            name="active"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-end pb-1">
                                    <Switch
                                        label="Active Status"
                                        checked={!!field.value}
                                        onChange={(checked) => field.onChange(checked)}
                                        color="brandOrange"
                                    />
                                </div>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="availabilityDate"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Availability"
                                    type="datetime-local"
                                    error={errors.availabilityDate?.message}
                                    value={(field.value as unknown as any) ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    required
                                />
                            )}
                        />
                        <Controller
                            name="lastMaintenanceDate"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Last Maintenance"
                                    type="datetime-local"
                                    error={errors.lastMaintenanceDate?.message}
                                    value={(field.value as unknown as any) ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    required
                                />
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={closeModal} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading} color="brandOrange">
                            {selectedTM ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Details Modal */}
            <Modal
                opened={!!detailsTM}
                onClose={() => setDetailsTM(null)}
                title={<Logo size="large" />}
                size="lg"
            >
                {detailsTM ? (
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold custom-black-white-theme-switch-text">
                                    Transport Means Details
                                </h2>
                                <p className="text-sm custom-black-white-theme-switch-text">
                                    {detailsTM.name} • {detailsTM.type}
                                </p>
                            </div>
                            <Badge color={detailsTM.active ? "green" : "red"} variant="light">
                                {detailsTM.active ? "Active" : "Inactive"}
                            </Badge>
                        </div>

                        <div className="rounded-2xl border border-[var(--bg-general-lighter)] custom-black-white-theme-switch-bg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm custom-black-white-theme-switch-text mb-1">Name</p>
                                    <p className="font-semibold custom-black-white-theme-switch-text">
                                        {detailsTM.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm custom-black-white-theme-switch-text mb-1">Type</p>
                                    <Badge variant="light">{detailsTM.type}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm custom-black-white-theme-switch-text mb-1">Estimated Time</p>
                                    <p className="custom-black-white-theme-switch-text">
                                        {detailsTM.estimatedTime || "—"}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-[var(--bg-general-light)] mt-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm custom-black-white-theme-switch-text mb-1">Capacity</p>
                                        <p className="custom-black-white-theme-switch-text">
                                            {formatNumber(detailsTM.capacity)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm custom-black-white-theme-switch-text mb-1">Cost per Km</p>
                                        <p className="font-semibold custom-black-white-theme-switch-text">
                                            {formatCurrency(detailsTM.costPerKm)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm custom-black-white-theme-switch-text mb-1">Status</p>
                                        <Badge
                                            color={detailsTM.active ? "green" : "red"}
                                            variant="light"
                                            size="sm"
                                        >
                                            {detailsTM.active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-[var(--bg-general-light)] mt-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm custom-black-white-theme-switch-text mb-1">Availability</p>
                                        <p className="custom-black-white-theme-switch-text">
                                            {toLocal(detailsTM.availabilityDate)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm custom-black-white-theme-switch-text mb-1">Last Maintenance</p>
                                        <p className="custom-black-white-theme-switch-text">
                                            {toLocal(detailsTM.lastMaintenanceDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {detailsTM.description ? (
                                <div className="border-t border-[var(--bg-general-light)] mt-4 pt-4">
                                    <p className="text-sm custom-black-white-theme-switch-text mb-1">Description</p>
                                    <p className="custom-black-white-theme-switch-text">{detailsTM.description}</p>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex justify-end">
                            <Button
                                variant="light"
                                onClick={() => {
                                    setDetailsTM(null);
                                    openModal(detailsTM);
                                }}
                                leftSection={<FaEdit />}
                            >
                                Edit
                            </Button>
                        </div>
                    </div>
                ) : null}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmationModal
                opened={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setTmToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Delete transport means?"
                message={
                    <div>
                        <div className="font-bold text-red-500 mb-2 text-sm">⚠️ CRITICAL WARNING</div>
                        <div className="text-sm custom-black-white-theme-switch-text">
                            Deleting this transport means will affect <strong>ALL</strong> parcels connected to it. Those
                            parcels will lose their carrier reference and related analytics. This action is{" "}
                            <strong>permanent</strong>. Are you absolutely sure?
                        </div>
                    </div>
                }
                loading={loading}
            />
        </div>
    );
};

export default TransportMeansPage;
