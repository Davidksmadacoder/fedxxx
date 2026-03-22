import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
  getAllServicesController,
  createServiceController,
} from "@/lib/controllers/service.controller";

export async function GET(req: NextRequest) {
  return withDb(async () => {
    return getAllServicesController(req as any);
  });
}

export async function POST(req: NextRequest) {
  return withDb(async () => {
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    return createServiceController(req as any);
  });
}
