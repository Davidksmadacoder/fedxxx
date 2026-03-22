import Joi from 'joi';
import { IssueType, IssueStatus } from '../enums/issueType.enum';

export class CreateIssueDto {
    parcelId!: string;
    type!: IssueType;
    status?: IssueStatus;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    title!: string;
    description!: string;
    reportedBy?: string;
    attachments?: string[];
    showToCustomer?: boolean;

    static validationSchema = Joi.object({
        parcelId: Joi.string().required(),
        type: Joi.string().valid(...Object.values(IssueType)).required(),
        status: Joi.string().valid(...Object.values(IssueStatus)).default(IssueStatus.OPEN),
        priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
        title: Joi.string().required(),
        description: Joi.string().required(),
        reportedBy: Joi.string().optional(),
        attachments: Joi.array().items(Joi.string().uri()).optional(),
        showToCustomer: Joi.boolean().default(true),
    });

    constructor(data: CreateIssueDto) { Object.assign(this, data); }
}

export class UpdateIssueDto {
    type?: IssueType;
    status?: IssueStatus;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    title?: string;
    description?: string;
    resolvedBy?: string;
    resolvedAt?: Date;
    resolution?: string;
    resolutionAmount?: number;
    resolutionPaymentDescription?: string;
    attachments?: string[];
    adminNotes?: string;
    showToCustomer?: boolean;

    static validationSchema = Joi.object({
        type: Joi.string().valid(...Object.values(IssueType)).optional(),
        status: Joi.string().valid(...Object.values(IssueStatus)).optional(),
        priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        resolvedBy: Joi.string().allow('', null).optional(),
        resolvedAt: Joi.date().optional(),
        resolution: Joi.string().allow('', null).optional(),
        resolutionAmount: Joi.number().min(0).optional(),
        resolutionPaymentDescription: Joi.string().allow('', null).optional(),
        attachments: Joi.array().items(Joi.string().uri()).optional(),
        adminNotes: Joi.string().allow('', null).optional(),
        showToCustomer: Joi.boolean().optional(),
    });

    constructor(data: UpdateIssueDto) { Object.assign(this, data); }
}







