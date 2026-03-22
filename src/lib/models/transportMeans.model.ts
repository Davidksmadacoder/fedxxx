import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface ITransportMeans extends Document {
    _id: Types.ObjectId;
    name: string;
    type: string;
    description?: string;
    capacity: number;
    estimatedTime: string;
    costPerKm: number;
    active: boolean;
    availabilityDate: Date;
    lastMaintenanceDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TransportMeansSchema: Schema<ITransportMeans> = new Schema(
    {
        name: { type: String, required: true, unique: true },
        type: { type: String, required: true },
        description: { type: String },
        capacity: { type: Number, required: true },
        estimatedTime: { type: String, required: true },
        costPerKm: { type: Number, required: true },
        active: { type: Boolean, default: true },
        availabilityDate: { type: Date, required: true },
        lastMaintenanceDate: { type: Date, required: true },
    },
    { timestamps: true }
);

export const TransportMeans: Model<ITransportMeans> = mongoose.models.TransportMeans || mongoose.model<ITransportMeans>('TransportMeans', TransportMeansSchema);