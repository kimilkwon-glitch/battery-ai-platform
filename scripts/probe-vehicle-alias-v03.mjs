#!/usr/bin/env node
/**
 * Vehicle Alias v0.3 안정화 검수
 * Usage: npm run verify:alias-v03
 * Output: reports/vehicle-alias-v03-probe.json (+ stdout summary)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findAllVehicleAliasDangerRules } from "../src/data/vehicle-alias-db.ts";
import { inspectVehicleAliasResolution } from "../src/lib/search/resolve-vehicle-alias-v01.ts";
import { resolveSearchVehicleAlias } from "../src/lib/search/search-vehicle-aliases.ts";
import { vehicleAssetsToSearchRows } from "../src/lib/vehicle-search.ts";
import { formatSearchVehicleDisplayLabel } from "../src/lib/search/search-vehicle-display.ts";
import { buildSearchPageResults } from "../src/lib/search-page-results.ts";
import {
  isBatterySpecPrimaryQuery,
  isForbiddenBatteryComparePair,
  resolveBatterySpecCodesFromQuery,
} from "../src/lib/search/battery-spec-search-alias.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = path.join(__dirname, "..", "reports", "vehicle-alias-v03-probe.json");

const VEHICLE_QUERIES = [
  "케이쓰리",
  "k3쿱",
  "아반떼 cn7",
  "아반떼 21년식",
  "쏘나타 dn8 하브",
  "쏘나타 dn8 lpg",
  "그랜저 ig",
  "더뉴그랜저",
  "그랜저 gn7",
  "싼타페 더프라임",
  "더 뉴 싼타페 21년식",
  "싼타페 mx5",
  "투싼 nx4 하브",
  "투싼 nx4 디젤",
  "스타리아",
  "스타리아 agm80l",
  "스타리아 agm80r",
  "포터2 19년식",
  "포터2 21년식",
  "포터 전기",
  "봉고3 전기",
  "쏘렌토 mq4 하브",
  "쏘렌토 mq4 디젤",
  "카니발 ka4",
  "셀토스 21년식",
];

const SPEC_QUERIES = [
  "AGM60L",
  "AGM70L",
  "agm70",
  "AGM80L",
  "AGM80R",
  "AGM95L",
  "AGM105L",
  "100R",
  "100알",
  "90R",
  "DIN62L",
  "DIN74L",
  "DIN80L",
  "DIN100L",
];

/** dangerRules hit·분기 검증용 */
const DANGER_PROBES = [
  { query: "스타리아 agm80l", expectRule: "danger-staria-agm80r-vs-l", note: "AGM80R≠AGM80L" },
  { query: "스타리아 agm80r", expectRule: "danger-staria-terminal-direction", note: "스타리아 AGM80R" },
  { query: "AGM95L", expectRule: "danger-agm95l-vs-100r", note: "AGM95L≠100R" },
  { query: "100R", expectRule: "danger-agm95l-vs-100r", note: "AGM95L≠100R" },
  { query: "포터2 19년식", expectRule: "danger-porter2-90r-vs-100r", note: "90R 연식" },
  { query: "포터2 21년식", expectRule: "danger-porter2-90r-vs-100r", note: "100R 연식" },
  { query: "포터2 디젤", expectRule: "danger-porter2-diesel-vs-ev", note: "디젤≠EV" },
  { query: "포터 전기", expectRule: "danger-porter2-diesel-vs-ev", note: "디젤≠EV" },
  { query: "봉고3 디젤", expectRule: "danger-bongo3-diesel-vs-ev", note: "디젤≠EV" },
  { query: "봉고3 전기", expectRule: "danger-bongo3-diesel-vs-ev", note: "디젤≠EV" },
  { query: "쏘렌토 mq4 하브", expectRule: "danger-sorento-mq4-hev-vs-normal", note: "MQ4 HEV" },
  { query: "쏘렌토 mq4 디젤", expectRule: "danger-sorento-mq4-hev-vs-normal", note: "MQ4 일반" },
  { query: "투싼 nx4 하브", expectRule: "danger-tucson-nx4-hev-vs-normal", note: "NX4 HEV" },
  { query: "투싼 nx4 디젤", expectRule: "danger-tucson-nx4-hev-vs-normal", note: "NX4 일반" },
  { query: "니로 ev", expectRule: "danger-niro-fuel-split", note: "니로 EV" },
  { query: "니로 하이브리드", expectRule: "danger-niro-fuel-split", note: "니로 HEV" },
  { query: "코나 ev", expectRule: "danger-kona-fuel-split", note: "코나 EV" },
  { query: "코나", expectRule: "danger-kona-fuel-split", note: "코나 일반" },
  { query: "제네시스 쿠페", expectRule: "danger-genesis-coupe-vs-gv80-coupe", note: "쿠페 분리" },
  { query: "gv80 쿠페", expectRule: "danger-genesis-coupe-vs-gv80-coupe", note: "GV80 쿠페" },
  { query: "렉스턴", expectRule: "danger-rexton-suv-vs-pickup", note: "SUV" },
  { query: "렉스턴칸", expectRule: "danger-rexton-suv-vs-pickup", note: "스포츠/칸" },
];

