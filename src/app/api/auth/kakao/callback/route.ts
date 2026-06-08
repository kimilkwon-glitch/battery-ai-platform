import { NextRequest } from "next/server";
import {
  oauthLoginFailRedirect,
  oauthLoginSuccessRedirect,
} from "@/lib/auth/oauth-callback.server";
import { oauthStateCookieName } from "@/lib/auth/oauth-start";
import {
  exchangeKakaoAuthorizationCode,
  fetchKakaoUserProfile,
  KAKAO_OAUTH_RETURN_COOKIE,
} from "@/lib/auth/kakao-oauth";
import { upsertSocialOAuthMember } from "@/lib/auth/social-oauth-login.server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const state = request.nextUrl.searchParams.get("state");

  if (error || !code) {
    return oauthLoginFailRedirect(request, "kakao_login_cancelled");
  }

  const expectedState = request.cookies.get(oauthStateCookieName("kakao"))?.value;
  if (!expectedState || !state || expectedState !== state) {
    return oauthLoginFailRedirect(request, "kakao_login_invalid_state");
  }

  const tokenResult = await exchangeKakaoAuthorizationCode(code);
  if (!tokenResult) {
    return oauthLoginFailRedirect(request, "kakao_login_failed");
  }

  const profile = await fetchKakaoUserProfile(tokenResult.accessToken);
  if (!profile) {
    return oauthLoginFailRedirect(request, "kakao_login_failed");
  }

  const member = await upsertSocialOAuthMember({
    provider: "kakao",
    providerId: profile.kakaoId,
    name: profile.name,
    email: profile.email ?? null,
  });

  if (!member) {
    return oauthLoginFailRedirect(request, "kakao_login_failed");
  }

  const returnPath = request.cookies.get(KAKAO_OAUTH_RETURN_COOKIE)?.value;
  const response = await oauthLoginSuccessRedirect(request, member, returnPath);
  response.cookies.delete(oauthStateCookieName("kakao"));
  response.cookies.delete(KAKAO_OAUTH_RETURN_COOKIE);
  return response;
}
