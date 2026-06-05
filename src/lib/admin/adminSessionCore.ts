/**
 * 관리자 세션 — Edge(middleware) / Node(API) 공통 (Web Crypto)
 * 세션 서명은 ADMIN_SESSION_SECRET(서버 env). 클라이언트 번들에 포함하지 않음.
 */

export const ADMIN_SESSION_COOKIE = "bm_admin_session" as const;
export const ADMIN_SESSION_MAX_AGE_SEC = 8 * 60 * 60;

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 =
    typeof btoa !== "undefined"
      ? btoa(binary)
      : Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSha256Base64Url(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const raw = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return base64UrlEncode(new Uint8Array(raw));
}

export async function createSessionToken(secret: string): Promise<string> {
  const exp = Date.now() + ADMIN_SESSION_MAX_AGE_SEC * 1000;
  const payload = String(exp);
  const sig = await hmacSha256Base64Url(payload, secret);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
  secret: string,
): Promise<boolean> {
  if (!token?.trim() || !secret) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(payload);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = await hmacSha256Base64Url(payload, secret);
  return timingSafeEqualStr(sig, expected);
}

export function getSessionCookieFromHeader(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const name = trimmed.slice(0, eq);
    if (name === ADMIN_SESSION_COOKIE) {
      return decodeURIComponent(trimmed.slice(eq + 1));
    }
  }
  return undefined;
}
