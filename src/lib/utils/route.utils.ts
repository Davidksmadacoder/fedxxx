import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/utils/dbConnect.utils";
import { isLoggedIn } from "@/lib/middleware/isLoggedIn.middleware";
import { CustomError } from "@/lib/utils/customError.utils";

function toErrorResponse(e: unknown) {
    if (e instanceof CustomError) {
        return NextResponse.json({ message: e.message }, { status: e.statusCode });
    }
    const msg =
        process.env.NODE_ENV === "production"
            ? "Internal Server Error"
            : (e as Error)?.message || "Internal Server Error";
    return NextResponse.json({ message: msg }, { status: 500 });
}

export async function withDb<T>(fn: () => Promise<NextResponse>): Promise<NextResponse> {
    try {
        await dbConnect();
        return await fn();
    } catch (e) {
        return toErrorResponse(e);
    }
}

export async function withAuth(
    req: NextRequest,
    admin = false
): Promise<NextResponse | { ok: true }> {
    const authResp = await isLoggedIn(req, admin);
    if (authResp.status !== 200) return authResp;
    return { ok: true };
}

export const Http = {
    ok: <T = Record<string, unknown>>(message: string, data?: T) => 
        NextResponse.json({ message, ...(data ?? {}) }, { status: 200 }),
    created: <T = Record<string, unknown>>(message: string, data?: T) =>
        NextResponse.json({ message, ...(data ?? {}) }, { status: 201 }),
    badRequest: (errors: unknown) =>
        NextResponse.json({ message: "Validation Error", errors }, { status: 400 }),
};
