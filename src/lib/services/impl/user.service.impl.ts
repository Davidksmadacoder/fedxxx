import { Admin, IAdmin } from '@/lib/models/admin.model';
import { UserService } from '../user.service';
import { CustomError } from '@/lib/utils/customError.utils';

class UserServiceImpl implements UserService {
    async getUserDetails(userId: string): Promise<IAdmin> {
        const user: IAdmin | null = await Admin.findById(userId).select('-password');
        if (!user) {
            throw new CustomError(404, 'User not found');
        }

        return user;
    }
}

export default UserServiceImpl;