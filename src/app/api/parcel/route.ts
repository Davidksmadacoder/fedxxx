import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import { getAllParcelsController, createParcelController } from "@/lib/controllers/parcel.controller";

export async function GET(req: NextRequest) {
    return withDb(async () => {
        const auth = await withAuth(req); // user-level
        if (auth instanceof NextResponse) return auth;
        return getAllParcelsController(req as any);
    });
}

export async function POST(req: NextRequest) {
    return withDb(async () => {
        const auth = await withAuth(req, true); // ADMIN
        if (auth instanceof NextResponse) return auth;
        return createParcelController(req as any);
    });
}
