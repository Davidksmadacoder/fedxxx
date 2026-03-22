import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { ShipmentStatus } from '../enums/shipment.enum';

export type TransportMeansSlim = {
    _id: string;
    name: string;
    type: string;
};

export interface IImageAsset {
    _id: Types.ObjectId;
    url: string;
    alt?: string;
    label?: string;
    order: number;
    uploadedAt: Date;
}

export interface ITimelineEvent {
    _id: Types.ObjectId;
    status: ShipmentStatus;
    message: string;
    timelineDate: Date;
    location?: string;
    sendEmail: boolean;
}

export interface ILocationPoint {
    _id: Types.ObjectId;
    latitude: number;
    longitude: number;
    timestamp: Date;
    visible: boolean;
    sendEmail: boolean;
}

export interface IContactInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface IParcel extends Document {
    _id: Types.ObjectId;
    trackingId: string;
    sender: IContactInfo;
    receiver: IContactInfo;
    description: string;
    weight: number;
    dimensions: string;

    // NOTE: Kept name "imageUrls" per your ask, but now as rich objects with IDs
    imageUrls: IImageAsset[];

    transportMeans: TransportMeansSlim | string | Types.ObjectId;

    pickupDate: Date;
    estimatedDeliveryDate: Date;
    actualDeliveryDate?: Date;

    fromLocation: string;
    toLocation: string;
    currentStatus: ShipmentStatus;

    timelines: ITimelineEvent[];
    liveRoutes: ILocationPoint[];

    // Payment and Pricing fields
    pricingId?: Types.ObjectId | string; // Reference to pricing rule used
    calculatedPrice?: number; // Calculated shipping price
    currency?: string; // Currency for the price (default: USD)
    distance?: number; // Distance in km (for pricing calculation)
    serviceType?: string; // Service type (same-day, next-day, international, etc.)
    
    // Payment information
    paymentMethodId?: Types.ObjectId | string; // Selected payment method
    paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'; // Payment status
    paymentAmount?: number; // Amount to be paid
    paymentCompletedAt?: Date; // When payment was completed
    paymentReference?: string; // Payment reference/transaction ID
    
    // Additional pricing breakdown
    basePrice?: number; // Base shipping price
    additionalFees?: number; // Additional fees (insurance, handling, etc.)
    discount?: number; // Discount applied
    totalAmount?: number; // Total amount (calculatedPrice + additionalFees - discount)

    createdAt: Date;
    updatedAt: Date;
}

const ImageAssetSchema = new Schema<IImageAsset>(
    {
        url: { type: String, required: true },
        alt: { type: String },
        label: { type: String },
        order: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const TimelineEventSchema = new Schema<ITimelineEvent>(
    {
        status: { type: String, enum: Object.values(ShipmentStatus), required: true },
        message: { type: String, required: true },
        timelineDate: { type: Date, required: true },
        location: { type: String },
        sendEmail: { type: Boolean, default: false },
    },
    { _id: true }
);

const LocationPointSchema = new Schema<ILocationPoint>(
    {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        timestamp: { type: Date, required: true },
        visible: { type: Boolean, default: true },
        sendEmail: { type: Boolean, default: false },
    },
    { _id: true }
);

const ContactInfoSchema: Schema<IContactInfo> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    { _id: false }
);

const ParcelSchema: Schema<IParcel> = new Schema(
    {
        trackingId: { type: String, required: true, unique: true, index: true },
        sender: { type: ContactInfoSchema, required: true },
        receiver: { type: ContactInfoSchema, required: true },

        description: { type: String, required: true },
        weight: { type: Number, required: true },
        dimensions: { type: String, required: true },

        // Rich image assets with ids for full CRUD
        imageUrls: { type: [ImageAssetSchema], default: [] },

        transportMeans: { type: Schema.Types.ObjectId, ref: 'TransportMeans', required: true },

        pickupDate: { type: Date, required: true },
        estimatedDeliveryDate: { type: Date, required: true },
        actualDeliveryDate: { type: Date },

        fromLocation: { type: String, required: true },
        toLocation: { type: String, required: true },

        currentStatus: { type: String, enum: Object.values(ShipmentStatus), default: ShipmentStatus.PENDING },

        timelines: { type: [TimelineEventSchema], default: [] },
        liveRoutes: { type: [LocationPointSchema], default: [] },

        // Payment and Pricing fields
        pricingId: { type: Schema.Types.ObjectId, ref: 'Pricing', index: true },
        calculatedPrice: { type: Number, min: 0 },
        currency: { type: String, default: 'USD' },
        distance: { type: Number, min: 0 }, // Distance in km
        serviceType: { type: String, index: true }, // same-day, next-day, international, etc.
        
        // Payment information
        paymentMethodId: { type: Schema.Types.ObjectId, ref: 'PaymentMethod', index: true },
        paymentStatus: { 
            type: String, 
            enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], 
            default: 'PENDING',
            index: true 
        },
        paymentAmount: { type: Number, min: 0 },
        paymentCompletedAt: { type: Date },
        paymentReference: { type: String },
        
        // Additional pricing breakdown
        basePrice: { type: Number, min: 0 },
        additionalFees: { type: Number, min: 0, default: 0 },
        discount: { type: Number, min: 0, default: 0 },
        totalAmount: { type: Number, min: 0 },
    },
    { timestamps: true }
);

// Keep arrays consistently sorted before save
ParcelSchema.pre('save', function (next) {
    if (this.imageUrls?.length) {
        this.imageUrls.sort((a, b) => a.order - b.order || a.uploadedAt.getTime() - b.uploadedAt.getTime());
    }
    if (this.timelines?.length) {
        this.timelines.sort((a, b) => a.timelineDate.getTime() - b.timelineDate.getTime());
    }
    if (this.liveRoutes?.length) {
        this.liveRoutes.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
    
    // Calculate total amount if pricing fields are present
    if (this.calculatedPrice !== undefined) {
        const base = this.basePrice || this.calculatedPrice || 0;
        const additional = this.additionalFees || 0;
        const discountAmount = this.discount || 0;
        this.totalAmount = Math.max(0, base + additional - discountAmount);
        
        // Set payment amount to total amount if not already set
        if (!this.paymentAmount) {
            this.paymentAmount = this.totalAmount;
        }
    }
    
    next();
});

export const Parcel: Model<IParcel> =
    mongoose.models.Parcel || mongoose.model<IParcel>('Parcel', ParcelSchema);
