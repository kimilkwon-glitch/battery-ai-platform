import { vehicleAssets, type VehicleAsset } from "@/lib/car-assets";
import { vehicleAliasDbV01 } from "@/data/vehicle-alias-db";
import { isVehicleFullyLithiumSalesExcluded } from "@/lib/vehicle-battery-customer-policy";
import { OPERATOR_SLUG_PRIMARY_BATTERY } from "@/lib/vehicle-fuel-primary-battery";
import { findReviewRuleForSlug } from "@/lib/admin/data/operator-review-rules";
import type { AdminReviewStatus, AdminVehicleRow } from "@/types/admin";

function isAgmSpec(code: string): boolean {
  return /AGM|DIN/i.test(code);
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
  const expected = rules[0]?.expectedPrimary;
  if (expected && expected !== "—" && !primary.includes(expected.split("/")[0]!)) {
    return "db_fix_needed";
  }
  return "ok";
}

export function buildAdminVehicleRows(): AdminVehicleRow[] {
  const aliasSlugs = new Set(
    vehicleAliasDbV01.map((a) => a.slugHint).filter(Boolean),
  );

  return vehicleAssets.map((asset) => {
    const primary =
      OPERATOR_SLUG_PRIMARY_BATTERY[asset.id] ??
      asset.defaultBatteryCode ??
      "—";
    const candidates = primary !== "—" ? [primary] : [];
    const salesExcluded = isVehicleFullyLithiumSalesExcluded(asset.id);
    const reviewStatus = resolveReviewStatus(asset, primary, salesExcluded);
    const rules = findReviewRuleForSlug(asset.id);

    return {
      slug: asset.id,
      brand: asset.brand,
      displayName: asset.displayName,
      generationName: asset.generationName,
      yearRange: asset.yearRange ?? "—",
      fuel: "—",
      primaryBattery: primary,
      candidateBatteries: candidates,
      isAgm: isAgmSpec(primary),
      terminalDirection: /R$/i.test(primary) ? "R" : /L$/i.test(primary) ? "L" : "—",
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
    (r) => r.reviewStatus !== "ok" && r.reviewStatus !== "sales_excluded",
  ).length;
}

export function countMissingVehicleImages(rows: AdminVehicleRow[]): number {
  return rows.filter((r) => !r.hasImage).length;
}
