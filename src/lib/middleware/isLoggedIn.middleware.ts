import { NextRequest, NextResponse } from "next/server";
import { extractTokenFromRequest, verifyToken } from "../utils/token.utils";
import { CustomError } from "../utils/customError.utils";
import type { JwtPayload } from "../utils/types.utils";

// Extend NextRequest to include user property
export interface AuthRequest extends NextRequest {
  user?: JwtPayload;
}

/**
 * Auth gate with optional admin enforcement.
 * - Success: attaches req.user and returns NextResponse.next()
 * - Unauthorized: 401
 * - Forbidden (when isAdmin && role !== ADMIN): 403
 */
export async function isLoggedIn(req: NextRequest, isAdmin: boolean = false) {
  try {
    const token = extractTokenFromRequest(req);
    const decodedUser = verifyToken(token) as JwtPayload;

    // Check admin role if required
    if (isAdmin && decodedUser.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Attach user to request for downstream use
    (req as AuthRequest).user = decodedUser;

    // Keep success behavior identical so existing callers don't break
    return NextResponse.next();
  } catch (error) {
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
