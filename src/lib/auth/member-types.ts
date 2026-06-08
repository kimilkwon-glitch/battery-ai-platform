import type { AuthProvider } from "@/lib/customer-profile-storage";

export type MemberPreferredStore = "deokcheon" | "hakjang";

export type MemberVehicleInfo = {
  manufacturer?: string;
  name?: string;
  year?: string;
  fuel?: string;
  batterySpec?: string;
};

/** DB 저장용 — passwordHash는 서버 전용 */
export type MemberRecord = {
  id: string;
  loginId: string | null;
  email: string | null;
  phone: string;
  name: string;
  passwordHash: string | null;
  provider: AuthProvider;
  providerId: string | null;
  zonecode: string | null;
  address: string | null;
  detailAddress: string | null;
  vehicleInfo: MemberVehicleInfo | null;
  preferredStore: MemberPreferredStore | null;
  createdAt: string;
  updatedAt: string;
};

/** API·클라이언트 반환용 — passwordHash 제외 */
export type MemberPublic = {
  id: string;
  loginId?: string;
  email?: string;
  phone: string;
  name: string;
  provider: AuthProvider;
  zonecode?: string;
  address?: string;
  detailAddress?: string;
  vehicleInfo?: MemberVehicleInfo;
  preferredStore?: MemberPreferredStore | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCredentialsMemberInput = {
  loginId: string;
  password: string;
  name: string;
  phone: string;
  email: string;
  zonecode: string;
  address: string;
  detailAddress: string;
  vehicleInfo?: MemberVehicleInfo | null;
};

export type UpsertSocialMemberInput = {
  provider: Exclude<AuthProvider, "credentials">;
  providerId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

/** PATCH /api/auth/me — id/loginId/provider/passwordHash 수정 불가 */
export type UpdateMemberProfilePatch = {
  name?: string;
  phone?: string;
  email?: string;
  zonecode?: string;
  address?: string;
  detailAddress?: string;
  vehicleInfo?: MemberVehicleInfo | null;
  preferredStore?: MemberPreferredStore | null;
};
