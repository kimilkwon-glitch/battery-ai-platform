/**
 * 사이트 대표 URL — metadata, canonical, sitemap, PG redirect, OAuth callback 단일 소스
 */

/** 운영 대표 도메인 (www) */
export const PRODUCTION_SITE_ORIGIN = "https://www.batterymanager.co.kr";

/** 루트 도메인 — www로 리다이렉트 대상 */
export const ROOT_DOMAIN = "batterymanager.co.kr";

const SITE_URL_ENV_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "AUTH_URL",
  "APP_URL",
] as const;

function firstEnvOrigin(): string | null {
  for (const key of SITE_URL_ENV_KEYS) {
    const value = process.env[key]?.trim();
    if (value) return value.replace(/\/$/, "");
  }
  return null;
}

/** 절대 URL이 필요할 때 (결제 redirect, sitemap, metadataBase 등) */
export function getSiteOrigin(): string {
  const fromEnv = firstEnvOrigin();
  if (fromEnv) return fromEnv;

  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_SITE_ORIGIN;
  }

  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

/** pathname → 절대 URL (내부 링크는 상대경로 우선, 외부·PG·메타에만 사용) */
export function absoluteUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getSiteOrigin()}${path}`;
}
