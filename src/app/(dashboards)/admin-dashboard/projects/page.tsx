"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaSync, FaEllipsisV, FaImage } from "react-icons/fa";
import { z } from "zod";

import { ProjectsApi } from "@/api/projects.api";
import { IProject } from "@/lib/models/project.model";
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
import { Card } from "@/components/ui/card/Card";
import { Collapse } from "@/components/ui/collapse/Collapse";
import { Menu } from "@/components/ui/menu/Menu";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { Switch } from "@/components/ui/switch/Switch";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const ProjectSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().min(1, "Description is required"),
    fullDescription: z.string().optional(),
    image: z.string().url().min(1, "Image URL is required"),
    images: z.array(z.string().url()).optional(),
    category: z.string().min(1, "Category is required"),
    client: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    results: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),
    order: z.coerce.number().default(0),
});

type ProjectFormData = z.infer<typeof ProjectSchema>;

const pageSize = 10;

export default function ProjectsPage() {
    const [projects, setProjects] = useState<IProject[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [detailsProject, setDetailsProject] = useState<IProject | null>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<ProjectFormData>({
        resolver: zodResolver(ProjectSchema),
        defaultValues: {
            title: "",
            slug: "",
            description: "",
            fullDescription: "",
            image: "",
            images: [],
            category: "",
            client: "",
            location: "",
            startDate: "",
            endDate: "",
            technologies: [],
            results: [],
            isActive: true,
            order: 0,
        },
    });

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const result = await ProjectsApi.list();
            setProjects(result.items);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load projects.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const categories = useMemo(() => {
        const cats = new Set(projects.map((p) => p.category).filter(Boolean));
        return Array.from(cats);
    }, [projects]);

    const filteredProjects = useMemo(() => {
        let filtered = projects;

        if (search.trim()) {
            const q = search.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.client?.toLowerCase().includes(q)
            );
        }

        if (categoryFilter !== "all") {
            filtered = filtered.filter((p) => p.category === categoryFilter);
        }

        if (statusFilter === "active") {
            filtered = filtered.filter((p) => p.isActive);
        } else if (statusFilter === "inactive") {
            filtered = filtered.filter((p) => !p.isActive);
        }

        return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [projects, search, categoryFilter, statusFilter]);

    const paginatedProjects = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredProjects.slice(start, start + pageSize);
    }, [filteredProjects, currentPage]);

    const totalPages = Math.ceil(filteredProjects.length / pageSize);

    const openModal = (project?: IProject) => {
        if (project) {
            setSelectedProject(project);
            setValue("title", project.title);
            setValue("slug", project.slug);
            setValue("description", project.description);
            setValue("fullDescription", project.fullDescription || "");
            setValue("image", project.image);
            setValue("images", project.images || []);
            setValue("category", project.category);
            setValue("client", project.client || "");
            setValue("location", project.location || "");
            setValue("startDate", project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "");
            setValue("endDate", project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "");
            setValue("technologies", project.technologies || []);
            setValue("results", project.results || []);
            setValue("isActive", project.isActive);
            setValue("order", project.order || 0);
        } else {
            setSelectedProject(null);
            reset();
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedProject(null);
        reset();
    };

    const onSubmit = async (data: ProjectFormData) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            };

            if (selectedProject) {
                const updated = await ProjectsApi.update(selectedProject._id.toString(), payload);
                setProjects((prev) =>
                    prev.map((p) => (p._id.toString() === selectedProject._id.toString() ? updated : p))
                );
                toast.success("Project updated successfully");
            } else {
                const created = await ProjectsApi.create(payload);
                setProjects((prev) => [created, ...prev]);
                toast.success("Project created successfully");
            }
            closeModal();
        } catch (error) {
            handleApiError(error, "Failed to save project.");
        } finally {
            setLoading(false);
        }
    };

    const openDeleteConfirmation = (id: string) => {
        setProjectToDelete(id);
        setConfirmModalOpen(true);
    };

    const handleDelete = async () => {
        if (!projectToDelete) return;
        setLoading(true);
        try {
            await ProjectsApi.delete(projectToDelete);
            setProjects((prev) => prev.filter((p) => p._id.toString() !== projectToDelete));
            toast.success("Project deleted successfully");
            setConfirmModalOpen(false);
            setProjectToDelete(null);
        } catch (error) {
            handleApiError(error, "Failed to delete project.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page-container custom-black-white-theme-switch-bg">
            <CustomLoader loading={loading} />

            {/* Header */}
            <AdminPageHeader
                title="Projects"
                description="Manage portfolio projects and case studies. Showcase your work and track project details."
                primaryAction={{
                    label: "Add Project",
                    onClick: () => openModal(),
                    icon: <FaPlus />,
                }}
                breadcrumbs={[
                    { label: "Admin Dashboard", href: "/admin-dashboard" },
                    { label: "Projects" },
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
                        onClick={fetchProjects}
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
            {loading && projects.length === 0 ? (
                <div className="space-y-2">
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                </div>
            ) : filteredProjects.length === 0 ? (
                <EmptyState
                    icon={<FaImage size={48} />}
                    title="No projects found"
                    description={
                        search || categoryFilter !== "all" || statusFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Add your first project to showcase your portfolio."
                    }
                    action={
                        !search && categoryFilter === "all" && statusFilter === "all"
                            ? {
                                  label: "Add Project",
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
                                    <TableHeader>Image</TableHeader>
                                    <TableHeader>Title</TableHeader>
                                    <TableHeader>Category</TableHeader>
                                    <TableHeader>Client</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Actions</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedProjects.map((project) => (
                                    <TableRow key={project._id.toString()}>
                                        <TableCell>
                                            {project.image ? (
                                                <img
                                                    src={project.image}
                                                    alt={project.title}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <FaImage className="text-gray-400" size={20} />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <span className="font-medium custom-black-white-theme-switch-text block">
                                                    {project.title}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    /{project.slug}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="light" size="sm">
                                                {project.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="custom-black-white-theme-switch-text">
                                            {project.client || "—"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                color={project.isActive ? "green" : "gray"}
                                                variant="light"
                                                size="sm"
                                            >
                                                {project.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Menu
                                                items={[
                                                    {
                                                        label: "View Details",
                                                        icon: <FaEye size={14} />,
                                                        onClick: () => {
                                                            setDetailsProject(project);
                                                            setDetailsModalOpen(true);
                                                        },
                                                    },
                                                    {
                                                        label: "Edit",
                                                        icon: <FaEdit size={14} />,
                                                        onClick: () => openModal(project),
                                                    },
                                                    {
                                                        label: "Delete",
                                                        icon: <FaTrash size={14} />,
                                                        onClick: () => openDeleteConfirmation(project._id.toString()),
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
                title={selectedProject ? "Update Project" : "Create Project"}
                description={selectedProject ? "Update project details and information." : "Create a new portfolio project."}
                size="xl"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Title"
                                    placeholder="Project title"
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
                                    placeholder="project-slug"
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
                                placeholder="Detailed project description"
                                error={errors.fullDescription?.message}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                minRows={4}
                            />
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="image"
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                                        Main Image URL <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <TextInput
                                            placeholder="https://example.com/image.jpg"
                                            error={errors.image?.message}
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            className="flex-1"
                                            required
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            id="project-image-upload"
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
                                            onClick={() => document.getElementById("project-image-upload")?.click()}
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
                                            className="mt-2 w-full h-48 object-cover rounded-md border border-[var(--bg-general-light)]"
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
                                    placeholder="e.g., Logistics, E-commerce"
                                    error={errors.category?.message}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    required
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="client"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Client"
                                    placeholder="Client name (optional)"
                                    error={errors.client?.message}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />

                        <Controller
                            name="location"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Location"
                                    placeholder="Project location (optional)"
                                    error={errors.location?.message}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="startDate"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="Start Date"
                                    type="date"
                                    error={errors.startDate?.message}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />

                        <Controller
                            name="endDate"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    label="End Date"
                                    type="date"
                                    error={errors.endDate?.message}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            {selectedProject ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Details Modal */}
            <Modal
                opened={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false);
                    setDetailsProject(null);
                }}
                title={`Project Details — ${detailsProject?.title ?? ""}`}
                size="lg"
            >
                {detailsProject && (
                    <div className="space-y-4">
                        {detailsProject.image && (
                            <img
                                src={detailsProject.image}
                                alt={detailsProject.title}
                                className="w-full h-64 rounded-lg object-cover"
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
                                <Badge variant="light">{detailsProject.category}</Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                                <Badge
                                    color={detailsProject.isActive ? "green" : "gray"}
                                    variant="light"
                                >
                                    {detailsProject.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>

                        <div className="border-t border-[var(--bg-general-light)] pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                            <p className="custom-black-white-theme-switch-text">{detailsProject.description}</p>
                        </div>

                        {detailsProject.fullDescription && (
                            <div className="border-t border-[var(--bg-general-light)] pt-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Full Description</p>
                                <p className="custom-black-white-theme-switch-text whitespace-pre-wrap">
                                    {detailsProject.fullDescription}
                                </p>
                            </div>
                        )}

                        {(detailsProject.client || detailsProject.location) && (
                            <div className="grid grid-cols-2 gap-4 border-t border-[var(--bg-general-light)] pt-4">
                                {detailsProject.client && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Client</p>
                                        <p className="custom-black-white-theme-switch-text">{detailsProject.client}</p>
                                    </div>
                                )}
                                {detailsProject.location && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Location</p>
                                        <p className="custom-black-white-theme-switch-text">{detailsProject.location}</p>
                                    </div>
                                )}
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
                    setProjectToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Delete project?"
                message={
                    <div className="text-sm custom-black-white-theme-switch-text">
                        Are you sure you want to delete this project? This action cannot be undone.
                    </div>
                }
                loading={loading}
            />
        </div>
    );
}
