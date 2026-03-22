import { api } from "./axios";
import { IContact } from "@/lib/models/contact.model";

export interface ContactQuery {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    priority?: string;
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
    res?.data?.contact ?? res?.data?.data ?? res?.data;

const pickList = <T,>(res: any): Paginated<T> => {
    if (res?.data?.contacts && Array.isArray(res.data.contacts)) {
        return {
            items: res.data.contacts,
            total: res.data.total ?? res.data.contacts.length,
            page: res.data.page ?? 1,
            limit: res.data.limit ?? res.data.contacts.length,
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

export const ContactsApi = {
    async list(query?: ContactQuery): Promise<Paginated<IContact>> {
        const params = qsOf((query || {}) as Record<string, unknown>);
        const res = await api.get(`/contact${params}`);
        return pickList<IContact>(res);
    },

    async getById(id: string): Promise<IContact> {
        const res = await api.get(`/contact/${id}`);
        return pickItem<IContact>(res);
    },

    async create(data: any): Promise<IContact> {
        const res = await api.post("/contact", data);
        return pickItem<IContact>(res);
    },

    async update(id: string, data: Partial<IContact>): Promise<IContact> {
        const res = await api.put(`/contact/${id}`, data);
        return pickItem<IContact>(res);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/contact/${id}`);
    },
};



