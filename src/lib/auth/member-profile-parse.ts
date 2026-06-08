import type { MemberVehicleInfo } from "@/lib/auth/member-types";

export function parseVehicleInfo(raw: unknown): MemberVehicleInfo | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  const info: MemberVehicleInfo = {};
  if (typeof v.manufacturer === "string" && v.manufacturer.trim()) {
    info.manufacturer = v.manufacturer.trim();
  }
  if (typeof v.name === "string" && v.name.trim()) info.name = v.name.trim();
  if (typeof v.year === "string" && v.year.trim()) info.year = v.year.trim();
  if (typeof v.fuel === "string" && v.fuel.trim()) info.fuel = v.fuel.trim();
  if (typeof v.batterySpec === "string" && v.batterySpec.trim()) {
    info.batterySpec = v.batterySpec.trim();
  }
  return Object.keys(info).length > 0 ? info : null;
}

export function mergeVehicleInfo(
  existing: MemberVehicleInfo | null,
  patch: MemberVehicleInfo | null | undefined,
): MemberVehicleInfo | null {
  if (patch === undefined) return existing;
  if (patch === null) return existing;
  const merged = { ...(existing ?? {}), ...patch };
  const cleaned: MemberVehicleInfo = {};
  if (merged.manufacturer?.trim()) cleaned.manufacturer = merged.manufacturer.trim();
  if (merged.name?.trim()) cleaned.name = merged.name.trim();
  if (merged.year?.trim()) cleaned.year = merged.year.trim();
  if (merged.fuel?.trim()) cleaned.fuel = merged.fuel.trim();
  if (merged.batterySpec?.trim()) cleaned.batterySpec = merged.batterySpec.trim();
  return Object.keys(cleaned).length > 0 ? cleaned : null;
}
