import { api } from "./axios";
import { IPayment } from "@/lib/models/payment.model";

export interface PaymentQuery {
    page?: number;
    limit?: number;
    status?: string;
    parcelId?: string;
    isPaid?: boolean;
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
    res?.data?.payment ?? res?.data?.data ?? res?.data;

const pickList = <T,>(res: any): Paginated<T> => {
    if (res?.data?.payments && Array.isArray(res.data.payments)) {
        return {
            items: res.data.payments,
            total: res.data.total ?? res.data.payments.length,
            page: res.data.page ?? 1,
            limit: res.data.limit ?? res.data.payments.length,
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

export const PaymentsApi = {
    async list(query?: PaymentQuery): Promise<Paginated<IPayment>> {
        const params = qsOf((query || {}) as Record<string, unknown>);
        const res = await api.get(`/payment${params}`);
        return pickList<IPayment>(res);
    },

    async getById(id: string): Promise<IPayment> {
        const res = await api.get(`/payment/${id}`);
        return pickItem<IPayment>(res);
    },

    async getByParcel(parcelId: string): Promise<IPayment[]> {
        const res = await api.get(`/payment/parcel/${parcelId}`);
        return res.data.payments || [];
    },

    async create(data: any): Promise<IPayment> {
        const res = await api.post("/payment", data);
        return pickItem<IPayment>(res);
    },

    async update(id: string, data: Partial<IPayment>): Promise<IPayment> {
        const res = await api.put(`/payment/${id}`, data);
        return pickItem<IPayment>(res);
    },

    async markAsPaid(id: string): Promise<IPayment> {
        const res = await api.patch(`/payment/${id}/paid`);
        return pickItem<IPayment>(res);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/payment/${id}`);
    },
};



