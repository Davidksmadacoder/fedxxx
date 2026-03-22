import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
    getTransportMeansByIdController,
    updateTransportMeansController,
    deleteTransportMeansController,
} from "@/lib/controllers/transportMeans.controller";

type Params = { id: string };
type RouteCtx<T> = { params: Promise<T> };

export async function GET(req: NextRequest, { params }: RouteCtx<Params>) {
    const resolved = await params;

    return withDb(async () => {
        const auth = await withAuth(req); // user-level
        if (auth instanceof NextResponse) return auth;
        return getTransportMeansByIdController(req as any, { params: resolved });
    });
}

export async function PUT(req: NextRequest, { params }: RouteCtx<Params>) {
    const resolved = await params;

    return withDb(async () => {
        const auth = await withAuth(req, true); // ADMIN
        if (auth instanceof NextResponse) return auth;
        return updateTransportMeansController(req as any, { params: resolved });
    });
}

export async function DELETE(req: NextRequest, { params }: RouteCtx<Params>) {
    const resolved = await params;

    return withDb(async () => {
        const auth = await withAuth(req, true); // ADMIN
        if (auth instanceof NextResponse) return auth;
        return deleteTransportMeansController(req as any, { params: resolved });
    });
}
