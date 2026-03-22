import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IFAQ extends Document {
    _id: Types.ObjectId;
    question: string;
    answer: string;
    category?: string;
    order: number;
    isActive: boolean;
    views?: number;
    helpful?: number;
    notHelpful?: number;
    createdAt: Date;
    updatedAt: Date;
}

const FAQSchema: Schema<IFAQ> = new Schema(
    {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        category: { type: String, index: true },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true, index: true },
        views: { type: Number, default: 0 },
        helpful: { type: Number, default: 0 },
        notHelpful: { type: Number, default: 0 },
    },
    { timestamps: true }
);

FAQSchema.index({ category: 1, isActive: 1 });
FAQSchema.index({ order: 1 });

export const FAQ: Model<IFAQ> =
    mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', FAQSchema);