const INFORMAL_ON_SCREEN = [
  "케이쓰리",
  "케이3",
  "케삼",
  "산타페",
  "소나타",
  "그랜져",
  "펠리세이드",
  "팰리",
];

const BRAND_DUP_RE = /^(현대|기아|제네시스)\s+\1\s/i;

function uiChecks(query, searchAlias, first) {
  const displayName = searchAlias
    ? formatSearchVehicleDisplayLabel(query, searchAlias)
    : first?.model ?? null;
  const model = first?.model ?? "";
  const matchedAlias = searchAlias?._internalMatchedAlias ?? null;

  const informalOnScreen = INFORMAL_ON_SCREEN.some(
    (t) =>
      (displayName && displayName.includes(t)) ||
      (model && model.includes(t)),
  );

  const brandDuplicated =
    BRAND_DUP_RE.test(model) ||
    BRAND_DUP_RE.test(displayName ?? "") ||
    /현대\s+현대|기아\s+기아|제네시스\s+제네시스/.test(model);

  const matchedAliasExposed =
    Boolean(searchAlias?.matchedAlias) &&
    ((model && model.includes(searchAlias.matchedAlias)) ||
      (displayName && displayName.includes(searchAlias.matchedAlias)));

  const imageSrcUndefined = first != null && first.imageSrc === undefined;
  const imageSrcMissing = first != null && (first.imageSrc == null || first.imageSrc === "");

  return {
    displayName,
    informalOnScreen,
    brandDuplicated,
    matchedAliasExposed,
    aliasesExposedOnScreen: informalOnScreen || matchedAliasExposed,
    imageSrcUndefined,
    imageSrcMissing,
    fallbackUsed: !searchAlias?.assetId && Boolean(first),
  };
}

function auditVehicle(query) {
  const inspect = inspectVehicleAliasResolution(query);
  const searchAlias = resolveSearchVehicleAlias(query);
  const rows = vehicleAssetsToSearchRows(query, 5, searchAlias);
  const first = rows[0] ?? null;
  const ui = uiChecks(query, searchAlias, first);

  return {
    query,
    aliasMatch: Boolean(searchAlias),
    matchedVia: searchAlias?.matchedVia ?? inspect.aliasDb?.matchedVia ?? null,
    slugHint: inspect.slugHint ?? searchAlias?.slugHint ?? null,
    assetId: searchAlias?.assetId ?? inspect.aliasDb?.assetId ?? null,
    displayName: ui.displayName ?? searchAlias?.formalDisplayName ?? searchAlias?.label ?? null,
    imageSrc: first?.imageSrc ?? null,
    fallback: ui.fallbackUsed,
    dangerRuleId: inspect.dangerRuleId,
    dangerPreferMultiple: inspect.dangerPreferMultiple,
    matchedAliasInternal: inspect.matchedAlias,
    firstRow: first
      ? {
          model: first.model,
          origin: first.origin,
          recommend: first.recommend,
          needsReview: first.needsReview ?? false,
        }
      : null,
    ui,
    pass:
      !ui.informalOnScreen &&
      !ui.brandDuplicated &&
      !ui.matchedAliasExposed &&
      !ui.imageSrcUndefined &&
      !(query.includes("스타리아") && first && /\bAGM80L\b/i.test(first.model)),
  };
}

