import { buildSearchPageResults, type SearchPageResults } from "@/lib/search-page-results";
import { buildSearchIntent, type QueryPipelineIntent } from "@/lib/search/search-intent-parser";
import { normalizeQuery } from "@/lib/search/normalize-query";
import { rankSearchResults } from "@/lib/search/search-ranking";
import type { HomeSearchType } from "@/lib/home-search-types";
import type { RunBatterySearchOptions } from "@/lib/search/run-battery-search-options";
import type { SearchQADetectedIntent } from "@/lib/search/search-quality-types";

export type { RunBatterySearchOptions } from "@/lib/search/run-battery-search-options";

export { normalizeQuery as normalizeSearchQuery };

/** 검색 파이프라인 의도 (QA·디버그용) */
export function detectSearchIntent(
  rawQuery: string,
  options?: RunBatterySearchOptions,
): QueryPipelineIntent & { searchType: HomeSearchType } {
  const pipeline = buildSearchIntent(rawQuery);
  return { ...pipeline, searchType: options?.searchType ?? "all" };
}

export { rankSearchResults };

/**
 * 단일 검색 엔진 — /search 페이지·QA API·메인 검색 폼이 동일 결과를 사용한다.
 */
export function runBatterySearch(
  rawQuery?: string,
  options?: RunBatterySearchOptions,
): SearchPageResults {
  return buildSearchPageResults(rawQuery, options);
}

/** QA용 intent 라벨 매핑 */
export function mapDetectedIntent(
  pipeline: QueryPipelineIntent,
  searchType: HomeSearchType,
): SearchQADetectedIntent {
  const q = pipeline.normalizedQuery;
  const f = pipeline.flags;

  if (searchType === "qa" || f.compare || /\b(vs|차이|비교)\b/i.test(q)) return "qa";
  if (searchType === "symptom" || pipeline.symptom.hasSymptom || f.symptom) return "symptom";
  if (f.photo || /사진/.test(q)) return "photo_check";
  if (f.order || /택배|배송|주문/.test(q)) return "shipping";
  if (/매장|학장|덕천|출장/.test(q)) return "store";
  if (f.inquiry || pipeline.purpose.purposes.some((p) => /출장|교체|매장/.test(p))) return "service";
  if (searchType === "battery" || pipeline.batterySpec.hasSpec) return "battery_code";
  if (pipeline.vehicle.fuel) return "vehicle_fuel";
  if (pipeline.vehicle.year) return "vehicle_year";
  if (pipeline.vehicle.hasVehicle) return "vehicle";
  if (searchType === "vehicle") return "vehicle";
  if (/^\d{2,4}\s*년/.test(q) || /년식/.test(q)) return "vehicle_year";
  if (/하이브리드|디젤|lpg|가솔린|전기/i.test(q)) return "vehicle_fuel";
  if (/^[a-z0-9가-힣]{1,12}$/i.test(q.trim())) return "vehicle_generation";
  return "unknown";
}
