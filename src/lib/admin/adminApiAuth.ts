import "server-only";

import { getAdminSessionSecret, verifyAdminApiKeyInput } from "@/lib/admin/adminCredentials";
import {
  getSessionCookieFromHeader,
  verifySessionToken,
} from "@/lib/admin/adminSessionCore";

/**
 * 관리자 API 인증
 * 1) httpOnly 세션 쿠키
 * 2) Authorization: Bearer <session-token>
 * 3) x-admin-key — 서버·CI 스크립트 전용 (브라우저 사용 금지)
 */
export async function verifyAdminApiRequest(request: Request): Promise<boolean> {
  const secret = getAdminSessionSecret();
  if (!secret) return false;

  const cookieToken = getSessionCookieFromHeader(request.headers.get("cookie"));
  if (await verifySessionToken(cookieToken, secret)) return true;

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const bearer = auth.slice(7).trim();
    if (await verifySessionToken(bearer, secret)) return true;
  }

  const headerKey = request.headers.get("x-admin-key")?.trim();
  if (headerKey && verifyAdminApiKeyInput(headerKey)) return true;

  return false;
}

/** @deprecated */
export function getAdminApiSecret(): string {
  return getAdminSessionSecret();
}

export function adminUnauthorizedResponse() {
  return {
    ok: false,
    error: "UNAUTHORIZED",
    message: "관리자 인증이 필요합니다.",
  };
}
