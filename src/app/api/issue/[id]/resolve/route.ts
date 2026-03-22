import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
  resolveIssueController,
} from "@/lib/controllers/issue.controller";

async function handleResolve(
  req: NextRequest,
  params: Promise<{ id: string }>
) {
  return withDb(async () => {
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    const resolvedParams = await params;
    return resolveIssueController(req as any, { params: resolvedParams });
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleResolve(req, params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleResolve(req, params);
}


