import {
  getCustomerVehicles,
  type CustomerVehicleRecord,
} from "@/lib/customer-vehicles-storage";
import { getCustomerProfile } from "@/lib/customer-profile-storage";

export type CheckoutVehicleChoice = CustomerVehicleRecord;

/** 주문서 — 등록 차량만 slug 기준 중복 제거 (최신 등록 우선) */
export function getCheckoutVehicleChoices(): CheckoutVehicleChoice[] {
  const bySlug = new Map<string, CustomerVehicleRecord>();

  for (const vehicle of getCustomerVehicles()) {
    const slug = vehicle.slug?.trim();
    if (!slug) continue;
    const existing = bySlug.get(slug);
    if (!existing || vehicle.registeredAt > existing.registeredAt) {
      bySlug.set(slug, vehicle);
    }
  }

  return Array.from(bySlug.values()).sort((a, b) =>
    b.registeredAt.localeCompare(a.registeredAt),
  );
}

/** 프로필 defaultVehicleId → 등록 차량 id 매칭 (slug/id 기준, 이름 fuzzy 금지) */
export function resolveDefaultCheckoutVehicleId(
  choices: CheckoutVehicleChoice[],
): string | null {
  if (choices.length === 0) return null;

  const profile = getCustomerProfile();
  const defaultId = profile?.defaultVehicleId?.trim();
  if (defaultId && choices.some((c) => c.id === defaultId)) {
    return defaultId;
  }

  return choices[0]?.id ?? null;
}

export function findCheckoutVehicleById(
  choices: CheckoutVehicleChoice[],
  id: string,
): CheckoutVehicleChoice | undefined {
  const trimmed = id.trim();
  if (!trimmed) return undefined;
  return choices.find((c) => c.id === trimmed);
}
