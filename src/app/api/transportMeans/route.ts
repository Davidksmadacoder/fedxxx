import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
  getAllTransportMeansController,
  createTransportMeansController,
} from "@/lib/controllers/transportMeans.controller";

export async function GET(req: NextRequest) {
  return withDb(async () => {
    const auth = await withAuth(req);
    if (auth instanceof NextResponse) return auth;
    return getAllTransportMeansController(req as any);
  });
}

export async function POST(req: NextRequest) {
  return withDb(async () => {
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    return createTransportMeansController(req as any);
  });
}
