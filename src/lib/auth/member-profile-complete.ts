import type { MemberPublic } from "@/lib/auth/member-types";

const PLACEHOLDER_PHONE = "미입력";

type ProfileCheckInput = {
  name: string;
  phone: string;
  zonecode?: string | null;
  address?: string | null;
  detailAddress?: string | null;
};

/** 클라이언트·서버 공통 — 주문에 필요한 최소 회원정보 */
export function isMemberProfileCompleteForCheckout(
  member: ProfileCheckInput | null,
): boolean {
  if (!member?.name?.trim()) return false;
  const digits = member.phone.replace(/\D/g, "");
  if (!digits || digits.length < 10 || member.phone === PLACEHOLDER_PHONE) return false;
  if (!member.zonecode?.trim() || !member.address?.trim() || !member.detailAddress?.trim()) {
    return false;
  }
  return true;
}
