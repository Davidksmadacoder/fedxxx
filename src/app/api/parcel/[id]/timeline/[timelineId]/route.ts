import type { NextRequest } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import { updateTimelineController, deleteTimelineController } from "@/lib/controllers/parcel.controller";

type Params = { id: string; timelineId: string };
type RouteCtx<T> = { params: Promise<T> };

export async function PATCH(req: NextRequest, { params }: RouteCtx<Params>) {
    const resolved = await params;

    return withDb(async () => {
        const auth = await withAuth(req, true); // ADMIN
        if (auth instanceof Response) return auth as any;
        return updateTimelineController(req as any, { params: resolved });
    });
}

export async function DELETE(req: NextRequest, { params }: RouteCtx<Params>) {
    const resolved = await params;

    return withDb(async () => {
        const auth = await withAuth(req, true); // ADMIN
        if (auth instanceof Response) return auth as any;
        return deleteTimelineController(req as any, { params: resolved });
    });
}
