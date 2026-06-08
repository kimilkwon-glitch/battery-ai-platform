import { NextRequest, NextResponse } from "next/server";
import {
  KAKAO_OAUTH_HANDOFF_COOKIE,
  type KakaoOAuthProfile,
} from "@/lib/auth/kakao-oauth";

export async function GET(request: NextRequest) {
  const raw = request.cookies.get(KAKAO_OAUTH_HANDOFF_COOKIE)?.value;
  const response = NextResponse.json({ ok: false as const, message: "카카오 로그인 정보가 없습니다." });

  if (!raw) {
    return response;
  }

  let profile: KakaoOAuthProfile;
  try {
    profile = JSON.parse(raw) as KakaoOAuthProfile;
    if (!profile?.kakaoId || !profile?.name) throw new Error("invalid");
  } catch {
    response.cookies.delete(KAKAO_OAUTH_HANDOFF_COOKIE);
    return NextResponse.json({ ok: false as const, message: "카카오 로그인 정보가 올바르지 않습니다." });
  }

  const ok = NextResponse.json({
    ok: true as const,
    profile: {
      userId: `bm-user-kakao-${profile.kakaoId}`,
      name: profile.name,
      email: profile.email,
      provider: "kakao" as const,
    },
  });
  ok.cookies.delete(KAKAO_OAUTH_HANDOFF_COOKIE);
  return ok;
}
