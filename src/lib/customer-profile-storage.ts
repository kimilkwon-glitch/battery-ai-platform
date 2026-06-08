/** 회원 프로필 (localStorage — 서버 연동 전 단일 source of truth) */

export type PreferredStoreId = "deokcheon" | "hakjang" | "undecided";
export type AuthProvider = "credentials" | "naver" | "kakao" | "google";

export type CustomerProfile = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  postalCode?: string;
  address1?: string;
  address2?: string;
  defaultVehicleId?: string;
  preferredStore?: PreferredStoreId;
  /** 회원가입 시 단일 차량 입력 (차량 프로필로 동기화) */
  vehicleName?: string;
  vehicleYear?: string;
  vehicleFuel?: string;
  provider: AuthProvider;
  createdAt: string;
  updatedAt: string;
};

const PROFILE_KEY = "bm-customer-profile-v1";

function newProfileId(): string {
  return `bm-user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyProfile(input: {
  name: string;
  phone: string;
  provider: AuthProvider;
  email?: string;
}): CustomerProfile {
  const now = new Date().toISOString();
  return {
    id: newProfileId(),
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || undefined,
    provider: input.provider,
    createdAt: now,
    updatedAt: now,
  };
}

export function saveCustomerProfile(
  profile: Omit<CustomerProfile, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
): CustomerProfile {
  if (typeof window === "undefined") {
    const now = new Date().toISOString();
    return { ...profile, createdAt: profile.createdAt ?? now, updatedAt: now };
  }
  const existing = getCustomerProfile();
  const now = new Date().toISOString();
  const row: CustomerProfile = {
    ...profile,
    id: profile.id || existing?.id || newProfileId(),
    createdAt: profile.createdAt ?? existing?.createdAt ?? now,
    updatedAt: now,
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(row));
  return row;
}

export function updateCustomerProfile(patch: Partial<CustomerProfile>): CustomerProfile | null {
  const current = getCustomerProfile();
  if (!current) return null;
  return saveCustomerProfile({ ...current, ...patch, id: current.id });
}

export function getCustomerProfile(): CustomerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CustomerProfile;
    if (!parsed?.phone && !parsed?.name) return null;
    return {
      ...parsed,
      id: parsed.id || newProfileId(),
      provider: parsed.provider ?? "credentials",
      createdAt: parsed.createdAt ?? new Date().toISOString(),
      updatedAt: parsed.updatedAt ?? parsed.createdAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
