"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaSync, FaEllipsisV, FaQuestionCircle } from "react-icons/fa";
import { z } from "zod";

import { FAQsApi } from "@/api/faqs.api";
import { IFAQ } from "@/lib/models/faq.model";
import CustomLoader from "@/components/features/CustomLoader";
import EmptyState from "@/components/features/EmptyState";
import ConfirmationModal from "@/components/features/ConfirmationModal";

// Custom Components
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from "@/components/ui/table/Table";
import { Badge } from "@/components/ui/badge/Badge";
import { Pagination } from "@/components/ui/pagination/Pagination";
import { Modal } from "@/components/ui/modal/Modal";
import { Button } from "@/components/ui/button/Button";
import { TextInput } from "@/components/ui/input/TextInput";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { Card } from "@/components/ui/card/Card";
import { Collapse } from "@/components/ui/collapse/Collapse";
import { Menu } from "@/components/ui/menu/Menu";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { Switch } from "@/components/ui/switch/Switch";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const FAQSchema = z.object({
    question: z.string().min(1, "Question is required"),
    answer: z.string().min(1, "Answer is required"),
    category: z.string().optional(),
    order: z.coerce.number().default(0),
    isActive: z.boolean().default(true),
});

type FAQFormData = z.infer<typeof FAQSchema>;

const pageSize = 10;

