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
import { getMemberStore } from "@/lib/auth/member-store";

export function memberServiceUnavailable(): NextResponse {
  return NextResponse.json(
    { ok: false, message: MEMBER_AUTH_MESSAGES.serviceUnavailable },
    { status: 503 },
  );
}

export function isMemberAuthReady(): boolean {
  return isMemberStoreConfigured() && isCustomerAuthConfigured();
}

export type AttachCustomerSessionOptions = {
  /** 로그인·OAuth 성공 시 세션 ID 회전(session_epoch bump) */
  rotate?: boolean;
};

export async function attachCustomerSessionCookie(
  response: NextResponse,
  userId: string,
  options?: AttachCustomerSessionOptions,
): Promise<NextResponse> {
  let sessionEpoch = 0;
  try {
    const store = await getMemberStore();
    if (options?.rotate) {
      await store.bumpMemberSessionEpoch(userId);
    }
    const member = await store.findMemberById(userId);
    sessionEpoch = member?.sessionEpoch ?? 0;
  } catch {
    sessionEpoch = 0;
  }
  const token = await mintCustomerSessionToken(userId, sessionEpoch);
  response.cookies.set(CUSTOMER_SESSION_COOKIE, token, customerSessionCookieOptions());
  return response;
}

export function clearCustomerSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", {
    ...customerSessionCookieOptions(0),
    maxAge: 0,
  });
  return response;
}
