import type { NextRequest } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
    updateImageController,
    deleteImageController,
} from "@/lib/controllers/parcel.controller";

type Params = { id: string; imageId: string };

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<Params> }
) {
    const resolved = await params;

    return withDb(async () => {
        const auth = await withAuth(req, true);
        if (auth instanceof Response) return auth as any;
        return updateImageController(req as any, { params: resolved });
    });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<Params> }
) {
    const resolved = await params;

    return withDb(async () => {
        const auth = await withAuth(req, true);
        if (auth instanceof Response) return auth as any;
        return deleteImageController(req as any, { params: resolved });
    });
}
