import { api } from "./axios";
import { IProject } from "@/lib/models/project.model";

export interface ProjectQuery {
    page?: number;
    limit?: number;
    category?: string;
    isActive?: boolean;
    slug?: string;
}

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

function qsOf(query: Record<string, unknown>) {
    const p = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        p.set(k, String(v));
    });
    const s = p.toString();
    return s ? `?${s}` : "";
}

const pickItem = <T,>(res: any): T =>
    res?.data?.project ?? res?.data?.data ?? res?.data;

const pickList = <T,>(res: any): Paginated<T> => {
    if (res?.data?.projects && Array.isArray(res.data.projects)) {
        return {
            items: res.data.projects,
            total: res.data.total ?? res.data.projects.length,
            page: res.data.page ?? 1,
            limit: res.data.limit ?? res.data.projects.length,
        };
    }
    if (res?.data?.items && Array.isArray(res.data.items)) {
        return {
            items: res.data.items,
            total: res.data.total ?? res.data.items.length,
            page: res.data.page ?? 1,
            limit: res.data.limit ?? res.data.items.length,
        };
    }
    if (Array.isArray(res?.data)) {
        return {
            items: res.data,
            total: res.data.length,
            page: 1,
            limit: res.data.length,
        };
    }
    return {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
    };
};

export const ProjectsApi = {
    async list(query?: ProjectQuery): Promise<Paginated<IProject>> {
        const params = qsOf((query || {}) as Record<string, unknown>);
        const res = await api.get(`/project${params}`);
        return pickList<IProject>(res);
    },

    async getById(id: string): Promise<IProject> {
        const res = await api.get(`/project/${id}`);
        return pickItem<IProject>(res);
    },

    async getBySlug(slug: string): Promise<IProject> {
        const res = await api.get(`/project/slug/${slug}`);
        return res.data.project;
    },

    async create(data: any): Promise<IProject> {
        const res = await api.post("/project", data);
        return pickItem<IProject>(res);
    },

    async update(id: string, data: Partial<IProject>): Promise<IProject> {
        const res = await api.put(`/project/${id}`, data);
        return pickItem<IProject>(res);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/project/${id}`);
    },
};



