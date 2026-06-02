import {
  searchVehicleAssets,
  vehicleAssetBrandLabel,
  vehicleAssetHref,
  type VehicleAsset,
} from "@/lib/car-assets";
import { batteryDetailHref } from "@/lib/canonical-battery-code";
import {
  CUSTOMER_BATTERY_SPEC_CODES,
  batterySpecTerminalHint,
  displayNameSearchPenalty,
  formatCustomerBatterySummaryForAsset,
  isCustomerGuideSymptomOnlyQuery,
} from "@/lib/search/customer-search-display";

export type CustomerBatterySuggestion = {
  kind: "battery";
  id: string;
  code: string;
  subtitle: string;
  href: string;
};

export type CustomerSearchSuggestion =
  | { kind: "vehicle"; asset: VehicleAsset; batterySummary: string }
  | CustomerBatterySuggestion;

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

function scoreBatterySpec(code: string, q: string): number {
  const c = norm(code);
  if (!q) return 0;
  if (c === q) return 120;
  if (c.startsWith(q)) return 95;
  if (c.includes(q)) return 75;
  if (q.length >= 3 && c.includes(q.slice(0, 3))) return 45;
  return 0;
}

function searchBatterySpecs(query: string, limit: number): CustomerBatterySuggestion[] {
  const q = norm(query);
  if (!q) return [];
  const scored = CUSTOMER_BATTERY_SPEC_CODES.map((code) => ({
    code,
    score: scoreBatterySpec(code, q),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ code }) => ({
    kind: "battery" as const,
    id: `spec-${code}`,
    code,
    subtitle: `배터리 규격 · ${batterySpecTerminalHint(code)}`,
    href: batteryDetailHref(code),
  }));
}

/** 차종 + 배터리 규격만 — 증상·가이드 키워드 제외 */
export function searchCustomerSuggestions(query: string, limit = 8): CustomerSearchSuggestion[] {
  const q = query.trim();
  if (!q || isCustomerGuideSymptomOnlyQuery(q)) return [];

  const qn = norm(q);
  const vehicles = searchVehicleAssets(q, limit * 2)
    .map((asset) => {
      let score = 0;
      if (norm(asset.displayName) === qn) score += 100;
      else if (asset.aliases.some((a) => norm(a) === qn)) score += 90;
      else score += 50;
      score -= displayNameSearchPenalty(asset.displayName);
      return { asset, score, batterySummary: formatCustomerBatterySummaryForAsset(asset) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const specs = searchBatterySpecs(q, Math.max(2, Math.floor(limit / 2)));
  const vehicleItems: CustomerSearchSuggestion[] = vehicles.map((v) => ({
    kind: "vehicle",
    asset: v.asset,
    batterySummary: v.batterySummary,
  }));

  const merged: CustomerSearchSuggestion[] = [];
  const seen = new Set<string>();
  for (const item of [...specs, ...vehicleItems]) {
    const key = item.kind === "battery" ? item.code : item.asset.id;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
    if (merged.length >= limit) break;
  }
  return merged;
}

export function customerSuggestionHref(s: CustomerSearchSuggestion): string {
  if (s.kind === "battery") return s.href;
  return vehicleAssetHref(s.asset);
}

export function customerSuggestionTitle(s: CustomerSearchSuggestion): string {
  if (s.kind === "battery") return s.code;
  return s.asset.displayName;
}

export function customerSuggestionBrandLabel(s: CustomerSearchSuggestion): string | null {
  if (s.kind === "battery") return "배터리 규격";
  return vehicleAssetBrandLabel(s.asset.brand);
}
