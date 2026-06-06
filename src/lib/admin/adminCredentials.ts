/**
 * 관리자 인증 환경변수 — Edge(middleware) / Node 공통
 * 비밀번호 검증(scrypt)은 adminPassword.server.ts (Node 전용)
 */

const DEV_USERNAME = "admin";
const DEV_SESSION_FALLBACK = "battery-manager-dev-session-secret";

/** 세션 HMAC 서명용 — ADMIN_SESSION_SECRET 권장 */
export function getAdminSessionSecret(): string {
  const fromEnv = process.env.ADMIN_SESSION_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return "";
  return DEV_SESSION_FALLBACK;
}

export function getAdminUsername(): string {
  const fromEnv = process.env.ADMIN_USERNAME?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return DEV_USERNAME;
  return "";
}

/** scrypt 해시(ADMIN_PASSWORD_HASH) 또는 평문(ADMIN_PASSWORD) — 서버 env만 */
export function getAdminPasswordStored(): string {
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (hash) return hash;
  const plain = process.env.ADMIN_PASSWORD?.trim();
  if (plain) return plain;
  return "";
}

export function isAdminAuthConfigured(): boolean {
  return (
    getAdminSessionSecret().length > 0 &&
    getAdminUsername().length > 0 &&
    getAdminPasswordStored().length > 0
  );
}

/** CI·서버 스크립트용 x-admin-key (ADMIN_API_KEY 또는 ADMIN_PASSWORD) */
export function verifyAdminApiKeyInput(key: string | undefined | null): boolean {
  const trimmed = key?.trim();
  if (!trimmed) return false;
  const apiKey = process.env.ADMIN_API_KEY?.trim();
  if (apiKey) return timingSafeEqualUtf8(trimmed, apiKey);
  const password = getAdminPasswordStored();
  if (!password || password.startsWith("scrypt:")) return false;
  return timingSafeEqualUtf8(trimmed, password);
}

export function timingSafeEqualUtf8(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export function verifyAdminUsernameInput(username: string | undefined | null): boolean {
  const expected = getAdminUsername();
  if (!expected || !username?.trim()) return false;
  return timingSafeEqualUtf8(username.trim(), expected);
}
