import { vehicleAssets } from "@/lib/car-assets";
import { isVehicleFullyLithiumSalesExcluded } from "@/lib/vehicle-battery-customer-policy";
import { OPERATOR_SLUG_PRIMARY_BATTERY } from "@/lib/vehicle-fuel-primary-battery";
import type { AdminMatchingRow, AdminReviewStatus } from "@/types/admin";

function resolveStatus(
  salesExcluded: boolean,
  missingImage: boolean,
  connected: string,
): AdminReviewStatus {
  if (salesExcluded) return "sales_excluded";
  if (missingImage) return "image_needed";
  if (!connected || connected === "—") return "db_fix_needed";
  return "ok";
}

export function buildMatchingAuditRows(): AdminMatchingRow[] {
  return vehicleAssets.map((asset) => {
    const connected =
      OPERATOR_SLUG_PRIMARY_BATTERY[asset.id] ??
      asset.defaultBatteryCode ??
      "—";
    const candidates = connected !== "—" ? [connected] : [];
    const salesExcluded = isVehicleFullyLithiumSalesExcluded(asset.id);
    const missingImage = !asset.image;

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
      reviewStatus: resolveStatus(salesExcluded, missingImage, connected),
    };
  });
}

export function countMatchingReview(rows: AdminMatchingRow[]): number {
  return rows.filter((r) => r.reviewStatus !== "ok").length;
}
