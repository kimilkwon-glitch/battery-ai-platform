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
  sessionEpoch = 0,
): Promise<string> {
  const exp = Date.now() + CUSTOMER_SESSION_MAX_AGE_SEC * 1000;
  const payload = `${userId}.${sessionEpoch}.${exp}`;
  const sig = await hmacSha256Base64Url(payload, secret);
  return `${payload}.${sig}`;
}

export type VerifiedCustomerSession = {
  userId: string;
  exp: number;
  sessionEpoch: number;
  legacyFormat: boolean;
};

function parseSessionTokenParts(token: string): {
  userId: string;
  sessionEpoch: number;
  exp: number;
  sig: string;
  legacyFormat: boolean;
} | null {
  const parts = token.split(".");
  if (parts.length === 3) {
    const [userId, expStr, sig] = parts;
    if (!userId || !expStr || !sig) return null;
    return {
      userId,
      sessionEpoch: 0,
      exp: Number(expStr),
      sig,
      legacyFormat: true,
    };
  }
  if (parts.length === 4) {
    const [userId, epochStr, expStr, sig] = parts;
    if (!userId || !epochStr || !expStr || !sig) return null;
    const sessionEpoch = Number(epochStr);
    if (!Number.isFinite(sessionEpoch) || sessionEpoch < 0) return null;
    return {
      userId,
      sessionEpoch,
      exp: Number(expStr),
      sig,
      legacyFormat: false,
    };
  }
  return null;
}

export async function verifyCustomerSessionToken(
  token: string | undefined | null,
  secret: string,
): Promise<VerifiedCustomerSession | null> {
  if (!token?.trim() || !secret) return null;
  const parsed = parseSessionTokenParts(token.trim());
  if (!parsed || !parsed.userId) return null;

  const { userId, sessionEpoch, exp, sig, legacyFormat } = parsed;
  if (!Number.isFinite(exp) || Date.now() > exp) return null;

  const payload = legacyFormat
    ? `${userId}.${exp}`
    : `${userId}.${sessionEpoch}.${exp}`;
  const expected = await hmacSha256Base64Url(payload, secret);
  if (!timingSafeEqualStr(sig, expected)) return null;

  return { userId, exp, sessionEpoch, legacyFormat };
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
