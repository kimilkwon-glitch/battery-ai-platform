import "server-only";

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

/** `{subject}.{exp}.{sig}` — subject must not contain dots */
export async function createSignedAccessToken(
  subject: string,
  secret: string,
  maxAgeSec: number,
): Promise<string> {
  const exp = Date.now() + maxAgeSec * 1000;
  const payload = `${subject}.${exp}`;
  const sig = await hmacSha256Base64Url(payload, secret);
  return `${payload}.${sig}`;
}

export async function verifySignedAccessToken(
  token: string | undefined | null,
  secret: string,
  expectedSubject?: string,
): Promise<{ subject: string; exp: number } | null> {
  if (!token?.trim() || !secret) return null;
  const lastDot = token.lastIndexOf(".");
  const secondDot = token.lastIndexOf(".", lastDot - 1);
  if (lastDot <= 0 || secondDot <= 0) return null;

  const subject = token.slice(0, secondDot);
  const expStr = token.slice(secondDot + 1, lastDot);
  const sig = token.slice(lastDot + 1);
  const exp = Number(expStr);
  if (!subject || !Number.isFinite(exp) || !sig) return null;
  if (expectedSubject && subject !== expectedSubject) return null;
  if (Date.now() > exp) return null;

  const payload = `${subject}.${expStr}`;
  const expected = await hmacSha256Base64Url(payload, secret);
  if (!timingSafeEqualStr(sig, expected)) return null;
  return { subject, exp };
}

export function readCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${name}=`)) continue;
    return trimmed.slice(name.length + 1);
  }
  return undefined;
}
