import Joi from 'joi';

export class CreateTestimonialDto {
    name!: string;
    role!: string;
    company?: string;
    image?: string;
    rating!: number;
    comment!: string;
    isActive?: boolean;
    order?: number;

    static validationSchema = Joi.object({
        name: Joi.string().required(),
        role: Joi.string().required(),
        company: Joi.string().optional(),
        image: Joi.string().uri().optional(),
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().required(),
        isActive: Joi.boolean().default(true),
        order: Joi.number().default(0),
    });

    constructor(data: CreateTestimonialDto) { Object.assign(this, data); }
}

export class UpdateTestimonialDto {
    name?: string;
    role?: string;
    company?: string;
    image?: string;
    rating?: number;
    comment?: string;
    isActive?: boolean;
    order?: number;

    static validationSchema = Joi.object({
        name: Joi.string().optional(),
        role: Joi.string().optional(),
        company: Joi.string().allow('', null).optional(),
        image: Joi.string().uri().allow('', null).optional(),
        rating: Joi.number().min(1).max(5).optional(),
        comment: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
        order: Joi.number().optional(),
    });

    constructor(data: UpdateTestimonialDto) { Object.assign(this, data); }
}







