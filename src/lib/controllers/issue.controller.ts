import { NextResponse, NextRequest } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { IssueService } from "@/lib/services/issue.service";
import IssueServiceImpl from "@/lib/services/impl/issue.service.impl";
import { CreateIssueDto, UpdateIssueDto } from "@/lib/dto/issue.dto";
import { validator } from "@/lib/utils/validator.utils";
import { Http } from "@/lib/utils/route.utils";

const issueService: IssueService = new IssueServiceImpl();

export async function createIssueController(req: AuthRequest) {
    const dto = new CreateIssueDto(await req.json());
    const errors = validator(CreateIssueDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const issue = await issueService.createIssue(dto);
    return NextResponse.json({ message: "Issue created", issue }, { status: 201 });
}

export async function getAllIssuesController(_req?: AuthRequest) {
    const issues = await issueService.getAllIssues();
    return Http.ok("Issues retrieved", { issues });
}

export async function getIssueByIdController(
    _req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const issue = await issueService.getIssueById(params.id);
    return Http.ok("Issue retrieved", { issue });
}

export async function getIssuesByParcelIdController(
    _req: AuthRequest | NextRequest,
    { params }: { params: { parcelId: string } }
) {
    // Only return issues visible to customers (public endpoint)
    const allIssues = await issueService.getIssuesByParcelId(params.parcelId);
    const publicIssues = allIssues.filter(issue => issue.showToCustomer !== false);
    return Http.ok("Issues retrieved", { issues: publicIssues });
}

export async function updateIssueController(
    req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const dto = new UpdateIssueDto(await req.json());
    const errors = validator(UpdateIssueDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const issue = await issueService.updateIssue(params.id, dto);
    return Http.ok("Issue updated", { issue });
}

export async function deleteIssueController(
    _req: AuthRequest,
    { params }: { params: { id: string } }
) {
    await issueService.deleteIssue(params.id);
    return Http.ok("Issue deleted");
}

export async function resolveIssueController(
    req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const body = await req.json();
    const resolvedBy = body.resolvedBy || ((req.user as any)?.email || 'Admin');
    const resolution = body.resolution || 'Issue resolved';
    const resolutionAmount = body.resolutionAmount;
    const paymentMethodId = body.paymentMethodId;
    const proofOfPayment = body.proofOfPayment;
    const paymentFee = body.paymentFee;
    const totalAmount = body.totalAmount;
    const paymentStatus = body.paymentStatus || 'PENDING';
    
    const paymentData = resolutionAmount && resolutionAmount > 0 ? {
        resolutionAmount,
        paymentMethodId,
        proofOfPayment,
        paymentFee,
        totalAmount,
        paymentStatus,
    } : undefined;
    
    const issue = await issueService.resolveIssue(
        params.id, 
        resolvedBy, 
        resolution,
        paymentData
    );
    return Http.ok("Issue resolved", { issue });
}

export async function toggleIssueVisibilityController(
    req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const body = await req.json();
    const showToCustomer = body.showToCustomer !== undefined ? body.showToCustomer : true;
    const issue = await issueService.toggleVisibility(params.id, showToCustomer);
    return Http.ok("Issue visibility updated", { issue });
}

export async function submitPaymentController(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const body = await req.json();
    const paymentMethodId = body.paymentMethodId;
    const proofOfPayment = body.proofOfPayment;

    if (!paymentMethodId || !proofOfPayment) {
        return Http.badRequest("Payment method ID and proof of payment are required");
    }

    const issue = await issueService.submitPayment(params.id, paymentMethodId, proofOfPayment);
    return Http.ok("Payment submitted successfully", { issue });
}

export async function updatePaymentStatusController(
    req: AuthRequest,
    { params }: { params: { id: string } }
) {
    const body = await req.json();
    const paymentStatus = body.paymentStatus;
    const showToCustomer = body.showToCustomer;

    if (!paymentStatus || !['PENDING', 'PAID', 'VERIFIED', 'FAILED'].includes(paymentStatus)) {
        return Http.badRequest("Valid payment status is required");
    }

    const issue = await issueService.updatePaymentStatus(
        params.id,
        paymentStatus as 'PENDING' | 'PAID' | 'VERIFIED' | 'FAILED',
        showToCustomer
    );
    return Http.ok("Payment status updated", { issue });
}







