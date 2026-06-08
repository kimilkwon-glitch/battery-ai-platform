import "server-only";

import { NextResponse } from "next/server";
import { isCustomerAuthConfigured } from "@/lib/auth/member-credentials";
import { isMemberStoreConfigured } from "@/lib/auth/member-store";
import { MEMBER_AUTH_MESSAGES } from "@/lib/auth/member-auth-errors";
import {
  CUSTOMER_SESSION_COOKIE,
  customerSessionCookieOptions,
  mintCustomerSessionToken,
} from "@/lib/auth/customer-session.server";

export function memberServiceUnavailable(): NextResponse {
  return NextResponse.json(
    { ok: false, message: MEMBER_AUTH_MESSAGES.serviceUnavailable },
    { status: 503 },
  );
}

export function isMemberAuthReady(): boolean {
  return isMemberStoreConfigured() && isCustomerAuthConfigured();
}

export async function attachCustomerSessionCookie(
  response: NextResponse,
  userId: string,
): Promise<NextResponse> {
  const token = await mintCustomerSessionToken(userId);
  response.cookies.set(CUSTOMER_SESSION_COOKIE, token, customerSessionCookieOptions());
  return response;
}
