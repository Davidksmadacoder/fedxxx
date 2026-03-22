import { IIssue, Issue } from '../../models/issue.model';
import { CreateIssueDto, UpdateIssueDto } from '../../dto/issue.dto';
import { CustomError } from '../../utils/customError.utils';
import { IssueService } from '../issue.service';
import { IssueStatus } from '../../enums/issueType.enum';
import { Parcel } from '../../models/parcel.model';
import { EmailServiceImpl } from './email.service.impl';

class IssueServiceImpl implements IssueService {
    private emailService = new EmailServiceImpl();
    async createIssue(data: CreateIssueDto): Promise<IIssue> {
        // Verify parcel exists
        const parcel = await Parcel.findById(data.parcelId);
        if (!parcel) {
            throw new CustomError(404, 'Parcel not found');
        }

        const issue = new Issue(data);
        await issue.save();
        return issue;
    }

    async getAllIssues(): Promise<IIssue[]> {
        return await Issue.find()
            .populate('parcelId')
            .sort({ createdAt: -1 });
    }

    async getIssueById(id: string): Promise<IIssue> {
        const issue = await Issue.findById(id).populate('parcelId');
        if (!issue) {
            throw new CustomError(404, 'Issue not found');
        }
        return issue;
    }

    async getIssuesByParcelId(parcelId: string): Promise<IIssue[]> {
        return await Issue.find({ parcelId })
            .sort({ createdAt: -1 });
    }

    async updateIssue(id: string, data: UpdateIssueDto): Promise<IIssue> {
        const issue = await Issue.findById(id);
        if (!issue) {
            throw new CustomError(404, 'Issue not found');
        }
        Object.assign(issue, data);
        await issue.save();
        return issue.populate('parcelId');
    }

    async deleteIssue(id: string): Promise<void> {
        const issue = await Issue.findById(id);
        if (!issue) {
            throw new CustomError(404, 'Issue not found');
        }
        await Issue.findByIdAndDelete(id);
    }

    async resolveIssue(
        id: string, 
        resolvedBy: string, 
        resolution: string,
        paymentData?: {
            resolutionAmount?: number;
            paymentMethodId?: string;
            proofOfPayment?: string;
            paymentFee?: number;
            totalAmount?: number;
            paymentStatus?: 'PENDING' | 'PAID' | 'VERIFIED' | 'FAILED';
        }
    ): Promise<IIssue> {
        const issue = await Issue.findById(id);
        if (!issue) {
            throw new CustomError(404, 'Issue not found');
        }

        // Check if payment is required and verified
        if (issue.resolutionAmount && issue.resolutionAmount > 0) {
            if (issue.paymentStatus !== 'VERIFIED') {
                throw new CustomError(400, 'Cannot resolve issue: Payment must be verified before resolution. Current payment status: ' + (issue.paymentStatus || 'PENDING'));
            }
        }

        issue.status = IssueStatus.RESOLVED;
        issue.resolvedBy = resolvedBy;
        issue.resolvedAt = new Date();
        issue.resolution = resolution;
        
        // Add payment data if provided
        if (paymentData) {
            if (paymentData.resolutionAmount !== undefined) issue.resolutionAmount = paymentData.resolutionAmount;
            if (paymentData.paymentMethodId) issue.paymentMethodId = paymentData.paymentMethodId as any;
            if (paymentData.proofOfPayment) issue.proofOfPayment = paymentData.proofOfPayment;
            if (paymentData.paymentFee !== undefined) issue.paymentFee = paymentData.paymentFee;
            if (paymentData.totalAmount !== undefined) issue.totalAmount = paymentData.totalAmount;
            if (paymentData.paymentStatus) issue.paymentStatus = paymentData.paymentStatus;
        }
        
        await issue.save();
        const populated = await issue.populate('parcelId');
        
        // Send email notification if issue is visible to customer
        if (populated.showToCustomer && populated.reportedBy) {
            try {
                const parcel = populated.parcelId as any;
                const trackingId = parcel?.trackingId;
                await this.emailService.sendIssueResolvedEmail(
                    populated.reportedBy,
                    populated.title,
                    resolution,
                    trackingId,
                    paymentData?.totalAmount || populated.totalAmount
                );
            } catch (error) {
                console.error('Failed to send issue resolution email:', error);
                // Don't throw - email failure shouldn't break the resolution
            }
        }
        
        return populated;
    }

    async submitPayment(
        id: string,
        paymentMethodId: string,
        proofOfPayment: string
    ): Promise<IIssue> {
        const issue = await Issue.findById(id);
        if (!issue) {
            throw new CustomError(404, 'Issue not found');
        }

        if (!issue.resolutionAmount || issue.resolutionAmount <= 0) {
            throw new CustomError(400, 'This issue does not require payment');
        }

        // Get payment method to calculate fee
        const PaymentMethod = (await import('../../models/paymentMethod.model')).PaymentMethod;
        const paymentMethod = await PaymentMethod.findById(paymentMethodId);
        if (!paymentMethod) {
            throw new CustomError(404, 'Payment method not found');
        }

        const paymentFee = (issue.resolutionAmount * paymentMethod.fee) / 100;
        const totalAmount = issue.resolutionAmount + paymentFee;

        issue.paymentMethodId = paymentMethodId as any;
        issue.proofOfPayment = proofOfPayment;
        issue.paymentFee = paymentFee;
        issue.totalAmount = totalAmount;
        issue.paymentStatus = 'PAID'; // Customer claims paid, admin needs to verify

        await issue.save();
        return issue.populate('parcelId');
    }

    async updatePaymentStatus(
        id: string,
        paymentStatus: 'PENDING' | 'PAID' | 'VERIFIED' | 'FAILED',
        showToCustomer?: boolean
    ): Promise<IIssue> {
        const issue = await Issue.findById(id);
        if (!issue) {
            throw new CustomError(404, 'Issue not found');
        }

        issue.paymentStatus = paymentStatus;
        if (showToCustomer !== undefined) {
            issue.showToCustomer = showToCustomer;
        }

        await issue.save();
        return issue.populate('parcelId');
    }

    async toggleVisibility(id: string, showToCustomer: boolean): Promise<IIssue> {
        const issue = await Issue.findById(id);
        if (!issue) {
            throw new CustomError(404, 'Issue not found');
        }
        issue.showToCustomer = showToCustomer;
        await issue.save();
        return issue.populate('parcelId');
    }
}

export default IssueServiceImpl;







