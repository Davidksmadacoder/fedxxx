import { LoginResponseDto } from "../dto/admin.dto";

export interface AuthService {
    login(email: string, password: string): Promise<LoginResponseDto>;
}