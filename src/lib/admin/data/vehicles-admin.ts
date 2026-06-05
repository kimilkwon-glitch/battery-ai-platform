import { vehicleAssets, type VehicleAsset } from "@/lib/car-assets";
import { vehicleAliasDbV01 } from "@/data/vehicle-alias-db";
import {
  getRecordsForSlug,
  getVehicleBatteryPageData,
  type VehicleBatteryRecord,
} from "@/lib/vehicleBattery";
import {
  isVehicleFullyLithiumSalesExcluded,
} from "@/lib/vehicle-battery-customer-policy";
import { OPERATOR_SLUG_PRIMARY_BATTERY } from "@/lib/vehicle-fuel-primary-battery";
import { findReviewRuleForSlug } from "@/lib/admin/data/operator-review-rules";
import type { AdminReviewStatus, AdminVehicleRow } from "@/types/admin";

function isAgmSpec(code: string): boolean {
  return /AGM|DIN/i.test(code);
}

function inferTerminal(records: VehicleBatteryRecord[]): string {
  const codes = records.flatMap((r) => [r.primaryBattery, ...r.batteryOptions]);
  if (codes.some((c) => /R$/i.test(c))) return "R";
  if (codes.some((c) => /L$/i.test(c))) return "L";
  return "—";
}

function resolveReviewStatus(
  asset: VehicleAsset,
  primary: string,
  salesExcluded: boolean,
): AdminReviewStatus {
  if (salesExcluded) return "sales_excluded";
  if (!asset.image) return "image_needed";
  if (asset.batteryMatchStatus === "needsReview") return "needs_review";
  const rules = findReviewRuleForSlug(asset.id);
  if (rules.some((r) => r.expectedPrimary !== "—" && !primary.includes(r.expectedPrimary.split("/")[0]!))) {
    return "db_fix_needed";
  }
  return "ok";
}

export function buildAdminVehicleRows(): AdminVehicleRow[] {
  const aliasSlugs = new Set(
    vehicleAliasDbV01.map((a) => a.slugHint).filter(Boolean),
  );

  return vehicleAssets.map((asset) => {
    const records = getRecordsForSlug(asset.id);
    const pageData = getVehicleBatteryPageData(asset.id);
    const primary =
      OPERATOR_SLUG_PRIMARY_BATTERY[asset.id] ??
      pageData?.summary?.representativeBattery ??
      records[0]?.primaryBattery ??
      asset.defaultBatteryCode ??
      "—";
    const candidates = [
      ...new Set(
        records.flatMap((r) => [r.primaryBattery, ...r.batteryOptions]).filter(Boolean),
      ),
    ];
    const salesExcluded = isVehicleFullyLithiumSalesExcluded(asset.id);
    const reviewStatus = resolveReviewStatus(asset, primary, salesExcluded);
    const rules = findReviewRuleForSlug(asset.id);

    return {
      slug: asset.id,
      brand: asset.brand,
      displayName: asset.displayName,
      generationName: asset.generationName,
      yearRange: asset.yearRange ?? "—",
      fuel: records.map((r) => r.fuel).filter(Boolean).join(", ") || "—",
      primaryBattery: primary,
      candidateBatteries: candidates,
      isAgm: isAgmSpec(primary),
      terminalDirection: inferTerminal(records),
      hasImage: Boolean(asset.image),
      needsReview: asset.batteryMatchStatus === "needsReview",
      hasAlias: aliasSlugs.has(asset.id),
      detailHref: `/vehicle/${asset.id}`,
      reviewMemo: rules[0]?.notes,
      salesExcluded,
      reviewStatus,
    };
  });
}

export function countVehiclesNeedingReview(rows: AdminVehicleRow[]): number {
  return rows.filter(
    (r) =>
      r.reviewStatus !== "ok" &&
      r.reviewStatus !== "sales_excluded",
  ).length;
}

export function countMissingVehicleImages(rows: AdminVehicleRow[]): number {
  return rows.filter((r) => !r.hasImage).length;
}
