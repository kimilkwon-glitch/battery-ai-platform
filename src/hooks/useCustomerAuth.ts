"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearCustomerSession,
  getCustomerSession,
  type CustomerSession,
} from "@/lib/customer-auth-session";

export function useCustomerAuth() {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setSession(getCustomerSession());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "bm-customer-session-v1") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const logout = useCallback(() => {
    clearCustomerSession();
    setSession(null);
  }, []);

  return {
    session,
    isLoggedIn: Boolean(session),
    ready,
    refresh,
    logout,
    displayName: session?.displayName ?? null,
  };
}
