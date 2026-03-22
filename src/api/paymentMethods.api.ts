import { api } from "./axios";
import { IPaymentMethod } from "@/lib/models/paymentMethod.model";

export interface PaymentMethodQuery {
    page?: number;
    limit?: number;
    type?: string;
    status?: boolean;
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
    res?.data?.paymentMethod ?? res?.data?.data ?? res?.data;

const pickList = <T,>(res: any): Paginated<T> => {
    if (res?.data?.paymentMethods && Array.isArray(res.data.paymentMethods)) {
        return {
            items: res.data.paymentMethods,
            total: res.data.total ?? res.data.paymentMethods.length,
            page: res.data.page ?? 1,
            limit: res.data.limit ?? res.data.paymentMethods.length,
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

export const PaymentMethodsApi = {
    async list(query?: PaymentMethodQuery): Promise<Paginated<IPaymentMethod>> {
        const params = qsOf((query || {}) as Record<string, unknown>);
        const res = await api.get(`/paymentMethod${params}`);
        return pickList<IPaymentMethod>(res);
    },

    async getById(id: string): Promise<IPaymentMethod> {
        const res = await api.get(`/paymentMethod/${id}`);
        return pickItem<IPaymentMethod>(res);
    },

    async getActive(): Promise<IPaymentMethod[]> {
        const res = await api.get("/paymentMethod/active");
        return res.data.paymentMethods || [];
    },

    async create(data: any): Promise<IPaymentMethod> {
        const res = await api.post("/paymentMethod", data);
        return pickItem<IPaymentMethod>(res);
    },

    async update(id: string, data: Partial<IPaymentMethod>): Promise<IPaymentMethod> {
        const res = await api.put(`/paymentMethod/${id}`, data);
        return pickItem<IPaymentMethod>(res);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/paymentMethod/${id}`);
    },
};



