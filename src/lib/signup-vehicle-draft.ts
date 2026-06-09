/**
 * 회원가입 중 차량 선택 — form state / sessionStorage 임시 저장 (계정 저장 전)
 */

import { getVehicle } from "@/lib/platform-data";

export const SIGNUP_VEHICLE_SELECT_MODE = "signup_vehicle_select";
const FORM_DRAFT_KEY = "bm-signup-form-draft-v1";
const VEHICLE_SELECT_KEY = "bm-signup-vehicle-select-v1";
const ACTIVE_FLAG_KEY = "bm-signup-vehicle-select-active";

export type SignupFormDraft = {
  loginId?: string;
  name?: string;
  phone?: string;
  email?: string;
  postalCode?: string;
  address1?: string;
  address2?: string;
  vehicleManufacturer?: string;
  vehicleName?: string;
  vehicleYear?: string;
  vehicleFuel?: string;
  batterySpec?: string;
  agreeTerms?: boolean;
  agreePrivacy?: boolean;
};

export type SignupVehicleSelection = {
  slug: string;
  displayName: string;
  manufacturer?: string;
  vehicleName?: string;
  vehicleYear?: string;
  vehicleFuel?: string;
  batterySpec?: string;
};

const MANUFACTURER_BY_BRAND: Record<string, string> = {
  hyundai: "현대",
  kia: "기아",
  genesis: "제네시스",
  chevrolet: "쉐보레",
  ssangyong: "KG모빌리티",
  renault: "르노코리아",
  samsung: "르노코리아",
};

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function isSignupVehicleSelectMode(value: string | null | undefined): boolean {
  return value === SIGNUP_VEHICLE_SELECT_MODE;
}

export function markSignupVehicleSelectActive(): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(ACTIVE_FLAG_KEY, "1");
}

export function isSignupVehicleSelectActive(): boolean {
  if (!canUseSessionStorage()) return false;
  return sessionStorage.getItem(ACTIVE_FLAG_KEY) === "1";
}

export function clearSignupVehicleSelectActive(): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.removeItem(ACTIVE_FLAG_KEY);
}

export function saveSignupFormDraft(draft: SignupFormDraft): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(draft));
}

export function loadSignupFormDraft(): SignupFormDraft | null {
  if (!canUseSessionStorage()) return null;
  try {
    const raw = sessionStorage.getItem(FORM_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SignupFormDraft;
  } catch {
    return null;
  }
}

export function clearSignupFormDraft(): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.removeItem(FORM_DRAFT_KEY);
}

export function saveSignupVehicleSelection(selection: SignupVehicleSelection): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(VEHICLE_SELECT_KEY, JSON.stringify(selection));
}

export function loadSignupVehicleSelection(): SignupVehicleSelection | null {
  if (!canUseSessionStorage()) return null;
  try {
    const raw = sessionStorage.getItem(VEHICLE_SELECT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SignupVehicleSelection;
  } catch {
    return null;
  }
}

export function clearSignupVehicleSelection(): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.removeItem(VEHICLE_SELECT_KEY);
}

export function buildSignupVehicleBrowseUrl(): string {
  return `/vehicles?mode=${SIGNUP_VEHICLE_SELECT_MODE}`;
}

export function appendSignupVehicleMode(href: string): string {
  if (!href || href.startsWith("http")) return href;
  const sep = href.includes("?") ? "&" : "?";
  if (href.includes(`mode=${SIGNUP_VEHICLE_SELECT_MODE}`)) return href;
  return `${href}${sep}mode=${SIGNUP_VEHICLE_SELECT_MODE}`;
}

function guessManufacturer(slug: string, brand?: string): string {
  if (brand?.trim()) {
    const mapped = MANUFACTURER_BY_BRAND[brand.toLowerCase()];
    if (mapped) return mapped;
    if (["현대", "기아", "제네시스", "쉐보레", "KG모빌리티", "르노코리아"].includes(brand)) {
      return brand;
    }
  }
  const vehicle = getVehicle(slug);
  if (vehicle.brand) {
    const mapped = MANUFACTURER_BY_BRAND[vehicle.brand.toLowerCase()];
    if (mapped) return mapped;
  }
  const prefix = slug.split("-")[0]?.toLowerCase();
  return MANUFACTURER_BY_BRAND[prefix ?? ""] ?? "";
}

function parseYearFromRange(yearRange?: string): string {
  if (!yearRange?.trim()) return "";
  const match = yearRange.match(/(20\d{2}|19\d{2})/);
  return match?.[1] ?? "";
}

function normalizeFuel(fuel?: string | null): string {
  if (!fuel?.trim()) return "";
  const f = fuel.trim();
  if (/하이브리드|hev|phev/i.test(f)) return "하이브리드";
  if (/전기|ev/i.test(f)) return "전기";
  if (/디젤|diesel/i.test(f)) return "디젤";
  if (/lpg/i.test(f)) return "LPG";
  if (/가솔린|gasoline|휘발유/i.test(f)) return "가솔린";
  return f;
}

export function buildSignupVehicleSelection(input: {
  slug: string;
  displayName: string;
  yearRange?: string;
  fuelHint?: string | null;
  recommendedBattery?: string;
  manufacturer?: string;
}): SignupVehicleSelection {
  const vehicle = getVehicle(input.slug);
  const manufacturer = input.manufacturer?.trim() || guessManufacturer(input.slug, vehicle.brand);
  const vehicleName = input.displayName.trim() || vehicle.displayName || "";
  const vehicleYear = parseYearFromRange(input.yearRange);
  const vehicleFuel = normalizeFuel(input.fuelHint);
  const batterySpec = input.recommendedBattery?.trim() || "";

  return {
    slug: input.slug,
    displayName: vehicleName,
    manufacturer: manufacturer || undefined,
    vehicleName: vehicleName || undefined,
    vehicleYear: vehicleYear || undefined,
    vehicleFuel: vehicleFuel || undefined,
    batterySpec: batterySpec || undefined,
  };
}

export function applySignupVehicleSelection(input: {
  slug: string;
  displayName: string;
  yearRange?: string;
  fuelHint?: string | null;
  recommendedBattery?: string;
  manufacturer?: string;
}): SignupVehicleSelection {
  const selection = buildSignupVehicleSelection(input);
  saveSignupVehicleSelection(selection);
  return selection;
}
