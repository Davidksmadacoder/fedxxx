import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import projectService from "@/lib/services/impl/project.service.impl";
import { CreateProjectDto } from "@/lib/dto/project.dto";
import { validator } from "@/lib/utils/validator.utils";
import { Http } from "@/lib/utils/route.utils";

export async function GET(req: NextRequest) {
  return withDb(async () => {
    const projects = await projectService.getAll();
    return Http.ok("Projects retrieved", { projects });
  });
}

export async function POST(req: NextRequest) {
  return withDb(async () => {
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    const dto = new CreateProjectDto(await req.json());
    const errors = validator(CreateProjectDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const project = await projectService.create(dto);
    return Http.ok("Project created", { project });
  });
}
