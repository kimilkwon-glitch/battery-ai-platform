/**
 * Vehicle Alias DB v0.1 → 검색 alias 매칭 (platform slug · 정식 표기 · 연식 분기)
 */
import {
  buildAliasIndex,
  findVehicleAliasDangerRule,
  normalizeVehicleAlias,
  vehicleAliasDbV01,
  type VehicleAliasEntry,
} from "@/data/vehicle-alias-db";
import { getVehicleAsset } from "@/lib/car-assets";
import type { SearchVehicleAliasMatch } from "@/lib/search/search-vehicle-aliases";
import { normalizeQuery } from "@/lib/search/normalize-query";
import { isPorter2Query, parseVehicleYearHint } from "@/lib/search/parse-vehicle-year";
import { stripBatterySpecTokensForVehicleMatch } from "@/lib/search/battery-spec-search-alias";
import { resolveAssetIdFromSlugHint } from "@/lib/search/vehicle-alias-slug-map";

/** 고객 화면·카드에 노출하지 않는 비공식/오타성 별칭 */
const INFORMAL_ALIAS_NORMALIZED = new Set([
  "케이쓰리",
  "케이3",
  "케삼",
  "산타페",
  "소나타",
  "그랜져",
  "캡쳐",
  "펠리세이드",
  "팰리",
  "펠리",
  "에스엠3",
  "에스엠5",
  "에스엠6",
  "에스엠7",
  "큐엠3",
  "큐엠5",
  "큐엠6",
  "삼각떼",
]);

const ALIAS_INDEX = buildAliasIndex(vehicleAliasDbV01);

const EXACT_CANONICAL_BONUS = 1000;
const EXACT_ALIAS_BONUS = 900;
const GENERATION_IN_QUERY_BONUS = 120;
const YEAR_MATCH_BONUS = 80;
const PARTIAL_CONTAINS_BASE = 400;

type ScoredMatch = {
  entry: VehicleAliasEntry;
  matchedAlias: string;
  matchKind: "canonical" | "alias" | "partial";
  score: number;
};

function detectFuelFromQuery(q: string): string | null {
  if (/하이브리드|hev|하브|hybrid/i.test(q)) return "hev";
  if (/전기차|전기|ev|일렉트릭|electric|일렉트리파이드/i.test(q)) return "ev";
  if (/디젤|경유|diesel/i.test(q)) return "diesel";
  if (/lpg|lpe|엘피지|엘피이|가스|바이퓨얼/i.test(q)) return "lpg";
  if (/가솔린|휘발유|gasoline/i.test(q)) return "gasoline";
  return null;
}

function yearInRange(year: number, yearRange?: string): boolean {
  if (!yearRange) return false;
  const m = yearRange.match(/(\d{4})\s*-\s*(현재|(\d{4}))/);
  if (!m) return false;
  const start = Number(m[1]);
  const end = m[2] === "현재" ? 2030 : Number(m[3]);
  return year >= start && year <= end;
}

