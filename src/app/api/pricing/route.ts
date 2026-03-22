import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withDb, withAuth } from "@/lib/utils/route.utils";
import {
  getAllPricingController,
  createPricingController,
  getActivePricingController,
  calculatePriceController,
} from "@/lib/controllers/pricing.controller";

export async function GET(req: NextRequest) {
  return withDb(async () => {
    const auth = await withAuth(req);
    if (auth instanceof NextResponse) return auth;
    const { searchParams } = new URL(req.url);
    const active = searchParams.get('active');
    if (active === 'true') {
      return getActivePricingController(req as any);
    }
    return getAllPricingController(req as any);
  });
}

export async function POST(req: NextRequest) {
  return withDb(async () => {
    const { searchParams } = new URL(req.url);
    const calculate = searchParams.get('calculate');
    if (calculate === 'true') {
      const auth = await withAuth(req);
      if (auth instanceof NextResponse) return auth;
      return calculatePriceController(req as any);
    }
    const auth = await withAuth(req, true);
    if (auth instanceof NextResponse) return auth;
    return createPricingController(req as any);
  });
}

