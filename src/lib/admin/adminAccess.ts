import "server-only";

import { timingSafeEqual } from "node:crypto";

const DEV_FALLBACK = "battery-manager-admin";

/**
 * 서버 전용 관리자 비밀키 (ADMIN_ACCESS_KEY)
 * NEXT_PUBLIC_* 사용 금지 — 클라이언트 번들에 노출되지 않음.
 */
export function getAdminAccessSecret(): string {
  const fromEnv = process.env.ADMIN_ACCESS_KEY?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") {
    return "";
  }
  return DEV_FALLBACK;
}

export function isAdminAccessConfigured(): boolean {
  return getAdminAccessSecret().length > 0;
}

export function verifyAccessKeyInput(key: string | undefined | null): boolean {
  const secret = getAdminAccessSecret();
  if (!secret || !key?.trim()) return false;
  const a = Buffer.from(key.trim());
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
