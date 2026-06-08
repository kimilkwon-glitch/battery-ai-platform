import { NextRequest, NextResponse } from "next/server";
import { getOAuthRedirectUri } from "@/lib/auth/oauth-config";

/**
 * 네이버 로그인 callback — URL 등록·리다이렉트 수신 준비
 * 토큰 교환·회원 연동은 추후 구현
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (process.env.NODE_ENV !== "production" && request.nextUrl.searchParams.get("debug") === "1") {
    return NextResponse.json({
      provider: "naver",
      redirectUri: getOAuthRedirectUri("naver"),
      code: code ? "present" : null,
      error,
    });
  }

  const login = new URL("/login", request.url);
  if (error || !code) {
    login.searchParams.set("error", "naver_login_cancelled");
    return NextResponse.redirect(login);
  }

  login.searchParams.set("oauth", "naver_pending");
  return NextResponse.redirect(login);
}
