import { api } from "./axios";
import { IPricing } from "@/lib/models/pricing.model";

export interface PricingQuery {
    page?: number;
    limit?: number;
    type?: string;
    isActive?: boolean;
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
    res?.data?.pricing ?? res?.data?.data ?? res?.data;

const pickList = <T,>(res: any): Paginated<T> => {
    if (res?.data?.pricings && Array.isArray(res.data.pricings)) {
        return {
            items: res.data.pricings,
            total: res.data.total ?? res.data.pricings.length,
            page: res.data.page ?? 1,
            limit: res.data.limit ?? res.data.pricings.length,
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

export const PricingApi = {
    async list(query?: PricingQuery): Promise<Paginated<IPricing>> {
        const params = qsOf((query || {}) as Record<string, unknown>);
        const res = await api.get(`/pricing${params}`);
        return pickList<IPricing>(res);
    },

    async getById(id: string): Promise<IPricing> {
        const res = await api.get(`/pricing/${id}`);
        return pickItem<IPricing>(res);
    },

    async create(data: any): Promise<IPricing> {
        const res = await api.post("/pricing", data);
        return pickItem<IPricing>(res);
    },

    async update(id: string, data: Partial<IPricing>): Promise<IPricing> {
        const res = await api.put(`/pricing/${id}`, data);
        return pickItem<IPricing>(res);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/pricing/${id}`);
    },
};



