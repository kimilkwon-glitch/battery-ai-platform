import { getSearchHref } from "@/lib/battery-search";
import { addCustomerVehicle } from "@/lib/customer-vehicles-storage";
import type { CustomerProfile } from "@/lib/customer-profile-storage";
import { updateCustomerProfile } from "@/lib/customer-profile-storage";

function vehicleSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "")
    .slice(0, 48) || `vehicle-${Date.now()}`;
}

/** 회원가입·추가정보 입력 시 선택 차량을 차량 프로필에 저장 */
export function syncSignupVehicleToProfile(profile: CustomerProfile): CustomerProfile {
  if (!profile.vehicleName?.trim()) return profile;

  const slug = vehicleSlug(profile.vehicleName);
  const row = addCustomerVehicle({
    slug,
    displayName: profile.vehicleName.trim(),
    href: getSearchHref(profile.vehicleName.trim()),
    year: profile.vehicleYear,
    fuel: profile.vehicleFuel,
    source: "signup",
  });

  return (
    updateCustomerProfile({
      ...profile,
      defaultVehicleId: row.id,
    }) ?? profile
  );
}
