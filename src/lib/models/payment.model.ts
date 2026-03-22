import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { PaymentStatus } from '../enums/paymentStatus.enum';

export interface IPayment extends Document {
    _id: Types.ObjectId;
    parcelId: Types.ObjectId;
    paymentMethodId: Types.ObjectId;
    
    amount: number;
    currency: string;
    status: PaymentStatus;
    
    // Payment details
    transactionId?: string;
    reference?: string;
    description?: string;
    
    // Payment proof
    proofOfPayment?: string; // URL to proof document/image
    notes?: string;
    
    // Admin controls
    isPaid: boolean; // Admin can toggle this
    paidAt?: Date;
    paidBy?: string; // Admin who marked as paid
    
    // Metadata
    metadata?: Record<string, any>;
    
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema<IPayment> = new Schema(
    {
        parcelId: {
            type: Schema.Types.ObjectId,
            ref: 'Parcel',
            required: true,
            index: true,
        },
        paymentMethodId: {
            type: Schema.Types.ObjectId,
            ref: 'PaymentMethod',
            required: true,
        },
        
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'USD', required: true },
        status: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.PENDING,
            required: true,
        },
        
        transactionId: { type: String },
        reference: { type: String },
        description: { type: String },
        
        proofOfPayment: { type: String },
        notes: { type: String },
        
        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
        paidBy: { type: String },
        
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

// Indexes
PaymentSchema.index({ parcelId: 1, status: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ isPaid: 1 });
PaymentSchema.index({ createdAt: -1 });

export const Payment: Model<IPayment> =
    mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);



