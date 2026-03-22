import { NextRequest, NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import { getUserDetailsController } from "@/lib/controllers/user.controller";

export async function GET(req: NextRequest) {
    return withDb(async () => {
        const auth = await withAuth(req); // user-level
        if (auth instanceof NextResponse) return auth;
        return await getUserDetailsController(req as any);
    });
}
