import { NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { PaymentService } from "@/lib/services/payment.service";
import PaymentServiceImpl from "@/lib/services/impl/payment.service.impl";
import { CreatePaymentDto, UpdatePaymentDto } from "@/lib/dto/payment.dto";
import { validator } from "@/lib/utils/validator.utils";
import { Http } from "@/lib/utils/route.utils";

const paymentService: PaymentService = new PaymentServiceImpl();

export async function createPaymentController(req: AuthRequest) {
    const dto = new CreatePaymentDto(await req.json());
    const errors = validator(CreatePaymentDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const payment = await paymentService.createPayment(dto);
    return NextResponse.json({ message: "Payment created", payment }, { status: 201 });
}

export async function getAllPaymentsController(_req?: AuthRequest) {
    const payments = await paymentService.getAllPayments();
    return Http.ok("Payments retrieved", { payments });
}

export async function getPaymentByIdController(
    _req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const payment = await paymentService.getPaymentById(params.id);
    return Http.ok("Payment retrieved", { payment });
}

export async function getPaymentsByParcelIdController(
    _req: AuthRequest,
    { params }: { params: { parcelId: string } }
) {
    const payments = await paymentService.getPaymentsByParcelId(params.parcelId);
    return Http.ok("Payments retrieved", { payments });
}

export async function updatePaymentController(
    req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const dto = new UpdatePaymentDto(await req.json());
    const errors = validator(UpdatePaymentDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const payment = await paymentService.updatePayment(params.id, dto);
    return Http.ok("Payment updated", { payment });
}

export async function deletePaymentController(
    _req: AuthRequest,
    { params }: { params: { id: string } }
) {
    await paymentService.deletePayment(params.id);
    return Http.ok("Payment deleted");
}

export async function markPaymentAsPaidController(
    req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const body = await req.json();
    const paidBy = body.paidBy || 'Admin';
    const payment = await paymentService.markAsPaid(params.id, paidBy);
    return Http.ok("Payment marked as paid", { payment });
}

export async function markPaymentAsUnpaidController(
    _req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const payment = await paymentService.markAsUnpaid(params.id);
    return Http.ok("Payment marked as unpaid", { payment });
}







