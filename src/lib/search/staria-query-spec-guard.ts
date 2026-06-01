import type { SearchVehicleAliasMatch } from "@/lib/search/search-vehicle-aliases";
import type { VehicleSearchRow } from "@/components/platform/SearchVehicleResults";
import { extractQuerySpecTokens } from "@/lib/search/search-query-specs";
import { getVehicleCardBatteryInfo } from "@/lib/vehicleBattery";

export const STARIA_CANONICAL_BATTERY_CODE = "AGM80R";

const MISLEADING_STARIA_QUERY_SPECS = new Set(["AGM80L", "CMF80L", "CMF80", "AGM80", "80L"]);

const STARIA_TITLE_SPEC_SUFFIX_RE = /\s*·\s*(AGM80L|CMF80L|CMF80|AGM80|80L)\s*$/i;

/** 스타리아 차량 카드·제목 맥락 */
export function isStariaVehicleSearchContext(
  query: string,
  alias?: SearchVehicleAliasMatch | null,
): boolean {
  if (/스타리아|staria/i.test(query)) return true;
  if (alias?.assetId === "staria-us4") return true;
  if (alias?.catalogId === "staria-us4") return true;
  const label = alias?.formalDisplayName ?? alias?.label ?? "";
  if (/스타리아|staria/i.test(label)) return true;
  if (alias?.dbQuery && /스타리아|staria/i.test(alias.dbQuery)) return true;
  return false;
}

export function isMisleadingStariaQuerySpec(spec: string, query = ""): boolean {
  const u = spec.toUpperCase().replace(/\s+/g, "");
  if (MISLEADING_STARIA_QUERY_SPECS.has(u)) return true;
  if (/^AGM80L$/i.test(u) || /^CMF80L$/i.test(u)) return true;
  if (u === "80L" && /스타리아|staria/i.test(query) && !/agm\s*80\s*r|80\s*r/i.test(query)) {
    return true;
  }
  return false;
}

/** 검색어에 스타리아 + 혼동 규격(AGM80L/CMF80L/80L 등)이 포함됐는지 */
export function queryHasStariaMisleadingBatterySpec(query: string): boolean {
  const tokens = extractQuerySpecTokens(query);
  if (tokens.some((t) => isMisleadingStariaQuerySpec(t, query))) return true;
  if (/스타리아|staria/i.test(query) && /\b80\s*l\b/i.test(query) && !/\b80\s*r\b|agm\s*80\s*r/i.test(query)) {
    return true;
  }
  return false;
}

/** 차량 카드 제목에 검색어 규격 토큰을 붙이지 않음 (스타리아는 차량명 중심) */
export function filterSpecsForStariaVehicleCardTitle(
  query: string,
  alias: SearchVehicleAliasMatch | null,
  specs: string[],
): string[] {
  if (!isStariaVehicleSearchContext(query, alias)) return specs;
  return [];
}

export function stripMisleadingSpecFromStariaModelTitle(model: string): string {
  return model.replace(STARIA_TITLE_SPEC_SUFFIX_RE, "").trim();
}

/** 스타리아 행: DB AGM80R 우선, 쿼리 AGM80L/CMF80L은 추천·제목에 승격 금지 */
/** 검색 요약·히어로용 — AGM80L/CMF80L/80L을 고객 노출 규격 목록에서 제거 */
export function sanitizeStariaBatterySpecsForCustomer(
  query: string,
  alias: SearchVehicleAliasMatch | null,
  specs: string[],
): string[] {
  if (!isStariaVehicleSearchContext(query, alias)) return specs;
  const cleaned = specs.filter((s) => !isMisleadingStariaQuerySpec(s, query));
  if (queryHasStariaMisleadingBatterySpec(query) || cleaned.length < specs.length) {
    return [STARIA_CANONICAL_BATTERY_CODE];
  }
  return cleaned;
}

export function resolveStariaAliasHeroBatteryCode(
  query: string,
  alias: SearchVehicleAliasMatch,
  specs: string[],
): string | undefined {
  if (!isStariaVehicleSearchContext(query, alias)) return specs[0];
  const sanitized = sanitizeStariaBatterySpecsForCustomer(query, alias, specs);
  return sanitized[0];
}

export function applyStariaVehicleSearchRow(row: VehicleSearchRow, query: string): VehicleSearchRow {
  if (!/스타리아|staria/i.test(query) && !/스타리아|staria/i.test(row.model)) {
    return row;
  }

  const db = getVehicleCardBatteryInfo("staria-us4");
  const canonical = db.displayCode || STARIA_CANONICAL_BATTERY_CODE;
  const misleading = queryHasStariaMisleadingBatterySpec(query);
  const model = stripMisleadingSpecFromStariaModelTitle(row.model);

  return {
    ...row,
    model,
    origin: canonical,
    recommend: canonical,
    needsReview: misleading ? true : row.needsReview,
    batteryNotes: misleading
      ? "스타리아는 AGM80R(R단자) 기준입니다. AGM80L·CMF80L 표기는 혼동이 잦아 단자 방향 사진 확인을 권장합니다."
      : row.batteryNotes ?? "스타리아 디젤·LPG 배터리는 AGM80R 기준으로 안내합니다.",
  };
}
