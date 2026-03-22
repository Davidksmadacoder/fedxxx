import { NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { PricingService } from "@/lib/services/pricing.service";
import PricingServiceImpl from "@/lib/services/impl/pricing.service.impl";
import { CreatePricingDto, UpdatePricingDto } from "@/lib/dto/pricing.dto";
import { validator } from "@/lib/utils/validator.utils";
import { Http } from "@/lib/utils/route.utils";

const pricingService: PricingService = new PricingServiceImpl();

export async function createPricingController(req: AuthRequest) {
    const dto = new CreatePricingDto(await req.json());
    const errors = validator(CreatePricingDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const pricing = await pricingService.createPricing(dto);
    return NextResponse.json({ message: "Pricing created", pricing }, { status: 201 });
}

export async function getAllPricingController(_req?: AuthRequest) {
    const pricing = await pricingService.getAllPricing();
    return Http.ok("Pricing retrieved", { pricing });
}

export async function getActivePricingController(_req?: AuthRequest) {
    const pricing = await pricingService.getActivePricing();
    return Http.ok("Active pricing retrieved", { pricing });
}

export async function getPricingByIdController(
    _req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const pricing = await pricingService.getPricingById(params.id);
    return Http.ok("Pricing retrieved", { pricing });
}

export async function updatePricingController(
    req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const dto = new UpdatePricingDto(await req.json());
    const errors = validator(UpdatePricingDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const pricing = await pricingService.updatePricing(params.id, dto);
    return Http.ok("Pricing updated", { pricing });
}

export async function deletePricingController(
    _req: AuthRequest,
    { params }: { params: { id: string } }
) {
    await pricingService.deletePricing(params.id);
    return Http.ok("Pricing deleted");
}

export async function calculatePriceController(req: AuthRequest) {
    const body = await req.json();
    const { weight, distance, serviceType, originCountry, destinationCountry } = body;
    
    if (!weight || !distance) {
        return Http.badRequest("Weight and distance are required");
    }
    
    try {
        const price = await pricingService.calculatePrice(
            weight,
            distance,
            serviceType,
            originCountry,
            destinationCountry
        );
        return Http.ok("Price calculated", { price });
    } catch (error: any) {
        return Http.badRequest(error.message || "Failed to calculate price");
    }
}







