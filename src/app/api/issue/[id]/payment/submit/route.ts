import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb } from "@/lib/utils/route.utils";
import { submitPaymentController } from "@/lib/controllers/issue.controller";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withDb(async () => {
    // Public endpoint - customer can submit payment
    const resolvedParams = await params;
    return submitPaymentController(req, { params: resolvedParams });
  });
}

