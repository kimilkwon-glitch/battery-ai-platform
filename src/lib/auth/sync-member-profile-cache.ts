import { memberPreferredStoreToUi } from "@/lib/auth/member-preferred-store";
import type { MemberPublic } from "@/lib/auth/member-types";
import { saveCustomerProfile } from "@/lib/customer-profile-storage";

/** UI 편의용 localStorage 프로필 동기화 — 인증 판단에는 사용하지 않음 */
export function syncMemberToProfileCache(member: MemberPublic): void {
  if (typeof window === "undefined") return;
  saveCustomerProfile({
    id: member.id,
    loginId: member.loginId,
    name: member.name,
    phone: member.phone,
    email: member.email,
    postalCode: member.zonecode,
    address1: member.address,
    address2: member.detailAddress,
    vehicleManufacturer: member.vehicleInfo?.manufacturer,
    vehicleName: member.vehicleInfo?.name,
    vehicleYear: member.vehicleInfo?.year,
    vehicleFuel: member.vehicleInfo?.fuel,
    batterySpec: member.vehicleInfo?.batterySpec,
    provider: member.provider,
    preferredStore: memberPreferredStoreToUi(member.preferredStore),
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  });
}
