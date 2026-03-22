import { api } from "./axios";
import { ITestimonial } from "@/lib/models/testimonial.model";

export interface TestimonialQuery {
    page?: number;
    limit?: number;
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
    res?.data?.testimonial ?? res?.data?.data ?? res?.data;

const pickList = <T,>(res: any): Paginated<T> => {
    if (res?.data?.testimonials && Array.isArray(res.data.testimonials)) {
        return {
            items: res.data.testimonials,
            total: res.data.total ?? res.data.testimonials.length,
            page: res.data.page ?? 1,
            limit: res.data.limit ?? res.data.testimonials.length,
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

export const TestimonialsApi = {
    async list(query?: TestimonialQuery): Promise<Paginated<ITestimonial>> {
        const params = qsOf((query || {}) as Record<string, unknown>);
        const res = await api.get(`/testimonial${params}`);
        return pickList<ITestimonial>(res);
    },

    async getById(id: string): Promise<ITestimonial> {
        const res = await api.get(`/testimonial/${id}`);
        return pickItem<ITestimonial>(res);
    },

    async create(data: any): Promise<ITestimonial> {
        const res = await api.post("/testimonial", data);
        return pickItem<ITestimonial>(res);
    },

    async update(id: string, data: Partial<ITestimonial>): Promise<ITestimonial> {
        const res = await api.put(`/testimonial/${id}`, data);
        return pickItem<ITestimonial>(res);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/testimonial/${id}`);
    },
};



