import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import contactService from "@/lib/services/impl/contact.service.impl";
import { CreateContactDto, UpdateContactDto } from "@/lib/dto/contact.dto";
import { validator } from "@/lib/utils/validator.utils";
import { Http } from "@/lib/utils/route.utils";

export async function GET(req: NextRequest) {
  return withDb(async () => {
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    const contacts = await contactService.getAll();
    return Http.ok("Contacts retrieved", { contacts });
  });
}

export async function POST(req: NextRequest) {
  return withDb(async () => {
    const dto = new CreateContactDto(await req.json());
    const errors = validator(CreateContactDto, dto);
    if (errors) return Http.badRequest(errors.details);
    const contact = await contactService.create(dto);
    return NextResponse.json({ message: "Contact submitted", contact }, { status: 201 });
  });
}







