import { IPricing, Pricing } from '../../models/pricing.model';
import { CreatePricingDto, UpdatePricingDto } from '../../dto/pricing.dto';
import { CustomError } from '../../utils/customError.utils';
import { PricingService } from '../pricing.service';

class PricingServiceImpl implements PricingService {
    async createPricing(data: CreatePricingDto): Promise<IPricing> {
        const pricing = new Pricing(data);
        await pricing.save();
        return pricing;
    }

    async getAllPricing(): Promise<IPricing[]> {
        return await Pricing.find().sort({ createdAt: -1 });
    }

    async getPricingById(id: string): Promise<IPricing> {
        const pricing = await Pricing.findById(id);
        if (!pricing) {
            throw new CustomError(404, 'Pricing not found');
        }
        return pricing;
    }

    async updatePricing(id: string, data: UpdatePricingDto): Promise<IPricing> {
        const pricing = await Pricing.findById(id);
        if (!pricing) {
            throw new CustomError(404, 'Pricing not found');
        }
        Object.assign(pricing, data);
        await pricing.save();
        return pricing;
    }

    async deletePricing(id: string): Promise<void> {
        const pricing = await Pricing.findById(id);
        if (!pricing) {
            throw new CustomError(404, 'Pricing not found');
        }
        await Pricing.findByIdAndDelete(id);
    }

    async getActivePricing(): Promise<IPricing[]> {
        const now = new Date();
        return await Pricing.find({
            isActive: true,
            $and: [
                {
                    $or: [
                        { validFrom: { $exists: false } },
                        { validFrom: { $lte: now } },
                    ],
                },
                {
                    $or: [
                        { validUntil: { $exists: false } },
                        { validUntil: { $gte: now } },
                    ],
                },
            ],
        }).sort({ isDefault: -1, createdAt: -1 });
    }

    async calculatePrice(
        weight: number,
        distance: number,
        serviceType?: string,
        originCountry?: string,
        destinationCountry?: string
    ): Promise<number> {
        const now = new Date();
        const queryConditions: any[] = [
            { isActive: true },
            {
                $or: [
                    { validFrom: { $exists: false } },
                    { validFrom: { $lte: now } },
                ],
            },
            {
                $or: [
                    { validUntil: { $exists: false } },
                    { validUntil: { $gte: now } },
                ],
            },
        ];

        // Filter by service type if provided
        if (serviceType) {
            queryConditions.push({
                $or: [
                    { serviceType: serviceType },
                    { serviceType: { $exists: false } },
                ],
            });
        }

        // Filter by countries if provided
        if (originCountry || destinationCountry) {
            const countryConditions: any[] = [];
            if (originCountry) {
                countryConditions.push(
                    { originCountry: originCountry },
                    { originCountry: { $exists: false } }
                );
            }
            if (destinationCountry) {
                countryConditions.push(
                    { destinationCountry: destinationCountry },
                    { destinationCountry: { $exists: false } }
                );
            }
            if (countryConditions.length > 0) {
                queryConditions.push({ $or: countryConditions });
            }
        }

        // Filter by weight range
        queryConditions.push({
            $or: [
                { minWeight: { $exists: false }, maxWeight: { $exists: false } },
                { $and: [{ minWeight: { $lte: weight } }, { maxWeight: { $gte: weight } }] },
                { $and: [{ minWeight: { $lte: weight } }, { maxWeight: { $exists: false } }] },
                { $and: [{ minWeight: { $exists: false } }, { maxWeight: { $gte: weight } }] },
            ],
        });

        // Filter by distance range
        queryConditions.push({
            $or: [
                { minDistance: { $exists: false }, maxDistance: { $exists: false } },
                { $and: [{ minDistance: { $lte: distance } }, { maxDistance: { $gte: distance } }] },
                { $and: [{ minDistance: { $lte: distance } }, { maxDistance: { $exists: false } }] },
                { $and: [{ minDistance: { $exists: false } }, { maxDistance: { $gte: distance } }] },
            ],
        });

        const query = { $and: queryConditions };
        const pricingRules = await Pricing.find(query).sort({ isDefault: -1 });

        if (pricingRules.length === 0) {
            throw new CustomError(404, 'No pricing rule found for the given parameters');
        }

        // Use the first matching rule (prioritize default)
        const rule = pricingRules[0];
        let totalPrice = rule.basePrice || 0;

        // Add per-unit charges
        if (rule.pricePerKg) {
            totalPrice += rule.pricePerKg * weight;
        }
        if (rule.pricePerKm) {
            totalPrice += rule.pricePerKm * distance;
        }
        if (rule.pricePerItem) {
            totalPrice += rule.pricePerItem; // Assuming 1 item for now
        }

        return totalPrice;
    }
}

export default PricingServiceImpl;

