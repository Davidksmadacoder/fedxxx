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
    FaTruck,
} from "react-icons/fa";
import { z } from "zod";

import { ServicesApi } from "@/api/services.api";
import { IService } from "@/lib/models/service.model";
import CustomLoader from "@/components/features/CustomLoader";
import EmptyState from "@/components/features/EmptyState";
import ConfirmationModal from "@/components/features/ConfirmationModal";
import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";
import { handleApiError } from "@/utils/error-handler";

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
import { Textarea } from "@/components/ui/textarea/Textarea";
import { NumberInput } from "@/components/ui/input/NumberInput";
import { Card } from "@/components/ui/card/Card";
import { Collapse } from "@/components/ui/collapse/Collapse";
import { Menu } from "@/components/ui/menu/Menu";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { Switch } from "@/components/ui/switch/Switch";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const ServiceSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().min(1, "Description is required"),
    fullDescription: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().url().optional().or(z.literal("")),
    category: z.string().min(1, "Category is required"),
    features: z.array(z.string()).optional(),
    pricing: z
        .object({
            basePrice: z.coerce.number().optional(),
            pricePerKg: z.coerce.number().optional(),
            pricePerKm: z.coerce.number().optional(),
        })
        .optional(),
    isActive: z.boolean().default(true),
    order: z.coerce.number().default(0),
});

type ServiceFormData = z.infer<typeof ServiceSchema>;

const pageSize = 10;

function sanitizeIconSrc(raw?: string) {
    const v = (raw ?? "").trim();
    if (!v) return "";
    // Allow: http(s), relative (/...), and data:image/*
    if (/^https?:\/\//i.test(v)) return v;
    if (v.startsWith("/")) return v;
    if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/i.test(v)) return v;
    // Block everything else (e.g. javascript:)
    return "";
}

function looksLikeImageUrl(v: string) {
    if (!v) return false;
    // If it's a safe src (http/https/relative/data:image) we treat as image.
    return Boolean(sanitizeIconSrc(v));
}

function ServiceIcon({
    icon,
    title,
    size = 32,
    className = "",
}: {
    icon?: string;
    title: string;
    size?: number;
    className?: string;
}) {
    const src = useMemo(() => sanitizeIconSrc(icon), [icon]);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        // reset failure state when icon changes
        setFailed(false);
    }, [src]);

    if (src && !failed) {
        return (
            <img
                src={src}
                alt={`${title} icon`}
                width={size}
                height={size}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setFailed(true)}
                className={[
                    "shrink-0 rounded-md border border-[var(--bg-general-light)] bg-white/5 object-cover",
                    className,
                ].join(" ")}
                style={{ width: size, height: size }}
            />
        );
    }

    // Fallback (keeps UI stable if icon is not a valid image URL or fails to load)
    const fallback = (icon ?? "").trim();
    return (
        <span
            aria-label={`${title} icon`}
            className={[
                "inline-flex shrink-0 items-center justify-center rounded-md border border-[var(--bg-general-light)] bg-white/5",
                className,
            ].join(" ")}
            style={{ width: size, height: size }}
            title={fallback || "No icon"}
        >
            <span className="text-lg leading-none">{fallback ? fallback.slice(0, 2) : "—"}</span>
        </span>
    );
}

