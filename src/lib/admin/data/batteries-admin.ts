import { BASE_BATTERY_SPECS } from "@/data/battery/baseSpecs";
import { batteryDetailHref } from "@/lib/canonical-battery-code";
import { isDeprioritizedBatterySpec } from "@/lib/battery-detail/deprioritized-specs";
import type { AdminBatteryRow } from "@/types/admin";

function batteryType(code: string): AdminBatteryRow["batteryType"] {
  if (/^DIN/i.test(code)) return "DIN";
  if (/AGM/i.test(code)) return "AGM";
  if (/^(CMF|GB|\d)/i.test(code)) return "일반";
  return "기타";
}

/** 로케트 GB / 쏠라이트 CMF 표기 검수용 */
export function detectBrandNotationIssue(code: string): string | undefined {
  if (/^CMF/i.test(code)) return "로케트 계열인데 CMF 표기 의심";
  if (/^GB/i.test(code) && !code.startsWith("GB")) return undefined;
  return undefined;
}

export function buildAdminBatteryRows(): AdminBatteryRow[] {
  return BASE_BATTERY_SPECS.map((spec) => {
    const code = spec.code;
    const missingSpecs =
      !spec.capacityAh20Hr || !spec.cca || !spec.dimensionsMm?.length;
    const hidden = isDeprioritizedBatterySpec(code);

    return {
      specCode: code,
      brand: "—",
      productName: code,
      capacityAh: spec.capacityAh20Hr ?? undefined,
      cca: spec.cca ?? undefined,
      rc: spec.rc ?? undefined,
      lengthMm: spec.dimensionsMm?.length ?? undefined,
      widthMm: spec.dimensionsMm?.width ?? undefined,
      heightMm: spec.dimensionsMm?.height ?? undefined,
      terminalDirection: spec.terminalLayout ?? undefined,
      batteryType: batteryType(code),
      hasHeroImage: true,
      detailImageCount: 0,
      detailHref: batteryDetailHref(code),
      compareHref: `/batteries/${code}/compare`,
      missingSpecs,
      adminMemo: detectBrandNotationIssue(code),
      hidden,
    };
  });
}

export function countBatteriesNeedingReview(rows: AdminBatteryRow[]): number {
  return rows.filter((r) => r.missingSpecs || r.hidden).length;
}

export function countMissingBatteryImages(rows: AdminBatteryRow[]): number {
  return rows.filter((r) => !r.hasHeroImage).length;
}