export default function FAQsPage() {
    const [faqs, setFaqs] = useState<IFAQ[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFAQ, setSelectedFAQ] = useState<IFAQ | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [detailsFAQ, setDetailsFAQ] = useState<IFAQ | null>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<FAQFormData>({
        resolver: zodResolver(FAQSchema),
        defaultValues: {
            question: "",
            answer: "",
            category: "",
            order: 0,
            isActive: true,
        },
    });

    const fetchFAQs = async () => {
        setLoading(true);
        try {
            const result = await FAQsApi.list();
            setFaqs(result.items);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load FAQs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFAQs();
    }, []);

    const categories = useMemo(() => {
        const cats = new Set(faqs.map((f) => f.category).filter(Boolean));
        return Array.from(cats);
    }, [faqs]);

    const filteredFAQs = useMemo(() => {
        let filtered = faqs;

        if (search.trim()) {
            const q = search.toLowerCase();
            filtered = filtered.filter(
                (f) =>
                    f.question.toLowerCase().includes(q) ||
                    f.answer.toLowerCase().includes(q) ||
                    f.category?.toLowerCase().includes(q)
            );
        }

        if (categoryFilter !== "all") {
            filtered = filtered.filter((f) => f.category === categoryFilter);
        }

        if (statusFilter === "active") {
            filtered = filtered.filter((f) => f.isActive);
        } else if (statusFilter === "inactive") {
            filtered = filtered.filter((f) => !f.isActive);
        }

        return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [faqs, search, categoryFilter, statusFilter]);

    const paginatedFAQs = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredFAQs.slice(start, start + pageSize);
    }, [filteredFAQs, currentPage]);

    const totalPages = Math.ceil(filteredFAQs.length / pageSize);

    const openModal = (faq?: IFAQ) => {
        if (faq) {
            setSelectedFAQ(faq);
            setValue("question", faq.question);
            setValue("answer", faq.answer);
            setValue("category", faq.category || "");
            setValue("order", faq.order || 0);
            setValue("isActive", faq.isActive);
        } else {
            setSelectedFAQ(null);
            reset();
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedFAQ(null);
        reset();
    };

    const onSubmit = async (data: FAQFormData) => {
        setLoading(true);
        try {
            if (selectedFAQ) {
                const updated = await FAQsApi.update(selectedFAQ._id.toString(), data);
                setFaqs((prev) =>
                    prev.map((f) => (f._id.toString() === selectedFAQ._id.toString() ? updated : f))
                );
                toast.success("FAQ updated successfully");
            } else {
                const created = await FAQsApi.create(data);
                setFaqs((prev) => [created, ...prev]);
                toast.success("FAQ created successfully");
            }
            closeModal();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save FAQ.");
        } finally {
            setLoading(false);
        }
    };

    const openDeleteConfirmation = (id: string) => {
        setFaqToDelete(id);
        setConfirmModalOpen(true);
    };

    const handleDelete = async () => {
        if (!faqToDelete) return;
        setLoading(true);
        try {
            await FAQsApi.delete(faqToDelete);
            setFaqs((prev) => prev.filter((f) => f._id.toString() !== faqToDelete));
            toast.success("FAQ deleted successfully");
            setConfirmModalOpen(false);
            setFaqToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete FAQ.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page-container custom-black-white-theme-switch-bg">
            <CustomLoader loading={loading} />

            {/* Header */}
            <AdminPageHeader
                title="FAQs"
                description="Manage frequently asked questions. Create and organize answers to help customers find information quickly."
                primaryAction={{
                    label: "Add FAQ",
                    onClick: () => openModal(),
                    icon: <FaPlus />,
                }}
                breadcrumbs={[
                    { label: "Admin Dashboard", href: "/admin-dashboard" },
                    { label: "FAQs" },
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
                        onClick={fetchFAQs}
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
                                placeholder="Search questions or answers..."
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
            {loading && faqs.length === 0 ? (
                <div className="space-y-2">
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                </div>
            ) : filteredFAQs.length === 0 ? (
                <EmptyState
                    icon={<FaQuestionCircle size={48} />}
                    title="No FAQs found"
                    description={
                        search || categoryFilter !== "all" || statusFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Add your first FAQ to help customers find answers."
                    }
                    action={
                        !search && categoryFilter === "all" && statusFilter === "all"
                            ? {
                                  label: "Add FAQ",
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
                                    <TableHeader>Question</TableHeader>
                                    <TableHeader>Category</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Order</TableHeader>
                                    <TableHeader>Actions</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedFAQs.map((faq) => (
                                    <TableRow key={faq._id.toString()}>
                                        <TableCell>
                                            <div>
                                                <span className="font-medium custom-black-white-theme-switch-text block">
                                                    {faq.question}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {faq.answer.substring(0, 60)}...
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {faq.category ? (
                                                <Badge variant="light" size="sm">
                                                    {faq.category}
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                color={faq.isActive ? "green" : "gray"}
                                                variant="light"
                                                size="sm"
                                            >
                                                {faq.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="custom-black-white-theme-switch-text">
                                            {faq.order || 0}
                                        </TableCell>
                                        <TableCell>
                                            <Menu
                                                items={[
                                                    {
                                                        label: "View Details",
                                                        icon: <FaEye size={14} />,
                                                        onClick: () => {
                                                            setDetailsFAQ(faq);
                                                            setDetailsModalOpen(true);
                                                        },
                                                    },
                                                    {
                                                        label: "Edit",
                                                        icon: <FaEdit size={14} />,
                                                        onClick: () => openModal(faq),
                                                    },
                                                    {
                                                        label: "Delete",
                                                        icon: <FaTrash size={14} />,
                                                        onClick: () => openDeleteConfirmation(faq._id.toString()),
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
                title={selectedFAQ ? "Update FAQ" : "Create FAQ"}
                description={selectedFAQ ? "Update FAQ content and settings." : "Create a new frequently asked question."}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Controller
                        name="question"
                        control={control}
                        render={({ field }) => (
                            <TextInput
                                label="Question"
                                placeholder="What is your question?"
                                error={errors.question?.message}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                required
                            />
                        )}
                    />

                    <Controller
                        name="answer"
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                label="Answer"
                                placeholder="Provide a detailed answer..."
                                error={errors.answer?.message}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                minRows={4}
                                required
                            />
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Category"
                                    placeholder="e.g., Shipping, Payment, General"
                                    error={errors.category?.message}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />

                        <Controller
                            name="order"
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={field.value}
                                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                        className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                                    />
                                </div>
                            )}
                        />
                    </div>

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
                            {selectedFAQ ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Details Modal */}
            <Modal
                opened={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false);
                    setDetailsFAQ(null);
                }}
                title="FAQ Details"
                size="lg"
            >
                {detailsFAQ && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Question</p>
                            <p className="text-lg font-semibold custom-black-white-theme-switch-text">
                                {detailsFAQ.question}
                            </p>
                        </div>

                        <div className="border-t border-[var(--bg-general-light)] pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Answer</p>
                            <p className="custom-black-white-theme-switch-text whitespace-pre-wrap leading-relaxed">
                                {detailsFAQ.answer}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t border-[var(--bg-general-light)] pt-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
                                {detailsFAQ.category ? (
                                    <Badge variant="light">{detailsFAQ.category}</Badge>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                                <Badge
                                    color={detailsFAQ.isActive ? "green" : "gray"}
                                    variant="light"
                                >
                                    {detailsFAQ.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order</p>
                                <p className="custom-black-white-theme-switch-text">{detailsFAQ.order || 0}</p>
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
                    setFaqToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Delete FAQ?"
                message={
                    <div className="text-sm custom-black-white-theme-switch-text">
                        Are you sure you want to delete this FAQ? This action cannot be undone.
                    </div>
                }
                loading={loading}
            />
        </div>
    );
}
