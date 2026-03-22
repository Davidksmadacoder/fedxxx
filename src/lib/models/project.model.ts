import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IProject extends Document {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    description: string;
    fullDescription?: string;
    image: string;
    images?: string[];
    category: string;
    client?: string;
    location?: string;
    startDate?: Date;
    endDate?: Date;
    technologies?: string[];
    results?: string[];
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema: Schema<IProject> = new Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true, index: true },
        description: { type: String, required: true },
        fullDescription: { type: String },
        image: { type: String, required: true },
        images: [{ type: String }],
        category: { type: String, required: true, index: true },
        client: { type: String },
        location: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        technologies: [{ type: String }],
        results: [{ type: String }],
        isActive: { type: Boolean, default: true, index: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

ProjectSchema.index({ category: 1, isActive: 1 });
ProjectSchema.index({ order: 1 });

export const Project: Model<IProject> =
    mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);







