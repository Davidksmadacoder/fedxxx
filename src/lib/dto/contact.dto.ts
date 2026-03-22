import Joi from 'joi';
import { ContactType, ContactStatus } from '../models/contact.model';

export class CreateContactDto {
    name!: string;
    email!: string;
    phone?: string;
    type?: ContactType;
    subject!: string;
    message!: string;
    attachments?: string[];

    static validationSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().optional(),
        type: Joi.string().valid(...Object.values(ContactType)).default(ContactType.GENERAL),
        subject: Joi.string().required(),
        message: Joi.string().required(),
        attachments: Joi.array().items(Joi.string().uri()).optional(),
    });

    constructor(data: CreateContactDto) { Object.assign(this, data); }
}

export class UpdateContactDto {
    status?: ContactStatus;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assignedTo?: string;
    response?: string;
    respondedBy?: string;

    static validationSchema = Joi.object({
        status: Joi.string().valid(...Object.values(ContactStatus)).optional(),
        priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
        assignedTo: Joi.string().allow('', null).optional(),
        response: Joi.string().allow('', null).optional(),
        respondedBy: Joi.string().allow('', null).optional(),
    });

    constructor(data: UpdateContactDto) { Object.assign(this, data); }
}







