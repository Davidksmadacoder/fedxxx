import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
  getIssuesByParcelIdController,
} from "@/lib/controllers/issue.controller";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ parcelId: string }> }
) {
  return withDb(async () => {
    // Public endpoint - no authentication required
    const resolvedParams = await params;
    return getIssuesByParcelIdController(req, { params: resolvedParams });
  });
}







