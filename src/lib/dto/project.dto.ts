import Joi from 'joi';

export class CreateProjectDto {
    title!: string;
    slug!: string;
    description!: string;
    fullDescription?: string;
    image!: string;
    images?: string[];
    category!: string;
    client?: string;
    location?: string;
    startDate?: Date;
    endDate?: Date;
    technologies?: string[];
    results?: string[];
    isActive?: boolean;
    order?: number;

    static validationSchema = Joi.object({
        title: Joi.string().required(),
        slug: Joi.string().required(),
        description: Joi.string().required(),
        fullDescription: Joi.string().optional(),
        image: Joi.string().uri().required(),
        images: Joi.array().items(Joi.string().uri()).optional(),
        category: Joi.string().required(),
        client: Joi.string().optional(),
        location: Joi.string().optional(),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
        technologies: Joi.array().items(Joi.string()).optional(),
        results: Joi.array().items(Joi.string()).optional(),
        isActive: Joi.boolean().default(true),
        order: Joi.number().default(0),
    });

    constructor(data: CreateProjectDto) { Object.assign(this, data); }
}

export class UpdateProjectDto {
    title?: string;
    slug?: string;
    description?: string;
    fullDescription?: string;
    image?: string;
    images?: string[];
    category?: string;
    client?: string;
    location?: string;
    startDate?: Date;
    endDate?: Date;
    technologies?: string[];
    results?: string[];
    isActive?: boolean;
    order?: number;

    static validationSchema = Joi.object({
        title: Joi.string().optional(),
        slug: Joi.string().optional(),
        description: Joi.string().optional(),
        fullDescription: Joi.string().allow('', null).optional(),
        image: Joi.string().uri().allow('', null).optional(),
        images: Joi.array().items(Joi.string().uri()).optional(),
        category: Joi.string().optional(),
        client: Joi.string().allow('', null).optional(),
        location: Joi.string().allow('', null).optional(),
        startDate: Joi.date().allow(null).optional(),
        endDate: Joi.date().allow(null).optional(),
        technologies: Joi.array().items(Joi.string()).optional(),
        results: Joi.array().items(Joi.string()).optional(),
        isActive: Joi.boolean().optional(),
        order: Joi.number().optional(),
    });

    constructor(data: UpdateProjectDto) { Object.assign(this, data); }
}







