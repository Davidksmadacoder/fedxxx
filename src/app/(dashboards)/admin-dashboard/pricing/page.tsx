"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaSync, FaEllipsisV, FaDollarSign } from "react-icons/fa";
import { z } from "zod";

import { PricingApi } from "@/api/pricing.api";
import { IPricing } from "@/lib/models/pricing.model";
import { PricingType } from "@/lib/enums/pricingType.enum";
import CustomLoader from "@/components/features/CustomLoader";
import EmptyState from "@/components/features/EmptyState";
import ConfirmationModal from "@/components/features/ConfirmationModal";

// UI
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from "@/components/ui/table/Table";
import { Badge } from "@/components/ui/badge/Badge";
import { Pagination } from "@/components/ui/pagination/Pagination";
import { Modal } from "@/components/ui/modal/Modal";
import { Button } from "@/components/ui/button/Button";
import { TextInput } from "@/components/ui/input/TextInput";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { NumberInput } from "@/components/ui/input/NumberInput";
import { Card } from "@/components/ui/card/Card";
import { Collapse } from "@/components/ui/collapse/Collapse";
import { Menu } from "@/components/ui/menu/Menu";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { Switch } from "@/components/ui/switch/Switch";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const PricingSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.nativeEnum(PricingType),
    description: z.string().optional(),
    basePrice: z.coerce.number().min(0, "Base price must be positive"),
    currency: z.string().default("USD"),
    minWeight: z.coerce.number().min(0).optional(),
    maxWeight: z.coerce.number().min(0).optional(),
    minDistance: z.coerce.number().min(0).optional(),
    maxDistance: z.coerce.number().min(0).optional(),
    pricePerKg: z.coerce.number().min(0).optional(),
    pricePerKm: z.coerce.number().min(0).optional(),
    pricePerItem: z.coerce.number().min(0).optional(),
    serviceType: z.string().optional(),
    destinationCountry: z.string().optional(),
    originCountry: z.string().optional(),
    isActive: z.boolean().default(true),
    isDefault: z.boolean().default(false),
    validFrom: z.string().optional(),
    validUntil: z.string().optional(),
});

type PricingFormData = z.infer<typeof PricingSchema>;

const pageSize = 10;

function typeLabel(type: string) {
    return type.replaceAll("_", " ");
}

function toDateInputValue(d?: string | Date | null) {
    if (!d) return "";
    const date = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
}

