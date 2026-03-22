import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { IssueType, IssueStatus } from '../enums/issueType.enum';

export interface IIssue extends Document {
    _id: Types.ObjectId;
    parcelId: Types.ObjectId;
    
    type: IssueType;
    status: IssueStatus;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    
    title: string;
    description: string;
    
    // Issue details
    reportedBy?: string; // User email or name
    reportedAt: Date;
    
    // Resolution
    resolvedBy?: string; // Admin who resolved
    resolvedAt?: Date;
    resolution?: string;
    
    // Payment for resolution
    resolutionAmount?: number; // Amount required to resolve issue
    resolutionPaymentDescription?: string; // Why the customer must pay (explanation)
    paymentMethodId?: Types.ObjectId; // Selected payment method
    proofOfPayment?: string; // URL to proof of payment image
    paymentFee?: number; // Processing fee for payment method
    totalAmount?: number; // Total amount (resolutionAmount + paymentFee)
    paymentStatus?: 'PENDING' | 'PAID' | 'VERIFIED' | 'FAILED'; // Payment status
    
    // Attachments
    attachments?: string[]; // URLs to files/images
    
    // Admin notes (internal)
    adminNotes?: string;
    
    // Visibility
    showToCustomer: boolean; // Admin can toggle visibility
    
    createdAt: Date;
    updatedAt: Date;
}

const IssueSchema: Schema<IIssue> = new Schema(
    {
        parcelId: {
            type: Schema.Types.ObjectId,
            ref: 'Parcel',
            required: true,
            index: true,
        },
        
        type: {
            type: String,
            enum: Object.values(IssueType),
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(IssueStatus),
            default: IssueStatus.OPEN,
            required: true,
            index: true,
        },
        priority: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            default: 'MEDIUM',
            required: true,
        },
        
        title: { type: String, required: true },
        description: { type: String, required: true },
        
        reportedBy: { type: String },
        reportedAt: { type: Date, default: Date.now },
        
        resolvedBy: { type: String },
        resolvedAt: { type: Date },
        resolution: { type: String },
        
        // Payment for resolution
        resolutionAmount: { type: Number },
        resolutionPaymentDescription: { type: String },
        paymentMethodId: { type: Schema.Types.ObjectId, ref: 'PaymentMethod' },
        proofOfPayment: { type: String },
        paymentFee: { type: Number },
        totalAmount: { type: Number },
        paymentStatus: { 
            type: String, 
            enum: ['PENDING', 'PAID', 'VERIFIED', 'FAILED'],
            default: 'PENDING'
        },
        
        attachments: [{ type: String }],
        
        adminNotes: { type: String },
        
        showToCustomer: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Indexes
IssueSchema.index({ parcelId: 1, status: 1 });
IssueSchema.index({ status: 1, priority: 1 });
IssueSchema.index({ type: 1 });
IssueSchema.index({ createdAt: -1 });

export const Issue: Model<IIssue> =
    mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);



