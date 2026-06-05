import "server-only";

import {
  getAdminSessionSecret,
  isAdminAuthConfigured,
  verifyAdminApiKeyInput,
  verifyAdminUsernameInput,
} from "@/lib/admin/adminCredentials";
import { verifyAdminPasswordInput } from "@/lib/admin/adminPassword.server";

export { getAdminSessionSecret, isAdminAuthConfigured };

/** @deprecated — 세션 secret은 getAdminSessionSecret 사용 */
export function getAdminAccessSecret(): string {
  return getAdminSessionSecret();
}

export function isAdminAccessConfigured(): boolean {
  return isAdminAuthConfigured();
}

/** 관리자 로그인 — 아이디·비밀번호 동시 검증 (구체적 실패 사유 노출 금지) */
export function verifyAdminLogin(
  username: string | undefined | null,
  password: string | undefined | null,
): boolean {
  if (!isAdminAuthConfigured()) return false;
  if (!verifyAdminUsernameInput(username)) return false;
  return verifyAdminPasswordInput(password);
}

/** @deprecated — accessKey 단일 필드 1차 호환 */
export function verifyAccessKeyInput(key: string | undefined | null): boolean {
  if (!isAdminAuthConfigured()) return false;
  return verifyAdminPasswordInput(key);
}

export { verifyAdminApiKeyInput };
