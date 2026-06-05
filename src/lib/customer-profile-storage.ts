/** 회원가입 시 저장하는 고객 프로필 (localStorage — 서버 연동 전) */

export type PreferredStoreId = "deokcheon" | "hakjang" | "undecided";

export type CustomerProfile = {
  name: string;
  phone: string;
  vehicleName?: string;
  vehicleYear?: string;
  vehicleFuel?: string;
  preferredStore?: PreferredStoreId;
  createdAt: string;
};

const PROFILE_KEY = "bm-customer-profile-v1";

export function saveCustomerProfile(profile: Omit<CustomerProfile, "createdAt">): void {
  if (typeof window === "undefined") return;
  const row: CustomerProfile = {
    ...profile,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(row));
}

export function getCustomerProfile(): CustomerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CustomerProfile;
    return parsed?.phone ? parsed : null;
  } catch {
    return null;
  }
}
