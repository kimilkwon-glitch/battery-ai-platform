import type { MemberPublic, UpdateMemberProfilePatch } from "@/lib/auth/member-types";
import { syncMemberToProfileCache } from "@/lib/auth/sync-member-profile-cache";
import type { AuthProvider } from "@/lib/customer-profile-storage";

/** 서버 /api/auth/me 기준 인메모리 캐시 — localStorage 인증 source of truth 아님 */
let cachedMember: MemberPublic | null = null;

export type CustomerAuthCache = MemberPublic | null;

export function setCustomerAuthCache(member: CustomerAuthCache): void {
  cachedMember = member;
}

export function getCustomerAuthCache(): CustomerAuthCache {
  return cachedMember;
}

export function clearCustomerAuthCache(): void {
  cachedMember = null;
}

export function isCustomerLoggedIn(): boolean {
  return cachedMember != null;
}

export function getCustomerUserId(): string | null {
  return cachedMember?.id ?? null;
}

/** OAuth 등 서버 세션 미연동 시 임시 캐시 (페이지 새로고침 시 /api/auth/me 기준으로 소멸) */
export function setLegacyOAuthAuthCache(input: {
  userId: string;
  displayName?: string;
  phone?: string;
  email?: string;
  provider?: AuthProvider;
}): void {
  const now = new Date().toISOString();
  cachedMember = {
    id: input.userId,
    name: input.displayName ?? "회원",
    phone: input.phone ?? "",
    email: input.email,
    provider: input.provider ?? "credentials",
    createdAt: now,
    updatedAt: now,
  };
}

export async function fetchCustomerAuthMe(): Promise<MemberPublic | null> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
    if (!res.ok) {
      setCustomerAuthCache(null);
      return null;
    }
    const data = (await res.json()) as { member?: MemberPublic | null };
    const member = data.member ?? null;
    setCustomerAuthCache(member);
    return member;
  } catch {
    setCustomerAuthCache(null);
    return null;
  }
}

export type PatchCustomerProfileResult =
  | { ok: true; member: MemberPublic }
  | { ok: false; message: string };

/** PATCH /api/auth/me — 서버 members 저장 후 인메모리·UI 캐시 동기화 */
export async function patchCustomerProfile(
  body: UpdateMemberProfilePatch,
): Promise<PatchCustomerProfileResult> {
  try {
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      member?: MemberPublic;
      message?: string;
    };
    if (!res.ok || !data.ok || !data.member) {
      return {
        ok: false,
        message: data.message ?? "회원정보 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      };
    }
    setCustomerAuthCache(data.member);
    syncMemberToProfileCache(data.member);
    return { ok: true, member: data.member };
  } catch {
    return {
      ok: false,
      message: "회원정보 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}
