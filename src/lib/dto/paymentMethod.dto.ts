import Joi from 'joi';
import { PaymentMethodType } from '../enums/paymentMethodType.enum';

export class CreatePaymentMethodDto {
    type!: PaymentMethodType;
    
    // Crypto Wallet fields
    cryptocurrency?: string;
    network?: string;
    walletAddress?: string;
    qrCode?: string;
    
    // Bank Account fields
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
    
    // Mobile Payment fields
    provider?: string;
    handle?: string;
    email?: string;
    
    // Common fields
    status?: boolean;
    processingTime?: string;
    fee?: number;
    isDefault?: boolean;

    static validationSchema = Joi.object({
        type: Joi.string().valid(...Object.values(PaymentMethodType)).required(),
        
        cryptocurrency: Joi.string().optional(),
        network: Joi.string().optional(),
        walletAddress: Joi.string().optional(),
        qrCode: Joi.string().uri().optional(),
        
        bankName: Joi.string().optional(),
        accountName: Joi.string().optional(),
        accountNumber: Joi.string().optional(),
        routingNumber: Joi.string().optional(),
        swiftCode: Joi.string().optional(),
        
        provider: Joi.string().optional(),
        handle: Joi.string().optional(),
        email: Joi.string().email().optional(),
        
        status: Joi.boolean().default(true),
        processingTime: Joi.string().default('1-3 business days'),
        fee: Joi.number().min(0).default(0),
        isDefault: Joi.boolean().default(false),
    });

    constructor(data: CreatePaymentMethodDto) { Object.assign(this, data); }
}

export class UpdatePaymentMethodDto {
    type?: PaymentMethodType;
    
    cryptocurrency?: string;
    network?: string;
    walletAddress?: string;
    qrCode?: string;
    
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
    
    provider?: string;
    handle?: string;
    email?: string;
    
    status?: boolean;
    processingTime?: string;
    fee?: number;
    isDefault?: boolean;

    static validationSchema = Joi.object({
        type: Joi.string().valid(...Object.values(PaymentMethodType)).optional(),
        
        cryptocurrency: Joi.string().allow('', null).optional(),
        network: Joi.string().allow('', null).optional(),
        walletAddress: Joi.string().allow('', null).optional(),
        qrCode: Joi.string().uri().allow('', null).optional(),
        
        bankName: Joi.string().allow('', null).optional(),
        accountName: Joi.string().allow('', null).optional(),
        accountNumber: Joi.string().allow('', null).optional(),
        routingNumber: Joi.string().allow('', null).optional(),
        swiftCode: Joi.string().allow('', null).optional(),
        
        provider: Joi.string().allow('', null).optional(),
        handle: Joi.string().allow('', null).optional(),
        email: Joi.string().email().allow('', null).optional(),
        
        status: Joi.boolean().optional(),
        processingTime: Joi.string().optional(),
        fee: Joi.number().min(0).optional(),
        isDefault: Joi.boolean().optional(),
    });

    constructor(data: UpdatePaymentMethodDto) { Object.assign(this, data); }
}







