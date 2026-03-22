"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaEye, FaFilter, FaSync, FaEllipsisV, FaEnvelope, FaCheckCircle, FaReply } from "react-icons/fa";
import { z } from "zod";

import { ContactsApi } from "@/api/contacts.api";
import { IContact, ContactType, ContactStatus } from "@/lib/models/contact.model";
import CustomLoader from "@/components/features/CustomLoader";
import EmptyState from "@/components/features/EmptyState";
import ConfirmationModal from "@/components/features/ConfirmationModal";
import { handleApiError } from "@/utils/error-handler";

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
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const ContactSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    type: z.nativeEnum(ContactType),
    subject: z.string().min(1, "Subject is required"),
    message: z.string().min(1, "Message is required"),
    status: z.nativeEnum(ContactStatus),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    assignedTo: z.string().optional(),
    response: z.string().optional(),
});

type ContactFormData = z.infer<typeof ContactSchema>;

const pageSize = 10;

const TYPE_COLORS: Partial<Record<ContactType, string>> = {
    GENERAL: "gray",
    SUPPORT: "blue",
    SALES: "green",
    TECHNICAL: "purple",
    COMPLAINT: "red",
    FEEDBACK: "yellow",
};

const STATUS_COLORS: Record<ContactStatus, string> = {
    NEW: "blue",
    IN_PROGRESS: "yellow",
    RESOLVED: "green",
    CLOSED: "gray",
};

const PRIORITY_COLORS: Record<string, string> = {
    LOW: "gray",
    MEDIUM: "blue",
    HIGH: "orange",
    URGENT: "red",
};

