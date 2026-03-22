import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import faqService from "@/lib/services/impl/faq.service.impl";
import { CreateFAQDto } from "@/lib/dto/faq.dto";
import { validator } from "@/lib/utils/validator.utils";
import { Http } from "@/lib/utils/route.utils";

export async function GET(req: NextRequest) {
  return withDb(async () => {
    const faqs = await faqService.getAll();
    return Http.ok("FAQs retrieved", { faqs });
  });
}

export async function POST(req: NextRequest) {
  return withDb(async () => {
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    const dto = new CreateFAQDto(await req.json());
    const errors = validator(CreateFAQDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const faq = await faqService.create(dto);
    return Http.ok("FAQ created", { faq });
  });
}
