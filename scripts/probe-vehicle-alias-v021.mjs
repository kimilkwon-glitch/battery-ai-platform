#!/usr/bin/env node
/**
 * Vehicle Alias v0.2.1 — 검색 테스트 로그
 * Usage: npx tsx scripts/probe-vehicle-alias-v021.mjs
 */
import { inspectVehicleAliasResolution } from "../src/lib/search/resolve-vehicle-alias-v01.ts";
import { resolveSearchVehicleAlias } from "../src/lib/search/search-vehicle-aliases.ts";
import { vehicleAssetsToSearchRows } from "../src/lib/vehicle-search.ts";

const QUERIES = [
  "케이쓰리",
  "k3쿱",
  "산타페 더프라임",
  "더 뉴 싼타페 21년식",
  "쏘렌토 mq4 하브",
  "쏘렌토 mq4 디젤",
  "스타리아 agm80l",
  "스타리아",
  "투싼 ix",
  "투싼 하이브리드",
  "쏘나타 dn8 하이브리드",
  "셀토스 21년식",
  "렉스턴칸",
  "렉스턴",
  "제네시스 쿠페",
  "gv80 쿠페",
  "포터2 전기",
  "포터2 21년식",
];

const STARIA_AUDIT_QUERIES = [
  "스타리아 agm80l",
  "스타리아 AGM80L",
  "스타리아 cmf80l",
  "스타리아 80L",
  "스타리아 agm80r",
  "스타리아",
];

function auditStariaRow(query, first) {
  if (!first) return null;
  const model = first.model ?? "";
  return {
    model,
    origin: first.origin,
    recommend: first.recommend,
    needsReview: first.needsReview ?? false,
    showsBatterySpecInModel: /\b(AGM80L|CMF80L)\b/i.test(model),
    showsMisleadingLInModel: /\bAGM80L\b/i.test(model) || /\bCMF80L\b/i.test(model),
    recommendIsAgm80R: String(first.recommend).toUpperCase() === "AGM80R",
  };
}

const results = QUERIES.map((query) => {
  const inspect = inspectVehicleAliasResolution(query);
  const searchAlias = resolveSearchVehicleAlias(query);
  const rows = vehicleAssetsToSearchRows(query, 3, searchAlias);
  const first = rows[0];
  return {
    query,
    dangerRuleId: inspect.dangerRuleId,
    dangerPreferMultiple: inspect.dangerPreferMultiple,
    slugHint: inspect.slugHint,
    matchedAlias: inspect.matchedAlias,
    matchKind: inspect.matchKind,
    matchScore: inspect.matchScore,
    aliasDb: inspect.aliasDb
      ? {
          matchedVia: inspect.aliasDb.matchedVia,
          assetId: inspect.aliasDb.assetId ?? null,
          catalogId: inspect.aliasDb.catalogId ?? null,
          displayName: inspect.aliasDb.formalDisplayName ?? inspect.aliasDb.label,
          dbQuery: inspect.aliasDb.dbQuery,
          note: inspect.aliasDb.searchRecognitionNote ?? null,
        }
      : null,
    searchAlias: searchAlias
      ? {
          matchedVia: searchAlias.matchedVia ?? "regex-or-fallback",
          assetId: searchAlias.assetId ?? null,
          displayName: searchAlias.formalDisplayName ?? searchAlias.label,
          dbQuery: searchAlias.dbQuery,
        }
      : null,
    firstRow: first
      ? {
          model: first.model,
          href: first.href,
          imageSrc: first.imageSrc ?? null,
          needsReview: first.needsReview ?? false,
          origin: first.origin,
          recommend: first.recommend,
        }
      : null,
    assetIdUndefinedFallback:
      !searchAlias?.assetId && Boolean(first) && !first.imageSrc,
  };
});

const stariaAudit = STARIA_AUDIT_QUERIES.map((query) => {
  const searchAlias = resolveSearchVehicleAlias(query);
  const rows = vehicleAssetsToSearchRows(query, 3, searchAlias);
  return { query, ...auditStariaRow(query, rows[0]) };
});

console.log(
  JSON.stringify({ at: new Date().toISOString(), results, stariaAudit }, null, 2),
);