function scoreEntry(
  entry: VehicleAliasEntry,
  matchedAlias: string,
  matchKind: ScoredMatch["matchKind"],
  rawQ: string,
  nq: string,
  queryFuel: string | null,
  yearHint: ReturnType<typeof parseVehicleYearHint>,
): number {
  let score =
    matchKind === "canonical"
      ? EXACT_CANONICAL_BONUS
      : matchKind === "alias"
        ? EXACT_ALIAS_BONUS
        : PARTIAL_CONTAINS_BASE;

  score += normalizeVehicleAlias(matchedAlias).length;

  const genCode = entry.generationCode?.toLowerCase();
  if (genCode && nq.includes(genCode.replace(/\s/g, ""))) {
    score += GENERATION_IN_QUERY_BONUS;
  }

  if (yearHint.year && yearInRange(yearHint.year, entry.yearRange)) {
    score += YEAR_MATCH_BONUS;
  }

  if (yearHint.year === 2021 && entry.slugHint === "hyundai-santafe-tm") {
    score += 60;
  }
  if (yearHint.year === 2021 && entry.slugHint === "hyundai-santafe-dm") {
    score -= 80;
  }
  if (yearHint.year === 2021 && entry.slugHint === "hyundai-avante-cn7") {
    score += 70;
  }
  if (yearHint.year === 2021 && entry.slugHint === "hyundai-tucson-nx4-hev") {
    score -= 90;
  }

  if (/더\s*프라임|더프라임/i.test(rawQ) && entry.slugHint === "hyundai-santafe-dm") {
    score += 70;
  }
  if (/더\s*프라임|더프라임/i.test(rawQ) && entry.slugHint === "hyundai-santafe-tm") {
    score -= 40;
  }

  const fuelTag = entry.mapTo?.fuel;
  if (queryFuel && fuelTag) {
    if (fuelTag === queryFuel || (queryFuel === "hev" && fuelTag === "hev")) score += 45;
    else score -= 35;
  } else if (queryFuel && entry.intentTags.includes(queryFuel)) {
    score += 30;
  }

  if (isPorter2Query(rawQ) && entry.slugHint === "hyundai-porter2") {
    score += 50;
  }

  if (entry.slugHint === "kia-sorento-mq4-hev" && queryFuel === "hev") {
    score += 90;
  }
  if (entry.slugHint === "kia-sorento-mq4" && queryFuel === "hev") {
    score -= 70;
  }

  if (entry.slugHint === "hyundai-staria-hev" && queryFuel === "hev") {
    score += 85;
  }
  if (entry.slugHint === "hyundai-staria-us4" && queryFuel === "hev") {
    score -= 60;
  }

  if (entry.slugHint === "hyundai-tucson-nx4-hev" && queryFuel === "hev") {
    score += 80;
  }
  if (entry.slugHint === "hyundai-tucson-nx4" && queryFuel === "hev") {
    score -= 55;
  }

  if (entry.slugHint === "hyundai-sonata-dn8-hev" && queryFuel === "hev") {
    score += 75;
  }
  if (entry.slugHint === "hyundai-sonata-dn8" && queryFuel === "hev") {
    score -= 50;
  }

  if (entry.slugHint === "hyundai-kona-os" && queryFuel === "ev") {
    if (entry.mapTo?.fuel === "ev" || entry.intentTags.includes("ev")) score += 85;
    else score -= 70;
  }
  if (entry.slugHint === "hyundai-kona-os" && queryFuel === "hev") {
    if (entry.intentTags.includes("hev")) score += 60;
    else score -= 40;
  }
  if (entry.slugHint === "hyundai-kona-sx2" && queryFuel === "ev") {
    score += 80;
  }

  if (entry.slugHint === "kia-niro-de" && queryFuel === "ev") {
    if (entry.intentTags.includes("ev")) score += 80;
    else score -= 55;
  }
  if (entry.slugHint === "kia-niro-de" && queryFuel === "hev") {
    if (entry.intentTags.includes("hev")) score += 75;
    else score -= 50;
  }
  if (/phev|플러그인/i.test(rawQ) && entry.slugHint === "kia-niro-de") {
    score += 40;
  }
  if (entry.slugHint === "kia-niro-sg2" && queryFuel === "ev") {
    score += 75;
  }
  if (entry.slugHint === "kia-niro-sg2" && queryFuel === "hev") {
    score += 70;
  }

  if (entry.slugHint === "kia-bongo3" && queryFuel === "ev") {
    score -= 65;
  }
  if (entry.slugHint === "hyundai-porter2" && queryFuel === "ev") {
    score -= 60;
  }

  return score;
}