export default function ContactsPage() {
    const [contacts, setContacts] = useState<IContact[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<IContact | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [detailsContact, setDetailsContact] = useState<IContact | null>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<string | null>(null);
    const [responseModalOpen, setResponseModalOpen] = useState(false);
    const [contactToRespond, setContactToRespond] = useState<string | null>(null);
    const [responseText, setResponseText] = useState("");

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<ContactFormData>({
        resolver: zodResolver(ContactSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            type: ContactType.GENERAL,
            subject: "",
            message: "",
            status: ContactStatus.NEW,
            priority: "MEDIUM",
            assignedTo: "",
            response: "",
        },
    });

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const result = await ContactsApi.list({
                page: currentPage,
                limit: pageSize,
            });
            setContacts(result.items);
        } catch (error) {
            console.log(error);
            toast.error("Failed to load contacts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [currentPage]);

    const filteredContacts = useMemo(() => {
        let filtered = contacts;

        if (search.trim()) {
            const q = search.toLowerCase();
            filtered = filtered.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.email.toLowerCase().includes(q) ||
                    c.subject.toLowerCase().includes(q) ||
                    c.message.toLowerCase().includes(q) ||
                    c.phone?.toLowerCase().includes(q)
            );
        }

        if (typeFilter !== "all") {
            filtered = filtered.filter((c) => c.type === typeFilter);
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((c) => c.status === statusFilter);
        }

        if (priorityFilter !== "all") {
            filtered = filtered.filter((c) => c.priority === priorityFilter);
        }

        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [contacts, search, typeFilter, statusFilter, priorityFilter]);

    const paginatedContacts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredContacts.slice(start, start + pageSize);
    }, [filteredContacts, currentPage]);

    const totalPages = Math.ceil(filteredContacts.length / pageSize);

    const analytics = useMemo(() => {
        const total = filteredContacts.length;
        const newCount = filteredContacts.filter((c) => c.status === ContactStatus.NEW).length;
        const inProgress = filteredContacts.filter((c) => c.status === ContactStatus.IN_PROGRESS).length;
        const resolved = filteredContacts.filter((c) => c.status === ContactStatus.RESOLVED).length;
        return [
            {
                title: "Total Contacts",
                value: total,
                icon: <FaEnvelope size={20} />,
                color: "blue",
            },
            {
                title: "New",
                value: newCount,
                icon: <FaEnvelope size={20} />,
                color: "blue",
            },
            {
                title: "In Progress",
                value: inProgress,
                icon: <FaEnvelope size={20} />,
                color: "yellow",
            },
            {
                title: "Resolved",
                value: resolved,
                icon: <FaCheckCircle size={20} />,
                color: "green",
            },
        ];
    }, [filteredContacts]);

    const openModal = (contact?: IContact) => {
        if (contact) {
            setSelectedContact(contact);
            setValue("name", contact.name);
            setValue("email", contact.email);
            setValue("phone", contact.phone || "");
            setValue("type", contact.type);
            setValue("subject", contact.subject);
            setValue("message", contact.message);
            setValue("status", contact.status);
            setValue("priority", contact.priority);
            setValue("assignedTo", contact.assignedTo || "");
            setValue("response", contact.response || "");
        } else {
            setSelectedContact(null);
            reset();
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedContact(null);
        reset();
    };

    const onSubmit = async (data: ContactFormData) => {
        setLoading(true);
        try {
            if (selectedContact) {
                // For update, only send fields allowed by UpdateContactDto
                const updateData = {
                    status: data.status,
                    priority: data.priority,
                    assignedTo: data.assignedTo || undefined,
                    response: data.response || undefined,
                };
                const updated = await ContactsApi.update(selectedContact._id.toString(), updateData);
                setContacts((prev) =>
                    prev.map((c) => (c._id.toString() === selectedContact._id.toString() ? updated : c))
                );
                toast.success("Contact updated successfully");
            } else {
                // For create, send all fields
                const created = await ContactsApi.create(data);
                setContacts((prev) => [created, ...prev]);
                toast.success("Contact created successfully");
            }
            closeModal();
        } catch (error) {
            handleApiError(error, "Failed to save contact.");
        } finally {
            setLoading(false);
        }
    };

    const openResponseModal = (id: string) => {
        const contact = contacts.find((c) => c._id.toString() === id);
        setContactToRespond(id);
        setResponseText(contact?.response || "");
        setResponseModalOpen(true);
    };

    const handleRespond = async () => {
        if (!contactToRespond || !responseText.trim()) {
            toast.error("Please provide a response.");
            return;
        }
        setLoading(true);
        try {
            const contact = contacts.find((c) => c._id.toString() === contactToRespond);
            if (!contact) return;

            const updated = await ContactsApi.update(contactToRespond, {
                response: responseText,
                status: ContactStatus.RESOLVED,
            });
            setContacts((prev) => prev.map((c) => (c._id.toString() === contactToRespond ? updated : c)));
            toast.success("Response sent successfully");
            setResponseModalOpen(false);
            setContactToRespond(null);
            setResponseText("");
        } catch (error) {
            handleApiError(error, "Failed to send response.");
        } finally {
            setLoading(false);
        }
    };

    const openDeleteConfirmation = (id: string) => {
        setContactToDelete(id);
        setConfirmModalOpen(true);
    };

    const handleDelete = async () => {
        if (!contactToDelete) return;
        setLoading(true);
        try {
            await ContactsApi.delete(contactToDelete);
            setContacts((prev) => prev.filter((c) => c._id.toString() !== contactToDelete));
            toast.success("Contact deleted successfully");
            setConfirmModalOpen(false);
            setContactToDelete(null);
        } catch (error) {
            handleApiError(error, "Failed to delete contact.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page-container custom-black-white-theme-switch-bg">
            <CustomLoader loading={loading} />

            {/* Header */}
            <AdminPageHeader
                title="Contacts"
                description="Manage customer contact submissions and inquiries. View, respond to, and track all customer communications."
                primaryAction={{
                    label: "Refresh",
                    onClick: fetchContacts,
                    icon: <FaSync />,
                    loading: loading,
                }}
                breadcrumbs={[
                    { label: "Admin Dashboard", href: "/admin-dashboard" },
                    { label: "Contacts" },
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <TextInput
                                label="Search"
                                placeholder="Search by name, email, subject..."
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
                                    {Object.values(ContactType).map((type) => (
                                        <option key={type} value={type}>
                                            {type.replace("_", " ")}
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
                                    {Object.values(ContactStatus).map((status) => (
                                        <option key={status} value={status}>
                                            {status.replace("_", " ")}
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
            {loading && contacts.length === 0 ? (
                <div className="space-y-2">
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                </div>
            ) : filteredContacts.length === 0 ? (
                <EmptyState
                    icon={<FaEnvelope size={48} />}
                    title="No contacts found"
                    description={
                        search || typeFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all"
                            ? "Try adjusting your filters"
                            : "No contact submissions yet."
                    }
                />
            ) : (
                <>
                    <div className="overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Name</TableHeader>
                                    <TableHeader>Email</TableHeader>
                                    <TableHeader>Type</TableHeader>
                                    <TableHeader>Subject</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Priority</TableHeader>
                                    <TableHeader>Date</TableHeader>
                                    <TableHeader>Actions</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedContacts.map((contact) => (
                                    <TableRow key={contact._id.toString()}>
                                        <TableCell>
                                            <span className="font-medium custom-black-white-theme-switch-text">
                                                {contact.name}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <a
                                                href={`mailto:${contact.email}`}
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                {contact.email}
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                color={(TYPE_COLORS[contact.type] || "gray") as any}
                                                variant="light"
                                                size="sm"
                                            >
                                                {contact.type.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="custom-black-white-theme-switch-text">
                                                {contact.subject}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                color={STATUS_COLORS[contact.status] as any}
                                                variant="light"
                                                size="sm"
                                            >
                                                {contact.status.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                color={PRIORITY_COLORS[contact.priority] as any}
                                                variant="light"
                                                size="sm"
                                            >
                                                {contact.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="custom-black-white-theme-switch-text text-sm">
                                            {new Date(contact.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Menu
                                                items={[
                                                    {
                                                        label: "View Details",
                                                        icon: <FaEye size={14} />,
                                                        onClick: () => {
                                                            setDetailsContact(contact);
                                                            setDetailsModalOpen(true);
                                                        },
                                                    },
                                                    {
                                                        label: "Edit",
                                                        icon: <FaEdit size={14} />,
                                                        onClick: () => openModal(contact),
                                                    },
                                                    {
                                                        label: "Respond",
                                                        icon: <FaReply size={14} />,
                                                        onClick: () => openResponseModal(contact._id.toString()),
                                                    },
                                                    {
                                                        label: "Delete",
                                                        icon: <FaTrash size={14} />,
                                                        onClick: () => openDeleteConfirmation(contact._id.toString()),
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
                title={selectedContact ? "Update Contact" : "Create Contact"}
                description={selectedContact ? "Update contact information and status." : "Create a new contact entry."}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {!selectedContact && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            label="Name"
                                            placeholder="Contact name"
                                            error={errors.name?.message}
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            required
                                        />
                                    )}
                                />

                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            label="Email"
                                            placeholder="email@example.com"
                                            error={errors.email?.message}
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            required
                                        />
                                    )}
                                />
                            </div>

                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        label="Phone"
                                        placeholder="Phone number"
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                )}
                            />

                            <div>
                                <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                                    Type
                                </label>
                                <select
                                    value={control._formValues.type || ContactType.GENERAL}
                                    onChange={(e) => setValue("type", e.target.value as ContactType)}
                                    className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                                >
                                    {Object.values(ContactType).map((type) => (
                                        <option key={type} value={type}>
                                            {type.replace("_", " ")}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Controller
                                name="subject"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        label="Subject"
                                        placeholder="Contact subject"
                                        error={errors.subject?.message}
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        required
                                    />
                                )}
                            />

                            <Controller
                                name="message"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        label="Message"
                                        placeholder="Contact message"
                                        error={errors.message?.message}
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        minRows={4}
                                        required
                                    />
                                )}
                            />
                        </>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                                Status
                            </label>
                            <select
                                value={control._formValues.status || ContactStatus.NEW}
                                onChange={(e) => setValue("status", e.target.value as ContactStatus)}
                                className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                            >
                                {Object.values(ContactStatus).map((status) => (
                                    <option key={status} value={status}>
                                        {status.replace("_", " ")}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                                Priority
                            </label>
                            <select
                                value={control._formValues.priority || "MEDIUM"}
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
                        name="assignedTo"
                        control={control}
                        render={({ field }) => (
                            <TextInput
                                label="Assigned To"
                                placeholder="Admin name or email"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                            />
                        )}
                    />

                    <Controller
                        name="response"
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                label="Response"
                                placeholder="Admin response"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                minRows={3}
                            />
                        )}
                    />

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={closeModal} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading} color="brandOrange">
                            {selectedContact ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Response Modal */}
            <Modal
                opened={responseModalOpen}
                onClose={() => {
                    setResponseModalOpen(false);
                    setContactToRespond(null);
                    setResponseText("");
                }}
                title="Respond to Contact"
                size="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                            Response
                        </label>
                        <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Write your response to the customer..."
                            className="w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]"
                            rows={5}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setResponseModalOpen(false);
                                setContactToRespond(null);
                                setResponseText("");
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleRespond} loading={loading} color="brandOrange">
                            Send Response
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Details Modal */}
            <Modal
                opened={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false);
                    setDetailsContact(null);
                }}
                title={`Contact Details — ${detailsContact?.name ?? ""}`}
                size="lg"
            >
                {detailsContact && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Type</p>
                                <Badge color={(TYPE_COLORS[detailsContact.type] || "gray") as any} variant="light">
                                    {detailsContact.type.replace("_", " ")}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                                <Badge color={STATUS_COLORS[detailsContact.status] as any} variant="light">
                                    {detailsContact.status.replace("_", " ")}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Priority</p>
                                <Badge color={PRIORITY_COLORS[detailsContact.priority] as any} variant="light">
                                    {detailsContact.priority}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-[var(--bg-general-light)] pt-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Name</p>
                                <p className="custom-black-white-theme-switch-text">{detailsContact.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                                <a
                                    href={`mailto:${detailsContact.email}`}
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {detailsContact.email}
                                </a>
                            </div>
                            {detailsContact.phone && (
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                                    <p className="custom-black-white-theme-switch-text">{detailsContact.phone}</p>
                                </div>
                            )}
                            {detailsContact.assignedTo && (
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assigned To</p>
                                    <p className="custom-black-white-theme-switch-text">{detailsContact.assignedTo}</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-[var(--bg-general-light)] pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Subject</p>
                            <p className="text-lg font-semibold custom-black-white-theme-switch-text">
                                {detailsContact.subject}
                            </p>
                        </div>

                        <div className="border-t border-[var(--bg-general-light)] pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Message</p>
                            <p className="custom-black-white-theme-switch-text whitespace-pre-wrap leading-relaxed">
                                {detailsContact.message}
                            </p>
                        </div>

                        {detailsContact.response && (
                            <div className="border-t border-[var(--bg-general-light)] pt-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Response</p>
                                <p className="custom-black-white-theme-switch-text whitespace-pre-wrap leading-relaxed">
                                    {detailsContact.response}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 border-t border-[var(--bg-general-light)] pt-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created</p>
                                <p className="custom-black-white-theme-switch-text">
                                    {new Date(detailsContact.createdAt).toLocaleString()}
                                </p>
                            </div>
                            {detailsContact.respondedAt && (
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Responded</p>
                                    <p className="custom-black-white-theme-switch-text">
                                        {new Date(detailsContact.respondedAt).toLocaleString()}
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
                    setContactToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Delete Contact?"
                message={
                    <div className="text-sm custom-black-white-theme-switch-text">
                        Are you sure you want to delete this contact? This action cannot be undone.
                    </div>
                }
                loading={loading}
            />
        </div>
    );
}
