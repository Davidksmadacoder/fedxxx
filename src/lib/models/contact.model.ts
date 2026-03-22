import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export enum ContactType {
    GENERAL = 'GENERAL',
    SUPPORT = 'SUPPORT',
    SALES = 'SALES',
    TECHNICAL = 'TECHNICAL',
    COMPLAINT = 'COMPLAINT',
    FEEDBACK = 'FEEDBACK',
}

export enum ContactStatus {
    NEW = 'NEW',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
}

export interface IContact extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    type: ContactType;
    subject: string;
    message: string;
    status: ContactStatus;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assignedTo?: string;
    response?: string;
    respondedAt?: Date;
    respondedBy?: string;
    attachments?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema: Schema<IContact> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, index: true },
        phone: { type: String },
        type: {
            type: String,
            enum: Object.values(ContactType),
            default: ContactType.GENERAL,
            index: true,
        },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: Object.values(ContactStatus),
            default: ContactStatus.NEW,
            index: true,
        },
        priority: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            default: 'MEDIUM',
        },
        assignedTo: { type: String },
        response: { type: String },
        respondedAt: { type: Date },
        respondedBy: { type: String },
        attachments: [{ type: String }],
    },
    { timestamps: true }
);

ContactSchema.index({ status: 1, type: 1 });
ContactSchema.index({ createdAt: -1 });

export const Contact: Model<IContact> =
    (mongoose.models && mongoose.models.Contact) || mongoose.model<IContact>('Contact', ContactSchema);



