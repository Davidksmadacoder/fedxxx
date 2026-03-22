import { ITransportMeans, TransportMeans } from '../../models/transportMeans.model';
import { CreateTransportMeansDto, UpdateTransportMeansDto } from '../../dto/transportMeans.dto';
import { CustomError } from '../../utils/customError.utils';
import { TransportMeansService } from '../transportMeans.service';

class TransportMeansServiceImpl implements TransportMeansService {
    async createTransportMeans(data: CreateTransportMeansDto): Promise<ITransportMeans> {
        const existing = await TransportMeans.findOne({ name: data.name });
        if (existing) {
            throw new CustomError(409, 'Transport means with this name already exists');
        }
        const transportMeans = new TransportMeans(data);
        await transportMeans.save();
        return transportMeans;
    }

    async getAllTransportMeans(): Promise<ITransportMeans[]> {
        return await TransportMeans.find().sort({ createdAt: -1 });
    }

    async getTransportMeansById(id: string): Promise<ITransportMeans> {
        const transportMeans = await TransportMeans.findById(id);
        if (!transportMeans) {
            throw new CustomError(404, 'Transport means not found');
        }
        return transportMeans;
    }

    async updateTransportMeans(id: string, data: UpdateTransportMeansDto): Promise<ITransportMeans> {
        const transportMeans = await TransportMeans.findById(id);
        if (!transportMeans) {
            throw new CustomError(404, 'Transport means not found');
        }
        Object.assign(transportMeans, data);
        await transportMeans.save();
        return transportMeans;
    }

    async deleteTransportMeans(id: string): Promise<void> {
        const transportMeans = await TransportMeans.findById(id);
        if (!transportMeans) {
            throw new CustomError(404, 'Transport means not found');
        }
        await TransportMeans.findByIdAndDelete(id);
    }
}

export default TransportMeansServiceImpl;