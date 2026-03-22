import { LoginResponseDto } from '@/lib/dto/admin.dto';
import { Admin, IAdmin } from '@/lib/models/admin.model';
import { CustomError } from '@/lib/utils/customError.utils';
import { generateToken } from '@/lib/utils/token.utils';
import bcrypt from 'bcryptjs';
import { AuthService } from '../auth.service';

const LOGIN_QUERY_TIMEOUT_MS = 10000;

class AuthServiceImpl implements AuthService {
    async login(email: string, password: string): Promise<LoginResponseDto> {
        const adminLookupStartedAt = Date.now();
        const admin: IAdmin | null = await Admin.findOne({ email }).maxTimeMS(LOGIN_QUERY_TIMEOUT_MS);
        console.info(`[AUTH_LOGIN] admin lookup completed in ${Date.now() - adminLookupStartedAt}ms`);
        if (!admin) {
            throw new CustomError(400, 'Invalid email or password');
        }

        const passwordCheckStartedAt = Date.now();
        const isValid = await bcrypt.compare(password, admin.password);
        console.info(`[AUTH_LOGIN] password verification completed in ${Date.now() - passwordCheckStartedAt}ms`);
        if (!isValid) {
            throw new CustomError(400, 'Invalid email or password');
        }

        const token = generateToken(admin._id.toString(), 'ADMIN');

        return {
            token,
            admin,
        };
    }
}

export default AuthServiceImpl;