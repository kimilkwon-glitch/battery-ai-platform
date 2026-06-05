import { vehicleAssets } from "@/lib/car-assets";
import { isVehicleFullyLithiumSalesExcluded } from "@/lib/vehicle-battery-customer-policy";
import {
  hasBatteryMatch,
  resolveBatteryMatchStatus,
  resolveCatalogBatteryCandidates,
  resolveCatalogPrimaryBattery,
  type VehicleImageStatus,
} from "@/lib/vehicle-battery-match";
import type { AdminMatchingRow, AdminReviewStatus } from "@/types/admin";

function resolveVehicleStatus(
  salesExcluded: boolean,
  missingImage: boolean,
): AdminReviewStatus {
  if (salesExcluded) return "sales_excluded";
  if (missingImage) return "image_needed";
  return "ok";
}

export function buildMatchingAuditRows(): AdminMatchingRow[] {
  return vehicleAssets.map((asset) => {
    const connected = resolveCatalogPrimaryBattery(asset.id, asset);
    const candidates = resolveCatalogBatteryCandidates(asset.id, asset);
    const salesExcluded = isVehicleFullyLithiumSalesExcluded(asset.id);
    const missingImage = !asset.image;
    const imageStatus: VehicleImageStatus = missingImage ? "missing" : "present";
    const vehicleStatus = resolveVehicleStatus(salesExcluded, missingImage);
    const hasBatteryMatchFlag = hasBatteryMatch(connected, candidates);
    const batteryMatchStatus = resolveBatteryMatchStatus(connected, candidates);

    return {
      slug: asset.id,
      vehicleName: asset.displayName,
      yearRange: asset.yearRange ?? "—",
      fuel: "—",
      connectedBattery: connected,
      candidateBatteries: candidates,
      terminalConflict: false,
      agmConflict: false,
      salesExcluded,
      missingImage,
      hasDetailPage: true,
      reviewStatus: vehicleStatus,
      vehicleStatus,
      imageStatus,
      hasBatteryMatch: hasBatteryMatchFlag,
      batteryMatchStatus,
    };
  });
}

export function countMatchingReview(rows: AdminMatchingRow[]): number {
  return rows.filter((r) => !r.hasBatteryMatch && !r.salesExcluded).length;
}
