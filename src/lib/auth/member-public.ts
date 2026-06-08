import type { MemberPublic, MemberRecord } from "@/lib/auth/member-types";

export function toMemberPublic(record: MemberRecord): MemberPublic {
  return {
    id: record.id,
    loginId: record.loginId ?? undefined,
    email: record.email ?? undefined,
    phone: record.phone,
    name: record.name,
    provider: record.provider,
    zonecode: record.zonecode ?? undefined,
    address: record.address ?? undefined,
    detailAddress: record.detailAddress ?? undefined,
    vehicleInfo: record.vehicleInfo ?? undefined,
    preferredStore: record.preferredStore,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
