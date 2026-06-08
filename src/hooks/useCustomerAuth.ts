"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearCustomerAuthCache,
  fetchCustomerAuthMe,
  getCustomerAuthCache,
} from "@/lib/auth/customer-auth-client";
import { syncMemberToProfileCache } from "@/lib/auth/sync-member-profile-cache";
import type { MemberPublic } from "@/lib/auth/member-types";

export function useCustomerAuth() {
  const [member, setMember] = useState<MemberPublic | null>(() => getCustomerAuthCache());
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const m = await fetchCustomerAuthMe();
    setMember(m);
    if (m) syncMemberToProfileCache(m);
    setReady(true);
    return m;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      clearCustomerAuthCache();
      setMember(null);
    }
  }, []);

  return {
    member,
    isLoggedIn: Boolean(member),
    ready,
    refresh,
    logout,
    displayName: member?.name ?? null,
    userId: member?.id ?? null,
  };
}
