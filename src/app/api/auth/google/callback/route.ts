import { NextRequest } from "next/server";
import {
  oauthCallbackRateLimitOrRedirect,
  oauthLoginFailRedirect,
  oauthLoginSuccessRedirect,
} from "@/lib/auth/oauth-callback.server";
import {
  exchangeGoogleAuthorizationCode,
  fetchGoogleUserProfile,
  OAUTH_RETURN_COOKIE,
} from "@/lib/auth/google-oauth";
import { oauthStateCookieName } from "@/lib/auth/oauth-start";
import { upsertSocialOAuthMember } from "@/lib/auth/social-oauth-login.server";

export async function GET(request: NextRequest) {
  const rateRedirect = await oauthCallbackRateLimitOrRedirect(request, "google");
  if (rateRedirect) return rateRedirect;

  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const state = request.nextUrl.searchParams.get("state");

  if (error || !code) {
    return oauthLoginFailRedirect(request, "google_login_cancelled");
  }

  const expectedState = request.cookies.get(oauthStateCookieName("google"))?.value;
  if (!expectedState || !state || expectedState !== state) {
    return oauthLoginFailRedirect(request, "google_login_invalid_state");
  }

  const tokenResult = await exchangeGoogleAuthorizationCode(code);
  if (!tokenResult) {
    return oauthLoginFailRedirect(request, "google_login_failed");
  }

  const profile = await fetchGoogleUserProfile(tokenResult.accessToken);
  if (!profile) {
    return oauthLoginFailRedirect(request, "google_login_failed");
  }

  const member = await upsertSocialOAuthMember({
    provider: "google",
    providerId: profile.googleId,
    name: profile.name,
    email: profile.email ?? null,
  });

  if (!member) {
    return oauthLoginFailRedirect(request, "google_login_failed");
  }

  const returnPath = request.cookies.get(OAUTH_RETURN_COOKIE)?.value;
  const response = await oauthLoginSuccessRedirect(request, member, returnPath);
  response.cookies.delete(oauthStateCookieName("google"));
  response.cookies.delete(OAUTH_RETURN_COOKIE);
  return response;
}
