import { NextRequest, NextResponse } from "next/server";
import { attachCustomerSessionCookie } from "@/lib/auth/member-api-helpers";
import { toMemberPublic } from "@/lib/auth/member-public";
import {
  GOOGLE_OAUTH_HANDOFF_COOKIE,
  type GoogleOAuthProfile,
} from "@/lib/auth/google-oauth";
import { upsertSocialOAuthMember } from "@/lib/auth/social-oauth-login.server";

const FAIL_MESSAGE = "구글 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.";

/** @deprecated callback에서 세션 발급 — 레거시 handoff 쿠키 호환용 */
export async function GET(request: NextRequest) {
  const raw = request.cookies.get(GOOGLE_OAUTH_HANDOFF_COOKIE)?.value;

  if (!raw) {
    return NextResponse.json({ ok: false as const, message: FAIL_MESSAGE });
  }

  let profile: GoogleOAuthProfile;
  try {
    profile = JSON.parse(raw) as GoogleOAuthProfile;
    if (!profile?.googleId || !profile?.name) throw new Error("invalid");
  } catch {
    const fail = NextResponse.json({ ok: false as const, message: FAIL_MESSAGE });
    fail.cookies.delete(GOOGLE_OAUTH_HANDOFF_COOKIE);
    return fail;
  }

  const member = await upsertSocialOAuthMember({
    provider: "google",
    providerId: profile.googleId,
    name: profile.name,
    email: profile.email ?? null,
  });

  if (!member) {
    const fail = NextResponse.json({ ok: false as const, message: FAIL_MESSAGE });
    fail.cookies.delete(GOOGLE_OAUTH_HANDOFF_COOKIE);
    return fail;
  }

  const response = NextResponse.json({
    ok: true as const,
    member: toMemberPublic(member),
  });
  response.cookies.delete(GOOGLE_OAUTH_HANDOFF_COOKIE);
  await attachCustomerSessionCookie(response, member.id);
  return response;
}
