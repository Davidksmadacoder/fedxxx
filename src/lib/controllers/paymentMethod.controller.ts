import { NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { PaymentMethodService } from "@/lib/services/paymentMethod.service";
import PaymentMethodServiceImpl from "@/lib/services/impl/paymentMethod.service.impl";
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from "@/lib/dto/paymentMethod.dto";
import { validator } from "@/lib/utils/validator.utils";
import { Http } from "@/lib/utils/route.utils";

const paymentMethodService: PaymentMethodService = new PaymentMethodServiceImpl();

export async function createPaymentMethodController(req: AuthRequest) {
    const dto = new CreatePaymentMethodDto(await req.json());
    const errors = validator(CreatePaymentMethodDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const paymentMethod = await paymentMethodService.createPaymentMethod(dto);
    return NextResponse.json({ message: "Payment method created", paymentMethod }, { status: 201 });
}

export async function getAllPaymentMethodsController(_req?: AuthRequest) {
    const paymentMethods = await paymentMethodService.getAllPaymentMethods();
    return Http.ok("Payment methods retrieved", { paymentMethods });
}

export async function getActivePaymentMethodsController(_req?: AuthRequest) {
    const paymentMethods = await paymentMethodService.getActivePaymentMethods();
    return Http.ok("Active payment methods retrieved", { paymentMethods });
}

export async function getPaymentMethodByIdController(
    _req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const paymentMethod = await paymentMethodService.getPaymentMethodById(params.id);
    return Http.ok("Payment method retrieved", { paymentMethod });
}

export async function updatePaymentMethodController(
    req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const dto = new UpdatePaymentMethodDto(await req.json());
    const errors = validator(UpdatePaymentMethodDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const paymentMethod = await paymentMethodService.updatePaymentMethod(params.id, dto);
    return Http.ok("Payment method updated", { paymentMethod });
}

export async function deletePaymentMethodController(
    _req: AuthRequest,
    { params }: { params: { id: string } }
) {
    await paymentMethodService.deletePaymentMethod(params.id);
    return Http.ok("Payment method deleted");
}







