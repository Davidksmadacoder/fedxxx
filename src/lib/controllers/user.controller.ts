import { NextResponse } from 'next/server';
import { UserService } from '../services/user.service';
import UserServiceImpl from '../services/impl/user.service.impl';
import { AuthRequest } from '../middleware/isLoggedIn.middleware';
import { CustomError } from '../utils/customError.utils';

const userService: UserService = new UserServiceImpl();

export async function getUserDetailsController(req: AuthRequest) {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            throw new CustomError(401, 'Unauthorized');
        }

        const userDetails = await userService.getUserDetails(userId);
        return NextResponse.json({ message: 'User details retrieved successfully', user: userDetails }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: error.statusCode || 500 });
    }
}