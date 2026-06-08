import { NextRequest, NextResponse } from "next/server";
import { getOAuthRedirectUri } from "@/lib/auth/oauth-config";
import {
  oauthLoginFailRedirect,
  oauthLoginSuccessRedirect,
} from "@/lib/auth/oauth-callback.server";
import {
  exchangeNaverAuthorizationCode,
  fetchNaverUserProfile,
  NAVER_OAUTH_RETURN_COOKIE,
} from "@/lib/auth/naver-oauth";
import { oauthStateCookieName } from "@/lib/auth/oauth-start";
import { upsertSocialOAuthMember } from "@/lib/auth/social-oauth-login.server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const state = request.nextUrl.searchParams.get("state");

  if (process.env.NODE_ENV !== "production" && request.nextUrl.searchParams.get("debug") === "1") {
    return NextResponse.json({
      provider: "naver",
      redirectUri: getOAuthRedirectUri("naver"),
      code: code ? "present" : null,
      error,
    });
  }

  if (error || !code || !state) {
    return oauthLoginFailRedirect(request, "naver_login_cancelled");
  }

  const expectedState = request.cookies.get(oauthStateCookieName("naver"))?.value;
  if (!expectedState || expectedState !== state) {
    return oauthLoginFailRedirect(request, "naver_login_invalid_state");
  }

  const tokenResult = await exchangeNaverAuthorizationCode(code, state);
  if (!tokenResult) {
    return oauthLoginFailRedirect(request, "naver_login_failed");
  }

  const profile = await fetchNaverUserProfile(tokenResult.accessToken);
  if (!profile) {
    return oauthLoginFailRedirect(request, "naver_login_failed");
  }

  const member = await upsertSocialOAuthMember({
    provider: "naver",
    providerId: profile.naverId,
    name: profile.name,
    email: profile.email ?? null,
  });

  if (!member) {
    return oauthLoginFailRedirect(request, "naver_login_failed");
  }

  const returnPath = request.cookies.get(NAVER_OAUTH_RETURN_COOKIE)?.value;
  const response = await oauthLoginSuccessRedirect(request, member, returnPath);
  response.cookies.delete(oauthStateCookieName("naver"));
  response.cookies.delete(NAVER_OAUTH_RETURN_COOKIE);
  return response;
}
