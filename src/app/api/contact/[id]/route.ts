import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import contactService from "@/lib/services/impl/contact.service.impl";
import { UpdateContactDto } from "@/lib/dto/contact.dto";
import { validator } from "@/lib/utils/validator.utils";
import { Http } from "@/lib/utils/route.utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withDb(async () => {
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const contact = await contactService.getById(id);
    return Http.ok("Contact retrieved", { contact });
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
    const dto = new UpdateContactDto(await req.json());
    const errors = validator(UpdateContactDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const contact = await contactService.update(id, dto);
    return Http.ok("Contact updated", { contact });
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
    await contactService.delete(id);
    return Http.ok("Contact deleted");
  });
}


