import { vehicleAssets, type VehicleAsset } from "@/lib/car-assets";
import { vehicleAliasDbV01 } from "@/data/vehicle-alias-db";
import { isVehicleFullyLithiumSalesExcluded } from "@/lib/vehicle-battery-customer-policy";
import {
  hasBatteryMatch,
  resolveBatteryMatchStatus,
  resolveCatalogBatteryCandidates,
  resolveCatalogPrimaryBattery,
  type VehicleImageStatus,
} from "@/lib/vehicle-battery-match";
import { findReviewRuleForSlug } from "@/lib/admin/data/operator-review-rules";
import type { AdminReviewStatus, AdminVehicleRow } from "@/types/admin";

function isAgmSpec(code: string): boolean {
  return /AGM|DIN/i.test(code);
}

/** 차량 DB·이미지·상세 검수 — 배터리 매칭과 분리 */
function resolveVehicleReviewStatus(
  asset: VehicleAsset,
  primary: string,
  salesExcluded: boolean,
): AdminReviewStatus {
  if (salesExcluded) return "sales_excluded";
  if (!asset.image) return "image_needed";
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
    const primary = resolveCatalogPrimaryBattery(asset.id, asset);
    const candidates = resolveCatalogBatteryCandidates(asset.id, asset);
    const salesExcluded = isVehicleFullyLithiumSalesExcluded(asset.id);
    const reviewStatus = resolveVehicleReviewStatus(asset, primary, salesExcluded);
    const rules = findReviewRuleForSlug(asset.id);
    const hasImage = Boolean(asset.image);
    const imageStatus: VehicleImageStatus = hasImage ? "present" : "missing";
    const hasBatteryMatchFlag = hasBatteryMatch(primary, candidates);
    const batteryMatchStatus = resolveBatteryMatchStatus(primary, candidates);

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
      hasImage,
      needsReview: reviewStatus !== "ok" && reviewStatus !== "sales_excluded",
      hasAlias: aliasSlugs.has(asset.id),
      detailHref: `/vehicle/${asset.id}`,
      reviewMemo: rules[0]?.notes,
      salesExcluded,
      reviewStatus,
      vehicleStatus: reviewStatus,
      imageStatus,
      hasBatteryMatch: hasBatteryMatchFlag,
      batteryMatchStatus,
    };
  });
}

export function countVehiclesNeedingReview(rows: AdminVehicleRow[]): number {
  return rows.filter(
    (r) => r.vehicleStatus !== "ok" && r.vehicleStatus !== "sales_excluded",
  ).length;
}

export function countVehiclesWithoutBatteryMatch(rows: AdminVehicleRow[]): number {
  return rows.filter((r) => !r.hasBatteryMatch && !r.salesExcluded).length;
}

export function countMissingVehicleImages(rows: AdminVehicleRow[]): number {
  return rows.filter((r) => r.imageStatus === "missing").length;
}

const REVIEW_REASON_LABELS: Record<AdminReviewStatus, string> = {
  ok: "정상",
  needs_review: "확인 필요",
  terminal_check: "단자 확인",
  agm_check: "AGM 확인",
  sales_excluded: "판매 제외 확인",
  image_needed: "이미지/세대 확인",
  db_fix_needed: "규격 검수 필요",
};

export function vehicleReviewReasonLabel(row: AdminVehicleRow): string {
  if (row.reviewMemo?.trim()) return row.reviewMemo.trim();
  if (row.vehicleStatus === "ok" && !row.hasBatteryMatch) {
    return "차량 DB 정상 / 배터리 매칭 미완료";
  }
  return REVIEW_REASON_LABELS[row.vehicleStatus] ?? "확인 필요";
}

export function vehicleAdminStatusLine(row: AdminVehicleRow): string {
  const parts: string[] = [];
  parts.push(row.vehicleStatus === "ok" ? "차량 정상" : REVIEW_REASON_LABELS[row.vehicleStatus]);
  parts.push(row.imageStatus === "present" ? "이미지 있음" : "이미지 없음");
  parts.push(row.hasBatteryMatch ? "배터리 매칭 완료" : "배터리 매칭 없음");
  return parts.join(" · ");
}
