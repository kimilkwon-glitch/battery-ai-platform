/**
 * @deprecated 버튼 노출은 /api/auth/providers + SocialLoginButtons 가 서버 OAuth 설정으로 판단합니다.
 * NEXT_PUBLIC_* 플래그는 개발 환경 mismatch 경고용으로만 참고합니다.
 */

import type { AuthProvider } from "@/lib/customer-profile-storage";

export function isNaverLoginEnabled(): boolean {
  return process.env.NEXT_PUBLIC_NAVER_LOGIN_ENABLED === "true";
}

export function isKakaoLoginEnabled(): boolean {
  return process.env.NEXT_PUBLIC_KAKAO_LOGIN_ENABLED === "true";
}

export function isGoogleLoginEnabled(): boolean {
  return process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED === "true";
}

export function isSocialProviderEnabled(provider: AuthProvider): boolean {
  if (provider === "naver") return isNaverLoginEnabled();
  if (provider === "kakao") return isKakaoLoginEnabled();
  if (provider === "google") return isGoogleLoginEnabled();
  return false;
}

export function hasAnySocialLoginEnabled(): boolean {
  return isNaverLoginEnabled() || isKakaoLoginEnabled() || isGoogleLoginEnabled();
}
