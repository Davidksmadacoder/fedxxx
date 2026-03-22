import { CreateServiceDto, UpdateServiceDto } from '../dto/service.dto';
import { IService } from '../models/service.model';

export interface ServiceService {
    createService(data: CreateServiceDto): Promise<IService>;
    getAllServices(): Promise<IService[]>;
    getActiveServices(): Promise<IService[]>;
    getServiceById(id: string): Promise<IService>;
    getServiceBySlug(slug: string): Promise<IService>;
    updateService(id: string, data: UpdateServiceDto): Promise<IService>;
    deleteService(id: string): Promise<void>;
}







