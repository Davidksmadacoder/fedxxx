import { NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { TransportMeansService } from "@/lib/services/transportMeans.service";
import TransportMeansServiceImpl from "@/lib/services/impl/transportMeans.service.impl";
import { CreateTransportMeansDto, UpdateTransportMeansDto } from "@/lib/dto/transportMeans.dto";
import { validator } from "@/lib/utils/validator.utils";
import { Http } from "@/lib/utils/route.utils";

const transportMeansService: TransportMeansService = new TransportMeansServiceImpl();

export async function createTransportMeansController(req: AuthRequest) {
    try {
        const dto = new CreateTransportMeansDto(await req.json());
        const errors = validator(CreateTransportMeansDto, dto);
        if (errors) return Http.badRequest(errors.details);
        const transportMeans = await transportMeansService.createTransportMeans(dto);
        return Http.created("Transport means created", { transportMeans });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function getAllTransportMeansController(_req?: AuthRequest) {
    try {
        const transportMeans = await transportMeansService.getAllTransportMeans();
        return Http.ok("Transport means retrieved", { transportMeans });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function getTransportMeansByIdController(
    _req: AuthRequest,
    { params }: { params: { id: string } }
) {
    try {
        const transportMeans = await transportMeansService.getTransportMeansById(params.id);
        return Http.ok("Transport means retrieved", { transportMeans });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function updateTransportMeansController(
    req: AuthRequest,
    { params }: { params: { id: string } }
) {
    try {
        const dto = new UpdateTransportMeansDto(await req.json());
        const errors = validator(UpdateTransportMeansDto, dto);
        if (errors) return Http.badRequest(errors.details);
        const transportMeans = await transportMeansService.updateTransportMeans(params.id, dto);
        return Http.ok("Transport means updated", { transportMeans });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}

export async function deleteTransportMeansController(
    _req: AuthRequest,
    { params }: { params: { id: string } }
) {
    try {
        await transportMeansService.deleteTransportMeans(params.id);
        return Http.ok("Transport means deleted");
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.statusCode || 500 }
        );
    }
}
