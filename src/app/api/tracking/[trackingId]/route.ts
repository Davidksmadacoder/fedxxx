import type { NextRequest } from "next/server";
import { withDb } from "@/lib/utils/route.utils";
import { getParcelByTrackingIdController } from "@/lib/controllers/parcel.controller";

type Params = { trackingId: string };
type RouteCtx<T> = { params: Promise<T> };

export async function GET(req: NextRequest, { params }: RouteCtx<Params>) {
    const resolved = await params; 
    const normalized = { trackingId: resolved.trackingId.toUpperCase() };

    return withDb(async () => {
        return getParcelByTrackingIdController(req as any, { params: normalized });
    });
}
