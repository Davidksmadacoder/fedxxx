import { CreatePaymentDto, UpdatePaymentDto } from '../dto/payment.dto';
import { IPayment } from '../models/payment.model';

export interface PaymentService {
    createPayment(data: CreatePaymentDto): Promise<IPayment>;
    getAllPayments(): Promise<IPayment[]>;
    getPaymentById(id: string): Promise<IPayment>;
    getPaymentsByParcelId(parcelId: string): Promise<IPayment[]>;
    updatePayment(id: string, data: UpdatePaymentDto): Promise<IPayment>;
    deletePayment(id: string): Promise<void>;
    markAsPaid(id: string, paidBy: string): Promise<IPayment>;
    markAsUnpaid(id: string): Promise<IPayment>;
}







