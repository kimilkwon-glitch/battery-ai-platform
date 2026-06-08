"use client";

import { useEffect } from "react";
import { fetchCustomerAuthMe } from "@/lib/auth/customer-auth-client";
import { syncMemberToProfileCache } from "@/lib/auth/sync-member-profile-cache";

/** 앱 로드 시 /api/auth/me로 인메모리 캐시 동기화 */
export function CustomerAuthBootstrap() {
  useEffect(() => {
    void fetchCustomerAuthMe().then((member) => {
      if (member) syncMemberToProfileCache(member);
    });
  }, []);
  return null;
}
