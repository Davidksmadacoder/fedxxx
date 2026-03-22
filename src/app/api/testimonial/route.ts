import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import testimonialService from "@/lib/services/impl/testimonial.service.impl";
import { CreateTestimonialDto } from "@/lib/dto/testimonial.dto";
import { validator } from "@/lib/utils/validator.utils";
import { Http } from "@/lib/utils/route.utils";

export async function GET(req: NextRequest) {
  return withDb(async () => {
    const testimonials = await testimonialService.getAll();
    return Http.ok("Testimonials retrieved", { testimonials });
  });
}

export async function POST(req: NextRequest) {
  return withDb(async () => {
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    const dto = new CreateTestimonialDto(await req.json());
    const errors = validator(CreateTestimonialDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const testimonial = await testimonialService.create(dto);
    return Http.ok("Testimonial created", { testimonial });
  });
}
