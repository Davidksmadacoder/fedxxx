import type { NextRequest } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import { addImagesController, reorderImagesController } from "@/lib/controllers/parcel.controller";

type Params = { id: string };

type RouteCtx<T> = { params: Promise<T> };

export async function POST(req: NextRequest, { params }: RouteCtx<Params>) {
    const resolved = await params;

    return withDb(async () => {
        const auth = await withAuth(req, true); // ADMIN
        if (auth instanceof Response) return auth as any;
        return addImagesController(req as any, { params: resolved });
    });
}

export async function PUT(req: NextRequest, { params }: RouteCtx<Params>) {
    const resolved = await params;

    return withDb(async () => {
        const auth = await withAuth(req, true); // ADMIN
        if (auth instanceof Response) return auth as any;
        return reorderImagesController(req as any, { params: resolved });
    });
}