function auditSpec(query) {
  const inspect = inspectVehicleAliasResolution(query);
  const searchAlias = resolveSearchVehicleAlias(query);
  const specCodes = resolveBatterySpecCodesFromQuery(query);
  const specPrimary = isBatterySpecPrimaryQuery(query);
  const rows = vehicleAssetsToSearchRows(query, 5, searchAlias);
  const page = buildSearchPageResults(query);
  const vehicles = page.vehicles ?? [];
  const batteries = page.batteries ?? [];
  const stariaInVehicles = vehicles.some((v) => /스타리아/i.test(v.model ?? ""));
  const singleVehicleLock = specPrimary && vehicles.length === 1 && !page.isSparse;
  const agm95l100rBundled =
    batteries.length >= 2 &&
    batteries.some((b) => /95/i.test(b.code)) &&
    batteries.some((b) => /100R/i.test(b.code)) &&
    isForbiddenBatteryComparePair("AGM95L", "100R");

  return {
    query,
    specCodes,
    specPrimary,
    aliasMatch: Boolean(searchAlias),
    slugHint: inspect.slugHint,
    dangerRuleId: inspect.dangerRuleId,
    vehicleRowCount: rows.length,
    pageVehicleCount: vehicles.length,
    pageBatteryCount: batteries.length,
    primaryBatteryCodes: batteries.slice(0, 3).map((b) => b.code),
    stariaInVehicles: query === "AGM80L" ? stariaInVehicles : undefined,
    singleVehicleLock,
    agm95l100rBundled,
    forbiddenPairGuard: isForbiddenBatteryComparePair("AGM95L", "100R"),
    pass:
      specPrimary &&
      !singleVehicleLock &&
      !agm95l100rBundled &&
      (query !== "AGM80L" || !stariaInVehicles) &&
      rows.length === 0,
  };
}

function auditDanger({ query, expectRule, note }) {
  const inspect = inspectVehicleAliasResolution(query);
  const searchAlias = resolveSearchVehicleAlias(query);
  const allDangerRuleIds = findAllVehicleAliasDangerRules(query);
  return {
    query,
    note,
    expectRule,
    dangerRuleId: inspect.dangerRuleId,
    allDangerRuleIds,
    dangerPreferMultiple: inspect.dangerPreferMultiple,
    slugHint: inspect.slugHint,
    aliasDbSlug: inspect.aliasDb?.slugHint ?? null,
    searchAliasAssetId: searchAlias?.assetId ?? null,
    ruleHit: allDangerRuleIds.includes(expectRule),
    pass: allDangerRuleIds.includes(expectRule),
  };
}

const vehicleResults = VEHICLE_QUERIES.map(auditVehicle);
const specResults = SPEC_QUERIES.map(auditSpec);
const dangerResults = DANGER_PROBES.map(auditDanger);

const summary = {
  vehiclePass: vehicleResults.filter((r) => r.pass).length,
  vehicleTotal: vehicleResults.length,
  specPass: specResults.filter((r) => r.pass).length,
  specTotal: specResults.length,
  dangerPass: dangerResults.filter((r) => r.pass).length,
  dangerTotal: dangerResults.length,
  assetIdFallbacks: vehicleResults.filter((r) => r.fallback),
  uiFailures: vehicleResults.filter((r) => !r.pass),
  specFailures: specResults.filter((r) => !r.pass),
  dangerFailures: dangerResults.filter((r) => !r.pass),
};

const report = {
  at: new Date().toISOString(),
  version: "v0.3.1-stabilization",
  summary,
  vehicleResults,
  specResults,
  dangerResults,
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

console.log(JSON.stringify({ reportPath: REPORT_PATH, summary }, null, 2));

const exitCode =
  summary.uiFailures.length ||
  summary.specFailures.length ||
  summary.dangerFailures.length
    ? 1
    : 0;
process.exit(exitCode);
