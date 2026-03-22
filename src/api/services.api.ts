import { api } from "./axios";
import { IService } from "@/lib/models/service.model";

export interface ServiceQuery {
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
    res?.data?.service ?? res?.data?.data ?? res?.data;

const pickList = <T,>(res: any): Paginated<T> => {
    if (res?.data?.services && Array.isArray(res.data.services)) {
        return {
            items: res.data.services,
            total: res.data.total ?? res.data.services.length,
            page: res.data.page ?? 1,
            limit: res.data.limit ?? res.data.services.length,
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

export const ServicesApi = {
    async list(query?: ServiceQuery): Promise<Paginated<IService>> {
        const params = qsOf((query || {}) as Record<string, unknown>);
        const res = await api.get(`/service${params}`);
        return pickList<IService>(res);
    },

    async getById(id: string): Promise<IService> {
        const res = await api.get(`/service/${id}`);
        return pickItem<IService>(res);
    },

    async getBySlug(slug: string): Promise<IService> {
        const res = await api.get(`/service/slug/${slug}`);
        return res.data.service;
    },

    async create(data: any): Promise<IService> {
        const res = await api.post("/service", data);
        return pickItem<IService>(res);
    },

    async update(id: string, data: Partial<IService>): Promise<IService> {
        const res = await api.put(`/service/${id}`, data);
        return pickItem<IService>(res);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/service/${id}`);
    },
};



