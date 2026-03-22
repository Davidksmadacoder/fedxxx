import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { loginController } from "@/lib/controllers/auth.controller";
import { CustomError } from "@/lib/utils/customError.utils";

export const runtime = "nodejs";
const LOGIN_PATH_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

export async function POST(req: NextRequest) {
    const reqStartedAt = Date.now();
    try {
        const connectStartedAt = Date.now();
        await withTimeout(
            dbConnect(),
            LOGIN_PATH_TIMEOUT_MS,
            `Database connection timed out after ${LOGIN_PATH_TIMEOUT_MS}ms`
        );
        console.info(`[AUTH_LOGIN] dbConnect completed in ${Date.now() - connectStartedAt}ms`);

        const loginStartedAt = Date.now();
        const response = await withTimeout(
            loginController(req),
            LOGIN_PATH_TIMEOUT_MS,
            `Login operation timed out after ${LOGIN_PATH_TIMEOUT_MS}ms`
        );
        console.info(`[AUTH_LOGIN] loginController completed in ${Date.now() - loginStartedAt}ms`);
        console.info(`[AUTH_LOGIN] total request duration ${Date.now() - reqStartedAt}ms`);
        return response;
    } catch (e) {
        if (e instanceof CustomError) {
            return NextResponse.json({ message: e.message }, { status: e.statusCode });
        }
        // expose a better error in non-prod
        const msg =
            process.env.NODE_ENV === "production"
                ? "Internal Server Error"
                : (e as Error).message || "Internal Server Error";
        return NextResponse.json({ message: msg }, { status: 500 });
    }
}
