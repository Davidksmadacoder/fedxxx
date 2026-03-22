import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
  markPaymentAsPaidController,
  markPaymentAsUnpaidController,
} from "@/lib/controllers/payment.controller";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withDb(async () => {
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    const resolvedParams = await params;
    return markPaymentAsPaidController(req as any, { params: resolvedParams });
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
    return markPaymentAsUnpaidController(req as any, { params: resolvedParams });
  });
}


