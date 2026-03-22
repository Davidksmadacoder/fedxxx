import Joi from 'joi';
import { ShipmentStatus } from '../enums/shipment.enum';

export class CreateParcelDto {
    sender!: {
        name: string; email: string; phone: string; address: string;
        city: string; state: string; postalCode: string; country: string;
    };
    receiver!: {
        name: string; email: string; phone: string; address: string;
        city: string; state: string; postalCode: string; country: string;
    };
    description!: string;
    weight!: number;
    dimensions!: string;

    // For creation, accept simple URLs; service will normalize into rich image assets with IDs.
    imageUrls!: string[];

    transportMeans!: string;
    pickupDate!: Date;
    estimatedDeliveryDate!: Date;
    fromLocation!: string;
    toLocation!: string;

    // Payment and Pricing fields (optional)
    pricingId?: string;
    calculatedPrice?: number;
    currency?: string;
    distance?: number;
    serviceType?: string;
    paymentMethodId?: string;
    paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    paymentAmount?: number;
    basePrice?: number;
    additionalFees?: number;
    discount?: number;
    totalAmount?: number;

    static validationSchema = Joi.object({
        sender: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            phone: Joi.string().required(),
            address: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            postalCode: Joi.string().required(),
            country: Joi.string().required(),
        }).required(),
        receiver: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            phone: Joi.string().required(),
            address: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            postalCode: Joi.string().required(),
            country: Joi.string().required(),
        }).required(),
        description: Joi.string().required(),
        weight: Joi.number().positive().required(),
        dimensions: Joi.string().required(),
        imageUrls: Joi.array().items(Joi.string().uri()).default([]),
        transportMeans: Joi.string().required(),
        pickupDate: Joi.date().required(),
        estimatedDeliveryDate: Joi.date().required(),
        fromLocation: Joi.string().required(),
        toLocation: Joi.string().required(),
        // Payment and Pricing fields
        pricingId: Joi.string().optional(),
        calculatedPrice: Joi.number().min(0).optional(),
        currency: Joi.string().default('USD').optional(),
        distance: Joi.number().min(0).optional(),
        serviceType: Joi.string().optional(),
        paymentMethodId: Joi.string().optional(),
        paymentStatus: Joi.string().valid('PENDING', 'PAID', 'FAILED', 'REFUNDED').optional(),
        paymentAmount: Joi.number().min(0).optional(),
        basePrice: Joi.number().min(0).optional(),
        additionalFees: Joi.number().min(0).optional(),
        discount: Joi.number().min(0).optional(),
        totalAmount: Joi.number().min(0).optional(),
    });

    constructor(data: CreateParcelDto) { Object.assign(this, data); }
}

export class UpdateParcelDto {
    sender?: Partial<CreateParcelDto['sender']>;
    receiver?: Partial<CreateParcelDto['receiver']>;
    description?: string;
    weight?: number;
    dimensions?: string;

    // You may entirely replace images via a batch (rare). Prefer image endpoints below.
    imageUrls?: string[];

    transportMeans?: string;
    pickupDate?: Date;
    estimatedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    fromLocation?: string;
    toLocation?: string;
    currentStatus?: ShipmentStatus;

    // Payment and Pricing fields
    pricingId?: string;
    calculatedPrice?: number;
    currency?: string;
    distance?: number;
    serviceType?: string;
    paymentMethodId?: string;
    paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    paymentAmount?: number;
    paymentCompletedAt?: Date;
    paymentReference?: string;
    basePrice?: number;
    additionalFees?: number;
    discount?: number;
    totalAmount?: number;

