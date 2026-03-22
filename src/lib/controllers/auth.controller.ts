import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../services/auth.service';
import AuthServiceImpl from '../services/impl/auth.service.impl';

const authService: AuthService = new AuthServiceImpl();

export async function loginController(req: NextRequest) {
    const { email, password } = await req.json();
    const response = await authService.login(email, password);
    return NextResponse.json({ message: 'Login successful', ...response }, { status: 200 });
}