import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { CustomError } from './customError.utils';

export const generateToken = (userId: string, role: string): string => {
    return jwt.sign({ sub: userId, role }, process.env.JWT_KEY as string, { expiresIn: "1d" });
};

export const extractTokenFromRequest = (req: NextRequest) => {
    // First try Authorization header
    const header = req.headers.get('authorization');
    if (header && header.startsWith('Bearer ')) {
        return header.split(" ")[1];
    }
    
    // Fallback to cookie
    const tokenFromCookie = req.cookies.get('accessTokenCargoPulse')?.value;
    if (tokenFromCookie) {
        return tokenFromCookie;
    }
    
    throw new CustomError(401, "Token not provided");
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_KEY as string);
    } catch (error: any) {
        throw new CustomError(401, "Invalid or expired token");
    }
}