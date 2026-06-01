#!/usr/bin/env node
/** v0.2 alias 매칭 스모크 — resolveVehicleAliasDbV01 동작 확인 */
import { resolveVehicleAliasDbV01 } from "../src/lib/search/resolve-vehicle-alias-v01.ts";

const QUERIES = [
  "케이쓰리",
  "산타페 더프라임",
  "더 뉴 싼타페 21년식",
  "쏘렌토 mq4 하브",
  "스타리아",
  "제네시스 쿠페",
  "렉스턴 스포츠 칸",
  "포터 전기",
  "투싼 ix",
  "셀토스 21년식",
];

const results = QUERIES.map((q) => {
  const m = resolveVehicleAliasDbV01(q);
  return {
    query: q,
    matched: Boolean(m),
    label: m?.formalDisplayName ?? null,
    assetId: m?.assetId ?? null,
    note: m?.searchRecognitionNote ?? null,
    matchedVia: m?.matchedVia ?? null,
  };
});

console.log(JSON.stringify(results, null, 2));
