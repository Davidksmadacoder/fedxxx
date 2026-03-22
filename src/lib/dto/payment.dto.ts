import Joi from 'joi';
import { PaymentStatus } from '../enums/paymentStatus.enum';

export class CreatePaymentDto {
    parcelId!: string;
    paymentMethodId!: string;
    amount!: number;
    currency?: string;
    status?: PaymentStatus;
    transactionId?: string;
    reference?: string;
    description?: string;
    proofOfPayment?: string;
    notes?: string;
    metadata?: Record<string, any>;

    static validationSchema = Joi.object({
        parcelId: Joi.string().required(),
        paymentMethodId: Joi.string().required(),
        amount: Joi.number().positive().required(),
        currency: Joi.string().default('USD'),
        status: Joi.string().valid(...Object.values(PaymentStatus)).default(PaymentStatus.PENDING),
        transactionId: Joi.string().optional(),
        reference: Joi.string().optional(),
        description: Joi.string().optional(),
        proofOfPayment: Joi.string().uri().optional(),
        notes: Joi.string().optional(),
        metadata: Joi.object().optional(),
    });

    constructor(data: CreatePaymentDto) { Object.assign(this, data); }
}

export class UpdatePaymentDto {
    paymentMethodId?: string;
    amount?: number;
    currency?: string;
    status?: PaymentStatus;
    transactionId?: string;
    reference?: string;
    description?: string;
    proofOfPayment?: string;
    notes?: string;
    isPaid?: boolean;
    paidAt?: Date;
    paidBy?: string;
    metadata?: Record<string, any>;

    static validationSchema = Joi.object({
        paymentMethodId: Joi.string().optional(),
        amount: Joi.number().positive().optional(),
        currency: Joi.string().optional(),
        status: Joi.string().valid(...Object.values(PaymentStatus)).optional(),
        transactionId: Joi.string().allow('', null).optional(),
        reference: Joi.string().allow('', null).optional(),
        description: Joi.string().allow('', null).optional(),
        proofOfPayment: Joi.string().uri().allow('', null).optional(),
        notes: Joi.string().allow('', null).optional(),
        isPaid: Joi.boolean().optional(),
        paidAt: Joi.date().optional(),
        paidBy: Joi.string().allow('', null).optional(),
        metadata: Joi.object().optional(),
    });

    constructor(data: UpdatePaymentDto) { Object.assign(this, data); }
}