    static validationSchema = Joi.object({
        sender: Joi.object({
            name: Joi.string().optional(),
            email: Joi.string().email().optional(),
            phone: Joi.string().optional(),
            address: Joi.string().optional(),
            city: Joi.string().optional(),
            state: Joi.string().optional(),
            postalCode: Joi.string().optional(),
            country: Joi.string().optional(),
        }).optional(),
        receiver: Joi.object({
            name: Joi.string().optional(),
            email: Joi.string().email().optional(),
            phone: Joi.string().optional(),
            address: Joi.string().optional(),
            city: Joi.string().optional(),
            state: Joi.string().optional(),
            postalCode: Joi.string().optional(),
            country: Joi.string().optional(),
        }).optional(),
        description: Joi.string().optional(),
        weight: Joi.number().positive().optional(),
        dimensions: Joi.string().optional(),
        imageUrls: Joi.array().items(Joi.string().uri()).optional(),
        transportMeans: Joi.string().optional(),
        pickupDate: Joi.date().optional(),
        estimatedDeliveryDate: Joi.date().optional(),
        actualDeliveryDate: Joi.date().optional(),
        fromLocation: Joi.string().optional(),
        toLocation: Joi.string().optional(),
        currentStatus: Joi.string().valid(...Object.values(ShipmentStatus)).optional(),
        // Payment and Pricing fields
        pricingId: Joi.string().allow('', null).optional(),
        calculatedPrice: Joi.number().min(0).allow(null).optional(),
        currency: Joi.string().optional(),
        distance: Joi.number().min(0).allow(null).optional(),
        serviceType: Joi.string().allow('', null).optional(),
        paymentMethodId: Joi.string().allow('', null).optional(),
        paymentStatus: Joi.string().valid('PENDING', 'PAID', 'FAILED', 'REFUNDED').optional(),
        paymentAmount: Joi.number().min(0).allow(null).optional(),
        paymentCompletedAt: Joi.date().allow(null).optional(),
        paymentReference: Joi.string().allow('', null).optional(),
        basePrice: Joi.number().min(0).allow(null).optional(),
        additionalFees: Joi.number().min(0).allow(null).optional(),
        discount: Joi.number().min(0).allow(null).optional(),
        totalAmount: Joi.number().min(0).allow(null).optional(),
    });

    constructor(data: UpdateParcelDto) { Object.assign(this, data); }
}

export class AddTimelineDto {
    status!: ShipmentStatus;
    message!: string;
    timelineDate!: Date;
    location?: string;
    sendEmail!: boolean;

    static validationSchema = Joi.object({
        status: Joi.string().valid(...Object.values(ShipmentStatus)).required(),
        message: Joi.string().required(),
        timelineDate: Joi.date().required(),
        location: Joi.string().optional(),
        sendEmail: Joi.boolean().required(),
    });

    constructor(data: AddTimelineDto) { Object.assign(this, data); }
}

export class UpdateTimelineDto {
    status?: ShipmentStatus;
    message?: string;
    timelineDate?: Date;
    location?: string;
    sendEmail?: boolean;

    static validationSchema = Joi.object({
        status: Joi.string().valid(...Object.values(ShipmentStatus)).optional(),
        message: Joi.string().optional(),
        timelineDate: Joi.date().optional(),
        location: Joi.string().optional(),
        sendEmail: Joi.boolean().optional(),
    });

    constructor(data: UpdateTimelineDto) { Object.assign(this, data); }
}

export class AddLocationDto {
    latitude!: number;
    longitude!: number;
    timestamp!: Date;
    visible?: boolean;
    sendEmail!: boolean;

    static validationSchema = Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        timestamp: Joi.date().required(),
        visible: Joi.boolean().default(true),
        sendEmail: Joi.boolean().required(),
    });

    constructor(data: AddLocationDto) { Object.assign(this, data); }
}

export class UpdateLocationDto {
    latitude?: number;
    longitude?: number;
    timestamp?: Date;
    visible?: boolean;

    static validationSchema = Joi.object({
        latitude: Joi.number().optional(),
        longitude: Joi.number().optional(),
        timestamp: Joi.date().optional(),
        visible: Joi.boolean().optional(),
    });

    constructor(data: UpdateLocationDto) { Object.assign(this, data); }
}

/** Images CRUD DTOs */
export class AddImagesDto {
    images!: { url: string; alt?: string; label?: string }[];

    static validationSchema = Joi.object({
        images: Joi.array().items(
            Joi.object({
                url: Joi.string().uri().required(),
                alt: Joi.string().allow('', null),
                label: Joi.string().allow('', null),
            })
        ).min(1).required(),
    });

    constructor(data: AddImagesDto) { Object.assign(this, data); }
}

export class UpdateImageDto {
    url?: string;
    alt?: string;
    label?: string;

    static validationSchema = Joi.object({
        url: Joi.string().uri().optional(),
        alt: Joi.string().allow('', null).optional(),
        label: Joi.string().allow('', null).optional(),
    });

    constructor(data: UpdateImageDto) { Object.assign(this, data); }
}

export class ReorderImagesDto {
    order!: { _id: string; order: number }[];

    static validationSchema = Joi.object({
        order: Joi.array().items(
            Joi.object({
                _id: Joi.string().required(),
                order: Joi.number().integer().min(0).required(),
            })
        ).min(1).required(),
    });

    constructor(data: ReorderImagesDto) { Object.assign(this, data); }
}
