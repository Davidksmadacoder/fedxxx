import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
  getServiceBySlugController,
} from "@/lib/controllers/service.controller";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withDb(async () => {
    const resolvedParams = await params;
    return getServiceBySlugController(req as any, { params: resolvedParams });
  });
}







