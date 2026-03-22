import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
  toggleIssueVisibilityController,
} from "@/lib/controllers/issue.controller";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withDb(async () => {
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    const resolvedParams = await params;
    return toggleIssueVisibilityController(req as any, { params: resolvedParams });
  });
}