export default function PricingPage() {
    const [pricings, setPricings] = useState<IPricing[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPricing, setSelectedPricing] = useState<IPricing | null>(null);

    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [detailsPricing, setDetailsPricing] = useState<IPricing | null>(null);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [pricingToDelete, setPricingToDelete] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<PricingFormData>({
        resolver: zodResolver(PricingSchema),
        defaultValues: {
            name: "",
            type: PricingType.SHIPPING,
            description: "",
            basePrice: 0,
            currency: "USD",
            minWeight: undefined,
            maxWeight: undefined,
            minDistance: undefined,
            maxDistance: undefined,
            pricePerKg: undefined,
            pricePerKm: undefined,
            pricePerItem: undefined,
            serviceType: "",
            destinationCountry: "",
            originCountry: "",
            isActive: true,
            isDefault: false,
            validFrom: "",
            validUntil: "",
        },
    });

    const fetchPricings = async () => {
        setLoading(true);
        try {
            const result = await PricingApi.list();
            setPricings(result.items);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load pricing.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPricings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredPricings = useMemo(() => {
        let filtered = pricings;

        const q = search.trim().toLowerCase();
        if (q) {
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    (p.description ?? "").toLowerCase().includes(q) ||
                    String(p.type).toLowerCase().includes(q)
            );
        }

        if (typeFilter !== "all") {
            filtered = filtered.filter((p) => p.type === typeFilter);
        }

        if (statusFilter === "active") {
            filtered = filtered.filter((p) => p.isActive);
        } else if (statusFilter === "inactive") {
            filtered = filtered.filter((p) => !p.isActive);
        }

        return filtered;
    }, [pricings, search, typeFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredPricings.length / pageSize));

    // Keep currentPage valid when filters change
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const paginatedPricings = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPricings.slice(start, start + pageSize);
    }, [filteredPricings, currentPage]);

    const openModal = (pricing?: IPricing) => {
        if (pricing) {
            setSelectedPricing(pricing);
            reset({
                name: pricing.name ?? "",
                type: (pricing.type as PricingType) ?? PricingType.SHIPPING,
                description: pricing.description ?? "",
                basePrice: pricing.basePrice ?? 0,
                currency: pricing.currency ?? "USD",
                minWeight: pricing.minWeight ?? undefined,
                maxWeight: pricing.maxWeight ?? undefined,
                minDistance: pricing.minDistance ?? undefined,
                maxDistance: pricing.maxDistance ?? undefined,
                pricePerKg: pricing.pricePerKg ?? undefined,
                pricePerKm: pricing.pricePerKm ?? undefined,
                pricePerItem: pricing.pricePerItem ?? undefined,
                serviceType: pricing.serviceType ?? "",
                destinationCountry: pricing.destinationCountry ?? "",
                originCountry: pricing.originCountry ?? "",
                isActive: Boolean(pricing.isActive),
                isDefault: Boolean(pricing.isDefault),
                validFrom: toDateInputValue(pricing.validFrom as any),
                validUntil: toDateInputValue(pricing.validUntil as any),
            });
        } else {
            setSelectedPricing(null);
            reset();
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedPricing(null);
        reset();
    };

    const onSubmit = async (data: PricingFormData) => {
        setSaving(true);
        try {
            const payload = {
                ...data,
                validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
                validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
            };

            if (selectedPricing) {
                const updated = await PricingApi.update(selectedPricing._id.toString(), payload);
                setPricings((prev) =>
                    prev.map((p) => (p._id.toString() === selectedPricing._id.toString() ? updated : p))
                );
                toast.success("Pricing updated successfully");
            } else {
                const created = await PricingApi.create(payload);
                setPricings((prev) => [created, ...prev]);
                toast.success("Pricing created successfully");
            }

            closeModal();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save pricing.");
        } finally {
            setSaving(false);
        }
    };

    const openDeleteConfirmation = (id: string) => {
        setPricingToDelete(id);
        setConfirmModalOpen(true);
    };

    const handleDelete = async () => {
        if (!pricingToDelete) return;
        setSaving(true);
        try {
            await PricingApi.delete(pricingToDelete);
            setPricings((prev) => prev.filter((p) => p._id.toString() !== pricingToDelete));
            toast.success("Pricing deleted successfully");
            setConfirmModalOpen(false);
            setPricingToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete pricing.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-page-container custom-black-white-theme-switch-bg">
            <CustomLoader loading={loading || saving} />

            <AdminPageHeader
                title="Pricing"
                description="Manage pricing rules and configurations. Set up shipping rates, service pricing, and pricing tiers."
                primaryAction={{
                    label: "Add Pricing",
                    onClick: () => openModal(),
                    icon: <FaPlus />,
                }}
                breadcrumbs={[{ label: "Admin Dashboard", href: "/admin-dashboard" }, { label: "Pricing" }]}
            />

            {/* Filters */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Button
                        variant="light"
                        leftSection={<FaFilter />}
                        onClick={() => setFiltersOpen((v) => !v)}
                        size="sm"
                    >
                        Filters
                    </Button>
                    <Button
                        variant="subtle"
                        leftSection={<FaSync />}
                        onClick={fetchPricings}
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
                                placeholder="Search by name, type..."
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
                                    {Object.values(PricingType).map((type) => (
                                        <option key={type} value={type}>
                                            {typeLabel(type)}
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
                                        const v = e.target.value;
                                        setStatusFilter(v === "active" ? "active" : v === "inactive" ? "inactive" : "all");
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
            {loading && pricings.length === 0 ? (
                <div className="space-y-2">
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                </div>
            ) : filteredPricings.length === 0 ? (
                <EmptyState
                    icon={<FaDollarSign size={48} />}
                    title="No pricing found"
                    description={
                        search || typeFilter !== "all" || statusFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Add your first pricing rule to get started."
                    }
                    action={
                        !search && typeFilter === "all" && statusFilter === "all"
                            ? { label: "Add Pricing", onClick: () => openModal() }
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
                                    <TableHeader>Base Price</TableHeader>
                                    <TableHeader>Currency</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Default</TableHeader>
                                    <TableHeader>Actions</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedPricings.map((pricing) => (
                                    <TableRow key={pricing._id.toString()}>
                                        <TableCell>
                                            <span className="font-medium custom-black-white-theme-switch-text">
                                                {pricing.name}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant="light" size="sm">
                                                {typeLabel(pricing.type)}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="custom-black-white-theme-switch-text">
                                            {Number(pricing.basePrice ?? 0).toFixed(2)}
                                        </TableCell>

                                        <TableCell className="custom-black-white-theme-switch-text">
                                            {pricing.currency ?? "USD"}
                                        </TableCell>

                                        <TableCell>
                                            <Badge color={pricing.isActive ? "green" : "gray"} variant="light" size="sm">
                                                {pricing.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            {pricing.isDefault ? (
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
                                                            setDetailsPricing(pricing);
                                                            setDetailsModalOpen(true);
                                                        },
                                                    },
                                                    {
                                                        label: "Edit",
                                                        icon: <FaEdit size={14} />,
                                                        onClick: () => openModal(pricing),
                                                    },
                                                    {
                                                        label: "Delete",
                                                        icon: <FaTrash size={14} />,
                                                        onClick: () => openDeleteConfirmation(pricing._id.toString()),
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
                title={selectedPricing ? "Update Pricing" : "Create Pricing"}
                description={selectedPricing ? "Update pricing rules and rates." : "Create a new pricing configuration."}
                size="xl"
                showLogo={false}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Name"
                                    placeholder="Pricing name"
                                    error={errors.name?.message}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    required
                                />
                            )}
                        />

                        {/* ✅ FIXED: Type is now controlled by RHF Controller (no control._formValues) */}
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                                        Type
                                    </label>
                                    <select
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value as PricingType)}
                                        className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                                    >
                                        {Object.values(PricingType).map((type) => (
                                            <option key={type} value={type}>
                                                {typeLabel(type)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.type?.message ? (
                                        <p className="mt-1 text-xs text-red-500">{String(errors.type.message)}</p>
                                    ) : null}
                                </div>
                            )}
                        />
                    </div>

                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                label="Description"
                                placeholder="Pricing description"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                minRows={2}
                            />
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Controller
                            name="basePrice"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Base Price"
                                    error={errors.basePrice?.message}
                                    value={field.value}
                                    onChange={(v) => field.onChange(v === "" ? 0 : (v as number))}
                                    min={0}
                                    required
                                />
                            )}
                        />

                        <Controller
                            name="currency"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Currency"
                                    placeholder="USD"
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    required
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="minWeight"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Min Weight (kg)"
                                    value={field.value}
                                    onChange={(v) => field.onChange(v === "" ? undefined : (v as number))}
                                    min={0}
                                />
                            )}
                        />
                        <Controller
                            name="maxWeight"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Max Weight (kg)"
                                    value={field.value}
                                    onChange={(v) => field.onChange(v === "" ? undefined : (v as number))}
                                    min={0}
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="minDistance"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Min Distance (km)"
                                    value={field.value}
                                    onChange={(v) => field.onChange(v === "" ? undefined : (v as number))}
                                    min={0}
                                />
                            )}
                        />
                        <Controller
                            name="maxDistance"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Max Distance (km)"
                                    value={field.value}
                                    onChange={(v) => field.onChange(v === "" ? undefined : (v as number))}
                                    min={0}
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Controller
                            name="pricePerKg"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Price Per Kg"
                                    value={field.value}
                                    onChange={(v) => field.onChange(v === "" ? undefined : (v as number))}
                                    min={0}
                                />
                            )}
                        />
                        <Controller
                            name="pricePerKm"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Price Per Km"
                                    value={field.value}
                                    onChange={(v) => field.onChange(v === "" ? undefined : (v as number))}
                                    min={0}
                                />
                            )}
                        />
                        <Controller
                            name="pricePerItem"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Price Per Item"
                                    value={field.value}
                                    onChange={(v) => field.onChange(v === "" ? undefined : (v as number))}
                                    min={0}
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Controller
                            name="serviceType"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Service Type"
                                    placeholder="e.g., same-day"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />
                        <Controller
                            name="originCountry"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Origin Country"
                                    placeholder="Country code"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />
                        <Controller
                            name="destinationCountry"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Destination Country"
                                    placeholder="Country code"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="validFrom"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Valid From"
                                    type="date"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />
                        <Controller
                            name="validUntil"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Valid Until"
                                    type="date"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field }) => (
                                <Switch label="Active Status" checked={field.value} onChange={field.onChange} color="brandOrange" />
                            )}
                        />
                        <Controller
                            name="isDefault"
                            control={control}
                            render={({ field }) => (
                                <Switch
                                    label="Default Pricing"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    color="brandOrange"
                                />
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={closeModal} disabled={saving}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={saving} color="brandOrange">
                            {selectedPricing ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Details Modal */}
            <Modal
                opened={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false);
                    setDetailsPricing(null);
                }}
                title={`Pricing Details — ${detailsPricing?.name ?? ""}`}
                size="lg"
                showLogo={false}
            >
                {detailsPricing && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Type</p>
                                <Badge variant="light">{typeLabel(detailsPricing.type)}</Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                                <Badge color={detailsPricing.isActive ? "green" : "gray"} variant="light">
                                    {detailsPricing.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>

                        <div className="border-t border-[var(--bg-general-light)] pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Base Price</p>
                            <p className="text-2xl font-bold custom-black-white-theme-switch-text">
                                {detailsPricing.currency} {Number(detailsPricing.basePrice ?? 0).toFixed(2)}
                            </p>
                        </div>

                        {(detailsPricing.pricePerKg || detailsPricing.pricePerKm || detailsPricing.pricePerItem) && (
                            <div className="border-t border-[var(--bg-general-light)] pt-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Per Unit Pricing</p>
                                <div className="grid grid-cols-3 gap-4">
                                    {detailsPricing.pricePerKg !== undefined && (
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Per Kg</p>
                                            <p className="font-semibold custom-black-white-theme-switch-text">
                                                {detailsPricing.currency} {Number(detailsPricing.pricePerKg).toFixed(2)}
                                            </p>
                                        </div>
                                    )}
                                    {detailsPricing.pricePerKm !== undefined && (
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Per Km</p>
                                            <p className="font-semibold custom-black-white-theme-switch-text">
                                                {detailsPricing.currency} {Number(detailsPricing.pricePerKm).toFixed(2)}
                                            </p>
                                        </div>
                                    )}
                                    {detailsPricing.pricePerItem !== undefined && (
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Per Item</p>
                                            <p className="font-semibold custom-black-white-theme-switch-text">
                                                {detailsPricing.currency} {Number(detailsPricing.pricePerItem).toFixed(2)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {detailsPricing.description && (
                            <div className="border-t border-[var(--bg-general-light)] pt-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                                <p className="custom-black-white-theme-switch-text">{detailsPricing.description}</p>
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
                    setPricingToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Delete pricing?"
                message={
                    <div className="text-sm custom-black-white-theme-switch-text">
                        Are you sure you want to delete this pricing? This action cannot be undone.
                    </div>
                }
                loading={saving}
            />
        </div>
    );
}
