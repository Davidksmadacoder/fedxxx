import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
  getAllPaymentsController,
  createPaymentController,
} from "@/lib/controllers/payment.controller";

export async function GET(req: NextRequest) {
  return withDb(async () => {
    const auth = await withAuth(req);
    if (auth instanceof NextResponse) return auth;
    return getAllPaymentsController(req as any);
  });
}

export async function POST(req: NextRequest) {
  return withDb(async () => {
    const auth = await withAuth(req);
    if (auth instanceof NextResponse) return auth;
    return createPaymentController(req as any);
  });
}







