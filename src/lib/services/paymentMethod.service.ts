import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from '../dto/paymentMethod.dto';
import { IPaymentMethod } from '../models/paymentMethod.model';

export interface PaymentMethodService {
    createPaymentMethod(data: CreatePaymentMethodDto): Promise<IPaymentMethod>;
    getAllPaymentMethods(): Promise<IPaymentMethod[]>;
    getPaymentMethodById(id: string): Promise<IPaymentMethod>;
    updatePaymentMethod(id: string, data: UpdatePaymentMethodDto): Promise<IPaymentMethod>;
    deletePaymentMethod(id: string): Promise<void>;
    getActivePaymentMethods(): Promise<IPaymentMethod[]>;
    getDefaultPaymentMethod(): Promise<IPaymentMethod | null>;
}







