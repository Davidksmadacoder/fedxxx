import { CreatePricingDto, UpdatePricingDto } from '../dto/pricing.dto';
import { IPricing } from '../models/pricing.model';

export interface PricingService {
    createPricing(data: CreatePricingDto): Promise<IPricing>;
    getAllPricing(): Promise<IPricing[]>;
    getPricingById(id: string): Promise<IPricing>;
    updatePricing(id: string, data: UpdatePricingDto): Promise<IPricing>;
    deletePricing(id: string): Promise<void>;
    getActivePricing(): Promise<IPricing[]>;
    calculatePrice(weight: number, distance: number, serviceType?: string, originCountry?: string, destinationCountry?: string): Promise<number>;
}







