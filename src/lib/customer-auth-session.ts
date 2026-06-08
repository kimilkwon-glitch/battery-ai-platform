import type { AuthProvider } from "@/lib/customer-profile-storage";
import {
  clearCustomerAuthCache,
  getCustomerAuthCache,
  getCustomerUserId as getCachedUserId,
  isCustomerLoggedIn as isCachedLoggedIn,
  setLegacyOAuthAuthCache,
} from "@/lib/auth/customer-auth-client";

/**
 * 고객 로그인 세션 — 서버 httpOnly 쿠키 + /api/auth/me가 source of truth
 *
 * 이 모듈의 동기 API는 인메모리 캐시만 읽습니다.
 * 캐시는 useCustomerAuth / fetchCustomerAuthMe로 /api/auth/me와 동기화됩니다.
 * localStorage 세션 저장은 사용하지 않습니다.
 */
export type CustomerSession = {
  userId: string;
  loggedInAt: string;
  displayName?: string;
  phone?: string;
  email?: string;
  provider?: AuthProvider;
};

export function isCustomerLoggedIn(): boolean {
  return isCachedLoggedIn();
}

export function getCustomerSession(): CustomerSession | null {
  const member = getCustomerAuthCache();
  if (!member) return null;
  return {
    userId: member.id,
    loggedInAt: member.updatedAt,
    displayName: member.name,
    phone: member.phone,
    email: member.email,
    provider: member.provider,
  };
}

export function getCustomerUserId(): string | null {
  return getCachedUserId();
}

/**
 * @deprecated OAuth는 callback에서 bm_customer_session 발급. 레거시 호환용 인메모리 캐시만.
 */
export function setCustomerSession(
  input: Omit<CustomerSession, "loggedInAt"> & { loggedInAt?: string },
): void {
  setLegacyOAuthAuthCache({
    userId: input.userId,
    displayName: input.displayName,
    phone: input.phone,
    email: input.email,
    provider: input.provider,
  });
}

export function clearCustomerSession(): void {
  clearCustomerAuthCache();
}
