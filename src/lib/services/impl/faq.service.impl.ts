import { IFAQ, FAQ } from '../../models/faq.model';
import { CreateFAQDto, UpdateFAQDto } from '../../dto/faq.dto';
import { CustomError } from '../../utils/customError.utils';

export class FAQService {
    async create(data: CreateFAQDto): Promise<IFAQ> {
        const faq = new FAQ(data);
        await faq.save();
        return faq;
    }

    async getAll(): Promise<IFAQ[]> {
        return await FAQ.find().sort({ order: 1, createdAt: -1 });
    }

    async getActive(): Promise<IFAQ[]> {
        return await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    }

    async getById(id: string): Promise<IFAQ> {
        const faq = await FAQ.findById(id);
        if (!faq) throw new CustomError(404, 'FAQ not found');
        // Increment views
        faq.views = (faq.views || 0) + 1;
        await faq.save();
        return faq;
    }

    async update(id: string, data: UpdateFAQDto): Promise<IFAQ> {
        const faq = await FAQ.findById(id);
        if (!faq) throw new CustomError(404, 'FAQ not found');
        Object.assign(faq, data);
        await faq.save();
        return faq;
    }

    async delete(id: string): Promise<void> {
        const faq = await FAQ.findById(id);
        if (!faq) throw new CustomError(404, 'FAQ not found');
        await FAQ.findByIdAndDelete(id);
    }
}

export default new FAQService();







