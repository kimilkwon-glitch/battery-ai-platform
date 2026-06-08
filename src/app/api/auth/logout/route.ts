import { NextResponse } from "next/server";
import {
  CUSTOMER_SESSION_COOKIE,
  customerSessionCookieOptions,
} from "@/lib/auth/customer-session.server";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", {
    ...customerSessionCookieOptions(0),
    maxAge: 0,
  });
  return response;
}
