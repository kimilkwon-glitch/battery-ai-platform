import { NextRequest, NextResponse } from "next/server";
import {
  buildOAuthAuthorizeUrl,
  oauthStateCookieName,
} from "@/lib/auth/oauth-start";
import type { OAuthProvider } from "@/lib/auth/oauth-config";

const OAUTH_RETURN_COOKIE = "bm_oauth_return";

export function handleOAuthStart(request: NextRequest, provider: OAuthProvider): NextResponse {
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
    response.cookies.set(OAUTH_RETURN_COOKIE, redirect, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
  }

  return response;
}