function collectMatches(rawQuery: string, nq: string, rawQ: string): ScoredMatch[] {
  const queryFuel = detectFuelFromQuery(rawQ);
  const yearHint = parseVehicleYearHint(rawQ);
  const matches: ScoredMatch[] = [];

  const push = (entry: VehicleAliasEntry, alias: string, kind: ScoredMatch["matchKind"]) => {
    matches.push({
      entry,
      matchedAlias: alias,
      matchKind: kind,
      score: scoreEntry(entry, alias, kind, rawQ, nq, queryFuel, yearHint),
    });
  };

  for (const entry of ALIAS_INDEX[nq] ?? []) {
    if (normalizeVehicleAlias(entry.canonicalName) === nq) {
      push(entry, entry.canonicalName, "canonical");
      continue;
    }
    const exactAlias = [...entry.displayAliases, ...entry.aliases].find(
      (a) => normalizeVehicleAlias(a) === nq,
    );
    if (exactAlias) {
      push(entry, exactAlias, "alias");
    }
  }

  for (const entry of vehicleAliasDbV01) {
    const all = [entry.canonicalName, ...entry.displayAliases, ...entry.aliases];
    for (const alias of all) {
      const na = normalizeVehicleAlias(alias);
      if (na.length < 3 || na === nq) continue;
      if (/^(1[6-9]|2[0-5])년(식)?$/.test(na)) continue;
      if (nq.includes(na)) {
        push(entry, alias, "partial");
      }
    }
  }

  const bySlug = new Map<string, ScoredMatch>();
  for (const m of matches) {
    const key = m.entry.slugHint;
    const prev = bySlug.get(key);
    if (!prev || m.score > prev.score) bySlug.set(key, m);
  }

  return [...bySlug.values()].sort((a, b) => b.score - a.score);
}

function isAmbiguousFamily(nq: string, scored: ScoredMatch[], familyNorm: string): boolean {
  const familyHits = scored.filter(
    (s) => normalizeVehicleAlias(s.entry.mapTo?.vehicleFamily ?? "") === familyNorm,
  );
  if (familyHits.length < 2) return false;
  const topHit = scored[0];
  const topAliasN = normalizeVehicleAlias(topHit.matchedAlias);
  return topAliasN === familyNorm || topAliasN === nq;
}

function buildRecognitionNote(
  rawQuery: string,
  formalLabel: string,
  matchedAlias: string,
  matchKind: ScoredMatch["matchKind"],
): string | undefined {
  const rawN = normalizeVehicleAlias(rawQuery.replace(/\s*배터리\s*$/i, ""));
  const matchN = normalizeVehicleAlias(matchedAlias);
  if (rawN === matchN && matchKind === "canonical") return undefined;

  if (INFORMAL_ALIAS_NORMALIZED.has(rawN)) {
    return `"${rawQuery.trim()}" 검색 결과: ${formalLabel} 기준으로 안내합니다.`;
  }

  if (matchKind === "partial" || rawN !== normalizeVehicleAlias(formalLabel)) {
    if (/하브|hev|하이브리드/i.test(rawQuery) && /쏘렌토|소렌토/i.test(rawQuery)) {
      return `"${rawQuery.trim()}" 검색 결과: 쏘렌토 MQ4 하이브리드 기준으로 안내합니다.`;
    }
    if (/더\s*프라임|더프라임/i.test(rawQuery) && /싼타페|산타페/i.test(rawQuery)) {
      return `"${rawQuery.trim()}" 검색 결과: 싼타페 더 프라임 기준으로 안내합니다.`;
    }
    if (/쿱|쿠페|koup/i.test(rawQuery) && /k3|케이/i.test(rawQuery)) {
      return `"${rawQuery.trim()}" 검색 결과: K3 1세대 계열로 안내합니다.`;
    }
    return `"${rawQuery.trim()}" 검색 결과: ${formalLabel} 계열로 안내합니다.`;
  }

  return undefined;
}

function buildDbQuery(entry: VehicleAliasEntry): string {
  const family = entry.mapTo?.vehicleFamily;
  if (entry.generationCode && family) {
    return `${family} ${entry.generationCode}`.replace(/\s+/g, " ").trim();
  }
  if (entry.generationName) {
    const gn = entry.generationName.trim();
    if (family && !normalizeVehicleAlias(gn).startsWith(normalizeVehicleAlias(family))) {
      return `${family} ${gn}`.replace(/\s+/g, " ").trim();
    }
    return gn;
  }
  if (family) return family;
  return entry.canonicalName;
}

