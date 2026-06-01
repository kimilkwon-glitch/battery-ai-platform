import type { SearchVehicleAliasMatch } from "@/lib/search/search-vehicle-aliases";

import { isKgMobilityBrand, queryMentionsKgMobilityBrand } from "@/lib/search/kg-mobility-brand";

import { extractQuerySpecTokens } from "@/lib/search/search-query-specs";
import { filterSpecsForStariaVehicleCardTitle } from "@/lib/search/staria-query-spec-guard";



/** 검색어에서 세대/트림 코드 (Y400, SP2, NX4 등) */

export function extractVehicleTrimFromQuery(query: string): string | null {

  const m = query.match(
    /\b(Y\d{3}|X\d{3}|SP\d|NX\d|NQ\d|IG|GN7|HG|KA4|MQ4|CN7|RG3|MX5|TM|C8|NE|DL3|GL3|JK1|JX1|W205|F56|CE|CV|JA|TAM|US4)\b/i,
  );

  return m ? m[0].toUpperCase() : null;

}



const BRAND_PREFIX_RE =
  /^(현대|기아|제네시스|KG모빌리티|KGM|KG\/쌍용|KG\/|KG|BMW|벤츠|아우디|Audi|쌍용|SsangYong)\s/i;

function displayLabelAlreadyBranded(formal: string, brand?: string): boolean {
  const t = formal.trim();
  if (BRAND_PREFIX_RE.test(t)) return true;
  if (brand && (t.startsWith(brand) || t.startsWith(`${brand} `))) return true;
  return false;
}

/** KG/쌍용·렉스턴 등 검색·카드 표시용 차량 라벨 */

export function formatSearchVehicleDisplayLabel(

  query: string,

  alias: SearchVehicleAliasMatch,

): string {

  const trim = extractVehicleTrimFromQuery(query);

  const kgModel =

    isKgMobilityBrand(alias.brand) ||

    queryMentionsKgMobilityBrand(query) ||

    /렉스턴|티볼리|코란도|토레스|무쏘|체어맨/i.test(alias.label);



  const formal = alias.formalDisplayName ?? alias.label;

  let base: string;

  if (kgModel && queryMentionsKgMobilityBrand(query)) {

    base = displayLabelAlreadyBranded(formal) ? formal : `KG모빌리티 ${formal}`;

  } else if (kgModel) {

    base = displayLabelAlreadyBranded(formal) ? formal : `KG/쌍용 ${formal}`;

  } else if (alias.brand) {

    base = displayLabelAlreadyBranded(formal, alias.brand) ? formal : `${alias.brand} ${formal}`;

  } else {

    base = formal;

  }



  if (trim && !base.toUpperCase().includes(trim)) {

    return `${base} ${trim}`;

  }

  return base;

}



function titleContainsSpec(title: string, spec: string): boolean {

  const t = title.toUpperCase().replace(/\s+/g, "");

  const s = spec.toUpperCase().replace(/\s+/g, "");

  return t.includes(s);

}



/** 관련 차량 카드 제목 — 규격 중복 방지 */

export function formatSearchVehicleRowTitle(

  query: string,

  alias: SearchVehicleAliasMatch | null,

  fallbackModel: string,

): string {

  const specs = filterSpecsForStariaVehicleCardTitle(
    query,
    alias,
    extractQuerySpecTokens(query),
  );

  const primarySpec = specs[0];



  if (!alias) {

    if (!primarySpec) return fallbackModel;

    if (titleContainsSpec(fallbackModel, primarySpec)) return fallbackModel;

    return `${fallbackModel} · ${primarySpec}`;

  }



  const formatted = formatSearchVehicleDisplayLabel(query, alias);

  const base = formatted || fallbackModel;



  if (!primarySpec) return base;

  if (specs.every((s) => titleContainsSpec(base, s))) return base;

  return `${base} · ${primarySpec}`;

}


