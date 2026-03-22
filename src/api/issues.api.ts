import { api } from "./axios";
import { IIssue } from "@/lib/models/issue.model";

export interface IssueQuery {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    priority?: string;
    parcelId?: string;
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
    res?.data?.issue ?? res?.data?.data ?? res?.data;

const pickList = <T,>(res: any): Paginated<T> => {
    if (res?.data?.issues && Array.isArray(res.data.issues)) {
        return {
            items: res.data.issues,
            total: res.data.total ?? res.data.issues.length,
            page: res.data.page ?? 1,
            limit: res.data.limit ?? res.data.issues.length,
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

export const IssuesApi = {
    async list(query?: IssueQuery): Promise<Paginated<IIssue>> {
        const params = qsOf((query || {}) as Record<string, unknown>);
        const res = await api.get(`/issue${params}`);
        return pickList<IIssue>(res);
    },

    async getById(id: string): Promise<IIssue> {
        const res = await api.get(`/issue/${id}`);
        return pickItem<IIssue>(res);
    },

    async getByParcel(parcelId: string): Promise<IIssue[]> {
        const res = await api.get(`/issue/parcel/${parcelId}`);
        return res.data.issues || [];
    },

    async create(data: any): Promise<IIssue> {
        const res = await api.post("/issue", data);
        return pickItem<IIssue>(res);
    },

    async update(id: string, data: Partial<IIssue>): Promise<IIssue> {
        const res = await api.put(`/issue/${id}`, data);
        return pickItem<IIssue>(res);
    },

    async resolve(
        id: string, 
        resolution: string,
        paymentData?: {
            resolutionAmount?: number;
            paymentMethodId?: string;
            proofOfPayment?: string;
            paymentFee?: number;
            totalAmount?: number;
            paymentStatus?: 'PENDING' | 'PAID' | 'VERIFIED' | 'FAILED';
            resolvedBy?: string;
        }
    ): Promise<IIssue> {
        const res = await api.patch(`/issue/${id}/resolve`, { resolution, ...paymentData });
        return pickItem<IIssue>(res);
    },

    async toggleVisibility(id: string): Promise<IIssue> {
        const res = await api.patch(`/issue/${id}/visibility`);
        return pickItem<IIssue>(res);
    },

    async submitPayment(id: string, paymentMethodId: string, proofOfPayment: string): Promise<IIssue> {
        const res = await api.patch(`/issue/${id}/payment/submit`, {
            paymentMethodId,
            proofOfPayment,
        });
        return pickItem<IIssue>(res);
    },

    async updatePaymentStatus(
        id: string,
        paymentStatus: 'PENDING' | 'PAID' | 'VERIFIED' | 'FAILED',
        showToCustomer?: boolean
    ): Promise<IIssue> {
        const res = await api.patch(`/issue/${id}/admin/payment`, {
            paymentStatus,
            showToCustomer,
        });
        return pickItem<IIssue>(res);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/issue/${id}`);
    },
};



