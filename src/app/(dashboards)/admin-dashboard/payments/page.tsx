"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaEye, FaFilter, FaSync, FaEllipsisV, FaDollarSign, FaCheckCircle } from "react-icons/fa";
import { z } from "zod";
import Link from "next/link";

import { PaymentsApi } from "@/api/payments.api";
import { IPayment } from "@/lib/models/payment.model";
import { PaymentStatus } from "@/lib/enums/paymentStatus.enum";
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
import { NumberInput } from "@/components/ui/input/NumberInput";
import { Card } from "@/components/ui/card/Card";
import { Collapse } from "@/components/ui/collapse/Collapse";
import { Menu } from "@/components/ui/menu/Menu";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { Switch } from "@/components/ui/switch/Switch";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const UpdatePaymentSchema = z.object({
    status: z.nativeEnum(PaymentStatus),
    amount: z.coerce.number().min(0).optional(),
    currency: z.string().optional(),
    transactionId: z.string().optional(),
    reference: z.string().optional(),
    description: z.string().optional(),
    proofOfPayment: z.string().url().optional().or(z.literal("")),
    notes: z.string().optional(),
    isPaid: z.boolean().optional(),
});

type UpdatePaymentFormData = z.infer<typeof UpdatePaymentSchema>;

const pageSize = 10;

const STATUS_COLORS: Record<PaymentStatus, string> = {
    PENDING: "yellow",
    PROCESSING: "blue",
    COMPLETED: "green",
    FAILED: "red",
    REFUNDED: "orange",
    CANCELLED: "gray",
};

