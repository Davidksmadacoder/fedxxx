import type { NextRequest } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
    updateLocationController,
    deleteLocationController,
    toggleLocationVisibilityController,
} from "@/lib/controllers/parcel.controller";

type Params = { id: string; locationId: string };
type RouteCtx<T> = { params: Promise<T> };

export async function PATCH(req: NextRequest, { params }: RouteCtx<Params>) {
    const resolved = await params;

    return withDb(async () => {
        const auth = await withAuth(req, true); // ADMIN
        if (auth instanceof Response) return auth as any;
        return updateLocationController(req as any, { params: resolved });
    });
}

export async function DELETE(req: NextRequest, { params }: RouteCtx<Params>) {
    const resolved = await params;

    return withDb(async () => {
        const auth = await withAuth(req, true); // ADMIN
        if (auth instanceof Response) return auth as any;
        return deleteLocationController(req as any, { params: resolved });
    });
}

// You used POST for toggling; keeping that contract.
export async function POST(req: NextRequest, { params }: RouteCtx<Params>) {
    const resolved = await params;

    return withDb(async () => {
        const auth = await withAuth(req, true); // ADMIN
        if (auth instanceof Response) return auth as any;
        return toggleLocationVisibilityController(req as any, { params: resolved });
    });
}
