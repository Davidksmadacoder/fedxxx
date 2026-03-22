import { IContact, Contact, ContactStatus } from '../../models/contact.model';
import { CreateContactDto, UpdateContactDto } from '../../dto/contact.dto';
import { CustomError } from '../../utils/customError.utils';
import { EmailServiceImpl } from './email.service.impl';

export class ContactService {
    private emailService = new EmailServiceImpl();
    async create(data: CreateContactDto): Promise<IContact> {
        const contact = new Contact(data);
        await contact.save();
        return contact;
    }

    async getAll(): Promise<IContact[]> {
        return await Contact.find().sort({ createdAt: -1 });
    }

    async getById(id: string): Promise<IContact> {
        const contact = await Contact.findById(id);
        if (!contact) throw new CustomError(404, 'Contact not found');
        return contact;
    }

    async update(id: string, data: UpdateContactDto): Promise<IContact> {
        const contact = await Contact.findById(id);
        if (!contact) throw new CustomError(404, 'Contact not found');
        const hadResponse = !!contact.response;
        Object.assign(contact, data);
        if (data.response) {
            contact.respondedAt = new Date();
            
            // Send email notification if this is a new response
            if (!hadResponse && contact.email) {
                try {
                    await this.emailService.sendContactResponseEmail(
                        contact.email,
                        contact.subject || 'Your Inquiry',
                        data.response
                    );
                } catch (error) {
                    console.error('Failed to send contact response email:', error);
                    // Don't throw - email failure shouldn't break the update
                }
            }
        }
        await contact.save();
        return contact;
    }

    async delete(id: string): Promise<void> {
        const contact = await Contact.findById(id);
        if (!contact) throw new CustomError(404, 'Contact not found');
        await Contact.findByIdAndDelete(id);
    }
}

export default new ContactService();







