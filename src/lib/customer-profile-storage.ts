/**
 * 회원 프로필 UI 캐시 (localStorage — 인증 source of truth 아님)
 * - 로그인·회원 식별: 서버 httpOnly 세션 + GET /api/auth/me
 * - 주문서·프로필 편집 UI 편의용으로만 동기화
 * - 비밀번호·비밀번호 stub 필드는 저장하지 않는다
 */

export type PreferredStoreId = "deokcheon" | "hakjang" | "undecided";
export type AuthProvider = "credentials" | "naver" | "kakao" | "google";

export type CustomerProfile = {
  id: string;
  /** 일반 회원가입 아이디 */
  loginId?: string;
  name: string;
  phone: string;
  email?: string;
  postalCode?: string;
  address1?: string;
  address2?: string;
  defaultVehicleId?: string;
  preferredStore?: PreferredStoreId;
  /** 회원가입 시 단일 차량 입력 (차량 프로필로 동기화) */
  vehicleManufacturer?: string;
  vehicleName?: string;
  vehicleYear?: string;
  vehicleFuel?: string;
  batterySpec?: string;
  provider: AuthProvider;
  createdAt: string;
  updatedAt: string;
};

const PROFILE_KEY = "bm-customer-profile-v1";

/** 레거시 stub·비밀번호성 필드 제거 (localStorage에 저장·반환하지 않음) */
function stripSensitiveProfileFields(
  profile: CustomerProfile & Record<string, unknown>,
): CustomerProfile {
  const {
    credentialsPasswordStub: _stub,
    password: _password,
    passwordHash: _hash,
    ...safe
  } = profile;
  return safe as CustomerProfile;
}

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
  const row = stripSensitiveProfileFields({
    ...profile,
    id: profile.id || existing?.id || newProfileId(),
    createdAt: profile.createdAt ?? existing?.createdAt ?? now,
    updatedAt: now,
  } as CustomerProfile & Record<string, unknown>);
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
    const parsed = JSON.parse(raw) as CustomerProfile & Record<string, unknown>;
    if (!parsed?.phone && !parsed?.name) return null;
    return stripSensitiveProfileFields({
      ...parsed,
      id: parsed.id || newProfileId(),
      provider: parsed.provider ?? "credentials",
      createdAt: parsed.createdAt ?? new Date().toISOString(),
      updatedAt: parsed.updatedAt ?? parsed.createdAt ?? new Date().toISOString(),
    });
  } catch {
    return null;
  }
}
