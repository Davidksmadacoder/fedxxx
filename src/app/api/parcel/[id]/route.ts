import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
    getParcelByIdController,
    updateParcelController,
    deleteParcelController,
} from "@/lib/controllers/parcel.controller";

type Params = { id: string };
type RouteCtx<T> = { params: Promise<T> };

export async function GET(req: NextRequest, { params }: RouteCtx<Params>) {
    const resolved = await params;

    return withDb(async () => {
        const auth = await withAuth(req); // user-level
        if (auth instanceof NextResponse) return auth;
        return getParcelByIdController(req as any, { params: resolved });
    });
}

export async function PUT(req: NextRequest, { params }: RouteCtx<Params>) {
    const resolved = await params;

    return withDb(async () => {
        const auth = await withAuth(req, true); // ADMIN
        if (auth instanceof NextResponse) return auth;
        return updateParcelController(req as any, { params: resolved });
    });
}

export async function DELETE(req: NextRequest, { params }: RouteCtx<Params>) {
    const resolved = await params;

    return withDb(async () => {
        const auth = await withAuth(req, true); // ADMIN
        if (auth instanceof NextResponse) return auth;
        return deleteParcelController(req as any, { params: resolved });
    });
}
