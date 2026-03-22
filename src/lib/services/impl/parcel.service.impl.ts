import mongoose from 'mongoose';
import { ParcelService } from '../parcel.service';
import { Parcel, IParcel, ILocationPoint, IImageAsset } from '../../models/parcel.model';
import {
    CreateParcelDto,
    UpdateParcelDto,
    AddTimelineDto,
    UpdateTimelineDto,
    AddLocationDto,
    UpdateLocationDto,
    AddImagesDto,
    UpdateImageDto,
    ReorderImagesDto,
} from '../../dto/parcel.dto';
import { CustomError } from '../../utils/customError.utils';
import { TransportMeans } from '../../models/transportMeans.model';
import { ShipmentStatus } from '../../enums/shipment.enum';
import { EmailServiceImpl } from './email.service.impl';

function normalizeParcel(p: IParcel): IParcel {
    if (p.imageUrls?.length) {
        p.imageUrls.sort((a, b) => a.order - b.order || a.uploadedAt.getTime() - b.uploadedAt.getTime());
    }
    if (p.timelines?.length) {
        p.timelines.sort((a, b) => a.timelineDate.getTime() - b.timelineDate.getTime());
    }
    if (p.liveRoutes?.length) {
        p.liveRoutes.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
    return p;
}

class ParcelServiceImpl implements ParcelService {
    private emailService = new EmailServiceImpl();

    private generateTrackingId(): string {
        return `TRK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    }

    /* -------------------------------- Parcels -------------------------------- */
    async createParcel(data: CreateParcelDto): Promise<IParcel> {
        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const transport = await TransportMeans.findById(data.transportMeans).session(session);
                if (!transport) throw new CustomError(404, 'Transport means not found');

                const trackingId = this.generateTrackingId();

                const images: IImageAsset[] = (data.imageUrls || []).map((url, idx) => ({
                    _id: new mongoose.Types.ObjectId(),
                    url,
                    order: idx,
                    uploadedAt: new Date(),
                    alt: undefined,
                    label: undefined,
                }));

                const parcel = new Parcel({
                    ...data,
                    imageUrls: images,
                    trackingId,
                    currentStatus: ShipmentStatus.PENDING,
                });

                await parcel.save({ session });

                await this.emailService.sendParcelCreatedEmail(data.sender.email, trackingId);
                await this.emailService.sendParcelCreatedEmail(data.receiver.email, trackingId);

                const populated = await parcel.populate('transportMeans');
                return normalizeParcel(populated as IParcel);
            });
        } finally {
            session.endSession();
        }
    }

    async getAllParcels(): Promise<IParcel[]> {
        const list = await Parcel.find().populate('transportMeans').sort({ createdAt: -1 });
        return list.map(normalizeParcel);
    }

    async getParcelById(id: string): Promise<IParcel> {
        const parcel = await Parcel.findById(id).populate('transportMeans');
        if (!parcel) throw new CustomError(404, 'Parcel not found');
        return normalizeParcel(parcel);
    }

    async getParcelByTrackingId(trackingId: string): Promise<IParcel> {
        const parcel = await Parcel.findOne({ trackingId }).populate('transportMeans');
        if (!parcel) throw new CustomError(404, 'Parcel not found');
        return normalizeParcel(parcel);
    }

    async updateParcel(id: string, data: UpdateParcelDto): Promise<IParcel> {
        const parcel = await Parcel.findById(id);
        if (!parcel) throw new CustomError(404, 'Parcel not found');

        if (data.currentStatus === ShipmentStatus.DELIVERED && !parcel.actualDeliveryDate) {
            parcel.actualDeliveryDate = new Date();
        }

        if (Array.isArray(data.imageUrls)) {
            parcel.imageUrls = data.imageUrls.map((url, idx) => ({
                _id: new mongoose.Types.ObjectId(),
                url,
                order: idx,
                uploadedAt: new Date(),
            })) as unknown as IImageAsset[];
            delete (data as any).imageUrls;
        }

        Object.assign(parcel, data);
        await parcel.save();
        const populated = await parcel.populate('transportMeans');
        return normalizeParcel(populated as IParcel);
    }

    async deleteParcel(id: string): Promise<void> {
        const parcel = await Parcel.findById(id);
        if (!parcel) throw new CustomError(404, 'Parcel not found');
        await Parcel.findByIdAndDelete(id);
    }

    /* ------------------------------- Timelines ------------------------------- */
    async addTimeline(id: string, data: AddTimelineDto): Promise<IParcel> {
        const parcel = await Parcel.findById(id);
        if (!parcel) throw new CustomError(404, 'Parcel not found');

        parcel.timelines.push({
            _id: new mongoose.Types.ObjectId(),
            status: data.status,
            message: data.message,
            timelineDate: new Date(data.timelineDate),
            location: data.location,
            sendEmail: !!data.sendEmail,
        });

        parcel.currentStatus = data.status;
        if (data.status === ShipmentStatus.DELIVERED && !parcel.actualDeliveryDate) {
            parcel.actualDeliveryDate = new Date(data.timelineDate);
        }

        await parcel.save();

        if (data.sendEmail) {
            await this.emailService.sendTimelineUpdateEmail(parcel.sender.email, parcel.trackingId, data.message);
            await this.emailService.sendTimelineUpdateEmail(parcel.receiver.email, parcel.trackingId, data.message);
        }

        const populated = await parcel.populate('transportMeans');
        return normalizeParcel(populated as IParcel);
    }

    async updateTimeline(id: string, timelineId: string, data: UpdateTimelineDto): Promise<IParcel> {
        const parcel = await Parcel.findById(id);
        if (!parcel) throw new CustomError(404, 'Parcel not found');

        const idx = parcel.timelines.findIndex((t: any) => String(t._id) === String(timelineId));
        if (idx === -1) throw new CustomError(404, 'Timeline not found');

        const tl = parcel.timelines[idx];
        const prevStatus = parcel.currentStatus;

        if (data.status) tl.status = data.status;
        if (data.message !== undefined) tl.message = data.message!;
        if (data.timelineDate) tl.timelineDate = new Date(data.timelineDate);
        if (data.location !== undefined) tl.location = data.location!;
        if (typeof data.sendEmail === 'boolean') tl.sendEmail = data.sendEmail;

        parcel.timelines.sort((a, b) => a.timelineDate.getTime() - b.timelineDate.getTime());
        const newest = parcel.timelines[parcel.timelines.length - 1];
        if (newest && String(newest._id) === String(tl._id)) {
            parcel.currentStatus = tl.status as ShipmentStatus;
            if (tl.status === ShipmentStatus.DELIVERED && !parcel.actualDeliveryDate) {
                parcel.actualDeliveryDate = tl.timelineDate;
            }
        }

        await parcel.save();

        if (data.sendEmail || (prevStatus !== parcel.currentStatus && parcel.currentStatus === ShipmentStatus.DELIVERED)) {
            await this.emailService.sendTimelineUpdateEmail(parcel.sender.email, parcel.trackingId, tl.message);
            await this.emailService.sendTimelineUpdateEmail(parcel.receiver.email, parcel.trackingId, tl.message);
        }

        const populated = await parcel.populate('transportMeans');
        return normalizeParcel(populated as IParcel);
    }

    async deleteTimeline(id: string, timelineId: string): Promise<IParcel> {
        const parcel = await Parcel.findById(id);
        if (!parcel) throw new CustomError(404, 'Parcel not found');

        const idx = parcel.timelines.findIndex((t: any) => String(t._id) === String(timelineId));
        if (idx === -1) throw new CustomError(404, 'Timeline not found');

        parcel.timelines.splice(idx, 1);
        await parcel.save();

        if (parcel.timelines.length) {
            parcel.timelines.sort((a, b) => a.timelineDate.getTime() - b.timelineDate.getTime());
            parcel.currentStatus = parcel.timelines[parcel.timelines.length - 1].status as ShipmentStatus;
        } else {
            parcel.currentStatus = ShipmentStatus.PENDING;
            parcel.actualDeliveryDate = undefined;
        }
        await parcel.save();

        const populated = await parcel.populate('transportMeans');
        return normalizeParcel(populated as IParcel);
    }

    /* ------------------------------ Live Routes ------------------------------ */
    async addLocation(id: string, data: AddLocationDto): Promise<IParcel> {
        const parcel = await Parcel.findById(id);
        if (!parcel) throw new CustomError(404, 'Parcel not found');

        const location: ILocationPoint = {
            _id: new mongoose.Types.ObjectId(),
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: new Date(data.timestamp),
            visible: data.visible ?? true,
            sendEmail: !!data.sendEmail,
        };

        parcel.liveRoutes.push(location);
        await parcel.save();

        if (data.sendEmail) {
            await this.emailService.sendLocationUpdateEmail(parcel.sender.email, parcel.trackingId, data.latitude, data.longitude);
            await this.emailService.sendLocationUpdateEmail(parcel.receiver.email, parcel.trackingId, data.latitude, data.longitude);
        }

        const populated = await parcel.populate('transportMeans');
        return normalizeParcel(populated as IParcel);
    }

    async updateLocation(id: string, locationId: string, data: UpdateLocationDto): Promise<IParcel> {
        const parcel = await Parcel.findById(id);
        if (!parcel) throw new CustomError(404, 'Parcel not found');

        const idx = parcel.liveRoutes.findIndex((r: any) => String(r._id) === String(locationId));
        if (idx === -1) throw new CustomError(404, 'Location not found');

        const loc = parcel.liveRoutes[idx];
        if (data.latitude !== undefined) loc.latitude = data.latitude;
        if (data.longitude !== undefined) loc.longitude = data.longitude;
        if (data.timestamp) loc.timestamp = new Date(data.timestamp);
        if (typeof data.visible === 'boolean') loc.visible = data.visible;

        await parcel.save();
        const populated = await parcel.populate('transportMeans');
        return normalizeParcel(populated as IParcel);
    }

    async deleteLocation(id: string, locationId: string): Promise<IParcel> {
        const parcel = await Parcel.findById(id);
        if (!parcel) throw new CustomError(404, 'Parcel not found');

        const idx = parcel.liveRoutes.findIndex((r: any) => String(r._id) === String(locationId));
        if (idx === -1) throw new CustomError(404, 'Location not found');

        parcel.liveRoutes.splice(idx, 1);
        await parcel.save();

        const populated = await parcel.populate('transportMeans');
        return normalizeParcel(populated as IParcel);
    }

    async toggleLocationVisibility(id: string, locationId: string): Promise<IParcel> {
        const parcel = await Parcel.findById(id);
        if (!parcel) throw new CustomError(404, 'Parcel not found');

        const idx = parcel.liveRoutes.findIndex((r: any) => String(r._id) === String(locationId));
        if (idx === -1) throw new CustomError(404, 'Location not found');

        parcel.liveRoutes[idx].visible = !parcel.liveRoutes[idx].visible;
        await parcel.save();

        const populated = await parcel.populate('transportMeans');
        return normalizeParcel(populated as IParcel);
    }

    /* -------------------------------- Images -------------------------------- */
    async addImages(id: string, data: AddImagesDto): Promise<IParcel> {
        const parcel = await Parcel.findById(id);
        if (!parcel) throw new CustomError(404, 'Parcel not found');

        const baseOrder = parcel.imageUrls.length ? Math.max(...parcel.imageUrls.map(i => i.order)) + 1 : 0;

        const toAdd: IImageAsset[] = data.images.map((img, i) => ({
            _id: new mongoose.Types.ObjectId(),
            url: img.url,
            alt: img.alt,
            label: img.label,
            order: baseOrder + i,
            uploadedAt: new Date(),
        }));

        parcel.imageUrls.push(...toAdd);
        await parcel.save();

        const populated = await parcel.populate('transportMeans');
        return normalizeParcel(populated as IParcel);
    }

    async updateImage(id: string, imageId: string, data: UpdateImageDto): Promise<IParcel> {
        const parcel = await Parcel.findById(id);
        if (!parcel) throw new CustomError(404, 'Parcel not found');

        const idx = parcel.imageUrls.findIndex((im: any) => String(im._id) === String(imageId));
        if (idx === -1) throw new CustomError(404, 'Image not found');

        const img = parcel.imageUrls[idx];
        if (data.url !== undefined) img.url = data.url!;
        if (data.alt !== undefined) img.alt = data.alt!;
        if (data.label !== undefined) img.label = data.label!;

        await parcel.save();

        const populated = await parcel.populate('transportMeans');
        return normalizeParcel(populated as IParcel);
    }

    async deleteImage(id: string, imageId: string): Promise<IParcel> {
        const parcel = await Parcel.findById(id);
        if (!parcel) throw new CustomError(404, 'Parcel not found');

        const idx = parcel.imageUrls.findIndex((im: any) => String(im._id) === String(imageId));
        if (idx === -1) throw new CustomError(404, 'Image not found');

        parcel.imageUrls.splice(idx, 1);
        // normalize order
        parcel.imageUrls.forEach((im, i) => (im.order = i));
        await parcel.save();

        const populated = await parcel.populate('transportMeans');
        return normalizeParcel(populated as IParcel);
    }

    async reorderImages(id: string, data: ReorderImagesDto): Promise<IParcel> {
        const parcel = await Parcel.findById(id);
        if (!parcel) throw new CustomError(404, 'Parcel not found');

        const map = new Map<string, number>(data.order.map(o => [String(o._id), o.order]));
        parcel.imageUrls.forEach(im => {
            const newOrder = map.get(String(im._id));
            if (typeof newOrder === 'number') im.order = newOrder;
        });

        await parcel.save();
        const populated = await parcel.populate('transportMeans');
        return normalizeParcel(populated as IParcel);
    }
}

export default ParcelServiceImpl;
