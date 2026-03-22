import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IService extends Document {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    description: string;
    fullDescription?: string;
    icon?: string;
    image?: string;
    category: string; // same-day, next-day, international, bulky, cold-chain, etc.
    features?: string[];
    pricing?: {
        basePrice?: number;
        pricePerKg?: number;
        pricePerKm?: number;
    };
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const ServiceSchema: Schema<IService> = new Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true, index: true },
        description: { type: String, required: true },
        fullDescription: { type: String },
        icon: { type: String },
        image: { type: String },
        category: { type: String, required: true, index: true },
        features: [{ type: String }],
        pricing: {
            basePrice: { type: Number, min: 0 },
            pricePerKg: { type: Number, min: 0 },
            pricePerKm: { type: Number, min: 0 },
        },
        isActive: { type: Boolean, default: true, index: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

ServiceSchema.index({ category: 1, isActive: 1 });
ServiceSchema.index({ order: 1 });

export const Service: Model<IService> =
    mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);







