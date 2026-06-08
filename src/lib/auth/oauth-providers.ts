import "server-only";

import { getGoogleOAuthConfig } from "@/lib/auth/google-oauth";
import { getKakaoOAuthConfig } from "@/lib/auth/kakao-oauth";
import { isNaverOAuthConfigured } from "@/lib/auth/naver-oauth";
import { OAUTH_DEFAULT_REDIRECT_URIS, type OAuthProvider } from "@/lib/auth/oauth-config";

/**
 * OAuth provider 활성화 — 서버 env 전용 (*_CLIENT_SECRET 은 이 파일·oauth 모듈에서만 읽음)
 *
 * Production callback (등록값과 일치해야 함):
 * - naver:  https://www.batterymanager.co.kr/api/auth/naver/callback
 * - kakao:  KAKAO_REDIRECT_URI 또는 동일 경로
 * - google: GOOGLE_REDIRECT_URI 또는 production 자동 생성
 *
 * 점검: GET /api/auth/providers → { naver, kakao, google: true }
 */

export type OAuthProviderAvailability = Record<OAuthProvider, boolean>;

export function getOAuthProviderAvailability(): OAuthProviderAvailability {
  return {
    naver: isNaverOAuthConfigured(),
    kakao: getKakaoOAuthConfig() != null,
    google: getGoogleOAuthConfig() != null,
  };
}

/** 운영 배포 검수용 — 등록 callback URL 참고값 */
export function getOAuthRedirectUriReference(): Record<OAuthProvider, string> {
  const kakao = getKakaoOAuthConfig();
  const google = getGoogleOAuthConfig();
  return {
    naver: OAUTH_DEFAULT_REDIRECT_URIS.naver,
    kakao: kakao?.redirectUri ?? OAUTH_DEFAULT_REDIRECT_URIS.kakao,
    google: google?.redirectUri ?? OAUTH_DEFAULT_REDIRECT_URIS.google,
  };
}
