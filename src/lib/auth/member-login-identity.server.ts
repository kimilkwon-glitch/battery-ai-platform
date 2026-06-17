import "server-only";

import { createHash } from "node:crypto";

/** 로그인 식별자 정규화 — 이메일은 소문자·trim, loginId는 trim만 */
export function normalizeMemberLoginIdOrEmail(value: string): string {
  const trimmed = value.trim();
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }
  return trimmed;
}

export function normalizeMemberEmailForStorage(email: string): string {
  return email.trim().toLowerCase();
}

/** rate limit 키용 — 원문 식별자를 메모리에 남기지 않음 */
export function hashMemberLoginAccountKey(normalizedIdOrEmail: string): string {
  return createHash("sha256").update(normalizedIdOrEmail).digest("hex").slice(0, 16);
}
