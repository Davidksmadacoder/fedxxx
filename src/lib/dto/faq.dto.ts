import Joi from 'joi';

export class CreateFAQDto {
    question!: string;
    answer!: string;
    category?: string;
    order?: number;
    isActive?: boolean;

    static validationSchema = Joi.object({
        question: Joi.string().required(),
        answer: Joi.string().required(),
        category: Joi.string().optional(),
        order: Joi.number().default(0),
        isActive: Joi.boolean().default(true),
    });

    constructor(data: CreateFAQDto) { Object.assign(this, data); }
}

export class UpdateFAQDto {
    question?: string;
    answer?: string;
    category?: string;
    order?: number;
    isActive?: boolean;

    static validationSchema = Joi.object({
        question: Joi.string().optional(),
        answer: Joi.string().optional(),
        category: Joi.string().allow('', null).optional(),
        order: Joi.number().optional(),
        isActive: Joi.boolean().optional(),
    });

    constructor(data: UpdateFAQDto) { Object.assign(this, data); }
}







