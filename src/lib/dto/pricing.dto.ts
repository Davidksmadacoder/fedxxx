import Joi from 'joi';
import { PricingType } from '../enums/pricingType.enum';

export class CreatePricingDto {
    name!: string;
    type!: PricingType;
    description?: string;
    basePrice!: number;
    currency?: string;
    minWeight?: number;
    maxWeight?: number;
    minDistance?: number;
    maxDistance?: number;
    pricePerKg?: number;
    pricePerKm?: number;
    pricePerItem?: number;
    serviceType?: string;
    destinationCountry?: string;
    originCountry?: string;
    isActive?: boolean;
    isDefault?: boolean;
    validFrom?: Date;
    validUntil?: Date;

    static validationSchema = Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid(...Object.values(PricingType)).required(),
        description: Joi.string().optional(),
        basePrice: Joi.number().min(0).required(),
        currency: Joi.string().default('USD'),
        minWeight: Joi.number().min(0).optional(),
        maxWeight: Joi.number().min(0).optional(),
        minDistance: Joi.number().min(0).optional(),
        maxDistance: Joi.number().min(0).optional(),
        pricePerKg: Joi.number().min(0).optional(),
        pricePerKm: Joi.number().min(0).optional(),
        pricePerItem: Joi.number().min(0).optional(),
        serviceType: Joi.string().optional(),
        destinationCountry: Joi.string().optional(),
        originCountry: Joi.string().optional(),
        isActive: Joi.boolean().default(true),
        isDefault: Joi.boolean().default(false),
        validFrom: Joi.date().optional(),
        validUntil: Joi.date().optional(),
    });

    constructor(data: CreatePricingDto) { Object.assign(this, data); }
}

export class UpdatePricingDto {
    name?: string;
    type?: PricingType;
    description?: string;
    basePrice?: number;
    currency?: string;
    minWeight?: number;
    maxWeight?: number;
    minDistance?: number;
    maxDistance?: number;
    pricePerKg?: number;
    pricePerKm?: number;
    pricePerItem?: number;
    serviceType?: string;
    destinationCountry?: string;
    originCountry?: string;
    isActive?: boolean;
    isDefault?: boolean;
    validFrom?: Date;
    validUntil?: Date;

    static validationSchema = Joi.object({
        name: Joi.string().optional(),
        type: Joi.string().valid(...Object.values(PricingType)).optional(),
        description: Joi.string().allow('', null).optional(),
        basePrice: Joi.number().min(0).optional(),
        currency: Joi.string().optional(),
        minWeight: Joi.number().min(0).allow(null).optional(),
        maxWeight: Joi.number().min(0).allow(null).optional(),
        minDistance: Joi.number().min(0).allow(null).optional(),
        maxDistance: Joi.number().min(0).allow(null).optional(),
        pricePerKg: Joi.number().min(0).allow(null).optional(),
        pricePerKm: Joi.number().min(0).allow(null).optional(),
        pricePerItem: Joi.number().min(0).allow(null).optional(),
        serviceType: Joi.string().allow('', null).optional(),
        destinationCountry: Joi.string().allow('', null).optional(),
        originCountry: Joi.string().allow('', null).optional(),
        isActive: Joi.boolean().optional(),
        isDefault: Joi.boolean().optional(),
        validFrom: Joi.date().allow(null).optional(),
        validUntil: Joi.date().allow(null).optional(),
    });

    constructor(data: UpdatePricingDto) { Object.assign(this, data); }
}







