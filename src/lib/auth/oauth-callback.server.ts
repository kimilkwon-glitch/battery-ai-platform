import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { attachCustomerSessionCookie } from "@/lib/auth/member-api-helpers";
import type { MemberRecord } from "@/lib/auth/member-types";
import { buildCompleteProfileRedirectUrl } from "@/lib/customer-auth-redirect";
import { CUSTOMER_MYPAGE } from "@/lib/customer-auth-routes";
import { memberNeedsProfileComplete } from "@/lib/auth/social-oauth-login.server";

export function oauthLoginFailRedirect(
  request: NextRequest,
  errorCode: string,
): NextResponse {
  const login = new URL("/login", request.url);
  login.searchParams.set("error", errorCode);
  return NextResponse.redirect(login);
}

export async function oauthLoginSuccessRedirect(
  request: NextRequest,
  member: MemberRecord,
  returnPath?: string | null,
): Promise<NextResponse> {
  const safeReturn =
    returnPath?.startsWith("/") && !returnPath.startsWith("//") ? returnPath : CUSTOMER_MYPAGE;

  const destination = memberNeedsProfileComplete(member)
    ? buildCompleteProfileRedirectUrl(safeReturn)
    : safeReturn;

  const response = NextResponse.redirect(new URL(destination, request.url));
  await attachCustomerSessionCookie(response, member.id);
  return response;
}
