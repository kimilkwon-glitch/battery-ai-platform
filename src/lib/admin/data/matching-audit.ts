import { vehicleAssets } from "@/lib/car-assets";
import {
  getRecordsForSlug,
  getVehicleBatteryPageData,
} from "@/lib/vehicleBattery";
import {
  isVehicleFullyLithiumSalesExcluded,
} from "@/lib/vehicle-battery-customer-policy";
import { OPERATOR_SLUG_PRIMARY_BATTERY } from "@/lib/vehicle-fuel-primary-battery";
import type { AdminMatchingRow, AdminReviewStatus } from "@/types/admin";

function hasTerminalConflict(codes: string[]): boolean {
  const hasL = codes.some((c) => /L$/i.test(c) || /L\b/i.test(c));
  const hasR = codes.some((c) => /R$/i.test(c) || /R\b/i.test(c));
  return hasL && hasR;
}

function hasAgmConflict(codes: string[]): boolean {
  const agm = codes.filter((c) => /AGM/i.test(c));
  const plain = codes.filter((c) => !/AGM|DIN/i.test(c) && /^\d|CMF|GB/i.test(c));
  return agm.length > 0 && plain.length > 0 && codes.length > 2;
}

function resolveStatus(
  salesExcluded: boolean,
  missingImage: boolean,
  terminalConflict: boolean,
  agmConflict: boolean,
  connected: string,
): AdminReviewStatus {
  if (salesExcluded) return "sales_excluded";
  if (missingImage) return "image_needed";
  if (terminalConflict) return "terminal_check";
  if (agmConflict) return "agm_check";
  if (!connected || connected === "—") return "db_fix_needed";
  return "ok";
}

export function buildMatchingAuditRows(): AdminMatchingRow[] {
  return vehicleAssets.map((asset) => {
    const records = getRecordsForSlug(asset.id);
    const pageData = getVehicleBatteryPageData(asset.id);
    const connected =
      OPERATOR_SLUG_PRIMARY_BATTERY[asset.id] ??
      pageData?.summary?.representativeBattery ??
      records[0]?.primaryBattery ??
      "—";
    const candidates = [
      ...new Set(
        records.flatMap((r) => [r.primaryBattery, ...r.batteryOptions]).filter(Boolean),
      ),
    ];
    const allCodes = [connected, ...candidates].filter((c) => c && c !== "—");
    const terminalConflict = hasTerminalConflict(allCodes);
    const agmConflict = hasAgmConflict(allCodes);
    const salesExcluded = isVehicleFullyLithiumSalesExcluded(asset.id);
    const missingImage = !asset.image;

    return {
      slug: asset.id,
      vehicleName: asset.displayName,
      yearRange: asset.yearRange ?? "—",
      fuel: records.map((r) => r.fuel).filter(Boolean).join(", ") || "—",
      connectedBattery: connected,
      candidateBatteries: candidates,
      terminalConflict,
      agmConflict,
      salesExcluded,
      missingImage,
      hasDetailPage: true,
      reviewStatus: resolveStatus(
        salesExcluded,
        missingImage,
        terminalConflict,
        agmConflict,
        connected,
      ),
      reviewMemo: terminalConflict
        ? "L/R 단자 후보 혼재"
        : agmConflict
          ? "AGM/일반 후보 혼재"
          : undefined,
    };
  });
}

export function countMatchingReview(rows: AdminMatchingRow[]): number {
  return rows.filter((r) => r.reviewStatus !== "ok").length;
}
