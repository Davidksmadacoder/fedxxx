"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaSync, FaStar, FaEllipsisV } from "react-icons/fa";
import { z } from "zod";

import { TestimonialsApi } from "@/api/testimonials.api";
import { ITestimonial } from "@/lib/models/testimonial.model";
import CustomLoader from "@/components/features/CustomLoader";
import EmptyState from "@/components/features/EmptyState";
import ConfirmationModal from "@/components/features/ConfirmationModal";
import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";
import { handleApiError } from "@/utils/error-handler";

// Custom Components
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

const TestimonialSchema = z.object({
    name: z.string().min(1, "Name is required"),
    role: z.string().min(1, "Role is required"),
    company: z.string().optional(),
    image: z.string().url().optional().or(z.literal("")),
    rating: z.coerce.number().min(1).max(5),
    comment: z.string().min(1, "Comment is required"),
    isActive: z.boolean().default(true),
    order: z.coerce.number().default(0),
});

type TestimonialFormData = z.infer<typeof TestimonialSchema>;

const pageSize = 10;

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<ITestimonial[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState<ITestimonial | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [detailsTestimonial, setDetailsTestimonial] = useState<ITestimonial | null>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<TestimonialFormData>({
        resolver: zodResolver(TestimonialSchema),
        defaultValues: {
            name: "",
            role: "",
            company: "",
            image: "",
            rating: 5,
            comment: "",
            isActive: true,
            order: 0,
        },
    });

    const fetchTestimonials = async () => {
        setLoading(true);
        try {
            const result = await TestimonialsApi.list();
            setTestimonials(result.items);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load testimonials.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const filteredTestimonials = useMemo(() => {
        let filtered = testimonials;

        if (search.trim()) {
            const q = search.toLowerCase();
            filtered = filtered.filter(
                (t) =>
                    t.name.toLowerCase().includes(q) ||
                    t.role.toLowerCase().includes(q) ||
                    t.company?.toLowerCase().includes(q) ||
                    t.comment.toLowerCase().includes(q)
            );
        }

        if (statusFilter === "active") {
            filtered = filtered.filter((t) => t.isActive);
        } else if (statusFilter === "inactive") {
            filtered = filtered.filter((t) => !t.isActive);
        }

        return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [testimonials, search, statusFilter]);

    const paginatedTestimonials = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredTestimonials.slice(start, start + pageSize);
    }, [filteredTestimonials, currentPage]);

    const totalPages = Math.ceil(filteredTestimonials.length / pageSize);

    const openModal = (testimonial?: ITestimonial) => {
        if (testimonial) {
            setSelectedTestimonial(testimonial);
            setValue("name", testimonial.name);
            setValue("role", testimonial.role);
            setValue("company", testimonial.company || "");
            setValue("image", testimonial.image || "");
            setValue("rating", testimonial.rating);
            setValue("comment", testimonial.comment);
            setValue("isActive", testimonial.isActive);
            setValue("order", testimonial.order || 0);
        } else {
            setSelectedTestimonial(null);
            reset();
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedTestimonial(null);
        reset();
    };

    const onSubmit = async (data: TestimonialFormData) => {
        setLoading(true);
        try {
            if (selectedTestimonial) {
                const updated = await TestimonialsApi.update(selectedTestimonial._id.toString(), data);
                setTestimonials((prev) =>
                    prev.map((t) => (t._id.toString() === selectedTestimonial._id.toString() ? updated : t))
                );
                toast.success("Testimonial updated successfully");
            } else {
                const created = await TestimonialsApi.create(data);
                setTestimonials((prev) => [created, ...prev]);
                toast.success("Testimonial created successfully");
            }
            closeModal();
        } catch (error) {
            handleApiError(error, "Failed to save testimonial.");
        } finally {
            setLoading(false);
        }
    };

    const openDeleteConfirmation = (id: string) => {
        setTestimonialToDelete(id);
        setConfirmModalOpen(true);
    };

    const handleDelete = async () => {
        if (!testimonialToDelete) return;
        setLoading(true);
        try {
            await TestimonialsApi.delete(testimonialToDelete);
            setTestimonials((prev) => prev.filter((t) => t._id.toString() !== testimonialToDelete));
            toast.success("Testimonial deleted successfully");
            setConfirmModalOpen(false);
            setTestimonialToDelete(null);
        } catch (error) {
            handleApiError(error, "Failed to delete testimonial.");
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FaStar
                key={i}
                className={i < rating ? "text-yellow-400" : "text-gray-300"}
                size={14}
            />
        ));
    };

    return (
        <div className="admin-page-container custom-black-white-theme-switch-bg">
            <CustomLoader loading={loading} />

            {/* Header */}
            <AdminPageHeader
                title="Testimonials"
                description="Manage customer testimonials and reviews. Showcase positive feedback to build trust with potential customers."
                primaryAction={{
                    label: "Add Testimonial",
                    onClick: () => openModal(),
                    icon: <FaPlus />,
                }}
                breadcrumbs={[
                    { label: "Admin Dashboard", href: "/admin-dashboard" },
                    { label: "Testimonials" },
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
                        onClick={fetchTestimonials}
                        size="sm"
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </div>
                <Collapse in={filtersOpen}>
                    <Card className="mb-4" withBorder>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextInput
                                label="Search"
                                placeholder="Search by name, role, company, or comment..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                leftSection={<FaFilter size={14} />}
                            />
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
            {loading && testimonials.length === 0 ? (
                <div className="space-y-2">
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                </div>
            ) : filteredTestimonials.length === 0 ? (
                <EmptyState
                    icon={<FaStar size={48} />}
                    title="No testimonials found"
                    description={
                        search || statusFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Add your first testimonial to showcase customer feedback."
                    }
                    action={
                        !search && statusFilter === "all"
                            ? {
                                  label: "Add Testimonial",
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
                                    <TableHeader>Role</TableHeader>
                                    <TableHeader>Company</TableHeader>
                                    <TableHeader>Rating</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Actions</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedTestimonials.map((testimonial) => (
                                    <TableRow key={testimonial._id.toString()}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {testimonial.image && (
                                                    <img
                                                        src={testimonial.image}
                                                        alt={testimonial.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                )}
                                                <span className="font-medium custom-black-white-theme-switch-text">
                                                    {testimonial.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="custom-black-white-theme-switch-text">
                                            {testimonial.role}
                                        </TableCell>
                                        <TableCell className="custom-black-white-theme-switch-text">
                                            {testimonial.company || "—"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {renderStars(testimonial.rating)}
                                                <span className="ml-1 text-sm custom-black-white-theme-switch-text">
                                                    ({testimonial.rating})
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                color={testimonial.isActive ? "green" : "gray"}
                                                variant="light"
                                                size="sm"
                                            >
                                                {testimonial.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Menu
                                                items={[
                                                    {
                                                        label: "View Details",
                                                        icon: <FaEye size={14} />,
                                                        onClick: () => {
                                                            setDetailsTestimonial(testimonial);
                                                            setDetailsModalOpen(true);
                                                        },
                                                    },
                                                    {
                                                        label: "Edit",
                                                        icon: <FaEdit size={14} />,
                                                        onClick: () => openModal(testimonial),
                                                    },
                                                    {
                                                        label: "Delete",
                                                        icon: <FaTrash size={14} />,
                                                        onClick: () => openDeleteConfirmation(testimonial._id.toString()),
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
            <Modal
                opened={modalOpen}
                onClose={closeModal}
                title={selectedTestimonial ? "Update Testimonial" : "Create Testimonial"}
                description={selectedTestimonial ? "Update testimonial details." : "Add a new customer testimonial."}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Name"
                                    placeholder="Customer name"
                                    error={errors.name?.message}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    required
                                />
                            )}
                        />

                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Role"
                                    placeholder="e.g., CEO, Manager"
                                    error={errors.role?.message}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    required
                                />
                            )}
                        />
                    </div>

                    <Controller
                        name="company"
                        control={control}
                        render={({ field }) => (
                            <TextInput
                                label="Company"
                                placeholder="Company name (optional)"
                                error={errors.company?.message}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                            />
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
                                        id="testimonial-image-upload"
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
                                        onClick={() => document.getElementById("testimonial-image-upload")?.click()}
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
                                        className="mt-2 w-32 h-32 object-cover rounded-full border border-[var(--bg-general-light)]"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="rating"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Rating"
                                    error={errors.rating?.message}
                                    value={field.value}
                                    onChange={(v) => field.onChange(v === "" ? 5 : (v as number))}
                                    min={1}
                                    max={5}
                                    required
                                />
                            )}
                        />

                        <Controller
                            name="order"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Display Order"
                                    error={errors.order?.message}
                                    value={field.value}
                                    onChange={(v) => field.onChange(v === "" ? 0 : (v as number))}
                                    min={0}
                                />
                            )}
                        />
                    </div>

                    <Controller
                        name="comment"
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                label="Comment"
                                placeholder="Customer testimonial text..."
                                error={errors.comment?.message}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                minRows={4}
                                required
                            />
                        )}
                    />

                    <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                            <Switch
                                label="Active Status"
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
                            {selectedTestimonial ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Details Modal */}
            <Modal
                opened={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false);
                    setDetailsTestimonial(null);
                }}
                title={`Testimonial Details — ${detailsTestimonial?.name ?? ""}`}
                size="lg"
            >
                {detailsTestimonial && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            {detailsTestimonial.image && (
                                <img
                                    src={detailsTestimonial.image}
                                    alt={detailsTestimonial.name}
                                    className="w-20 h-20 rounded-full object-cover"
                                />
                            )}
                            <div>
                                <h3 className="text-xl font-semibold custom-black-white-theme-switch-text">
                                    {detailsTestimonial.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {detailsTestimonial.role}
                                    {detailsTestimonial.company && ` at ${detailsTestimonial.company}`}
                                </p>
                                <div className="flex items-center gap-1 mt-2">
                                    {renderStars(detailsTestimonial.rating)}
                                    <span className="ml-1 text-sm custom-black-white-theme-switch-text">
                                        {detailsTestimonial.rating}/5
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-[var(--bg-general-light)] pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Comment</p>
                            <p className="custom-black-white-theme-switch-text leading-relaxed">
                                {detailsTestimonial.comment}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-[var(--bg-general-light)] pt-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                                <Badge
                                    color={detailsTestimonial.isActive ? "green" : "gray"}
                                    variant="light"
                                >
                                    {detailsTestimonial.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Display Order</p>
                                <p className="custom-black-white-theme-switch-text">{detailsTestimonial.order || 0}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmationModal
                opened={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setTestimonialToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Delete testimonial?"
                message={
                    <div className="text-sm custom-black-white-theme-switch-text">
                        Are you sure you want to delete this testimonial? This action cannot be undone.
                    </div>
                }
                loading={loading}
            />
        </div>
    );
}
