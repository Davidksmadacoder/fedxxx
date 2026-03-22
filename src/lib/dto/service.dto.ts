import Joi from 'joi';

export class CreateServiceDto {
    title!: string;
    slug!: string;
    description!: string;
    fullDescription?: string;
    icon?: string;
    image?: string;
    category!: string;
    features?: string[];
    pricing?: {
        basePrice?: number;
        pricePerKg?: number;
        pricePerKm?: number;
    };
    isActive?: boolean;
    order?: number;

    static validationSchema = Joi.object({
        title: Joi.string().required(),
        slug: Joi.string().required(),
        description: Joi.string().required(),
        fullDescription: Joi.string().optional(),
        icon: Joi.string().uri().optional(),
        image: Joi.string().uri().optional(),
        category: Joi.string().required(),
        features: Joi.array().items(Joi.string()).optional(),
        pricing: Joi.object({
            basePrice: Joi.number().min(0).optional(),
            pricePerKg: Joi.number().min(0).optional(),
            pricePerKm: Joi.number().min(0).optional(),
        }).optional(),
        isActive: Joi.boolean().default(true),
        order: Joi.number().default(0),
    });

    constructor(data: CreateServiceDto) { Object.assign(this, data); }
}

export class UpdateServiceDto {
    title?: string;
    slug?: string;
    description?: string;
    fullDescription?: string;
    icon?: string;
    image?: string;
    category?: string;
    features?: string[];
    pricing?: {
        basePrice?: number;
        pricePerKg?: number;
        pricePerKm?: number;
    };
    isActive?: boolean;
    order?: number;

    static validationSchema = Joi.object({
        title: Joi.string().optional(),
        slug: Joi.string().optional(),
        description: Joi.string().optional(),
        fullDescription: Joi.string().allow('', null).optional(),
        icon: Joi.string().uri().allow('', null).optional(),
        image: Joi.string().uri().allow('', null).optional(),
        category: Joi.string().optional(),
        features: Joi.array().items(Joi.string()).optional(),
        pricing: Joi.object({
            basePrice: Joi.number().min(0).allow(null).optional(),
            pricePerKg: Joi.number().min(0).allow(null).optional(),
            pricePerKm: Joi.number().min(0).allow(null).optional(),
        }).optional(),
        isActive: Joi.boolean().optional(),
        order: Joi.number().optional(),
    });

    constructor(data: UpdateServiceDto) { Object.assign(this, data); }
}







