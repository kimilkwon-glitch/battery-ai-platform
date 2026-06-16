import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { buildProductQnaDetailUrl } from "@/lib/inquiry/product-qna-url";
import type { CustomerInquiryRecord } from "@/types/customer-inquiry";

export { buildProductQnaDetailUrl };

export const QNA_AUTHOR_COOKIE_PREFIX = "bm_qna_";
export const QNA_AUTHOR_COOKIE_MAX_AGE_SEC = 365 * 24 * 60 * 60;

export type ProductQnaViewerContext = {
  userId?: string;
  /** inquiryId -> raw view token from cookie */
  authorTokens: Map<string, string>;
};

export function qnaAuthorCookieName(inquiryId: string): string {
  return `${QNA_AUTHOR_COOKIE_PREFIX}${inquiryId}`;
}

export function createAuthorViewToken(): string {
  return randomBytes(24).toString("base64url");
}

export function hashAuthorViewToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function parseProductQnaViewerContext(request: Request, userId?: string): ProductQnaViewerContext {
  const authorTokens = new Map<string, string>();
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(QNA_AUTHOR_COOKIE_PREFIX)) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const name = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    const inquiryId = name.slice(QNA_AUTHOR_COOKIE_PREFIX.length);
    if (inquiryId && value) authorTokens.set(inquiryId, decodeURIComponent(value));
  }
  return { userId, authorTokens };
}

export function canViewSecretProductQna(
  record: CustomerInquiryRecord,
  viewer: ProductQnaViewerContext,
): boolean {
  if (record.isSecret !== true) return true;
  if (viewer.userId && record.authorUserId && viewer.userId === record.authorUserId) return true;
  const token = viewer.authorTokens.get(record.id);
  if (!token || !record.authorViewTokenHash) return false;
  return hashAuthorViewToken(token) === record.authorViewTokenHash;
}

export function authorViewCookieOptions(maxAge = QNA_AUTHOR_COOKIE_MAX_AGE_SEC) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}
