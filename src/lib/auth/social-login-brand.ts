/**
 * 소셜 로그인 버튼 — 공식 브랜드 가이드 색상·라벨·애셋 경로
 */

import type { AuthProvider } from "@/lib/customer-profile-storage";
import type { OAuthProvider } from "@/lib/auth/oauth-config";

export type SocialLoginProvider = Extract<AuthProvider, OAuthProvider>;

export const SOCIAL_LOGIN_BRAND = {
  naver: {
    label: "네이버로 계속하기",
    backgroundColor: "#03A94D",
    textColor: "#FFFFFF",
    iconSrc: "/assets/social-login/naver/naver-n.svg",
    iconAlt: "네이버",
    iconSize: 20,
  },
  kakao: {
    label: "카카오로 계속하기",
    backgroundColor: "#FEE500",
    textColor: "#191919",
    iconSrc: "/assets/social-login/kakao/kakao-symbol.svg",
    iconAlt: "카카오",
    iconSize: 20,
  },
  google: {
    label: "구글로 계속하기",
    backgroundColor: "#FFFFFF",
    textColor: "#1F2937",
    borderColor: "#D1D5DB",
    iconSrc: "/assets/social-login/google/google-g.svg",
    iconAlt: "Google",
    iconSize: 20,
  },
} as const satisfies Record<
  SocialLoginProvider,
  {
    label: string;
    backgroundColor: string;
    textColor: string;
    iconSrc: string;
    iconAlt: string;
    iconSize: number;
    borderColor?: string;
  }
>;

export function getSocialLoginBrand(provider: SocialLoginProvider) {
  return SOCIAL_LOGIN_BRAND[provider];
}

export function getOAuthStartPath(provider: SocialLoginProvider, redirect?: string | null): string {
  const base = `/api/auth/${provider}/start`;
  const trimmed = redirect?.trim();
  if (!trimmed) return base;
  return `${base}?redirect=${encodeURIComponent(trimmed)}`;
}
