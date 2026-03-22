import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import faqService from "@/lib/services/impl/faq.service.impl";
import { UpdateFAQDto } from "@/lib/dto/faq.dto";
import { validator } from "@/lib/utils/validator.utils";
import { Http } from "@/lib/utils/route.utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withDb(async () => {
    const { id } = await params;
    const faq = await faqService.getById(id);
    return Http.ok("FAQ retrieved", { faq });
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
    const dto = new UpdateFAQDto(await req.json());
    const errors = validator(UpdateFAQDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const faq = await faqService.update(id, dto);
    return Http.ok("FAQ updated", { faq });
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
    await faqService.delete(id);
    return Http.ok("FAQ deleted");
  });
}


