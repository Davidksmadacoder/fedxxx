import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface ITestimonial extends Document {
    _id: Types.ObjectId;
    name: string;
    role: string;
    company?: string;
    image?: string;
    rating: number; // 1-5
    comment: string;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const TestimonialSchema: Schema<ITestimonial> = new Schema(
    {
        name: { type: String, required: true },
        role: { type: String, required: true },
        company: { type: String },
        image: { type: String },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        isActive: { type: Boolean, default: true, index: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

TestimonialSchema.index({ isActive: 1, order: 1 });

export const Testimonial: Model<ITestimonial> =
    mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);







