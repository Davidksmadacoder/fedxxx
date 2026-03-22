import { CreateTransportMeansDto, UpdateTransportMeansDto } from '../dto/transportMeans.dto';
import { ITransportMeans } from '../models/transportMeans.model';

export interface TransportMeansService {
    createTransportMeans(data: CreateTransportMeansDto): Promise<ITransportMeans>;
    getAllTransportMeans(): Promise<ITransportMeans[]>;
    getTransportMeansById(id: string): Promise<ITransportMeans>;
    updateTransportMeans(id: string, data: UpdateTransportMeansDto): Promise<ITransportMeans>;
    deleteTransportMeans(id: string): Promise<void>;
}