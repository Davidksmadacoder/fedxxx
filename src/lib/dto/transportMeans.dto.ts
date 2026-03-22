import Joi from 'joi';

export class CreateTransportMeansDto {
    name: string;
    type: string;
    description?: string;
    capacity: number;
    estimatedTime: string;
    costPerKm: number;
    active?: boolean;
    availabilityDate: Date;
    lastMaintenanceDate: Date;

    static validationSchema = Joi.object({
        name: Joi.string().required(),
        type: Joi.string().required(),
        description: Joi.string().optional(),
        capacity: Joi.number().required(),
        estimatedTime: Joi.string().required(),
        costPerKm: Joi.number().required(),
        active: Joi.boolean().default(true),
        availabilityDate: Joi.date().required(),
        lastMaintenanceDate: Joi.date().required(),
    });

    constructor(data: CreateTransportMeansDto) {
        Object.assign(this, data);
    }
}

export class UpdateTransportMeansDto {
    name?: string;
    type?: string;
    description?: string;
    capacity?: number;
    estimatedTime?: string;
    costPerKm?: number;
    active?: boolean;
    availabilityDate?: Date;
    lastMaintenanceDate?: Date;

    static validationSchema = Joi.object({
        name: Joi.string().optional(),
        type: Joi.string().optional(),
        description: Joi.string().optional(),
        capacity: Joi.number().optional(),
        estimatedTime: Joi.string().optional(),
        costPerKm: Joi.number().optional(),
        active: Joi.boolean().optional(),
        availabilityDate: Joi.date().optional(),
        lastMaintenanceDate: Joi.date().optional(),
    });

    constructor(data: UpdateTransportMeansDto) {
        Object.assign(this, data);
    }
}