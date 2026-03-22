import { IService, Service } from '../../models/service.model';
import { CreateServiceDto, UpdateServiceDto } from '../../dto/service.dto';
import { CustomError } from '../../utils/customError.utils';
import { ServiceService } from '../service.service';

class ServiceServiceImpl implements ServiceService {
    async createService(data: CreateServiceDto): Promise<IService> {
        const service = new Service(data);
        await service.save();
        return service;
    }

    async getAllServices(): Promise<IService[]> {
        return await Service.find().sort({ order: 1, createdAt: -1 });
    }

    async getActiveServices(): Promise<IService[]> {
        return await Service.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    }

    async getServiceById(id: string): Promise<IService> {
        const service = await Service.findById(id);
        if (!service) throw new CustomError(404, 'Service not found');
        return service;
    }

    async getServiceBySlug(slug: string): Promise<IService> {
        const service = await Service.findOne({ slug, isActive: true });
        if (!service) throw new CustomError(404, 'Service not found');
        return service;
    }

    async updateService(id: string, data: UpdateServiceDto): Promise<IService> {
        const service = await Service.findById(id);
        if (!service) throw new CustomError(404, 'Service not found');
        Object.assign(service, data);
        await service.save();
        return service;
    }

    async deleteService(id: string): Promise<void> {
        const service = await Service.findById(id);
        if (!service) throw new CustomError(404, 'Service not found');
        await Service.findByIdAndDelete(id);
    }
}

export default ServiceServiceImpl;







