import { IAdmin } from '../models/admin.model';

export class LoginResponseDto {
    token: string;
    admin: IAdmin;
}