import "server-only";

import { createHash } from "node:crypto";

function rateLimitSecret(): string | null {
  const dedicated = process.env.RATE_LIMIT_HASH_SECRET?.trim();
  if (dedicated) return dedicated;
  const session = process.env.CUSTOMER_SESSION_SECRET?.trim();
  if (session) return session;
  return null;
}

export function isRateLimitHashConfigured(): boolean {
  return Boolean(rateLimitSecret());
}

/** IP·이메일·전화·loginId 등 원문 저장 없이 keyed hash */
export function hashRateLimitIdentity(namespace: string, ...parts: string[]): string {
  const secret = rateLimitSecret();
  const payload = `${namespace}:${parts.map((p) => p.trim()).join("|")}`;
  if (!secret) {
    return createHash("sha256").update(`dev:${payload}`).digest("hex").slice(0, 32);
  }
  return createHash("sha256").update(`${secret}:${payload}`).digest("hex").slice(0, 32);
}

export function hashRateLimitIp(ip: string): string {
  return hashRateLimitIdentity("_ip", ip.trim() || "unknown");
}
