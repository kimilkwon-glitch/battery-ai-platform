/**
 * 고객 로그인 세션 (localStorage) — 실제 인증 연동 전 스텁
 */
export type CustomerSession = {
  loggedInAt: string;
  displayName?: string;
  phone?: string;
  email?: string;
};

const SESSION_KEY = "bm-customer-session-v1";

function readSession(): CustomerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CustomerSession;
    return parsed?.loggedInAt ? parsed : null;
  } catch {
    return null;
  }
}

export function isCustomerLoggedIn(): boolean {
  return readSession() != null;
}

export function getCustomerSession(): CustomerSession | null {
  return readSession();
}

export function setCustomerSession(input: Omit<CustomerSession, "loggedInAt"> & { loggedInAt?: string }): void {
  if (typeof window === "undefined") return;
  const row: CustomerSession = {
    loggedInAt: input.loggedInAt ?? new Date().toISOString(),
    displayName: input.displayName,
    phone: input.phone,
    email: input.email,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(row));
}

export function clearCustomerSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}
