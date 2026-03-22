import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
  getPaymentByIdController,
  updatePaymentController,
  deletePaymentController,
} from "@/lib/controllers/payment.controller";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withDb(async () => {
    const auth = await withAuth(req);
    if (auth instanceof NextResponse) return auth;
    const resolvedParams = await params;
    return getPaymentByIdController(req as any, { params: resolvedParams });
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
    return updatePaymentController(req as any, { params: resolvedParams });
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
    return deletePaymentController(req as any, { params: resolvedParams });
  });
}


