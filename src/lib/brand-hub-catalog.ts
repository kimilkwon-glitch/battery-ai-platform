import { BASE_BATTERY_SPECS, getBaseBatterySpec } from "@/data/battery/baseSpecs";
import type { BatteryBrand, BatteryBrandSpec } from "@/data/battery/types";
import { ROCKET_SPECS } from "@/data/battery/brands/rocket-specs";
import { SOLITE_SPECS } from "@/data/battery/brands/solite-specs";
import { formatDimensionsDisplay } from "@/data/battery/spec-helpers";
export type BrandHubFamilyTabId = "general" | "din" | "agm";
export type CustomerBrandHubId = "rocket" | "solite";

const BRAND_KEY: Record<CustomerBrandHubId, BatteryBrand> = {
  rocket: "ROCKET",
  solite: "SOLITE",
};

/** 고객 화면에서 제외한 DIN72L 등 — 브랜드 안내에도 미노출 */
const EXCLUDED_NORM = new Set(["DIN72L"]);

export function brandSpecPool(brandId: CustomerBrandHubId): BatteryBrandSpec[] {
  return brandId === "rocket" ? ROCKET_SPECS : SOLITE_SPECS;
}

function specCompleteness(s: BatteryBrandSpec): number {
  let score = 0;
  if (s.capacityAh20Hr != null) score += 4;
  if (s.cca != null) score += 8;
  if (s.rc != null) score += 4;
  if (s.dimensionsMm?.length && s.dimensionsMm?.width && s.dimensionsMm?.height) score += 8;
  if (s.exposeToCustomer !== false) score += 2;
  if (/[LR]$/.test(s.code) || /AL$/i.test(s.code)) score += 2;
  if (s.code === s.normalizedCode) score += 1;
  return score;
}

function resolveBaseSpecForNorm(normalizedCode: string) {
  const direct = getBaseBatterySpec(normalizedCode);
  if (direct?.code === normalizedCode) return direct;
  return (
    BASE_BATTERY_SPECS.find(
      (b) => b.code === normalizedCode || b.aliases.includes(normalizedCode),
    ) ?? null
  );
}

/** baseSpecs(로케트·쏠라이트 제원표) — 브랜드 레코드 null 필드만 동일 normalizedCode 기준 보완 */
export function mergeBrandSpecWithBaseNorm(spec: BatteryBrandSpec): BatteryBrandSpec {
  const base = resolveBaseSpecForNorm(spec.normalizedCode);
  if (!base) return spec;

  const dims =
    spec.dimensionsMm?.length && spec.dimensionsMm?.width && spec.dimensionsMm?.height
      ? spec.dimensionsMm
      : base.dimensionsMm.length
        ? {
            length: base.dimensionsMm.length,
            width: base.dimensionsMm.width ?? 175,
            height: base.dimensionsMm.height ?? 190,
            totalHeight: base.dimensionsMm.totalHeight ?? undefined,
          }
        : spec.dimensionsMm;

  const mergedRc = spec.rc ?? base.rc;
  return {
    ...spec,
    capacityAh20Hr: spec.capacityAh20Hr ?? base.capacityAh20Hr ?? null,
    cca: spec.cca ?? base.cca ?? null,
    ...(mergedRc != null ? { rc: mergedRc } : {}),
    dimensionsMm: dims,
  };
}

function codePreferenceScore(spec: BatteryBrandSpec): number {
  if (/^AGM\d+[LR]$/i.test(spec.code)) return 10;
  if (spec.code.startsWith("CMF") || spec.code.startsWith("GB")) return 5;
  return 0;
}

function pickBestInNormGroup(list: BatteryBrandSpec[]): BatteryBrandSpec {
  const merged = list.map(mergeBrandSpecWithBaseNorm);
  return [...merged].sort(
    (a, b) =>
      specCompleteness(b) - specCompleteness(a) ||
      codePreferenceScore(b) - codePreferenceScore(a) ||
      a.code.localeCompare(b.code, "ko"),
  )[0]!;
}

/** AGM 탭: normalizedCode가 AGM+용량+L/R 인 경우만 (AGM95·GB80R 제외) */
export function isBrandHubAgmNorm(normalizedCode: string): boolean {
  return /^AGM\d+(L|R)$/i.test(normalizedCode);
}

export function specMatchesBrandHubFamilyTab(
  spec: BatteryBrandSpec,
  tab: BrandHubFamilyTabId,
): boolean {
  if (EXCLUDED_NORM.has(spec.normalizedCode)) return false;
  if (tab === "agm") return isBrandHubAgmNorm(spec.normalizedCode);
  if (tab === "din") return spec.family === "DIN";
  if (isBrandHubAgmNorm(spec.normalizedCode)) return false;
  return spec.family === "CMF" || spec.family === "GB" || spec.family === "COMMERCIAL";
}

