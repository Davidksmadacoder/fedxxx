import { NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { ServiceService } from "@/lib/services/service.service";
import ServiceServiceImpl from "@/lib/services/impl/service.service.impl";
import { CreateServiceDto, UpdateServiceDto } from "@/lib/dto/service.dto";
import { validator } from "@/lib/utils/validator.utils";
import { Http } from "@/lib/utils/route.utils";

const serviceService: ServiceService = new ServiceServiceImpl();

export async function createServiceController(req: AuthRequest) {
    const dto = new CreateServiceDto(await req.json());
    const errors = validator(CreateServiceDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const service = await serviceService.createService(dto);
    return NextResponse.json({ message: "Service created", service }, { status: 201 });
}

export async function getAllServicesController(_req?: AuthRequest) {
    const services = await serviceService.getAllServices();
    return Http.ok("Services retrieved", { services });
}

export async function getActiveServicesController(_req?: AuthRequest) {
    const services = await serviceService.getActiveServices();
    return Http.ok("Active services retrieved", { services });
}

export async function getServiceByIdController(
    _req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const service = await serviceService.getServiceById(params.id);
    return Http.ok("Service retrieved", { service });
}

export async function getServiceBySlugController(
    _req: AuthRequest,
    { params }: { params: { slug: string } }
) {
    const service = await serviceService.getServiceBySlug(params.slug);
    return Http.ok("Service retrieved", { service });
}

export async function updateServiceController(
    req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const dto = new UpdateServiceDto(await req.json());
    const errors = validator(UpdateServiceDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const service = await serviceService.updateService(params.id, dto);
    return Http.ok("Service updated", { service });
}

export async function deleteServiceController(
    _req: AuthRequest,
    { params }: { params: { id: string } }
) {
    await serviceService.deleteService(params.id);
    return Http.ok("Service deleted");
}







