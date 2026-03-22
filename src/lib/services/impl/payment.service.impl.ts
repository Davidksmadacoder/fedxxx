import { IPayment, Payment } from '../../models/payment.model';
import { CreatePaymentDto, UpdatePaymentDto } from '../../dto/payment.dto';
import { CustomError } from '../../utils/customError.utils';
import { PaymentService } from '../payment.service';
import { PaymentStatus } from '../../enums/paymentStatus.enum';
import { Parcel } from '../../models/parcel.model';

class PaymentServiceImpl implements PaymentService {
    async createPayment(data: CreatePaymentDto): Promise<IPayment> {
        // Verify parcel exists
        const parcel = await Parcel.findById(data.parcelId);
        if (!parcel) {
            throw new CustomError(404, 'Parcel not found');
        }

        const payment = new Payment(data);
        await payment.save();
        return payment;
    }

    async getAllPayments(): Promise<IPayment[]> {
        return await Payment.find()
            .populate('parcelId')
            .populate('paymentMethodId')
            .sort({ createdAt: -1 });
    }

    async getPaymentById(id: string): Promise<IPayment> {
        const payment = await Payment.findById(id)
            .populate('parcelId')
            .populate('paymentMethodId');
        if (!payment) {
            throw new CustomError(404, 'Payment not found');
        }
        return payment;
    }

    async getPaymentsByParcelId(parcelId: string): Promise<IPayment[]> {
        return await Payment.find({ parcelId })
            .populate('paymentMethodId')
            .sort({ createdAt: -1 });
    }

    async updatePayment(id: string, data: UpdatePaymentDto): Promise<IPayment> {
        const payment = await Payment.findById(id);
        if (!payment) {
            throw new CustomError(404, 'Payment not found');
        }
        Object.assign(payment, data);
        await payment.save();
        await payment.populate('parcelId');
        await payment.populate('paymentMethodId');
        return payment;
    }

    async deletePayment(id: string): Promise<void> {
        const payment = await Payment.findById(id);
        if (!payment) {
            throw new CustomError(404, 'Payment not found');
        }
        await Payment.findByIdAndDelete(id);
    }

    async markAsPaid(id: string, paidBy: string): Promise<IPayment> {
        const payment = await Payment.findById(id);
        if (!payment) {
            throw new CustomError(404, 'Payment not found');
        }
        payment.isPaid = true;
        payment.paidAt = new Date();
        payment.paidBy = paidBy;
        payment.status = PaymentStatus.COMPLETED;
        await payment.save();
        await payment.populate('parcelId');
        await payment.populate('paymentMethodId');
        return payment;
    }

    async markAsUnpaid(id: string): Promise<IPayment> {
        const payment = await Payment.findById(id);
        if (!payment) {
            throw new CustomError(404, 'Payment not found');
        }
        payment.isPaid = false;
        payment.paidAt = undefined;
        payment.paidBy = undefined;
        payment.status = PaymentStatus.PENDING;
        await payment.save();
        await payment.populate('parcelId');
        await payment.populate('paymentMethodId');
        return payment;
    }
}

export default PaymentServiceImpl;



