import { CreateIssueDto, UpdateIssueDto } from '../dto/issue.dto';
import { IIssue } from '../models/issue.model';

export interface IssueService {
    createIssue(data: CreateIssueDto): Promise<IIssue>;
    getAllIssues(): Promise<IIssue[]>;
    getIssueById(id: string): Promise<IIssue>;
    getIssuesByParcelId(parcelId: string): Promise<IIssue[]>;
    updateIssue(id: string, data: UpdateIssueDto): Promise<IIssue>;
    deleteIssue(id: string): Promise<void>;
    resolveIssue(
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
    ): Promise<IIssue>;
    submitPayment(id: string, paymentMethodId: string, proofOfPayment: string): Promise<IIssue>;
    updatePaymentStatus(id: string, paymentStatus: 'PENDING' | 'PAID' | 'VERIFIED' | 'FAILED', showToCustomer?: boolean): Promise<IIssue>;
    toggleVisibility(id: string, showToCustomer: boolean): Promise<IIssue>;
}







