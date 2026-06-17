import { NextResponse } from "next/server";
import { MEMBER_AUTH_MESSAGES } from "@/lib/auth/member-auth-errors";
import { getMemberStore } from "@/lib/auth/member-store";
import { isMemberAuthReady, memberServiceUnavailable } from "@/lib/auth/member-api-helpers";
import { isValidLoginId } from "@/lib/auth/signup-validation";
import { enforceIpRateLimitOrNull } from "@/lib/security/rate-limit-guard.server";

export const dynamic = "force-dynamic";

const CHECK_RATE_LIMIT = 30;
const CHECK_RATE_WINDOW_MS = 15 * 60 * 1000;

export async function GET(request: Request) {
  if (!isMemberAuthReady()) {
    return memberServiceUnavailable();
  }

  const blocked = await enforceIpRateLimitOrNull(
    request,
    "auth.check_login_id",
    CHECK_RATE_LIMIT,
    CHECK_RATE_WINDOW_MS,
    MEMBER_AUTH_MESSAGES.serviceUnavailable,
  );
  if (blocked) return blocked;

  const loginId = new URL(request.url).searchParams.get("loginId")?.trim() ?? "";

  if (!isValidLoginId(loginId)) {
    return NextResponse.json({
      available: false,
      message: "아이디는 영문·숫자 4~20자로 입력해 주세요.",
    });
  }

  const store = await getMemberStore();
  const existing = await store.findMemberByLoginId(loginId);

  if (existing) {
    return NextResponse.json({
      available: false,
      message: MEMBER_AUTH_MESSAGES.loginIdTaken,
    });
  }

  return NextResponse.json({ available: true });
}
