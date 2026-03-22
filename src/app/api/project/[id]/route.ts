import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import projectService from "@/lib/services/impl/project.service.impl";
import { UpdateProjectDto } from "@/lib/dto/project.dto";
import { validator } from "@/lib/utils/validator.utils";
import { Http } from "@/lib/utils/route.utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withDb(async () => {
    const { id } = await params;
    return projectService.getById(id).then(project => 
      Http.ok("Project retrieved", { project })
    );
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withDb(async () => {
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const dto = new UpdateProjectDto(await req.json());
    const errors = validator(UpdateProjectDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const project = await projectService.update(id, dto);
    return Http.ok("Project updated", { project });
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withDb(async () => {
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    await projectService.delete(id);
    return Http.ok("Project deleted");
  });
}


