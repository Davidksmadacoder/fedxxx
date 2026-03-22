import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
  getPaymentsByParcelIdController,
} from "@/lib/controllers/payment.controller";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parcelId: string }> }
) {
  return withDb(async () => {
    const auth = await withAuth(req);
    if (auth instanceof NextResponse) return auth;
    const resolvedParams = await params;
    return getPaymentsByParcelIdController(req as any, { params: resolvedParams });
  });
}



