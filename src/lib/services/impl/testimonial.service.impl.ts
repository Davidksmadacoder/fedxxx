import { ITestimonial, Testimonial } from '../../models/testimonial.model';
import { CreateTestimonialDto, UpdateTestimonialDto } from '../../dto/testimonial.dto';
import { CustomError } from '../../utils/customError.utils';

export class TestimonialService {
    async create(data: CreateTestimonialDto): Promise<ITestimonial> {
        const testimonial = new Testimonial(data);
        await testimonial.save();
        return testimonial;
    }

    async getAll(): Promise<ITestimonial[]> {
        return await Testimonial.find().sort({ order: 1, createdAt: -1 });
    }

    async getActive(): Promise<ITestimonial[]> {
        return await Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    }

    async getById(id: string): Promise<ITestimonial> {
        const testimonial = await Testimonial.findById(id);
        if (!testimonial) throw new CustomError(404, 'Testimonial not found');
        return testimonial;
    }

    async update(id: string, data: UpdateTestimonialDto): Promise<ITestimonial> {
        const testimonial = await Testimonial.findById(id);
        if (!testimonial) throw new CustomError(404, 'Testimonial not found');
        Object.assign(testimonial, data);
        await testimonial.save();
        return testimonial;
    }

    async delete(id: string): Promise<void> {
        const testimonial = await Testimonial.findById(id);
        if (!testimonial) throw new CustomError(404, 'Testimonial not found');
        await Testimonial.findByIdAndDelete(id);
    }
}

export default new TestimonialService();







