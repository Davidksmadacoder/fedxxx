import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import { updatePaymentStatusController } from "@/lib/controllers/issue.controller";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withDb(async () => {
    // Admin-only endpoint - requires authentication
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    const resolvedParams = await params;
    return updatePaymentStatusController(req as any, { params: resolvedParams });
  });
}

