/**
 * 소셜 로그인 OAuth redirect URI — 네이버·카카오·구글 개발자 콘솔 등록용
 */

import { absoluteUrl, getSiteOrigin, PRODUCTION_SITE_ORIGIN } from "@/lib/site-url";

export type OAuthProvider = "naver" | "kakao" | "google";

const DEFAULT_CALLBACK_PATH: Record<OAuthProvider, string> = {
  naver: "/api/auth/naver/callback",
  kakao: "/api/auth/kakao/callback",
  google: "/api/auth/google/callback",
};

const ENV_KEY: Record<OAuthProvider, string> = {
  naver: "NAVER_REDIRECT_URI",
  kakao: "KAKAO_REDIRECT_URI",
  google: "GOOGLE_REDIRECT_URI",
};

/** 운영 기본 callback URL (환경변수 미설정 시) */
export const OAUTH_DEFAULT_REDIRECT_URIS: Record<OAuthProvider, string> = {
  naver: `${PRODUCTION_SITE_ORIGIN}/api/auth/naver/callback`,
  kakao: `${PRODUCTION_SITE_ORIGIN}/api/auth/kakao/callback`,
  google: `${PRODUCTION_SITE_ORIGIN}/api/auth/google/callback`,
};

export function getOAuthRedirectUri(provider: OAuthProvider): string {
  const fromEnv = process.env[ENV_KEY[provider]]?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (provider === "kakao") return "";
  return absoluteUrl(DEFAULT_CALLBACK_PATH[provider]);
}

export function getOAuthCallbackPath(provider: OAuthProvider): string {
  return DEFAULT_CALLBACK_PATH[provider];
}

/** 등록된 redirect URI가 현재 사이트 origin과 일치하는지 (배포 검수용) */
export function isOAuthRedirectUriAligned(provider: OAuthProvider): boolean {
  const uri = getOAuthRedirectUri(provider);
  const origin = getSiteOrigin();
  return uri.startsWith(origin);
}
