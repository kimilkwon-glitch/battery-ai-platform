import "server-only";

import { isMemberAuthReady } from "@/lib/auth/member-api-helpers";
import { isMemberProfileCompleteForCheckout } from "@/lib/auth/member-profile-complete";
import { getMemberStore } from "@/lib/auth/member-store";
import type { MemberRecord, UpsertSocialMemberInput } from "@/lib/auth/member-types";

/** 소셜 로그인 후 주문에 필요한 최소 회원정보 미입력 여부 */
export function memberNeedsProfileComplete(member: MemberRecord): boolean {
  return !isMemberProfileCompleteForCheckout(member);
}

/** provider + providerId 기준 members upsert (email 자동 병합 없음) */
export async function upsertSocialOAuthMember(
  input: UpsertSocialMemberInput,
): Promise<MemberRecord | null> {
  if (!isMemberAuthReady()) return null;
  try {
    const store = await getMemberStore();
    return await store.upsertSocialMember(input);
  } catch {
    return null;
  }
}
