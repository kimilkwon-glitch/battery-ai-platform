/**
 * 소셜 로그인 노출 설정 — OAuth 연동 완료 전까지 버튼 숨김
 * 클라이언트 노출: NEXT_PUBLIC_* 환경변수 필요
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
