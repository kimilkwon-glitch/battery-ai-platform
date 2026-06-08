import { NextRequest, NextResponse } from "next/server";
import { getOAuthRedirectUri } from "@/lib/auth/oauth-config";

/** 구글 로그인 callback — URL 등록 준비 (토큰 교환 추후 구현) */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (process.env.NODE_ENV !== "production" && request.nextUrl.searchParams.get("debug") === "1") {
    return NextResponse.json({
      provider: "google",
      redirectUri: getOAuthRedirectUri("google"),
      code: code ? "present" : null,
      error,
    });
  }

  const login = new URL("/login", request.url);
  if (error || !code) {
    login.searchParams.set("error", "google_login_cancelled");
    return NextResponse.redirect(login);
  }

  login.searchParams.set("oauth", "google_pending");
  return NextResponse.redirect(login);
}
