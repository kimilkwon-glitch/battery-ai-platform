import type { MemberPublic } from "@/lib/auth/member-types";
import { syncMemberToProfileCache } from "@/lib/auth/sync-member-profile-cache";

/**
 * OAuth 완료 후 UI 캐시 동기화
 * 인증 source of truth는 bm_customer_session + /api/auth/me (서버 세션)
 */
export function applyOAuthMemberCache(member: MemberPublic): void {
  syncMemberToProfileCache(member);
}
