import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb } from "@/lib/utils/route.utils";
import projectService from "@/lib/services/impl/project.service.impl";
import { Http } from "@/lib/utils/route.utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withDb(async () => {
    const { slug } = await params;
    const project = await projectService.getBySlug(slug);
    return Http.ok("Project retrieved", { project });
  });
}


