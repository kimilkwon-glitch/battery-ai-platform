import { addCustomerVehicle, type CustomerVehicleRecord } from "@/lib/customer-vehicles-storage";

export type SaveVehicleFromDetailInput = {
  slug: string;
  displayName: string;
  yearRange?: string;
  fuelHint?: string;
  recommendedBattery?: string;
  batteryOptions?: string[];
  source?: CustomerVehicleRecord["source"];
};

export type SaveVehicleResult =
  | { ok: true; record: CustomerVehicleRecord }
  | { ok: false; error: string };

export function saveVehicleFromDetail(input: SaveVehicleFromDetailInput): SaveVehicleResult {
  if (typeof window === "undefined") {
    return { ok: false, error: "브라우저 환경에서만 저장할 수 있습니다." };
  }
  if (!input.slug?.trim() || !input.displayName?.trim()) {
    return { ok: false, error: "차량 정보가 부족해 저장할 수 없습니다." };
  }

  try {
    const record = addCustomerVehicle({
      slug: input.slug.trim(),
      displayName: input.displayName.trim(),
      href: `/vehicle/${input.slug.trim()}`,
      yearRange: input.yearRange?.trim() || undefined,
      fuel: input.fuelHint?.trim() || undefined,
      fuelHint: input.fuelHint?.trim() || undefined,
      recommendedBattery: input.recommendedBattery?.trim() || undefined,
      batteryOptions: input.batteryOptions?.filter(Boolean),
      source: input.source ?? "vehicleDetail",
    });
    return { ok: true, record };
  } catch {
    return { ok: false, error: "차량정보 저장에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }
}

export function buildVehicleAuthRedirectPath(
  slug: string,
  action: "saveVehicle" = "saveVehicle",
): string {
  return `/vehicle/${encodeURIComponent(slug)}?action=${action}`;
}

export function buildLoginRedirectUrl(slug: string): string {
  const redirect = buildVehicleAuthRedirectPath(slug);
  return `/login?redirect=${encodeURIComponent(redirect)}&action=saveVehicle`;
}

export function buildSignupRedirectUrl(slug: string): string {
  const redirect = buildVehicleAuthRedirectPath(slug);
  return `/signup?redirect=${encodeURIComponent(redirect)}&action=saveVehicle`;
}
