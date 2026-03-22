import { api } from "./axios";
import { IParcel } from "@/lib/models/parcel.model";

export interface ParcelQuery {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
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
    res?.data?.parcel ?? res?.data?.data ?? res?.data;

const pickList = <T,>(res: any): Paginated<T> => {
    if (res?.data?.parcels && Array.isArray(res.data.parcels)) {
        return {
            items: res.data.parcels,
            total: res.data.total ?? res.data.parcels.length,
            page: res.data.page ?? 1,
            limit: res.data.limit ?? res.data.parcels.length,
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

export const ParcelsApi = {
    async list(query?: ParcelQuery): Promise<Paginated<IParcel>> {
        const params = qsOf((query || {}) as Record<string, unknown>);
        const res = await api.get(`/parcel${params}`);
        return pickList<IParcel>(res);
    },

    async getById(id: string): Promise<IParcel> {
        const res = await api.get(`/parcel/${id}`);
        return pickItem<IParcel>(res);
    },

    async getByTrackingId(trackingId: string): Promise<IParcel> {
        const res = await api.get(`/tracking/${encodeURIComponent(trackingId)}`);
        return res.data.parcel;
    },

    async create(data: any): Promise<IParcel> {
        const res = await api.post("/parcel", data);
        return pickItem<IParcel>(res);
    },

    async update(id: string, data: Partial<IParcel>): Promise<IParcel> {
        const res = await api.put(`/parcel/${id}`, data);
        return pickItem<IParcel>(res);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/parcel/${id}`);
    },

    async addTimeline(id: string, data: any): Promise<IParcel> {
        const res = await api.post(`/parcel/${id}/timeline`, data);
        return pickItem<IParcel>(res);
    },

    async updateTimeline(id: string, timelineId: string, data: any): Promise<IParcel> {
        const res = await api.patch(`/parcel/${id}/timeline/${timelineId}`, data);
        return pickItem<IParcel>(res);
    },

    async deleteTimeline(id: string, timelineId: string): Promise<IParcel> {
        const res = await api.delete(`/parcel/${id}/timeline/${timelineId}`);
        return pickItem<IParcel>(res);
    },

    async addLocation(id: string, data: any): Promise<IParcel> {
        const res = await api.post(`/parcel/${id}/locations`, data);
        return pickItem<IParcel>(res);
    },

    async updateLocation(id: string, locationId: string, data: any): Promise<IParcel> {
        const res = await api.patch(`/parcel/${id}/locations/${locationId}`, data);
        return pickItem<IParcel>(res);
    },

    async deleteLocation(id: string, locationId: string): Promise<IParcel> {
        const res = await api.delete(`/parcel/${id}/locations/${locationId}`);
        return pickItem<IParcel>(res);
    },

    async toggleLocationVisibility(id: string, locationId: string): Promise<IParcel> {
        const res = await api.patch(`/parcel/${id}/locations/${locationId}/visibility`);
        return pickItem<IParcel>(res);
    },

    async addImages(id: string, data: any): Promise<IParcel> {
        const res = await api.post(`/parcel/${id}/images`, data);
        return pickItem<IParcel>(res);
    },

    async updateImage(id: string, imageId: string, data: any): Promise<IParcel> {
        const res = await api.patch(`/parcel/${id}/images/${imageId}`, data);
        return pickItem<IParcel>(res);
    },

    async deleteImage(id: string, imageId: string): Promise<IParcel> {
        const res = await api.delete(`/parcel/${id}/images/${imageId}`);
        return pickItem<IParcel>(res);
    },

    async reorderImages(id: string, data: any): Promise<IParcel> {
        const res = await api.patch(`/parcel/${id}/images/reorder`, data);
        return pickItem<IParcel>(res);
    },
};

