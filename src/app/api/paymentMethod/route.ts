import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
  getAllPaymentMethodsController,
  createPaymentMethodController,
} from "@/lib/controllers/paymentMethod.controller";

export async function GET(req: NextRequest) {
  return withDb(async () => {
    const auth = await withAuth(req);
    if (auth instanceof NextResponse) return auth;
    return getAllPaymentMethodsController(req as any);
  });
}

export async function POST(req: NextRequest) {
  return withDb(async () => {
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    return createPaymentMethodController(req as any);
  });
}