export default function PaymentsPage() {
    const [payments, setPayments] = useState<IPayment[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [paidFilter, setPaidFilter] = useState<string>("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<IPayment | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [detailsPayment, setDetailsPayment] = useState<IPayment | null>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<UpdatePaymentFormData>({
        resolver: zodResolver(UpdatePaymentSchema),
        defaultValues: {
            status: PaymentStatus.PENDING,
            amount: undefined,
            currency: "USD",
            transactionId: "",
            reference: "",
            description: "",
            proofOfPayment: "",
            notes: "",
            isPaid: false,
        },
    });

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const result = await PaymentsApi.list();
            setPayments(result.items);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load payments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const filteredPayments = useMemo(() => {
        let filtered = payments;

        if (search.trim()) {
            const q = search.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.transactionId?.toLowerCase().includes(q) ||
                    p.reference?.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q) ||
                    p.parcelId.toString().includes(q)
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((p) => p.status === statusFilter);
        }

        if (paidFilter === "paid") {
            filtered = filtered.filter((p) => p.isPaid);
        } else if (paidFilter === "unpaid") {
            filtered = filtered.filter((p) => !p.isPaid);
        }

        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [payments, search, statusFilter, paidFilter]);

    const paginatedPayments = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPayments.slice(start, start + pageSize);
    }, [filteredPayments, currentPage]);

    const totalPages = Math.ceil(filteredPayments.length / pageSize);

    const analytics = useMemo(() => {
        const total = filteredPayments.length;
        const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
        const completed = filteredPayments.filter((p) => p.status === PaymentStatus.COMPLETED).length;
        const pending = filteredPayments.filter((p) => p.status === PaymentStatus.PENDING).length;
        return [
            {
                title: "Total Payments",
                value: total,
                icon: <FaDollarSign size={20} />,
                color: "blue",
            },
            {
                title: "Total Amount",
                value: `$${totalAmount.toFixed(2)}`,
                icon: <FaDollarSign size={20} />,
                color: "green",
            },
            {
                title: "Completed",
                value: completed,
                icon: <FaCheckCircle size={20} />,
                color: "green",
            },
            {
                title: "Pending",
                value: pending,
                icon: <FaDollarSign size={20} />,
                color: "yellow",
            },
        ];
    }, [filteredPayments]);

    const openModal = (payment: IPayment) => {
        setSelectedPayment(payment);
        setValue("status", payment.status);
        setValue("amount", payment.amount);
        setValue("currency", payment.currency);
        setValue("transactionId", payment.transactionId || "");
        setValue("reference", payment.reference || "");
        setValue("description", payment.description || "");
        setValue("proofOfPayment", payment.proofOfPayment || "");
        setValue("notes", payment.notes || "");
        setValue("isPaid", payment.isPaid);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedPayment(null);
        reset();
    };

    const onSubmit = async (data: UpdatePaymentFormData) => {
        if (!selectedPayment) return;
        setLoading(true);
        try {
            const updated = await PaymentsApi.update(selectedPayment._id.toString(), {
                ...data,
                paidAt: data.isPaid && !selectedPayment.isPaid ? new Date() : selectedPayment.paidAt,
            });
            setPayments((prev) =>
                prev.map((p) => (p._id.toString() === selectedPayment._id.toString() ? updated : p))
            );
            toast.success("Payment updated successfully");
            closeModal();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update payment.");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        setLoading(true);
        try {
            const updated = await PaymentsApi.markAsPaid(id);
            setPayments((prev) => prev.map((p) => (p._id.toString() === id ? updated : p)));
            toast.success("Payment marked as paid");
        } catch (error) {
            console.error(error);
            toast.error("Failed to mark payment as paid.");
        } finally {
            setLoading(false);
        }
    };

    const openDeleteConfirmation = (id: string) => {
        setPaymentToDelete(id);
        setConfirmModalOpen(true);
    };

    const handleDelete = async () => {
        if (!paymentToDelete) return;
        setLoading(true);
        try {
            await PaymentsApi.delete(paymentToDelete);
            setPayments((prev) => prev.filter((p) => p._id.toString() !== paymentToDelete));
            toast.success("Payment deleted successfully");
            setConfirmModalOpen(false);
            setPaymentToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete payment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page-container custom-black-white-theme-switch-bg">
            <CustomLoader loading={loading} />

            {/* Header */}
            <AdminPageHeader
                title="Payments"
                description="View and manage payment records and transactions. Track payment status, update records, and monitor financial activity."
                primaryAction={{
                    label: "Refresh",
                    onClick: fetchPayments,
                    icon: <FaSync />,
                    loading: loading,
                }}
                breadcrumbs={[
                    { label: "Admin Dashboard", href: "/admin-dashboard" },
                    { label: "Payments" },
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
                </div>
                <Collapse in={filtersOpen}>
                    <Card className="mb-4" withBorder>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <TextInput
                                label="Search"
                                placeholder="Search by transaction ID, reference..."
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
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                                >
                                    <option value="all">All Statuses</option>
                                    {Object.values(PaymentStatus).map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                                    Paid Status
                                </label>
                                <select
                                    value={paidFilter}
                                    onChange={(e) => {
                                        setPaidFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                                >
                                    <option value="all">All</option>
                                    <option value="paid">Paid</option>
                                    <option value="unpaid">Unpaid</option>
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
                                style={{
                                    backgroundColor: `${item.color}20`,
                                    color: item.color,
                                }}
                            >
                                {item.icon}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Table / Empty state */}
            {loading && payments.length === 0 ? (
                <div className="space-y-2">
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                </div>
            ) : filteredPayments.length === 0 ? (
                <EmptyState
                    icon={<FaDollarSign size={48} />}
                    title="No payments found"
                    description={
                        search || statusFilter !== "all" || paidFilter !== "all"
                            ? "Try adjusting your filters"
                            : "No payment records yet."
                    }
                />
            ) : (
                <>
                    <div className="overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Parcel ID</TableHeader>
                                    <TableHeader>Amount</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Transaction ID</TableHeader>
                                    <TableHeader>Paid</TableHeader>
                                    <TableHeader>Date</TableHeader>
                                    <TableHeader>Actions</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedPayments.map((payment) => (
                                    <TableRow key={payment._id.toString()}>
                                        <TableCell>
                                            <Link
                                                href={`/admin-dashboard/parcels?search=${payment.parcelId}`}
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                {payment.parcelId.toString().slice(-8)}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="custom-black-white-theme-switch-text font-semibold">
                                            {payment.currency} {payment.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                color={STATUS_COLORS[payment.status] as any}
                                                variant="light"
                                                size="sm"
                                            >
                                                {payment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="custom-black-white-theme-switch-text text-sm font-mono">
                                            {payment.transactionId || "—"}
                                        </TableCell>
                                        <TableCell>
                                            {payment.isPaid ? (
                                                <Badge color="green" variant="light" size="sm">
                                                    Paid
                                                </Badge>
                                            ) : (
                                                <Badge color="gray" variant="light" size="sm">
                                                    Unpaid
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="custom-black-white-theme-switch-text text-sm">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Menu
                                                items={[
                                                    {
                                                        label: "View Details",
                                                        icon: <FaEye size={14} />,
                                                        onClick: () => {
                                                            setDetailsPayment(payment);
                                                            setDetailsModalOpen(true);
                                                        },
                                                    },
                                                    {
                                                        label: "Edit",
                                                        icon: <FaEdit size={14} />,
                                                        onClick: () => openModal(payment),
                                                    },
                                                    {
                                                        label: payment.isPaid
                                                            ? "Mark as Unpaid"
                                                            : "Mark as Paid",
                                                        icon: <FaCheckCircle size={14} />,
                                                        onClick: () => handleMarkAsPaid(payment._id.toString()),
                                                    },
                                                    {
                                                        label: "Delete",
                                                        icon: <FaTrash size={14} />,
                                                        onClick: () => openDeleteConfirmation(payment._id.toString()),
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

            {/* Update Modal */}
            <Modal opened={modalOpen} onClose={closeModal} title="Update Payment" size="lg">
                {selectedPayment && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                                    Status
                                </label>
                                <select
                                    value={control._formValues.status || PaymentStatus.PENDING}
                                    onChange={(e) => setValue("status", e.target.value as PaymentStatus)}
                                    className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                                >
                                    {Object.values(PaymentStatus).map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Controller
                                name="amount"
                                control={control}
                                render={({ field }) => (
                                    <NumberInput
                                        label="Amount"
                                        value={field.value}
                                        onChange={(v) => field.onChange(v === "" ? undefined : (v as number))}
                                        min={0}
                                    />
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                name="currency"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        label="Currency"
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                )}
                            />

                            <Controller
                                name="transactionId"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        label="Transaction ID"
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                name="reference"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        label="Reference"
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                )}
                            />

                            <Controller
                                name="proofOfPayment"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        label="Proof of Payment URL"
                                        type="url"
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
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
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    minRows={2}
                                />
                            )}
                        />

                        <Controller
                            name="notes"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    label="Notes"
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    minRows={2}
                                />
                            )}
                        />

                        <Controller
                            name="isPaid"
                            control={control}
                            render={({ field }) => (
                                <Switch
                                    label="Mark as Paid"
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
                                Update
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Details Modal */}
            <Modal
                opened={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false);
                    setDetailsPayment(null);
                }}
                title="Payment Details"
                size="lg"
            >
                {detailsPayment && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount</p>
                                <p className="text-2xl font-bold custom-black-white-theme-switch-text">
                                    {detailsPayment.currency} {detailsPayment.amount.toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                                <Badge color={STATUS_COLORS[detailsPayment.status] as any} variant="light">
                                    {detailsPayment.status}
                                </Badge>
                            </div>
                        </div>

                        <div className="border-t border-[var(--bg-general-light)] pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Parcel ID</p>
                            <Link
                                href={`/admin-dashboard/parcels?search=${detailsPayment.parcelId}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {detailsPayment.parcelId.toString()}
                            </Link>
                        </div>

                        {detailsPayment.transactionId && (
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction ID</p>
                                <p className="custom-black-white-theme-switch-text font-mono">
                                    {detailsPayment.transactionId}
                                </p>
                            </div>
                        )}

                        {detailsPayment.reference && (
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reference</p>
                                <p className="custom-black-white-theme-switch-text">{detailsPayment.reference}</p>
                            </div>
                        )}

                        {detailsPayment.description && (
                            <div className="border-t border-[var(--bg-general-light)] pt-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                                <p className="custom-black-white-theme-switch-text">{detailsPayment.description}</p>
                            </div>
                        )}

                        {detailsPayment.notes && (
                            <div className="border-t border-[var(--bg-general-light)] pt-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Notes</p>
                                <p className="custom-black-white-theme-switch-text whitespace-pre-wrap">
                                    {detailsPayment.notes}
                                </p>
                            </div>
                        )}

                        {detailsPayment.proofOfPayment && (
                            <div className="border-t border-[var(--bg-general-light)] pt-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Proof of Payment</p>
                                <a
                                    href={detailsPayment.proofOfPayment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    View Proof
                                </a>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 border-t border-[var(--bg-general-light)] pt-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created</p>
                                <p className="custom-black-white-theme-switch-text">
                                    {new Date(detailsPayment.createdAt).toLocaleString()}
                                </p>
                            </div>
                            {detailsPayment.paidAt && (
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paid At</p>
                                    <p className="custom-black-white-theme-switch-text">
                                        {new Date(detailsPayment.paidAt).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmationModal
                opened={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setPaymentToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Delete payment?"
                message={
                    <div className="text-sm custom-black-white-theme-switch-text">
                        Are you sure you want to delete this payment? This action cannot be undone.
                    </div>
                }
                loading={loading}
            />
        </div>
    );
}
