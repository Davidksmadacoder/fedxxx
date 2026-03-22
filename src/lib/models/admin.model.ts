import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAdmin extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const AdminSchema: Schema<IAdmin> = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);

export const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);