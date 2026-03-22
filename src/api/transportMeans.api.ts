import { api } from "./axios";
import { ITransportMeans } from "@/lib/models/transportMeans.model";

export interface TransportMeansQuery {
    page?: number;
    limit?: number;
    active?: boolean;
    type?: string;
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
    res?.data?.transportMeans ?? res?.data?.data ?? res?.data;

const pickList = <T,>(res: any): Paginated<T> => {
    if (res?.data?.transportMeans && Array.isArray(res.data.transportMeans)) {
        return {
            items: res.data.transportMeans,
            total: res.data.total ?? res.data.transportMeans.length,
            page: res.data.page ?? 1,
            limit: res.data.limit ?? res.data.transportMeans.length,
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

export const TransportMeansApi = {
    async list(query?: TransportMeansQuery): Promise<Paginated<ITransportMeans>> {
        const params = qsOf((query || {}) as Record<string, unknown>);
        const res = await api.get(`/transportMeans${params}`);
        return pickList<ITransportMeans>(res);
    },

    async getById(id: string): Promise<ITransportMeans> {
        const res = await api.get(`/transportMeans/${id}`);
        return pickItem<ITransportMeans>(res);
    },

    async create(data: any): Promise<ITransportMeans> {
        const res = await api.post("/transportMeans", data);
        return pickItem<ITransportMeans>(res);
    },

    async update(id: string, data: Partial<ITransportMeans>): Promise<ITransportMeans> {
        const res = await api.put(`/transportMeans/${id}`, data);
        return pickItem<ITransportMeans>(res);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/transportMeans/${id}`);
    },
};



