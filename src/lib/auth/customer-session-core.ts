/**
 * 고객 세션 — Edge / Node 공통 (Web Crypto HMAC)
 * 토큰 형식: {userId}.{exp}.{sig}
 */

export const CUSTOMER_SESSION_COOKIE = "bm_customer_session" as const;
export const CUSTOMER_SESSION_MAX_AGE_SEC = 14 * 24 * 60 * 60; // 14일

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

export async function createCustomerSessionToken(
  userId: string,
  secret: string,
): Promise<string> {
  const exp = Date.now() + CUSTOMER_SESSION_MAX_AGE_SEC * 1000;
  const payload = `${userId}.${exp}`;
  const sig = await hmacSha256Base64Url(payload, secret);
  return `${payload}.${sig}`;
}

export type VerifiedCustomerSession = {
  userId: string;
  exp: number;
};

export async function verifyCustomerSessionToken(
  token: string | undefined | null,
  secret: string,
): Promise<VerifiedCustomerSession | null> {
  if (!token?.trim() || !secret) return null;
  const lastDot = token.lastIndexOf(".");
  const secondDot = token.lastIndexOf(".", lastDot - 1);
  if (lastDot < 0 || secondDot < 0) return null;

  const userId = token.slice(0, secondDot);
  const expStr = token.slice(secondDot + 1, lastDot);
  const sig = token.slice(lastDot + 1);
  if (!userId) return null;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return null;

  const payload = `${userId}.${expStr}`;
  const expected = await hmacSha256Base64Url(payload, secret);
  if (!timingSafeEqualStr(sig, expected)) return null;

  return { userId, exp };
}

export function getCustomerSessionCookieFromHeader(
  cookieHeader: string | null,
): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const name = trimmed.slice(0, eq);
    if (name === CUSTOMER_SESSION_COOKIE) {
      return decodeURIComponent(trimmed.slice(eq + 1));
    }
  }
  return undefined;
}
