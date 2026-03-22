import { IPaymentMethod, PaymentMethod } from '../../models/paymentMethod.model';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from '../../dto/paymentMethod.dto';
import { CustomError } from '../../utils/customError.utils';
import { PaymentMethodService } from '../paymentMethod.service';

class PaymentMethodServiceImpl implements PaymentMethodService {
    async createPaymentMethod(data: CreatePaymentMethodDto): Promise<IPaymentMethod> {
        const paymentMethod = new PaymentMethod(data);
        await paymentMethod.save();
        return paymentMethod;
    }

    async getAllPaymentMethods(): Promise<IPaymentMethod[]> {
        return await PaymentMethod.find().sort({ createdAt: -1 });
    }

    async getPaymentMethodById(id: string): Promise<IPaymentMethod> {
        const paymentMethod = await PaymentMethod.findById(id);
        if (!paymentMethod) {
            throw new CustomError(404, 'Payment method not found');
        }
        return paymentMethod;
    }

    async updatePaymentMethod(id: string, data: UpdatePaymentMethodDto): Promise<IPaymentMethod> {
        const paymentMethod = await PaymentMethod.findById(id);
        if (!paymentMethod) {
            throw new CustomError(404, 'Payment method not found');
        }
        Object.assign(paymentMethod, data);
        await paymentMethod.save();
        return paymentMethod;
    }

    async deletePaymentMethod(id: string): Promise<void> {
        const paymentMethod = await PaymentMethod.findById(id);
        if (!paymentMethod) {
            throw new CustomError(404, 'Payment method not found');
        }
        await PaymentMethod.findByIdAndDelete(id);
    }

    async getActivePaymentMethods(): Promise<IPaymentMethod[]> {
        return await PaymentMethod.find({ status: true }).sort({ isDefault: -1, createdAt: -1 });
    }

    async getDefaultPaymentMethod(): Promise<IPaymentMethod | null> {
        return await PaymentMethod.findOne({ isDefault: true, status: true });
    }
}

export default PaymentMethodServiceImpl;







