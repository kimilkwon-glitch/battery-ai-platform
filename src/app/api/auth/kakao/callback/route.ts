import { NextRequest, NextResponse } from "next/server";
import { oauthStateCookieName } from "@/lib/auth/oauth-start";
import {
  exchangeKakaoAuthorizationCode,
  fetchKakaoUserProfile,
  KAKAO_OAUTH_HANDOFF_COOKIE,
  KAKAO_OAUTH_RETURN_COOKIE,
} from "@/lib/auth/kakao-oauth";

function loginRedirect(request: NextRequest, error?: string): NextResponse {
  const login = new URL("/login", request.url);
  if (error) login.searchParams.set("error", error);
  return NextResponse.redirect(login);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const state = request.nextUrl.searchParams.get("state");

  if (error || !code) {
    return loginRedirect(request, "kakao_login_cancelled");
  }

  const expectedState = request.cookies.get(oauthStateCookieName("kakao"))?.value;
  if (!expectedState || !state || expectedState !== state) {
    return loginRedirect(request, "kakao_login_invalid_state");
  }

  const tokenResult = await exchangeKakaoAuthorizationCode(code);
  if (!tokenResult) {
    return loginRedirect(request, "kakao_login_failed");
  }

  const profile = await fetchKakaoUserProfile(tokenResult.accessToken);
  if (!profile) {
    return loginRedirect(request, "kakao_login_failed");
  }

  const returnPath = request.cookies.get(KAKAO_OAUTH_RETURN_COOKIE)?.value;
  const login = new URL("/login", request.url);
  login.searchParams.set("oauth_handoff", "kakao");
  if (returnPath?.startsWith("/") && !returnPath.startsWith("//")) {
    login.searchParams.set("redirect", returnPath);
  }

  const response = NextResponse.redirect(login);
  response.cookies.set(KAKAO_OAUTH_HANDOFF_COOKIE, JSON.stringify(profile), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 120,
    path: "/",
  });
  response.cookies.delete(oauthStateCookieName("kakao"));
  response.cookies.delete(KAKAO_OAUTH_RETURN_COOKIE);

  return response;
}