function layoutSortRank(spec: BatteryBrandSpec): number {
  const n = spec.normalizedCode;
  const c = spec.code;
  if (n === "40AL" || /AL$/i.test(c)) return 0;
  if (spec.terminalLayout === "L" || /L$/i.test(n)) return 1;
  if (spec.terminalLayout === "R" || /R$/i.test(n)) return 2;
  return 3;
}

function capacitySortKey(spec: BatteryBrandSpec): number {
  if (spec.capacityAh20Hr != null) return spec.capacityAh20Hr;
  const n = spec.normalizedCode;
  const din = n.match(/^DIN(\d+)/i);
  if (din) return parseInt(din[1], 10);
  const agm = n.match(/^AGM(\d+)/i);
  if (agm) return parseInt(agm[1], 10);
  const hy = n.match(/^(\d+)-/);
  if (hy) return parseInt(hy[1], 10);
  const lead = n.match(/^(\d+)/);
  if (lead) return parseInt(lead[1], 10);
  return 9999;
}

export function compareBrandHubCatalogSpecs(
  a: BatteryBrandSpec,
  b: BatteryBrandSpec,
): number {
  const cap = capacitySortKey(a) - capacitySortKey(b);
  if (cap !== 0) return cap;
  const lay = layoutSortRank(a) - layoutSortRank(b);
  if (lay !== 0) return lay;
  return a.normalizedCode.localeCompare(b.normalizedCode, "ko") || a.code.localeCompare(b.code, "ko");
}

/** normalizedCode당 1카드 — 가장 완전한 브랜드 제원 행 선택 */
export function listBrandHubCatalogForTab(
  brandId: CustomerBrandHubId,
  tab: BrandHubFamilyTabId,
): BatteryBrandSpec[] {
  const brand = BRAND_KEY[brandId];
  const byNorm = new Map<string, BatteryBrandSpec[]>();

  for (const s of brandSpecPool(brandId)) {
    if (s.brand !== brand) continue;
    if (!specMatchesBrandHubFamilyTab(s, tab)) continue;
    const list = byNorm.get(s.normalizedCode) ?? [];
    list.push(s);
    byNorm.set(s.normalizedCode, list);
  }

  const cards = [...byNorm.values()].map((group) => pickBestInNormGroup(group));
  return cards.sort(compareBrandHubCatalogSpecs);
}

export function brandHubPrimaryTitle(spec: BatteryBrandSpec): string {
  if (spec.family === "DIN" || spec.normalizedCode.startsWith("DIN")) {
    return spec.normalizedCode;
  }
  return spec.normalizedCode;
}

export function brandHubManufacturerLine(
  spec: BatteryBrandSpec,
  brandId: CustomerBrandHubId,
): string | null {
  const label = brandId === "rocket" ? "로케트" : "쏠라이트";
  if (spec.family === "DIN" || spec.normalizedCode.startsWith("DIN")) {
    if (spec.code !== spec.normalizedCode) return `${label} ${spec.code}`;
    return null;
  }
  if (spec.code !== spec.normalizedCode && (spec.code.startsWith("GB") || spec.code.startsWith("CMF"))) {
    return `${label} ${spec.code}`;
  }
  if (spec.code.startsWith("AGM") && spec.code !== spec.normalizedCode) {
    return `${label} ${spec.code}`;
  }
  return null;
}

export type BrandHubFieldGap = {
  code: string;
  brand: CustomerBrandHubId;
  tab: BrandHubFamilyTabId;
  missing: ("cca" | "rc" | "size" | "capacity")[];
  cause: "db_null" | "display";
};

export function auditBrandHubFieldGaps(brandId: CustomerBrandHubId): BrandHubFieldGap[] {
  const gaps: BrandHubFieldGap[] = [];
  const tabs: BrandHubFamilyTabId[] = ["general", "din", "agm"];

  for (const tab of tabs) {
    for (const spec of listBrandHubCatalogForTab(brandId, tab)) {
      const merged = mergeBrandSpecWithBaseNorm(spec);
      const missing: BrandHubFieldGap["missing"] = [];
      if (merged.capacityAh20Hr == null) missing.push("capacity");
      if (merged.cca == null) missing.push("cca");
      if (merged.rc == null) missing.push("rc");
      if (!formatDimensionsDisplay(merged.dimensionsMm)) missing.push("size");
      if (missing.length) {
        gaps.push({
          code: spec.code,
          brand: brandId,
          tab,
          missing,
          cause: "db_null",
        });
      }
    }
  }
  return gaps;
}
