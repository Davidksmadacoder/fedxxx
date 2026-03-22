import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
  getActivePaymentMethodsController,
} from "@/lib/controllers/paymentMethod.controller";

export async function GET(req: NextRequest) {
  return withDb(async () => {
    // Public endpoint - no authentication required for viewing active payment methods
    return getActivePaymentMethodsController(req as any);
  });
}