function formalLabelFor(entry: VehicleAliasEntry, assetId?: string): string {
  if (assetId) {
    const asset = getVehicleAsset(assetId);
    if (asset?.displayName) return asset.displayName;
  }
  return entry.canonicalName;
}

export type VehicleAliasInspectResult = {
  query: string;
  dangerRuleId: string | null;
  dangerPreferMultiple: boolean;
  slugHint: string | null;
  matchedAlias: string | null;
  matchKind: string | null;
  matchScore: number | null;
  aliasDb: SearchVehicleAliasMatch | null;
  searchAlias: SearchVehicleAliasMatch | null;
};

/** v0.2.1 QA — alias DB 단계별 해석 로그 (프로덕션 검색 경로와 동일 출처) */
export function inspectVehicleAliasResolution(rawQuery: string): VehicleAliasInspectResult {
  const { normalizedQuery } = normalizeQuery(rawQuery);
  const rawQ = normalizedQuery.replace(/\s*배터리\s*$/i, "").trim();
  const danger = rawQ ? findVehicleAliasDangerRule(rawQ) : null;
  const nq = normalizeVehicleAlias(rawQ);
  const scored = rawQ ? collectMatches(rawQuery, nq, rawQ) : [];
  const top = scored[0];

  const aliasDb = resolveVehicleAliasDbV01(rawQuery);

  return {
    query: rawQuery,
    dangerRuleId: danger?.id ?? null,
    dangerPreferMultiple: danger?.preferAskOrShowMultiple ?? false,
    slugHint: top?.entry.slugHint ?? null,
    matchedAlias: top?.matchedAlias ?? null,
    matchKind: top?.matchKind ?? null,
    matchScore: top?.score ?? null,
    aliasDb,
    searchAlias: null,
  };
}

export function resolveVehicleAliasDbV01(rawQuery: string): SearchVehicleAliasMatch | null {
  const { normalizedQuery } = normalizeQuery(rawQuery);
  const rawQ = normalizedQuery.replace(/\s*배터리\s*$/i, "").trim();
  if (!rawQ) return null;

  const vehicleQ = stripBatterySpecTokensForVehicleMatch(rawQ);
  const matchQ = vehicleQ || rawQ;
  const nq = normalizeVehicleAlias(matchQ);
  const scored = collectMatches(rawQuery, nq, matchQ);
  if (!scored.length) return null;

  const danger = findVehicleAliasDangerRule(rawQ);
  if (danger?.preferAskOrShowMultiple && danger.safeSlugHints?.length) {
    const safeSet = new Set(danger.safeSlugHints);
    const safeScored = scored.filter((s) => safeSet.has(s.entry.slugHint));
    if (safeScored.length >= 2) {
      const gap = safeScored[0].score - safeScored[1].score;
      if (gap < 60) return null;
    }
  }

  const top = scored[0];
  const ambiguousK3 = nq === "k3" && isAmbiguousFamily(nq, scored, "k3");

  const yearHint = parseVehicleYearHint(rawQ);
  const fuel = top.entry.mapTo?.fuel ?? detectFuelFromQuery(rawQ);

  const assetId = ambiguousK3
    ? undefined
    : resolveAssetIdFromSlugHint(top.entry.slugHint, {
        rawQuery: rawQ,
        fuel: fuel === "hev" ? "hev" : fuel,
        year: yearHint.year,
        yearEra: yearHint.era,
      });

  const formalDisplayName = formalLabelFor(top.entry, assetId);

  return {
    label: formalDisplayName,
    formalDisplayName,
    brand: top.entry.brandLabel,
    assetId,
    catalogId: assetId,
    dbQuery: buildDbQuery(top.entry),
    searchRecognitionNote: buildRecognitionNote(
      rawQuery,
      formalDisplayName,
      top.matchedAlias,
      top.matchKind,
    ),
    matchedVia: "vehicle-alias-db-v01",
  };
}
