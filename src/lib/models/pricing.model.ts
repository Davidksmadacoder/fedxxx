import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { PricingType } from '../enums/pricingType.enum';

export interface IPricing extends Document {
    _id: Types.ObjectId;
    
    name: string;
    type: PricingType;
    description?: string;
    
    // Pricing structure
    basePrice: number;
    currency: string;
    
    // Conditional pricing
    minWeight?: number; // kg
    maxWeight?: number; // kg
    minDistance?: number; // km
    maxDistance?: number; // km
    
    // Per unit pricing
    pricePerKg?: number;
    pricePerKm?: number;
    pricePerItem?: number;
    
    // Service-specific
    serviceType?: string; // same-day, next-day, international, etc.
    destinationCountry?: string;
    originCountry?: string;
    
    // Status
    isActive: boolean;
    isDefault: boolean;
    
    // Validity
    validFrom?: Date;
    validUntil?: Date;
    
    createdAt: Date;
    updatedAt: Date;
}

const PricingSchema: Schema<IPricing> = new Schema(
    {
        name: { type: String, required: true },
        type: {
            type: String,
            enum: Object.values(PricingType),
            required: true,
        },
        description: { type: String },
        
        basePrice: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'USD', required: true },
        
        minWeight: { type: Number, min: 0 },
        maxWeight: { type: Number, min: 0 },
        minDistance: { type: Number, min: 0 },
        maxDistance: { type: Number, min: 0 },
        
        pricePerKg: { type: Number, min: 0 },
        pricePerKm: { type: Number, min: 0 },
        pricePerItem: { type: Number, min: 0 },
        
        serviceType: { type: String },
        destinationCountry: { type: String },
        originCountry: { type: String },
        
        isActive: { type: Boolean, default: true, index: true },
        isDefault: { type: Boolean, default: false },
        
        validFrom: { type: Date },
        validUntil: { type: Date },
    },
    { timestamps: true }
);

// Indexes
PricingSchema.index({ type: 1, isActive: 1 });
PricingSchema.index({ serviceType: 1 });
PricingSchema.index({ isActive: 1, isDefault: 1 });
PricingSchema.index({ createdAt: -1 });

export const Pricing: Model<IPricing> =
    mongoose.models.Pricing || mongoose.model<IPricing>('Pricing', PricingSchema);



