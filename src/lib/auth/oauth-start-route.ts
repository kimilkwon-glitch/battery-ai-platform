import { NextRequest, NextResponse } from "next/server";
import { KAKAO_OAUTH_RETURN_COOKIE } from "@/lib/auth/kakao-oauth";
import {
  buildOAuthAuthorizeUrl,
  oauthStateCookieName,
} from "@/lib/auth/oauth-start";
import type { OAuthProvider } from "@/lib/auth/oauth-config";
import { enforceIpRateLimitOrNull } from "@/lib/security/rate-limit-guard.server";

const OAUTH_RETURN_COOKIE = "bm_oauth_return";

export async function handleOAuthStart(request: NextRequest, provider: OAuthProvider): Promise<NextResponse> {
  const blocked = await enforceIpRateLimitOrNull(
    request,
    `oauth.${provider}.start`,
    20,
    15 * 60 * 1000,
  );
  if (blocked) return blocked;

  const state = crypto.randomUUID();
  const authorizeUrl = buildOAuthAuthorizeUrl(provider, state);

  if (!authorizeUrl) {
    return NextResponse.json(
      { ok: false, message: "OAuth 설정이 완료되지 않았습니다." },
      { status: 503 },
    );
  }

  const redirect = request.nextUrl.searchParams.get("redirect")?.trim();
  const response = NextResponse.redirect(authorizeUrl);

  response.cookies.set(oauthStateCookieName(provider), state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    const returnCookieName = provider === "kakao" ? KAKAO_OAUTH_RETURN_COOKIE : OAUTH_RETURN_COOKIE;
    response.cookies.set(returnCookieName, redirect, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
  }

  return response;
}
