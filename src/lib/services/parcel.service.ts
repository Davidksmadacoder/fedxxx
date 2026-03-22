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
} from '../dto/parcel.dto';
import { IParcel } from '../models/parcel.model';

export interface ParcelService {
    // parcels
    createParcel(data: CreateParcelDto): Promise<IParcel>;
    getAllParcels(): Promise<IParcel[]>;
    getParcelById(id: string): Promise<IParcel>;
    getParcelByTrackingId(trackingId: string): Promise<IParcel>;
    updateParcel(id: string, data: UpdateParcelDto): Promise<IParcel>;
    deleteParcel(id: string): Promise<void>;

    // timelines
    addTimeline(id: string, data: AddTimelineDto): Promise<IParcel>;
    updateTimeline(id: string, timelineId: string, data: UpdateTimelineDto): Promise<IParcel>;
    deleteTimeline(id: string, timelineId: string): Promise<IParcel>;

    // live routes
    addLocation(id: string, data: AddLocationDto): Promise<IParcel>;
    updateLocation(id: string, locationId: string, data: UpdateLocationDto): Promise<IParcel>;
    deleteLocation(id: string, locationId: string): Promise<IParcel>;
    toggleLocationVisibility(id: string, locationId: string): Promise<IParcel>;

    // images
    addImages(id: string, data: AddImagesDto): Promise<IParcel>;
    updateImage(id: string, imageId: string, data: UpdateImageDto): Promise<IParcel>;
    deleteImage(id: string, imageId: string): Promise<IParcel>;
    reorderImages(id: string, data: ReorderImagesDto): Promise<IParcel>;
}
