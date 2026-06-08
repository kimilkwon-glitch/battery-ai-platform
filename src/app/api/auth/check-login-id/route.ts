import { NextResponse } from "next/server";
import { MEMBER_AUTH_MESSAGES } from "@/lib/auth/member-auth-errors";
import { getMemberStore } from "@/lib/auth/member-store";
import { isMemberAuthReady, memberServiceUnavailable } from "@/lib/auth/member-api-helpers";
import { isValidLoginId } from "@/lib/auth/signup-validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isMemberAuthReady()) {
    return memberServiceUnavailable();
  }

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
