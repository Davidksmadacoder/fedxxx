import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
  getServiceByIdController,
  updateServiceController,
  deleteServiceController,
} from "@/lib/controllers/service.controller";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withDb(async () => {
    // Public endpoint - no authentication required for viewing service details
    const resolvedParams = await params;
    return getServiceByIdController(req as any, { params: resolvedParams });
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withDb(async () => {
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    const resolvedParams = await params;
    return updateServiceController(req as any, { params: resolvedParams });
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withDb(async () => {
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    const resolvedParams = await params;
    return deleteServiceController(req as any, { params: resolvedParams });
  });
}


