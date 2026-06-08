/**
 * OAuth authorize URL 생성 — provider별 start 라우트에서 사용
 */

import { getKakaoOAuthConfig } from "@/lib/auth/kakao-oauth";
import { getOAuthRedirectUri, type OAuthProvider } from "@/lib/auth/oauth-config";

export function buildNaverAuthorizeUrl(state: string): string | null {
  const clientId = process.env.NAVER_CLIENT_ID?.trim();
  if (!clientId) return null;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getOAuthRedirectUri("naver"),
    state,
  });
  return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
}

export function buildKakaoAuthorizeUrl(state: string): string | null {
  const config = getKakaoOAuthConfig();
  if (!config) return null;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state,
  });
  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}

export function buildGoogleAuthorizeUrl(state: string): string | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) return null;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getOAuthRedirectUri("google"),
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function buildOAuthAuthorizeUrl(provider: OAuthProvider, state: string): string | null {
  if (provider === "naver") return buildNaverAuthorizeUrl(state);
  if (provider === "kakao") return buildKakaoAuthorizeUrl(state);
  if (provider === "google") return buildGoogleAuthorizeUrl(state);
  return null;
}

export function oauthStateCookieName(provider: OAuthProvider): string {
  return `bm_oauth_state_${provider}`;
}
