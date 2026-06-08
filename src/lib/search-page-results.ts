import type { VehicleSearchRow } from "@/components/platform/SearchVehicleResults";
import { resolveSpec } from "@/lib/data/resolveSpec";
import { searchAll, type UnifiedSearchResult } from "@/lib/data/searchAll";
import { batteries, classifySearch, compareHref, getBattery, type SearchIntent } from "@/lib/platform-data";
import { extractOrderedQuerySpecs, extractQuerySpecTokens } from "@/lib/search/search-query-specs";
import {
  formatSearchVehicleDisplayLabel,
  formatSearchVehicleRowTitle,
} from "@/lib/search/search-vehicle-display";
import {
  queryHasStariaMisleadingBatterySpec,
  resolveStariaAliasHeroBatteryCode,
  sanitizeStariaBatterySpecsForCustomer,
} from "@/lib/search/staria-query-spec-guard";
import {
  isKgMobilityBrand,
  KG_MOBILITY_CANONICAL_BRAND,
  queryMentionsKgMobilityBrand,
} from "@/lib/search/kg-mobility-brand";
import { vehicleAssetsToSearchRows } from "@/lib/vehicle-search";
import { batteryDetailHref, canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { isDeprioritizedBatterySpec } from "@/lib/battery-detail/deprioritized-specs";
import { isBatteryMatched, normalizeBatteryCode } from "@/lib/batteryNormalize";
import { resolveSearchVehicleAlias, type SearchVehicleAliasMatch } from "@/lib/search/search-vehicle-aliases";
import { HUB_PHOTO, HUB_SHOP, HUB_SHOP_ANCHORS, HUB_STORE } from "@/lib/customer-hub-routes";
import { prependHubCtas } from "@/lib/search/search-hub-cta";
import {
  buildIntentCtas,
  buildIntentMessage,
  detectQueryIntentFlags,
  isSymptomDiagnosisPrimaryQuery,
  resolveSearchIntentLabel,
  shouldPrioritizeGuidance,
  symptomHrefFromIntent,
} from "@/lib/search/search-intent";
import {
  buildVehiclePurposeMessage,
  extractPurposeKeywords,
  isFocusSearchQuery,
} from "@/lib/search/search-purpose";
import {
  buildSpecFitMessage,
  isJisD31Spec,
  vehicleSpecFitConfirmed,
} from "@/lib/search/search-spec-fit";
import { normalizeQuery } from "@/lib/search/normalize-query";
import { buildSearchIntent } from "@/lib/search/search-intent-parser";
import { resolveBatteryTerminalLabel } from "@/lib/battery-spec-display";
import { buildSearchSummary, type RecognizedSpecResult } from "@/lib/search/search-summary";
import { shouldSuppressPopularBatteries } from "@/lib/search/search-ranking";
import {
  getCuratedVehicleQuestions,
  rankQuestionsForVehicleContext,
} from "@/lib/search/search-vehicle-questions";
import { computeTopFoldLimits } from "@/lib/search/search-top-fold";
import type { RunBatterySearchOptions } from "@/lib/search/run-battery-search-options";
import { isCustomerCatalogSearchType } from "@/lib/home-search-types";
import {
  isCustomerGuideSymptomOnlyQuery,
  sanitizeCustomerBatterySummary,
  toCustomerVehicleSearchRow,
} from "@/lib/search/customer-search-display";
import {
  buildSearchUxPresentation,
  emptySearchUx,
  type SearchUxPresentation,
} from "@/lib/search/search-ux-presentation";

const DEFAULT_VISIBLE = 3;
export type RecognizedVehicleResult = {
  title: string;
  vehicleLabel: string;
  fuelLabel: string | null;
  specTier: "exact" | "db" | "map" | "none";
  specFieldLabel: string | null;
  specDisplay: string | null;
  specLabel: string | null;
  /** @deprecated UI는 secondaryNote·primaryBatteryCode 사용 */
  specCheckNote: string | null;
  candidateLabel: string | null;
  candidateDisplay: string | null;
  /** 보조 안내 — 사진 확인 권장 등 */
  confirmNote: string | null;
  /** 연식 분기 등 복수 후보 (포터2 90R/100R) */
  candidateBatteryCodes?: string[];
  yearBranchLinks?: SearchCta[];
  bodyMessage: string | null;
  confidenceLabel: string | null;
  /** 고객 응답에서는 제외 — 운영자 디버그용 */
  specSource?: "vehicle-battery-db" | "fitment-override" | "car-asset-default" | "candidate-map" | null;
  dbMatchKey?: string | null;
  dbRecordId?: string | null;
  dbRecordDisplayName?: string | null;
  primaryBatteryCode: string | null;
  secondaryNote: string | null;
  basisLabel: string | null;
  fallbackMessage: string | null;
  guidance: string;
  href: string;
  ctas: SearchCta[];
  secondaryLinks: SearchCta[];
};

export type { RecognizedSpecResult };
const MIN_RELEVANCE_SCORE = 55;
const MIN_BATTERY_SCORE = 65;

export type SearchBatteryItem = {
  code: string;
  subtitle: string;
  href: string;
  score: number;
  variantNote?: string;
};

export type SearchHeroResult = {
  title: string;
  vehicleName?: string;
  batteryCode?: string;
  status: "confirmed" | "needs_check";
  statusLabel: string;
  message: string;
  href: string;
  detailLabel: string;
};

export type SearchSummaryKeywords = {
  vehicleKeywords: string[];
  batterySpecs: string[];
  symptomKeywords: string[];
};

export type SearchCta = {
  label: string;
  href: string;
};

export type SearchPageResults = {
  query: string;
  displayQuery: string;
  intent: SearchIntent;
  chips: string[];
  summary: SearchSummaryKeywords;
  ctas: SearchCta[];
  hero: SearchHeroResult | null;
  vehicles: VehicleSearchRow[];
  vehiclesTotal: number;
  batteries: SearchBatteryItem[];
  batteriesTotal: number;
  questions: UnifiedSearchResult[];
  questionsTotal: number;
  guides: UnifiedSearchResult[];
  guidesTotal: number;
  relatedKeywords: string[];
  isSparse: boolean;
  insufficientMessage: string | null;
  missingSpecMessage: string | null;
  missingVehicleMessage: string | null;
  guidanceNote: string | null;
  intentMessage: string | null;
  specFitMessage: string | null;
  orderGuidance: string | null;
  compareIntent: boolean;
  aliasVehicleNote: string | null;
  /** 별칭 검색 인식 안내 (비공식 별칭 목록 미노출) */
  searchRecognitionNote: string | null;
  upgradeGuidance: string | null;
  recognizedVehicle: RecognizedVehicleResult | null;
  recognizedSpec: RecognizedSpecResult | null;
  popularBatteries: SearchBatteryItem[];
  popularBatteriesTotal: number;
  emptySuggestions: string[];
  defaultVisible: number;
  deferSecondary: boolean;
  hadError: boolean;
  queryHasBatterySpec: boolean;
  primarySpec: string | null;
  terminalTypeLabel: string | null;
  showSymptomSidebar: boolean;
  symptomDiagnosisFirst: boolean;
  compareBatteryCodes: string[] | null;
  /** 차종·규격 검색 — 질문/가이드보다 차량·규격 결과 우선 */
  catalogPrimaryIntent: boolean;
  ux: SearchUxPresentation;
};

const INSUFFICIENT_MESSAGE =
  "정확한 결과가 부족합니다. 차량명 + 연식 + 연료를 함께 입력하거나 현재 장착된 배터리 사진으로 확인해 주세요.";

const MISSING_SPEC_MESSAGE =
  "검색한 규격을 정확히 찾지 못했습니다. 차량 연식·연료 또는 실제 배터리 사진 확인이 필요합니다.";

const GUIDANCE_NOTE =
  "단자 방향, 연식, 연료에 따라 장착 가능 여부가 달라질 수 있습니다.";

function isKnownBatterySpec(spec: string): boolean {
  const n = normalizeBatteryCode(spec);
  if (!n) return false;
  return batteries.some((b) => isBatteryMatched(n, b.code) || normalizeBatteryCode(b.code) === n);
}

function extractSymptomKeywords(
  query: string,
  intent: SearchIntent,
  alias: SearchVehicleAliasMatch | null,
): string[] {
  const purpose = extractPurposeKeywords(query);
  if (purpose.length > 0) return purpose;

  const found: string[] = [];
  const symptomTokens = ["시동", "방전", "블랙박스", "사진", "대체", "차이", "증상", "겨울", "재방전", "교체", "업그레이드", "택배", "문의", "가격", "규격"];
  const hasSymptomToken = symptomTokens.some((t) => query.includes(t));
  if (!alias && hasSymptomToken && intent.type === "symptom" && intent.symptom?.title) {
    found.push(intent.symptom.title);
  }
  for (const t of symptomTokens) {
    if (query.includes(t) && !found.includes(t)) found.push(t);
  }
  return found.slice(0, 4);
}

function buildSummaryKeywords(
  query: string,
  intent: SearchIntent,
  specs: string[],
  alias: SearchVehicleAliasMatch | null,
): SearchSummaryKeywords {
  const vehicleKeywords: string[] = [];
  if (alias?.label) {
    vehicleKeywords.push(formatSearchVehicleDisplayLabel(query, alias));
    if (
      isKgMobilityBrand(alias.brand) ||
      /렉스턴|티볼리|코란도|토레스|무쏘|체어맨/i.test(alias.label)
    ) {
      if (!vehicleKeywords.some((v) => v.includes("KG모빌리티"))) {
        vehicleKeywords.push("KG모빌리티");
      }
    }
  } else if (intent.vehicle?.displayName) {
    const brand = intent.vehicle.brand ?? "";
    vehicleKeywords.push(brand ? `${brand} ${intent.vehicle.displayName}` : intent.vehicle.displayName);
  }
  const gen = extractGenerationChip(query);
  if (gen && !vehicleKeywords.some((v) => v.toUpperCase().includes(gen))) {
    vehicleKeywords.push(gen);
  }
  const vehiclePart = queryVehiclePart(query, specs);
  const nonVehicleHint = /주문|확인|대체|차이|호환|사진|방전|시동|택배|문의|vs|비교|배터리/i;
  if (
    vehiclePart &&
    vehiclePart.length >= 2 &&
    vehiclePart.length <= 24 &&
    !nonVehicleHint.test(vehiclePart) &&
    !vehicleKeywords.length
  ) {
    vehicleKeywords.push(vehiclePart);
  }
  return {
    vehicleKeywords: [...new Set(vehicleKeywords.filter(Boolean))],
    batterySpecs: summarySpecLabels(query, specs),
    symptomKeywords: extractSymptomKeywords(query, intent, alias),
  };
}

const ORDER_GUIDANCE_TEXT =
  "택배 주문 전에는 차량 연식·연료·단자 방향·현재 장착 배터리 사진 확인이 필요합니다.";

const ALIAS_VEHICLE_NOTE = "연료를 선택하면 더 정확해집니다.";

const UPGRADE_REVIEW_GUIDANCE =
  "업그레이드 후보 규격은 차량 트레이 공간, 단자 방향, ISG 여부, 현재 장착 배터리 기준으로 확인해야 합니다. 트레이 사이즈 정보가 없는 차량은 사진 확인 또는 문의 후 안내합니다.";

function isUpgradeReviewWithoutSpecs(query: string, specTokens: string[]): boolean {
  if (!/업그레이드|검토/i.test(query)) return false;
  if (specTokens.length > 0) return false;
  return !/\b(AGM|DIN|CMF|EFB)\d+[LR]?/i.test(query);
}

function specDetailHref(
  specs: string[],
  specTokens: string[],
  topBattery: SearchBatteryItem | undefined,
  hero: SearchHeroResult | null,
): string {
  const primary = specTokens[0] ?? specs[0];
  if (primary) {
    const hrefCode = canonicalBatteryCode(resolveSpec(primary) || primary);
    if (hrefCode && isKnownBatterySpec(hrefCode)) {
      return batteryDetailHref(hrefCode);
    }
  }
  if (topBattery?.href) return topBattery.href;
  if (hero?.href && !hero.href.includes("#")) return hero.href;
  return "/guides";
}

function buildCompareHref(specTokens: string[], specs: string[]): string | undefined {
  const ordered = specTokens.length > 0 ? specTokens : specs;
  const codes = ordered
    .map((s) => normalizeBatteryCode(resolveSpec(s) || s))
    .filter(Boolean);
  if (codes.length >= 2) return compareHref(codes[0], codes[1]);
  if (codes.length === 1) return compareHref(codes[0], codes[0]);
  return "/compare";
}

function mergeSearchCtas(primary: SearchCta[], required: SearchCta[]): SearchCta[] {
  const seen = new Set<string>();
  const out: SearchCta[] = [];
  for (const cta of [...primary, ...required]) {
    if (seen.has(cta.label)) continue;
    seen.add(cta.label);
    out.push(cta);
  }
  return out;
}

function buildRequiredCtas(
  flags: ReturnType<typeof detectQueryIntentFlags>,
  compareLink: string,
  specHref: string,
  query: string,
): SearchCta[] {
  const base: SearchCta[] = [];
  if (flags.order) {
    base.push(
      { label: "배터리 검색", href: HUB_SHOP },
      { label: "주문 전 규격 확인", href: HUB_SHOP_ANCHORS.orderCheck },
      { label: "택배 주문 전 확인", href: HUB_SHOP_ANCHORS.delivery },
      { label: "단자 방향 확인", href: HUB_SHOP_ANCHORS.terminal },
      { label: "사진으로 확인", href: HUB_PHOTO },
      { label: "문의하기", href: "/ai" },
    );
    return prependHubCtas(base, query, flags);
  }
  if (flags.compare) {
    base.push(
      { label: "규격 비교 보기", href: compareLink },
      { label: "사진으로 확인", href: HUB_PHOTO },
      { label: "문의하기", href: "/ai" },
      { label: "차량 정보 더 입력", href: "/vehicles" },
    );
    return prependHubCtas(base, query, flags);
  }
  base.push(
    { label: "사진으로 확인", href: HUB_PHOTO },
    { label: "문의하기", href: "/ai" },
    { label: flags.compare ? "규격 비교 보기" : "규격 가이드 보기", href: flags.compare ? compareLink : specHref },
    { label: "차량 정보 더 입력", href: "/vehicles" },
  );
  return prependHubCtas(base, query, flags);
}

function buildCtas(
  specs: string[],
  specTokens: string[],
  flags: ReturnType<typeof detectQueryIntentFlags>,
  hero: SearchHeroResult | null,
  topBattery: SearchBatteryItem | undefined,
  query: string,
): SearchCta[] {
  const specHref = specDetailHref(specs, specTokens, topBattery, hero);
  const compareLink = buildCompareHref(specTokens, specs) ?? specHref;
  return buildRequiredCtas(flags, compareLink, specHref, query);
}

function emptyResults(partial?: Partial<SearchPageResults>): SearchPageResults {
  const intent = classifySearch("");
  return {
    query: "",
    displayQuery: "",
    intent,
    chips: [],
    summary: { vehicleKeywords: [], batterySpecs: [], symptomKeywords: [] },
    ctas: [],
    hero: null,
    vehicles: [],
    vehiclesTotal: 0,
    batteries: [],
    batteriesTotal: 0,
    questions: [],
    questionsTotal: 0,
    guides: [],
    guidesTotal: 0,
    relatedKeywords: [],
    isSparse: true,
    insufficientMessage: null,
    missingSpecMessage: null,
    missingVehicleMessage: null,
    guidanceNote: null,
    intentMessage: null,
    specFitMessage: null,
    orderGuidance: null,
    compareIntent: false,
    aliasVehicleNote: null,
    searchRecognitionNote: null,
    upgradeGuidance: null,
    recognizedVehicle: null,
    recognizedSpec: null,
    popularBatteries: [],
    popularBatteriesTotal: 0,
    emptySuggestions: EMPTY_SUGGESTIONS,
    defaultVisible: DEFAULT_VISIBLE,
    deferSecondary: true,
    hadError: false,
    queryHasBatterySpec: false,
    primarySpec: null,
    terminalTypeLabel: null,
    showSymptomSidebar: false,
    symptomDiagnosisFirst: false,
    compareBatteryCodes: null,
    catalogPrimaryIntent: false,
    ux: emptySearchUx(),
    ...partial,
  };
}

const EMPTY_SUGGESTIONS = [
  "아이오닉5 배터리",
  "그랜저 IG AGM70L",
  "K8 배터리",
];

const GUIDE_KEYWORDS = /bms|ibs|단자|agm|din|사진|단방향|등록|초기화|호환|업그레이드/i;
const SYMPTOM_KEYWORDS = /시동|방전|딸깍|늦|겨울|cca|블랙박스|재방전|안걸/i;

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

function extractBatterySpecs(query: string): string[] {
  const fromTokens = extractOrderedQuerySpecs(query);
  const patterns =
    query.match(
      /\b(AGM|DIN|CMF|EFB)\d+[LR]?|\b(AGM|DIN|CMF|EFB)\s+\d+\s*[LR]?|\b\d{2,3}D\d+[LR]\b|\b\d{2,3}[LR]\b/gi,
    ) ?? [];
  const codes = patterns.map((p) => resolveSpec(p.replace(/\s+/g, ""))).filter(Boolean);
  const bareQuery = query.trim();
  if (!/\s/.test(bareQuery) && /^(AGM|DIN|CMF|EFB|\d)/i.test(bareQuery)) {
    const resolved = resolveSpec(bareQuery);
    if (resolved && /^(AGM|DIN|CMF|EFB|\d)/i.test(resolved)) {
      codes.unshift(resolved);
    }
  }
  const resolved = [...fromTokens, ...codes.map(normalizeBatteryCode)].filter(Boolean);
  return [...new Set(resolved)];
}

function summarySpecLabels(query: string, specs: string[]): string[] {
  const tokens = extractOrderedQuerySpecs(query);
  return tokens.length > 0 ? tokens : specs;
}

function terminalVariant(code: string): string | null {
  const c = normalizeBatteryCode(code);
  if (c.endsWith("R")) return c.slice(0, -1) + "L";
  if (c.endsWith("L")) return c.slice(0, -1) + "R";
  return null;
}

function extractFuelChip(query: string): string | null {
  const fuels = ["가솔린", "디젤", "LPG", "하이브리드", "HEV", "PHEV", "전기", "EV"];
  for (const f of fuels) {
    if (query.includes(f)) return f === "HEV" || f === "PHEV" ? "하이브리드" : f;
  }
  return null;
}

function extractBrandChip(query: string): string | null {
  if (queryMentionsKgMobilityBrand(query)) return KG_MOBILITY_CANONICAL_BRAND;
  const brands = ["제네시스", "현대", "기아", "BMW", "벤츠", "메르세데스", "아udi", "볼보", "미니"];
  for (const b of brands) {
    if (query.toLowerCase().includes(b.toLowerCase())) return b;
  }
  return null;
}

function extractTerminalChip(query: string, specs: string[]): string | null {
  if (/r단자|플러스.*오른|단자.*r/i.test(query)) return "R단자";
  if (/l단자|플러스.*왼|단자.*l/i.test(query)) return "L단자";
  const spec = specs[0];
  if (spec?.endsWith("R")) return "R단자";
  if (spec?.endsWith("L")) return "L단자";
  return null;
}

function queryVehiclePart(query: string, specs: string[]): string {
  let q = query;
  for (const spec of specs) {
    q = q.replace(new RegExp(spec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "");
  }
  return q.replace(/\s+/g, " ").trim();
}

function extractGenerationChip(query: string): string | null {
  const m = query.match(
    /\b(RG3|MQ4|IG|GN7|HG|TM|MX5|CN7|KA4|NX4|NQ5|DL3|GL3|SP2|NE|CE|CV|JK1|JX1|W205|F56|Y400|X100|JA|TAM|US4|G30)\b/i,
  );
  return m ? m[0].toUpperCase() : null;
}

function primarySpecTerminalLabel(spec: string): string | null {
  const code = normalizeBatteryCode(resolveSpec(spec) || spec);
  if (!isKnownBatterySpec(code)) return null;
  return resolveBatteryTerminalLabel(code);
}

function resolveSummaryBatterySpecCodes(
  recognizedVehicle: RecognizedVehicleResult | null,
  recognizedSpec: RecognizedSpecResult | null,
  queryHasBatterySpec: boolean,
  parsedSpecs: string[],
): string[] {
  if (queryHasBatterySpec && parsedSpecs.length > 0) {
    return parsedSpecs.filter((s) => isKnownBatterySpec(normalizeBatteryCode(resolveSpec(s) || s)));
  }
  if (recognizedVehicle?.candidateBatteryCodes?.length) {
    return recognizedVehicle.candidateBatteryCodes;
  }
  if (recognizedVehicle?.primaryBatteryCode) {
    return [recognizedVehicle.primaryBatteryCode];
  }
  if (recognizedSpec?.primaryBatteryCode) {
    return [recognizedSpec.primaryBatteryCode];
  }
  return [];
}

function shouldShowMissingSpecMessage(input: {
  symptomDiagnosisFirst: boolean;
  hasBatteryFocus: boolean;
  compareIntent: boolean;
  compareBatteryCodes: string[] | null;
  recognizedVehicle: RecognizedVehicleResult | null;
  recognizedSpec: RecognizedSpecResult | null;
  summaryBatterySpecs: string[];
}): boolean {
  if (input.symptomDiagnosisFirst) return false;
  if (input.hasBatteryFocus) return false;
  if (input.compareIntent && (input.compareBatteryCodes?.length ?? 0) >= 2) return false;
  if (input.recognizedVehicle?.primaryBatteryCode || input.recognizedVehicle?.candidateBatteryCodes?.length) {
    return false;
  }
  if (input.recognizedSpec?.primaryBatteryCode) return false;
  if (input.summaryBatterySpecs.length === 0) return false;
  const unknown = input.summaryBatterySpecs.filter(
    (s) => !isKnownBatterySpec(normalizeBatteryCode(resolveSpec(s) || s)),
  );
  return unknown.length > 0;
}

function parseChips(query: string, intent: SearchIntent, specs: string[]): string[] {
  const chips: string[] = [];
  if (intent.vehicle?.displayName) chips.push(intent.vehicle.displayName);
  const gen = extractGenerationChip(query);
  if (gen && !chips.some((c) => c.toUpperCase().includes(gen))) chips.push(gen);
  for (const s of specs) chips.push(s);
  const fuel = extractFuelChip(query);
  if (fuel) chips.push(fuel);
  const brand = extractBrandChip(query);
  if (brand) chips.push(brand);
  const terminal = extractTerminalChip(query, specs);
  if (terminal) chips.push(terminal);
  return [...new Set(chips)].slice(0, 6);
}

function tokenMatchesVehicleQuery(token: string, queryNorm: string): boolean {
  const nt = norm(token);
  if (nt.length < 2) return false;
  if (queryNorm === nt) return true;
  if (nt.length <= 3 && queryNorm.length >= 5) {
    if (queryNorm.endsWith(nt) && queryNorm.length > nt.length + 2) return false;
    if (queryNorm.includes(nt) && !queryNorm.startsWith(nt) && queryNorm.length > nt.length + 2)
      return false;
  }
  return queryNorm.includes(nt);
}

function scoreVehicleRow(
  row: VehicleSearchRow,
  query: string,
  specs: string[],
  alias: SearchVehicleAliasMatch | null,
  vehicleQuery: string,
): number {
  const q = norm(queryVehiclePart(vehicleQuery, specs) || vehicleQuery || query);
  const model = norm(row.model);
  let score = 0;
  if (alias) {
    const labelN = norm(alias.label);
    if (model.includes(labelN) || labelN.includes(model)) score += 220;
  }
  if (model && q.includes(model)) score += 100;
  else if (
    model &&
    model.split(/[^a-z0-9가-힣]+/).some((t) => tokenMatchesVehicleQuery(t, q))
  )
    score += 75;
  const gen = extractGenerationChip(query);
  if (gen && norm(row.model).includes(norm(gen))) score += 30;
  for (const spec of specs) {
    const s = norm(spec);
    const slug = slugFromVehicleHref(row.href);
    const fitConfirmed = slug ? vehicleSpecFitConfirmed(slug, spec) : false;
    if (isJisD31Spec(spec) && !fitConfirmed) continue;
    if (norm(row.recommend).includes(s) || norm(row.origin).includes(s)) score += fitConfirmed ? 40 : 0;
    if (norm(row.fuel).includes(s)) score += 20;
  }
  return score;
}

function filterVehicles(
  rows: VehicleSearchRow[],
  query: string,
  specs: string[],
  alias: SearchVehicleAliasMatch | null,
  vehicleQuery: string,
): VehicleSearchRow[] {
  const blockCrVForEv6 = /\bEV6\b/i.test(query);
  const blockIceNoiseForIoniq5 = /아이오닉\s*5|아이오닉5|ioniq\s*5|ioniq5/i.test(query);

  const scored = rows
    .map((row) => ({
      row,
      score: scoreVehicleRow(row, query, specs, alias, vehicleQuery),
    }))
    .filter(({ score, row }) => {
      if (blockCrVForEv6 && /\/vehicle\/cr-v\b/i.test(row.href)) return false;
      if (blockIceNoiseForIoniq5 && /\/vehicle\/cr-v\b/i.test(row.href)) return false;
      if (alias && norm(row.model).includes(norm(alias.label.split(" ")[0]))) return true;
      return score >= MIN_RELEVANCE_SCORE;
    })
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    const q = norm(vehicleQuery || query);
    const loose = rows.filter((row) => {
      const model = norm(row.model);
      if (!model || !q) return false;
      if (model.includes(q) || q.includes(model)) return true;
      const tokens = q.split(/[^a-z0-9가-힣]+/).filter((t) => t.length >= 2);
      return tokens.some((t) => model.includes(norm(t)));
    });
    if (loose.length > 0) return loose;
    if (alias) {
      const fallback = rows.find((row) => norm(row.model).includes(norm(alias.label.split(/\s+/)[0] ?? alias.label)));
      return fallback ? [fallback] : rows.slice(0, 1);
    }
    return [];
  }
  return scored.map((s) => s.row);
}

function shouldShowVehiclePickerGrid(
  query: string,
  rawVehicleRows: VehicleSearchRow[],
  vehicleRows: VehicleSearchRow[],
): boolean {
  const count = Math.max(rawVehicleRows.length, vehicleRows.length);
  if (count <= 1) return false;
  const nq = norm(query.replace(/\s*배터리\s*$/i, ""));
  if (nq === "k3" || /케이쓰리|케이3|케삼/i.test(query)) return true;
  return count >= 2;
}

function mapHitToBatteryItem(
  h: UnifiedSearchResult,
  primary?: string,
  exact = false,
  options?: { unverifiedFit?: boolean },
): SearchBatteryItem {
  const code = canonicalBatteryCode(h.title) || normalizeBatteryCode(h.title);
  let variantNote: string | undefined;
  if (options?.unverifiedFit) {
    variantNote = "차량 적합 여부 확인 필요";
  } else if (primary && code === terminalVariant(primary)) {
    variantNote = "단자 방향 확인 필요";
  } else if (primary && code !== primary && !exact) {
    variantNote = "유사 규격";
  }
  const bat = getBattery(code);
  return {
    code,
    subtitle: `${bat.type ?? ""} · ${bat.terminal ?? ""} · ${bat.capacity ?? ""}`.replace(/^ · | · $/g, "").trim() || "규격 정보",
    href: h.href,
    score: exact ? 200 : h.score,
    variantNote,
  };
}

function syntheticBatteryItem(
  spec: string,
  options?: { unverifiedFit?: boolean; queryOnly?: boolean },
): SearchBatteryItem {
  const resolved = resolveSpec(spec) || spec;
  const code = canonicalBatteryCode(resolved) || canonicalBatteryCode(spec) || normalizeBatteryCode(resolved);
  const known = isKnownBatterySpec(code) || isKnownBatterySpec(normalizeBatteryCode(resolved));
  const bat = known ? getBattery(code) : getBattery(normalizeBatteryCode(resolved));
  const variantNote = options?.queryOnly
    ? "검색한 규격 · 확인 필요"
    : options?.unverifiedFit
      ? "차량 적합 여부 확인 필요"
      : !known
        ? "확인 필요 규격"
        : undefined;
  const displayCode = options?.queryOnly ? canonicalBatteryCode(spec) || code : code;
  return {
    code: displayCode,
    subtitle:
      bat
        ? `${bat.type ?? ""} · ${bat.terminal ?? ""} · ${bat.capacity ?? ""}`.replace(/^ · | · $/g, "").trim()
        : "검색어에 포함된 규격",
    href: known ? batteryDetailHref(displayCode) : "/guides",
    score: 200,
    variantNote,
  };
}

function filterBatteries(
  hits: UnifiedSearchResult[],
  specs: string[],
  options?: {
    suppressUnscoped?: boolean;
    vehicleSlug?: string | null;
    allowTerminalVariant?: boolean;
  },
): { exact: SearchBatteryItem[]; popular: SearchBatteryItem[] } {
  const primary = specs[0];
  const exactCodes = new Set<string>();

  if (specs.length > 0) {
    const exactItems: SearchBatteryItem[] = [];
    for (const spec of specs) {
      const resolved = resolveSpec(spec) || spec;
      const nMatch = normalizeBatteryCode(resolved);
      const nDisplay = canonicalBatteryCode(resolved) || canonicalBatteryCode(spec) || nMatch;
      const known = isKnownBatterySpec(nMatch) || isKnownBatterySpec(nDisplay);
      const fitConfirmed = options?.vehicleSlug ? vehicleSpecFitConfirmed(options.vehicleSlug, nMatch) : false;
      const unverifiedFit = Boolean(options?.vehicleSlug) && !fitConfirmed;
      const hit = hits.find((h) => normalizeBatteryCode(h.title) === nMatch);
      if (hit) {
        exactItems.push(mapHitToBatteryItem(hit, spec, true, { unverifiedFit }));
        exactCodes.add(nDisplay);
      } else if (known) {
        exactItems.push(syntheticBatteryItem(spec, { unverifiedFit }));
        exactCodes.add(nDisplay);
      } else {
        exactItems.push(syntheticBatteryItem(spec, { queryOnly: true }));
        exactCodes.add(nDisplay);
      }
      if (options?.allowTerminalVariant) {
        const variant = terminalVariant(nMatch);
        if (variant && isKnownBatterySpec(variant)) {
          const vHit = hits.find((h) => normalizeBatteryCode(h.title) === variant);
          if (vHit && !exactCodes.has(variant)) {
            exactItems.push(mapHitToBatteryItem(vHit, spec, false, { unverifiedFit }));
            exactCodes.add(variant);
          }
        }
      }
    }
    return { exact: exactItems, popular: [] };
  }

  if (options?.suppressUnscoped) {
    return {
      exact: [],
      popular: hits
        .filter((h) => h.score >= MIN_BATTERY_SCORE && isKnownBatterySpec(normalizeBatteryCode(h.title)))
        .slice(0, 3)
        .map((h) => mapHitToBatteryItem(h, undefined, false)),
    };
  }

  const relevant = hits
    .filter((h) => h.score >= MIN_BATTERY_SCORE && isKnownBatterySpec(normalizeBatteryCode(h.title)))
    .sort((a, b) => {
      const codeA = normalizeBatteryCode(a.title);
      const codeB = normalizeBatteryCode(b.title);
      const scoreA = isDeprioritizedBatterySpec(codeA) ? a.score - 45 : a.score;
      const scoreB = isDeprioritizedBatterySpec(codeB) ? b.score - 45 : b.score;
      return scoreB - scoreA;
    });
  return {
    exact: relevant.slice(0, DEFAULT_VISIBLE).map((h) => mapHitToBatteryItem(h, undefined, false)),
    popular: relevant.slice(DEFAULT_VISIBLE, DEFAULT_VISIBLE + 3).map((h) => mapHitToBatteryItem(h, undefined, false)),
  };
}

function shouldShowGuides(query: string, hits: UnifiedSearchResult[]): boolean {
  if (GUIDE_KEYWORDS.test(query)) return hits.length > 0;
  return hits.some((h) => h.score >= 70);
}

function filterQuestions(hits: UnifiedSearchResult[], query: string): UnifiedSearchResult[] {
  const minScore = SYMPTOM_KEYWORDS.test(query) ? 45 : MIN_RELEVANCE_SCORE;
  return hits.filter((h) => h.score >= minScore);
}

const SYMPTOM_HIT_RE = /블랙박스|방전|시동|증상|완전\s*방전|재방전/i;
const COMPARE_HIT_RE = /비교|차이|\bvs\b|대체|호환/i;

function filterQuestionsByIntent(
  hits: UnifiedSearchResult[],
  query: string,
  flags: ReturnType<typeof detectQueryIntentFlags>,
): UnifiedSearchResult[] {
  let rows = filterQuestions(hits, query);
  if (flags.compare) {
    rows = rows.filter((h) => !SYMPTOM_HIT_RE.test(`${h.title} ${h.subtitle ?? ""}`));
  }
  if (!flags.symptom) {
    rows = rows.filter((h) => !SYMPTOM_HIT_RE.test(`${h.title} ${h.subtitle ?? ""}`));
  }
  if (flags.terminalDirection && !flags.compare) {
    rows = rows.filter((h) => !COMPARE_HIT_RE.test(h.title) || /단자|방향/.test(h.title));
  }
  return rows;
}

function filterGuidesByIntent(
  hits: UnifiedSearchResult[],
  query: string,
  flags: ReturnType<typeof detectQueryIntentFlags>,
): UnifiedSearchResult[] {
  if (!shouldShowGuides(query, hits)) return [];
  let rows = hits.filter((h) => h.score >= MIN_RELEVANCE_SCORE);
  if (flags.compare && !GUIDE_KEYWORDS.test(query)) return [];
  if (!flags.symptom) {
    rows = rows.filter((h) => !SYMPTOM_HIT_RE.test(h.title));
  }
  return rows;
}

function filterRelatedKeywordsForIntent(
  keywords: string[],
  flags: ReturnType<typeof detectQueryIntentFlags>,
  specs: string[],
): string[] {
  return keywords.filter((k) => {
    const text = k;
    if (flags.compare && SYMPTOM_HIT_RE.test(text)) return false;
    if (flags.compare && /블랙박스\s*방전/.test(text)) return false;
    if ((flags.terminalDirection || specs.length > 0) && SYMPTOM_HIT_RE.test(text)) return false;
    if (specs.length > 0 && /\b(AGM|DIN|CMF|EFB)\d/i.test(text)) {
      const matchesQuerySpec = specs.some((s) => text.toUpperCase().includes(s.toUpperCase()));
      if (!matchesQuerySpec && !/배터리|차량/.test(text)) return false;
    }
    if (flags.upgrade && specs.length > 0 && /\b(AGM|DIN|CMF|EFB)\d/i.test(text)) {
      return specs.some((s) => text.toUpperCase().includes(s.toUpperCase()));
    }
    return true;
  });
}

function slugFromVehicleHref(href: string): string | null {
  const m = href.match(/\/vehicle\/([^/?#]+)/);
  return m?.[1] ?? null;
}

function buildHero(
  query: string,
  intent: SearchIntent,
  specs: string[],
  topVehicle: VehicleSearchRow | undefined,
  topBattery: SearchBatteryItem | undefined,
): SearchHeroResult | null {
  const vehicleName = topVehicle?.model ?? intent.vehicle?.displayName;
  const batteryCode = specs[0] ?? topBattery?.code ?? intent.battery?.code;
  const slug = topVehicle ? slugFromVehicleHref(topVehicle.href) : intent.vehicle?.id;

  if (!vehicleName && !batteryCode) {
    if (specs.length > 0) {
      return {
        title: specs.join(" · "),
        batteryCode: specs[0],
        status: "needs_check",
        statusLabel: "확인 필요 규격",
        message: `${specs.join(", ")}은(는) 검색어에 포함된 규격입니다. 차량 적합 여부는 연식·연료·사진을 함께 보는 것이 안전합니다.`,
        href: specDetailHref(specs, specs, topBattery, null),
        detailLabel: "규격 가이드 보기",
      };
    }
    return null;
  }

  let status: SearchHeroResult["status"] = "needs_check";
  let statusLabel = "연식/연료/트림 확인 필요";
  let message = "연료를 선택하면 더 정확해집니다.";

  if (slug && batteryCode) {
    const fitConfirmed = vehicleSpecFitConfirmed(slug, batteryCode);
    const jisUnverified = isJisD31Spec(batteryCode) && !fitConfirmed;

    if (fitConfirmed && !jisUnverified) {
      status = "confirmed";
      statusLabel = "확인된 규격";
      message = `${vehicleName}에 ${batteryCode} 규격이 확인되어 있습니다. 연료·연식별 상세는 차량 기준 페이지에서 볼 수 있습니다.`;
    } else {
      status = "needs_check";
      statusLabel = jisUnverified ? "장착 가능 여부 확인 필요" : "연식/연료/트림 확인 필요";
      const fitMsg = buildSpecFitMessage(batteryCode, vehicleName, slug);
      message =
        fitMsg ??
        `확인된 차량 정보와 검색 규격(${batteryCode})의 적합 여부를 바로 확정하기 어렵습니다. 연식·연료·사진 확인을 권장합니다.`;
    }
  } else if (batteryCode && !vehicleName) {
    message = `${batteryCode} 규격 정보와 호환 차종을 아래에서 볼 수 있습니다. 단자 방향(L/R)도 함께 보는 것이 안전합니다.`;
  }

  const title =
    vehicleName && batteryCode
      ? titleContainsSpecForHero(vehicleName, batteryCode)
        ? vehicleName
        : `${vehicleName} · ${batteryCode}`
      : vehicleName ?? batteryCode ?? query;

  const href = slug
    ? `/vehicle/${slug}${batteryCode ? `#fuel-batteries` : ""}`
    : topBattery?.href ?? `/batteries/${encodeURIComponent(batteryCode ?? "")}`;

  return {
    title,
    vehicleName,
    batteryCode,
    status,
    statusLabel,
    message,
    href,
    detailLabel: slug ? "차량 상세 보기" : "규격 상세 보기",
  };
}

function sanitizeVehicleRowsForUpgrade(rows: VehicleSearchRow[]): VehicleSearchRow[] {
  return rows.map((row) => ({
    ...row,
    recommend: "연료·연식별 확인",
    origin: "사진 확인 권장",
    upgrade: "규격 확인 필요",
    fuel: /연료별/.test(row.fuel) ? row.fuel : "연료별",
  }));
}

function toCustomerRecognizedVehicle(
  rv: RecognizedVehicleResult | null,
): RecognizedVehicleResult | null {
  if (!rv) return null;
  const {
    specSource: _specSource,
    dbMatchKey: _dbMatchKey,
    dbRecordId: _dbRecordId,
    dbRecordDisplayName: _dbRecordDisplayName,
    ...rest
  } = rv;
  return {
    ...rest,
    secondaryNote: sanitizeCustomerBatterySummary(rv.secondaryNote) ?? rv.secondaryNote,
    guidance: sanitizeCustomerBatterySummary(rv.guidance) ?? rv.guidance,
    fallbackMessage: sanitizeCustomerBatterySummary(rv.fallbackMessage) ?? rv.fallbackMessage,
    bodyMessage: sanitizeCustomerBatterySummary(rv.bodyMessage) ?? rv.bodyMessage,
  };
}

function filterHitsWithoutBatteryCodes(hits: UnifiedSearchResult[]): UnifiedSearchResult[] {
  return hits.filter((h) => !/\b(AGM|DIN|CMF|EFB)\d+[LR]?\b/i.test(h.title));
}

function buildRelatedKeywords(query: string, specs: string[], intent: SearchIntent): string[] {
  const related: string[] = [];
  if (intent.vehicle && specs[0]) {
    related.push(`${intent.vehicle.displayName} ${specs[0]}`);
  }
  if (specs[0]) {
    const v = terminalVariant(specs[0]);
    if (v) related.push(v);
  }
  if (intent.vehicle) {
    related.push(`${intent.vehicle.displayName} 배터리`);
  }
  return [...new Set(related.filter((k) => norm(k) !== norm(query)))].slice(0, 4);
}

function titleContainsSpecForHero(title: string, spec: string): boolean {
  const t = title.toUpperCase().replace(/\s+/g, "");
  const s = spec.toUpperCase().replace(/\s+/g, "");
  return t.includes(s);
}

function buildAliasHero(
  query: string,
  alias: SearchVehicleAliasMatch,
  specs: string[],
): SearchHeroResult {
  const label = formatSearchVehicleDisplayLabel(query, alias);
  const title = formatSearchVehicleRowTitle(query, alias, label);
  const misleadingStaria = queryHasStariaMisleadingBatterySpec(query);
  const batteryCode = resolveStariaAliasHeroBatteryCode(query, alias, specs);
  return {
    title,
    vehicleName: label,
    batteryCode,
    status: "needs_check",
    statusLabel: misleadingStaria ? "단자 방향 확인 필요" : "연식/연료 확인 필요",
    message: misleadingStaria
      ? "스타리아는 AGM80R(R단자) 기준입니다. AGM80L·CMF80L 표기는 혼동이 잦아 사진 확인을 권장합니다."
      : ALIAS_VEHICLE_NOTE,
    href: `/search?q=${encodeURIComponent(`${alias.formalDisplayName ?? alias.label} 배터리`)}`,
    detailLabel: "차량 상세 보기",
  };
}

export function buildSearchPageResults(
  rawQuery?: string,
  options?: RunBatterySearchOptions,
): SearchPageResults {
  const pipeline = buildSearchIntent(rawQuery ?? "");
  const query = pipeline.normalizedQuery;
  const displayQuery = pipeline.displayQuery;
  const searchType = options?.searchType ?? "all";
  const customerCatalogOnly = isCustomerCatalogSearchType(searchType);
  const baseIntent = classifySearch(query);
  const alias = resolveSearchVehicleAlias(rawQuery ?? "");
  const intentFlags = pipeline.flags;
  const specTokens = extractOrderedQuerySpecs(query);
  const specs = extractBatterySpecs(query);
  const symptomDiagnosisFirst =
    customerCatalogOnly ? false : isSymptomDiagnosisPrimaryQuery(query, intentFlags);
  const queryHasBatterySpec = specTokens.length > 0 || pipeline.batterySpec.hasSpec;
  const upgradeReviewOnly = isUpgradeReviewWithoutSpecs(query, specTokens);
  const intent = {
    ...baseIntent,
    label: pipeline.intentLabel,
  };
  let chips = query ? parseChips(query, intent, specs) : [];
  const summary = buildSummaryKeywords(query, intent, specs, alias);
  if (pipeline.vehicle.displayName) {
    summary.vehicleKeywords = [
      pipeline.vehicle.displayName,
      ...summary.vehicleKeywords.filter((k) => k !== pipeline.vehicle.displayName),
    ].slice(0, 3);
  }
  if (upgradeReviewOnly) {
    summary.batterySpecs = [];
    chips = chips.filter((c) => !/\b(AGM|DIN|CMF|EFB)\d/i.test(c));
    if (!summary.symptomKeywords.includes("업그레이드")) {
      summary.symptomKeywords = ["업그레이드 검토", ...summary.symptomKeywords].slice(0, 4);
    }
  } else if (!queryHasBatterySpec) {
    summary.batterySpecs = [];
  }
  const primarySpec = queryHasBatterySpec ? (specTokens[0] ?? summary.batterySpecs[0]) : null;
  const terminalTypeLabel = primarySpec ? primarySpecTerminalLabel(primarySpec) : null;
  const showSymptomSidebar = intentFlags.symptom && !intentFlags.compare;
  const vehicleQuery = alias?.dbQuery ?? (queryVehiclePart(query, specs) || query);

  if (!query) {
    return emptyResults({ query: "", displayQuery: "", intent, chips: [], summary });
  }

  if (customerCatalogOnly && isCustomerGuideSymptomOnlyQuery(query)) {
    return emptyResults({
      query,
      displayQuery,
      intent,
      chips,
      summary,
      insufficientMessage: "증상·가이드 키워드는 검색창이 아닌 배터리 가이드·증상 페이지에서 확인할 수 있습니다.",
      ctas: [
        { label: "배터리 가이드", href: "/guides" },
        { label: "증상 진단", href: "/symptoms" },
      ],
      isSparse: true,
    });
  }

  try {
    const all = searchAll(query, 12);
    const batteryHits = Array.isArray(all?.byKind?.battery) ? all.byKind.battery : [];
    const qaHits = Array.isArray(all?.byKind?.qa) ? all.byKind.qa : [];
    const guideHits = Array.isArray(all?.byKind?.guide) ? all.byKind.guide : [];

    const rawVehicleRows = vehicleAssetsToSearchRows(query, 12, alias);
    const vehicleRows = filterVehicles(rawVehicleRows, query, specs, alias, vehicleQuery);
    const finalVehicles =
      vehicleRows.length > 0
        ? vehicleRows
        : alias && rawVehicleRows.length > 0
          ? [rawVehicleRows[0]]
          : vehicleRows;
    const vehicleSlug = finalVehicles[0] ? slugFromVehicleHref(finalVehicles[0].href) : null;
    const purposeKeywords = summary.symptomKeywords;
    const hasFocusQuery = isFocusSearchQuery(
      query,
      alias,
      summary.vehicleKeywords,
      purposeKeywords,
      intentFlags,
      specs,
    );
    const batterySpecsForFilter = upgradeReviewOnly ? [] : specs;
    const suppressUnscopedBatteries =
      upgradeReviewOnly ||
      (hasFocusQuery && specs.length === 0) ||
      intentFlags.compare ||
      (intentFlags.upgrade && specs.length === 0);
    const { exact: batteries, popular: popularBatteries } = filterBatteries(batteryHits, batterySpecsForFilter, {
      suppressUnscoped: suppressUnscopedBatteries,
      vehicleSlug: upgradeReviewOnly ? null : vehicleSlug,
      allowTerminalVariant: intentFlags.terminalDirection,
    });
    const vehiclePart = queryVehiclePart(query, specs);
    const hasVehicleIntent =
      Boolean(alias) ||
      (Boolean(intent.vehicle) && vehiclePart.length >= 2) ||
      (summary.vehicleKeywords.length > 0 && vehiclePart.length >= 2);

    const topFold = computeTopFoldLimits(
      alias,
      summary.batterySpecs.length,
      intentFlags,
      hasVehicleIntent,
    );
    if (customerCatalogOnly) {
      topFold.maxQuestions = 0;
      topFold.maxGuides = 0;
    }

    let vehiclesForRender = upgradeReviewOnly
      ? sanitizeVehicleRowsForUpgrade(finalVehicles)
      : finalVehicles;
    if (alias && vehiclesForRender.length === 0 && rawVehicleRows.length > 0) {
      vehiclesForRender = [rawVehicleRows[0]];
    }
    let maxVehicles = topFold.maxVehicles;
    if (!alias && finalVehicles.length > 1 && hasVehicleIntent && !queryHasBatterySpec) {
      maxVehicles = Math.min(finalVehicles.length, 8);
    }
    vehiclesForRender = vehiclesForRender.slice(0, maxVehicles);

    const vehicleHref =
      vehiclesForRender[0]?.href ??
      (alias?.assetId || alias?.catalogId
        ? `/vehicle/${alias.assetId ?? alias.catalogId}`
        : "/vehicles");

    const summaryCards = buildSearchSummary(
      pipeline,
      alias,
      queryHasBatterySpec ? summary.batterySpecs : [],
      vehicleHref,
    );
    let recognizedVehicle = summaryCards.recognizedVehicle;
    const recognizedSpec = summaryCards.recognizedSpec;

    if (symptomDiagnosisFirst) {
      summary.batterySpecs = [];
    } else {
      summary.batterySpecs = resolveSummaryBatterySpecCodes(
        recognizedVehicle,
        recognizedSpec,
        queryHasBatterySpec,
        summary.batterySpecs,
      );
      if (alias) {
        summary.batterySpecs = sanitizeStariaBatterySpecsForCustomer(query, alias, summary.batterySpecs);
      }
    }

    const showVehiclePickerGrid = shouldShowVehiclePickerGrid(query, rawVehicleRows, finalVehicles);
    if (recognizedVehicle && !showVehiclePickerGrid) {
      vehiclesForRender = finalVehicles.slice(0, Math.max(1, maxVehicles));
    } else if (recognizedVehicle && showVehiclePickerGrid) {
      const pickerSource =
        vehiclesForRender.length > 0
          ? vehiclesForRender
          : finalVehicles.length > 0
            ? finalVehicles
            : rawVehicleRows;
      vehiclesForRender = pickerSource.slice(0, maxVehicles);
    }

    const batteriesLimited = batteries.slice(0, topFold.maxBatteries);
    const suppressPopular =
      shouldSuppressPopularBatteries({
        hasVehicle: Boolean(alias),
        hasAlias: Boolean(alias),
        specCount: summary.batterySpecs.length,
        intentFlags: intentFlags,
      }) || hasFocusQuery;
    const popularList =
      upgradeReviewOnly || !topFold.showPopular || suppressPopular
        ? []
        : popularBatteries.slice(0, DEFAULT_VISIBLE);

    let questions = filterQuestionsByIntent(qaHits, query, intentFlags);
    if (pipeline.vehicle.hasVehicle) {
      const vehicleQuestionCtx = {
        canonicalKey: pipeline.vehicle.canonicalKey,
        fuel: pipeline.vehicle.fuel,
        model: pipeline.vehicle.model,
        candidateSpecs: recognizedVehicle?.specDisplay
          ? [
              recognizedVehicle.specDisplay
                .replace(/\s*계열\s*$/u, "")
                .trim(),
            ].filter(Boolean)
          : [],
      };
      questions = rankQuestionsForVehicleContext(questions, vehicleQuestionCtx);
      if (questions.length === 0) {
        questions = getCuratedVehicleQuestions(vehicleQuestionCtx);
      }
    }
    let guides = filterGuidesByIntent(guideHits, query, intentFlags);
    if (upgradeReviewOnly) {
      questions = filterHitsWithoutBatteryCodes(questions);
      guides = filterHitsWithoutBatteryCodes(guides);
    }

    const questionsLimited =
      topFold.maxQuestions > 0 ? questions.slice(0, topFold.maxQuestions) : questions;
    const guidesLimited = topFold.maxGuides > 0 ? guides.slice(0, topFold.maxGuides) : guides;

    const heroSpecs = upgradeReviewOnly ? [] : specs;
    let hero = topFold.showHero
      ? buildHero(query, intent, heroSpecs, vehiclesForRender[0], batteriesLimited[0])
      : null;
    if (!hero && alias) {
      hero = buildAliasHero(query, alias, upgradeReviewOnly ? [] : summary.batterySpecs);
    }
    if (upgradeReviewOnly && hero) {
      hero = {
        ...hero,
        batteryCode: undefined,
        title: hero.vehicleName ?? hero.title,
        message: UPGRADE_REVIEW_GUIDANCE,
        statusLabel: "규격 확인 필요",
        detailLabel: "차량 상세 보기",
      };
    }
    const specHref = specDetailHref(specs, specTokens, batteriesLimited[0], hero);
    const compareLink = buildCompareHref(specTokens, summary.batterySpecs) ?? specHref;

    if (symptomDiagnosisFirst && recognizedVehicle && !queryHasBatterySpec) {
      recognizedVehicle = {
        ...recognizedVehicle,
        primaryBatteryCode: null,
        specDisplay: null,
        specLabel: null,
        candidateDisplay: null,
        candidateBatteryCodes: undefined,
        bodyMessage:
          buildIntentMessage(query, intentFlags, intent) ??
          "블랙박스 상시전원·장기주차·배터리 노후 여부를 먼저 보는 것이 좋습니다.",
        guidance: "차종·연식 확인 후 규격을 보조로 안내합니다.",
        ctas: buildIntentCtas(
          intentFlags,
          specHref,
          recognizedVehicle.href,
          symptomHrefFromIntent(intent, query),
          guides[0]?.href,
          compareLink,
          query,
        ),
      };
      summary.batterySpecs = [];
    }

    const hasVehicle = Boolean(alias) || summary.vehicleKeywords.length > 0;
    const prioritizeGuidance = shouldPrioritizeGuidance(intentFlags, hasVehicle, purposeKeywords.length);

    const intentCtas = upgradeReviewOnly
      ? [
          { label: "사진으로 확인", href: "/analysis/photo" },
          { label: "문의하기", href: "/service-center" },
          { label: "차량 상세 보기", href: vehiclesForRender[0]?.href ?? hero?.href ?? "/vehicles" },
          { label: "규격 가이드 보기", href: "/guides" },
        ]
      : prioritizeGuidance
      ? buildIntentCtas(
          intentFlags,
          specHref,
          finalVehicles[0]?.href ?? hero?.href,
          symptomHrefFromIntent(intent, query),
          guides[0]?.href,
          compareLink,
          query,
        )
      : buildCtas(specs, specTokens, intentFlags, hero, batteries[0], query);
    const compareBatteryCodes =
      intentFlags.compare && summary.batterySpecs.length >= 2
        ? summary.batterySpecs.slice(0, 2)
        : null;
    const hasBatteryFocus =
      !symptomDiagnosisFirst &&
      (Boolean(recognizedVehicle?.primaryBatteryCode) ||
        Boolean(recognizedVehicle?.candidateBatteryCodes?.length) ||
        Boolean(recognizedSpec?.primaryBatteryCode) ||
        Boolean(compareBatteryCodes?.length));
    const ctas = hasBatteryFocus
      ? []
      : mergeSearchCtas(intentCtas, buildRequiredCtas(intentFlags, compareLink, specHref, query));

    const intentMessage = hasBatteryFocus
      ? null
      : buildIntentMessage(query, intentFlags, intent) ??
        buildVehiclePurposeMessage(query, purposeKeywords, intentFlags);

    const specFitMessage =
      hasBatteryFocus || !(specs.length > 0 && finalVehicles[0])
        ? null
        : buildSpecFitMessage(specs[0], finalVehicles[0].model, vehicleSlug);

    const missingVehicleMessage =
      hasVehicleIntent && finalVehicles.length === 0 && !alias && !recognizedVehicle
        ? "일치하는 차량 정보를 찾지 못했습니다. 차량명, 연식, 연료를 다시 입력하거나 사진으로 확인해 주세요."
        : null;

    const unknownSpecs = summary.batterySpecs.filter(
      (s) => !isKnownBatterySpec(normalizeBatteryCode(resolveSpec(s) || s)),
    );
    const missingSpecMessage =
      unknownSpecs.length > 0 &&
      shouldShowMissingSpecMessage({
        symptomDiagnosisFirst,
        hasBatteryFocus,
        compareIntent: intentFlags.compare,
        compareBatteryCodes,
        recognizedVehicle,
        recognizedSpec,
        summaryBatterySpecs: summary.batterySpecs,
      })
        ? `${unknownSpecs.join(", ")}은(는) 검색한 규격입니다. ${MISSING_SPEC_MESSAGE}`
        : null;

    const totalRelevant =
      finalVehicles.length + batteries.length + questions.length + guides.length + (hero ? 1 : 0);
    const isSparse = totalRelevant <= 1 && popularList.length === 0;
    const insufficientMessage = isSparse ? INSUFFICIENT_MESSAGE : null;
    const guidanceNote =
      recognizedVehicle?.primaryBatteryCode || recognizedSpec?.primaryBatteryCode
        ? null
        : specs.length > 0 || summary.batterySpecs.length > 0
          ? GUIDANCE_NOTE
          : null;

    const customerVehicles = vehiclesForRender.map(toCustomerVehicleSearchRow);
    const customerRecognizedVehicle = toCustomerRecognizedVehicle(recognizedVehicle);
    const catalogPrimaryIntent =
      !symptomDiagnosisFirst &&
      !isCustomerGuideSymptomOnlyQuery(query) &&
      (customerVehicles.length > 0 ||
        queryHasBatterySpec ||
        batteriesLimited.length > 0 ||
        Boolean(customerRecognizedVehicle) ||
        Boolean(recognizedSpec));

    return {
      query,
      displayQuery,
      intent,
      chips,
      summary,
      ctas,
      hero,
      vehicles: customerVehicles,
      vehiclesTotal: customerVehicles.length,
      orderGuidance: intentFlags.order ? ORDER_GUIDANCE_TEXT : null,
      compareIntent: intentFlags.compare,
      aliasVehicleNote: alias?.searchRecognitionNote ?? (alias ? ALIAS_VEHICLE_NOTE : null),
      searchRecognitionNote: alias?.searchRecognitionNote ?? null,
      upgradeGuidance: upgradeReviewOnly ? UPGRADE_REVIEW_GUIDANCE : null,
      recognizedVehicle: customerRecognizedVehicle,
      recognizedSpec,
      batteries: batteriesLimited,
      batteriesTotal: batteries.length,
      questions: questionsLimited,
      questionsTotal: questions.length,
      guides: guidesLimited,
      guidesTotal: guides.length,
      relatedKeywords: filterRelatedKeywordsForIntent(
        upgradeReviewOnly
          ? buildRelatedKeywords(query, [], intent).filter((k) => !/\b(AGM|DIN|CMF|EFB)\d/i.test(k))
          : buildRelatedKeywords(query, specs, intent),
        intentFlags,
        specs,
      ),
      queryHasBatterySpec,
      primarySpec,
      terminalTypeLabel,
      showSymptomSidebar,
      symptomDiagnosisFirst,
      compareBatteryCodes,
      catalogPrimaryIntent,
      isSparse,
      insufficientMessage,
      missingSpecMessage,
      missingVehicleMessage,
      guidanceNote,
      intentMessage,
      specFitMessage,
      popularBatteries: popularList,
      popularBatteriesTotal: popularList.length,
      emptySuggestions: EMPTY_SUGGESTIONS,
      defaultVisible: DEFAULT_VISIBLE,
      deferSecondary: topFold.deferSecondary,
      hadError: false,
      ux: buildSearchUxPresentation({
        query,
        displayQuery,
        intent,
        summary,
        symptomDiagnosisFirst,
        compareIntent: intentFlags.compare,
        compareBatteryCodes,
        recognizedVehicle: customerRecognizedVehicle,
        recognizedSpec,
        vehicles: customerVehicles,
        intentMessage,
        intentFlags,
      }),
    };
  } catch (err) {
    console.error("[search] buildSearchPageResults failed:", err);
    return emptyResults({
      query,
      displayQuery,
      intent,
      chips,
      summary,
      ctas: buildCtas(specs, specTokens, intentFlags, null, undefined, query),
      orderGuidance: intentFlags.order ? ORDER_GUIDANCE_TEXT : null,
      compareIntent: intentFlags.compare,
      aliasVehicleNote: alias?.searchRecognitionNote ?? (alias ? ALIAS_VEHICLE_NOTE : null),
      searchRecognitionNote: alias?.searchRecognitionNote ?? null,
      upgradeGuidance: upgradeReviewOnly ? UPGRADE_REVIEW_GUIDANCE : null,
      insufficientMessage: INSUFFICIENT_MESSAGE,
      missingSpecMessage: specs.length > 0 ? MISSING_SPEC_MESSAGE : null,
      guidanceNote: specs.length > 0 ? GUIDANCE_NOTE : null,
      hadError: true,
    });
  }
}
