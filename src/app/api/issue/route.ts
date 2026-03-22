import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
  getAllIssuesController,
  createIssueController,
} from "@/lib/controllers/issue.controller";

export async function GET(req: NextRequest) {
  return withDb(async () => {
    const auth = await withAuth(req);
    if (auth instanceof NextResponse) return auth;
    return getAllIssuesController(req as any);
  });
}

export async function POST(req: NextRequest) {
  return withDb(async () => {
    const auth = await withAuth(req);
    if (auth instanceof NextResponse) return auth;
    return createIssueController(req as any);
  });
}