export default function ServicesPage() {
    const [services, setServices] = useState<IService[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<IService | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [detailsService, setDetailsService] = useState<IService | null>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
    const [featuresInput, setFeaturesInput] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<ServiceFormData>({
        resolver: zodResolver(ServiceSchema),
        defaultValues: {
            title: "",
            slug: "",
            description: "",
            fullDescription: "",
            icon: "",
            image: "",
            category: "",
            features: [],
            pricing: {
                basePrice: undefined,
                pricePerKg: undefined,
                pricePerKm: undefined,
            },
            isActive: true,
            order: 0,
        },
    });

    const watchedIcon = watch("icon");

    const fetchServices = async () => {
        setLoading(true);
        try {
            const result = await ServicesApi.list();
            setServices(result.items);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load services.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const categories = useMemo(() => {
        const cats = new Set(services.map((s) => s.category).filter(Boolean));
        return Array.from(cats);
    }, [services]);

    const filteredServices = useMemo(() => {
        let filtered = services;

        if (search.trim()) {
            const q = search.toLowerCase();
            filtered = filtered.filter(
                (s) =>
                    s.title.toLowerCase().includes(q) ||
                    s.description.toLowerCase().includes(q) ||
                    s.category.toLowerCase().includes(q) ||
                    s.slug.toLowerCase().includes(q)
            );
        }

        if (categoryFilter !== "all") {
            filtered = filtered.filter((s) => s.category === categoryFilter);
        }

        if (statusFilter === "active") {
            filtered = filtered.filter((s) => s.isActive);
        } else if (statusFilter === "inactive") {
            filtered = filtered.filter((s) => !s.isActive);
        }

        return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [services, search, categoryFilter, statusFilter]);

    const paginatedServices = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredServices.slice(start, start + pageSize);
    }, [filteredServices, currentPage]);

    const totalPages = Math.ceil(filteredServices.length / pageSize);

    const openModal = (service?: IService) => {
        if (service) {
            setSelectedService(service);
            setValue("title", service.title);
            setValue("slug", service.slug);
            setValue("description", service.description);
            setValue("fullDescription", service.fullDescription || "");
            setValue("icon", service.icon || "");
            setValue("image", service.image || "");
            setValue("category", service.category);
            setValue("features", service.features || []);
            setValue("pricing", service.pricing || {});
            setValue("isActive", service.isActive);
            setValue("order", service.order || 0);
            setFeaturesInput((service.features || []).join("\n"));
        } else {
            setSelectedService(null);
            reset();
            setFeaturesInput("");
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedService(null);
        reset();
        setFeaturesInput("");
    };

    const onSubmit = async (data: ServiceFormData) => {
        setLoading(true);
        try {
            const features = featuresInput
                .split("\n")
                .map((f) => f.trim())
                .filter(Boolean);

            const payload = {
                ...data,
                features,
            };

            if (selectedService) {
                const updated = await ServicesApi.update(selectedService._id.toString(), payload);
                setServices((prev) =>
                    prev.map((s) => (s._id.toString() === selectedService._id.toString() ? updated : s))
                );
                toast.success("Service updated successfully");
            } else {
                const created = await ServicesApi.create(payload);
                setServices((prev) => [created, ...prev]);
                toast.success("Service created successfully");
            }
            closeModal();
        } catch (error) {
            handleApiError(error, "Failed to save service.");
        } finally {
            setLoading(false);
        }
    };

    const openDeleteConfirmation = (id: string) => {
        setServiceToDelete(id);
        setConfirmModalOpen(true);
    };

    const handleDelete = async () => {
        if (!serviceToDelete) return;
        setLoading(true);
        try {
            await ServicesApi.delete(serviceToDelete);
            setServices((prev) => prev.filter((s) => s._id.toString() !== serviceToDelete));
            toast.success("Service deleted successfully");
            setConfirmModalOpen(false);
            setServiceToDelete(null);
        } catch (error) {
            handleApiError(error, "Failed to delete service.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page-container custom-black-white-theme-switch-bg">
            <CustomLoader loading={loading} />

            {/* Header */}
            <AdminPageHeader
                title="Services"
                description="Create, edit, and manage the services shown on the public site. Configure pricing, features, and availability."
                primaryAction={{
                    label: "Add Service",
                    onClick: () => openModal(),
                    icon: <FaPlus />,
                }}
                breadcrumbs={[
                    { label: "Admin Dashboard", href: "/admin-dashboard" },
                    { label: "Services" },
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
                        onClick={fetchServices}
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
                                placeholder="Search by title, description, category..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                leftSection={<FaFilter size={14} />}
                            />
                            <div>
                                <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                                    Category
                                </label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => {
                                        setCategoryFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
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
                                        setStatusFilter(e.target.value as any);
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
            {loading && services.length === 0 ? (
                <div className="space-y-2">
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                </div>
            ) : filteredServices.length === 0 ? (
                <EmptyState
                    icon={<FaTruck size={48} />}
                    title="No services found"
                    description={
                        search || categoryFilter !== "all" || statusFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Add your first service to get started."
                    }
                    action={
                        !search && categoryFilter === "all" && statusFilter === "all"
                            ? {
                                label: "Add Service",
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
                                    <TableHeader>Title</TableHeader>
                                    <TableHeader>Category</TableHeader>
                                    <TableHeader>Slug</TableHeader>
                                    <TableHeader>Base Price</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Actions</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedServices.map((service) => (
                                    <TableRow key={service._id.toString()}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {service.icon ? (
                                                    <ServiceIcon icon={service.icon} title={service.title} size={32} />
                                                ) : null}
                                                <span className="font-medium custom-black-white-theme-switch-text">
                                                    {service.title}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="light" size="sm">
                                                {service.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="custom-black-white-theme-switch-text text-sm">
                                            /{service.slug}
                                        </TableCell>
                                        <TableCell className="custom-black-white-theme-switch-text">
                                            {service.pricing?.basePrice ? `$${service.pricing.basePrice.toFixed(2)}` : "—"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge color={service.isActive ? "green" : "gray"} variant="light" size="sm">
                                                {service.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Menu
                                                items={[
                                                    {
                                                        label: "View Details",
                                                        icon: <FaEye size={14} />,
                                                        onClick: () => {
                                                            setDetailsService(service);
                                                            setDetailsModalOpen(true);
                                                        },
                                                    },
                                                    {
                                                        label: "Edit",
                                                        icon: <FaEdit size={14} />,
                                                        onClick: () => openModal(service),
                                                    },
                                                    {
                                                        label: "Delete",
                                                        icon: <FaTrash size={14} />,
                                                        onClick: () => openDeleteConfirmation(service._id.toString()),
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
            <Modal opened={modalOpen} onClose={closeModal} title="Service" size="xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Title"
                                    placeholder="Service title"
                                    error={errors.title?.message}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    required
                                />
                            )}
                        />

                        <Controller
                            name="slug"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Slug"
                                    placeholder="service-slug"
                                    error={errors.slug?.message}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    required
                                />
                            )}
                        />
                    </div>

                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                label="Description"
                                placeholder="Short description"
                                error={errors.description?.message}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                minRows={2}
                                required
                            />
                        )}
                    />

                    <Controller
                        name="fullDescription"
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                label="Full Description"
                                placeholder="Detailed service description"
                                error={errors.fullDescription?.message}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                minRows={4}
                            />
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Controller
                            name="icon"
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <div className="flex items-end justify-between gap-3">
                                        <div className="flex-1">
                                            <TextInput
                                                label="Icon URL"
                                                placeholder="https://example.com/icon.png (or /icons/fast.svg)"
                                                error={errors.icon?.message}
                                                value={field.value}
                                                onChange={(e) => field.onChange(e.target.value)}
                                            />
                                        </div>
                                        <div className="pb-1">
                                            {looksLikeImageUrl(watchedIcon || "") ? (
                                                <ServiceIcon icon={watchedIcon || ""} title={watch("title") || "Service"} size={36} />
                                            ) : (
                                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--bg-general-light)] bg-white/5 text-sm">
                                                    —
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        This will be displayed as an image in the table and details view.
                                    </p>
                                </div>
                            )}
                        />

                        <Controller
                            name="image"
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                                        Image URL
                                    </label>
                                    <div className="flex gap-2">
                                        <TextInput
                                            placeholder="https://example.com/image.jpg"
                                            error={errors.image?.message}
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            className="flex-1"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            id="service-image-upload"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                setUploadingImage(true);
                                                try {
                                                    const res = await uploadToCloudinary(file);
                                                    field.onChange(res.url);
                                                    toast.success("Image uploaded successfully");
                                                } catch (error) {
                                                    handleApiError(error, "Failed to upload image.");
                                                } finally {
                                                    setUploadingImage(false);
                                                    e.target.value = "";
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => document.getElementById("service-image-upload")?.click()}
                                            loading={uploadingImage}
                                            variant="light"
                                            size="sm"
                                        >
                                            Upload
                                        </Button>
                                    </div>
                                    {field.value && (
                                        <img
                                            src={field.value}
                                            alt="Preview"
                                            className="mt-2 w-full h-32 object-cover rounded-md border border-[var(--bg-general-light)]"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        />

                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Category"
                                    placeholder="e.g., same-day, next-day"
                                    error={errors.category?.message}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    required
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                            Features (one per line)
                        </label>
                        <textarea
                            value={featuresInput}
                            onChange={(e) => setFeaturesInput(e.target.value)}
                            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                            className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Controller
                            name="pricing.basePrice"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Base Price"
                                    placeholder="0.00"
                                    value={field.value}
                                    onChange={(v) => field.onChange(v === "" ? undefined : (v as number))}
                                    min={0}
                                />
                            )}
                        />

                        <Controller
                            name="pricing.pricePerKg"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Price Per Kg"
                                    placeholder="0.00"
                                    value={field.value}
                                    onChange={(v) => field.onChange(v === "" ? undefined : (v as number))}
                                    min={0}
                                />
                            )}
                        />

                        <Controller
                            name="pricing.pricePerKm"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Price Per Km"
                                    placeholder="0.00"
                                    value={field.value}
                                    onChange={(v) => field.onChange(v === "" ? undefined : (v as number))}
                                    min={0}
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="order"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Display Order"
                                    value={field.value}
                                    onChange={(v) => field.onChange(v === "" ? 0 : (v as number))}
                                    min={0}
                                />
                            )}
                        />

                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-end pb-1">
                                    <Switch
                                        label="Active Status"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        color="brandOrange"
                                    />
                                </div>
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={closeModal} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading} color="brandOrange">
                            {selectedService ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Details Modal */}
            <Modal
                opened={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false);
                    setDetailsService(null);
                }}
                title={`Service Details — ${detailsService?.title ?? ""}`}
                size="lg"
            >
                {detailsService && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            {detailsService.icon ? (
                                <ServiceIcon icon={detailsService.icon} title={detailsService.title} size={44} />
                            ) : null}
                            <div>
                                <h3 className="text-xl font-semibold custom-black-white-theme-switch-text">
                                    {detailsService.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">/{detailsService.slug}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
                                <Badge variant="light">{detailsService.category}</Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                                <Badge color={detailsService.isActive ? "green" : "gray"} variant="light">
                                    {detailsService.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>

                        <div className="border-t border-[var(--bg-general-light)] pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                            <p className="custom-black-white-theme-switch-text">{detailsService.description}</p>
                        </div>

                        {detailsService.fullDescription && (
                            <div className="border-t border-[var(--bg-general-light)] pt-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Full Description</p>
                                <p className="custom-black-white-theme-switch-text whitespace-pre-wrap">
                                    {detailsService.fullDescription}
                                </p>
                            </div>
                        )}

                        {detailsService.features && detailsService.features.length > 0 && (
                            <div className="border-t border-[var(--bg-general-light)] pt-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Features</p>
                                <ul className="list-disc list-inside space-y-1 custom-black-white-theme-switch-text">
                                    {detailsService.features.map((feature, idx) => (
                                        <li key={idx}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {detailsService.pricing && (
                            <div className="border-t border-[var(--bg-general-light)] pt-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pricing</p>
                                <div className="grid grid-cols-3 gap-4">
                                    {detailsService.pricing.basePrice !== undefined && (
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Base Price</p>
                                            <p className="font-semibold custom-black-white-theme-switch-text">
                                                ${detailsService.pricing.basePrice.toFixed(2)}
                                            </p>
                                        </div>
                                    )}
                                    {detailsService.pricing.pricePerKg !== undefined && (
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Per Kg</p>
                                            <p className="font-semibold custom-black-white-theme-switch-text">
                                                ${detailsService.pricing.pricePerKg.toFixed(2)}
                                            </p>
                                        </div>
                                    )}
                                    {detailsService.pricing.pricePerKm !== undefined && (
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Per Km</p>
                                            <p className="font-semibold custom-black-white-theme-switch-text">
                                                ${detailsService.pricing.pricePerKm.toFixed(2)}
                                            </p>
                                        </div>
                                    )}
                                </div>
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
                    setServiceToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Delete service?"
                message={
                    <div className="text-sm custom-black-white-theme-switch-text">
                        Are you sure you want to delete this service? This action cannot be undone.
                    </div>
                }
                loading={loading}
            />
        </div>
    );
}
