import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import testimonialService from "@/lib/services/impl/testimonial.service.impl";
import { UpdateTestimonialDto } from "@/lib/dto/testimonial.dto";
import { validator } from "@/lib/utils/validator.utils";
import { Http } from "@/lib/utils/route.utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withDb(async () => {
    // Public endpoint - no authentication required for viewing testimonial details
    const { id } = await params;
    const testimonial = await testimonialService.getById(id);
    return Http.ok("Testimonial retrieved", { testimonial });
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
    const dto = new UpdateTestimonialDto(await req.json());
    const errors = validator(UpdateTestimonialDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const testimonial = await testimonialService.update(id, dto);
    return Http.ok("Testimonial updated", { testimonial });
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
    await testimonialService.delete(id);
    return Http.ok("Testimonial deleted");
  });
}


