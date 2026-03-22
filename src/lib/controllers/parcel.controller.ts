import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { ParcelService } from "@/lib/services/parcel.service";
import ParcelServiceImpl from "@/lib/services/impl/parcel.service.impl";
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
} from "@/lib/dto/parcel.dto";
import { validator } from "@/lib/utils/validator.utils";
import { Http } from "@/lib/utils/route.utils";

const parcelService: ParcelService = new ParcelServiceImpl();

/* ------------------------------- Parcels CRUD ------------------------------ */
export async function createParcelController(req: AuthRequest) {
    const dto = new CreateParcelDto(await req.json());
    const errors = validator(CreateParcelDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const parcel = await parcelService.createParcel(dto);
    return Http.created("Parcel created", { parcel });
}

export async function getAllParcelsController(_req?: AuthRequest) {
    const parcels = await parcelService.getAllParcels();
    return Http.ok("Parcels retrieved", { parcels });
}

export async function getParcelByIdController(
    _req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const parcel = await parcelService.getParcelById(params.id);
    return Http.ok("Parcel retrieved", { parcel });
}

export async function getParcelByTrackingIdController(
    _req: Request,
    { params }: { params: { trackingId: string } }
) {
    const parcel = await parcelService.getParcelByTrackingId(params.trackingId);
    return Http.ok("Parcel retrieved", { parcel });
}

export async function updateParcelController(
    req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const dto = new UpdateParcelDto(await req.json());
    const errors = validator(UpdateParcelDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const parcel = await parcelService.updateParcel(params.id, dto);
    return Http.ok("Parcel updated", { parcel });
}

export async function deleteParcelController(
    _req: AuthRequest,
    { params }: { params: { id: string } }
) {
    await parcelService.deleteParcel(params.id);
    return Http.ok("Parcel deleted");
}

/* -------------------------------- Timelines ------------------------------- */
export async function addTimelineController(
    req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const dto = new AddTimelineDto(await req.json());
    const errors = validator(AddTimelineDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const parcel = await parcelService.addTimeline(params.id, dto);
    return Http.ok("Timeline added", { parcel });
}

export async function updateTimelineController(
    req: AuthRequest,
    { params }: { params: { id: string; timelineId: string } }
) {
    const dto = new UpdateTimelineDto(await req.json());
    const errors = validator(UpdateTimelineDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const parcel = await parcelService.updateTimeline(params.id, params.timelineId, dto);
    return Http.ok("Timeline updated", { parcel });
}

export async function deleteTimelineController(
    _req: AuthRequest,
    { params }: { params: { id: string; timelineId: string } }
) {
    const parcel = await parcelService.deleteTimeline(params.id, params.timelineId);
    return Http.ok("Timeline deleted", { parcel });
}

/* ------------------------------- Live Routes ------------------------------ */
export async function addLocationController(
    req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const dto = new AddLocationDto(await req.json());
    const errors = validator(AddLocationDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const parcel = await parcelService.addLocation(params.id, dto);
    return Http.ok("Location added", { parcel });
}

export async function updateLocationController(
    req: AuthRequest,
    { params }: { params: { id: string; locationId: string } }
) {
    const dto = new UpdateLocationDto(await req.json());
    const errors = validator(UpdateLocationDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const parcel = await parcelService.updateLocation(params.id, params.locationId, dto);
    return Http.ok("Location updated", { parcel });
}

export async function deleteLocationController(
    _req: AuthRequest,
    { params }: { params: { id: string; locationId: string } }
) {
    const parcel = await parcelService.deleteLocation(params.id, params.locationId);
    return Http.ok("Location deleted", { parcel });
}

export async function toggleLocationVisibilityController(
    _req: AuthRequest,
    { params }: { params: { id: string; locationId: string } }
) {
    const parcel = await parcelService.toggleLocationVisibility(params.id, params.locationId);
    return Http.ok("Visibility toggled", { parcel });
}

/* --------------------------------- Images --------------------------------- */
export async function addImagesController(
    req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const dto = new AddImagesDto(await req.json());
    const errors = validator(AddImagesDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const parcel = await parcelService.addImages(params.id, dto);
    return Http.ok("Images added", { parcel });
}

export async function updateImageController(
    req: AuthRequest,
    { params }: { params: { id: string; imageId: string } }
) {
    const dto = new UpdateImageDto(await req.json());
    const errors = validator(UpdateImageDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const parcel = await parcelService.updateImage(params.id, params.imageId, dto);
    return Http.ok("Image updated", { parcel });
}

export async function deleteImageController(
    _req: AuthRequest,
    { params }: { params: { id: string; imageId: string } }
) {
    const parcel = await parcelService.deleteImage(params.id, params.imageId);
    return Http.ok("Image deleted", { parcel });
}

export async function reorderImagesController(
    req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const dto = new ReorderImagesDto(await req.json());
    const errors = validator(ReorderImagesDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const parcel = await parcelService.reorderImages(params.id, dto);
    return Http.ok("Images reordered", { parcel });
}
