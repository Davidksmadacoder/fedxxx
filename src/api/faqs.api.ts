import { api } from "./axios";
import { IFAQ } from "@/lib/models/faq.model";

export interface FAQQuery {
    page?: number;
    limit?: number;
    category?: string;
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
    res?.data?.faq ?? res?.data?.data ?? res?.data;

const pickList = <T,>(res: any): Paginated<T> => {
    if (res?.data?.faqs && Array.isArray(res.data.faqs)) {
        return {
            items: res.data.faqs,
            total: res.data.total ?? res.data.faqs.length,
            page: res.data.page ?? 1,
            limit: res.data.limit ?? res.data.faqs.length,
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

export const FAQsApi = {
    async list(query?: FAQQuery): Promise<Paginated<IFAQ>> {
        const params = qsOf((query || {}) as Record<string, unknown>);
        const res = await api.get(`/faq${params}`);
        return pickList<IFAQ>(res);
    },

    async getById(id: string): Promise<IFAQ> {
        const res = await api.get(`/faq/${id}`);
        return pickItem<IFAQ>(res);
    },

    async create(data: any): Promise<IFAQ> {
        const res = await api.post("/faq", data);
        return pickItem<IFAQ>(res);
    },

    async update(id: string, data: Partial<IFAQ>): Promise<IFAQ> {
        const res = await api.put(`/faq/${id}`, data);
        return pickItem<IFAQ>(res);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/faq/${id}`);
    },
};



