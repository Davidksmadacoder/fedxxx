import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { PaymentMethodType } from '../enums/paymentMethodType.enum';

export interface IPaymentMethod extends Document {
    _id: Types.ObjectId;
    type: PaymentMethodType;
    
    // Crypto Wallet fields
    cryptocurrency?: string;
    network?: string;
    walletAddress?: string;
    qrCode?: string;
    
    // Bank Account fields
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
    
    // Mobile Payment fields
    provider?: string;
    handle?: string;
    email?: string;
    
    // Common fields
    status: boolean;
    processingTime: string;
    fee: number;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentMethodSchema: Schema<IPaymentMethod> = new Schema(
    {
        type: {
            type: String,
            enum: Object.values(PaymentMethodType),
            required: true,
        },
        
        // Crypto Wallet fields
        cryptocurrency: { type: String },
        network: { type: String },
        walletAddress: { type: String },
        qrCode: { type: String },
        
        // Bank Account fields
        bankName: { type: String },
        accountName: { type: String },
        accountNumber: { type: String },
        routingNumber: { type: String },
        swiftCode: { type: String },
        
        // Mobile Payment fields
        provider: { type: String },
        handle: { type: String },
        email: { type: String },
        
        // Common fields
        status: { type: Boolean, default: true },
        processingTime: { type: String, default: '1-3 business days' },
        fee: { type: Number, default: 0 },
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Indexes
PaymentMethodSchema.index({ type: 1 });
PaymentMethodSchema.index({ status: 1 });
PaymentMethodSchema.index({ isDefault: 1 });

// Validation: Ensure required fields based on type
PaymentMethodSchema.pre('save', function (next) {
    if (this.type === PaymentMethodType.CRYPTO_WALLET) {
        if (!this.walletAddress) {
            return next(new Error('Wallet address is required for crypto wallet payment method'));
        }
    } else if (this.type === PaymentMethodType.BANK_ACCOUNT) {
        if (!this.bankName || !this.accountNumber) {
            return next(new Error('Bank name and account number are required for bank account payment method'));
        }
    } else if (this.type === PaymentMethodType.MOBILE_PAYMENT) {
        if (!this.provider) {
            return next(new Error('Provider is required for mobile payment method'));
        }
    }
    next();
});

// Ensure only one default payment method
PaymentMethodSchema.pre('save', async function (next) {
    if (this.isDefault && this.isModified('isDefault')) {
        await mongoose.model('PaymentMethod').updateMany(
            { _id: { $ne: this._id }, isDefault: true },
            { $set: { isDefault: false } }
        );
    }
    next();
});

export const PaymentMethod: Model<IPaymentMethod> =
    mongoose.models.PaymentMethod || mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema);







