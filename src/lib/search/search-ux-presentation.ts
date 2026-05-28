import { batteryDetailHref, canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { buildVehicleDetailHref } from "@/lib/battery-cta";
import { getSearchHref } from "@/lib/battery-search";
import { HUB_PHOTO, HUB_SHOP, HUB_SHOP_ANCHORS, HUB_STORE, HUB_STORE_ANCHORS } from "@/lib/customer-hub-routes";
import { classifySearch, compareHref, getBattery } from "@/lib/platform-data";
import type { SearchPageResults, RecognizedVehicleResult } from "@/lib/search-page-results";
import { detectCustomerHubFromQuery, hubCtaForQuery } from "@/lib/search/search-hub-cta";
import type { QueryIntentFlags } from "@/lib/search/search-intent";
import { resolveSearchIntentLabel } from "@/lib/search/search-intent";
import { resolveBatteryTerminalLabel } from "@/lib/battery-spec-display";
import { isPorter2VehicleContext } from "@/lib/search/fitment-overrides";
import type { RecognizedSpecResult } from "@/lib/search/search-summary";

function porter2ContextFromVehicle(
  query: string,
  vehicle: RecognizedVehicleResult | null,
): boolean {
  if (!vehicle) return false;
  return isPorter2VehicleContext({
    query,
    vehicleLabel: vehicle.vehicleLabel,
    href: vehicle.href,
  });
}

export type SearchUxMode = "vehicle" | "spec" | "compare" | "symptom" | "purpose" | "generic";

export type SearchUxChip = {
  label: string;
  href: string;
  active?: boolean;
  variant?: "fuel" | "year" | "hint";
};

export type SearchUxCta = {
  label: string;
  href: string;
  tier: "primary" | "secondary" | "ghost";
};

export type SymptomCauseCard = {
  title: string;
  hint: string;
};

export type SearchUxPresentation = {
  mode: SearchUxMode;
  intentBadge: string;
  heroLines: string[];
  recommendationReasons: string[];
  conditionChips: SearchUxChip[];
  photoCta: SearchUxCta;
  heroCtas: SearchUxCta[];
  mobileSticky: SearchUxCta[];
  symptomCauses: SymptomCauseCard[];
  compareNote: string | null;
  yearBranchHint: string | null;
  specMeta: {
    code: string;
    type: string;
    capacity: string;
    cca: string;
    terminal: string;
  } | null;
  sampleVehicles: { label: string; href: string }[];
  purposeBlurb: string | null;
};

const PHOTO_CTA: SearchUxCta = {
  label: "사진으로 최종 확인",
  href: HUB_PHOTO,
  tier: "ghost",
};

const SYMPTOM_CAUSES: SymptomCauseCard[] = [
  { title: "블랙박스 상시전원", hint: "주차 중 상시전원·이벤트 녹화 설정 확인" },
  { title: "암전류", hint: "추가 장착품·퓨즈·배선 누전 여부 점검" },
  { title: "장기주차", hint: "2주 이상 미운행 시 방전 가능" },
  { title: "배터리 노후", hint: "용량·시동 성능·경고등 동반 여부 확인" },
];

const FUEL_CHIP_ORDER = ["가솔린", "디젤", "LPG", "하이브리드", "전기"] as const;

function slugFromVehicleHref(href: string): string | null {
  const m = href.match(/\/vehicle\/([^/?#]+)/);
  return m?.[1] ?? null;
}

function isPurposeUxQuery(query: string, intentBadge: string): boolean {
  if (detectCustomerHubFromQuery(query)) return true;
  return /(점|출장|주문|상품|매장) 검색$/.test(intentBadge);
}

function queryMentionsFuel(query: string, fuel: string): boolean {
  if (fuel === "하이브리드") return /하이브|hev/i.test(query);
  if (fuel === "가솔린") return /가솔|휘발/i.test(query);
  if (fuel === "디젤") return /디젤/i.test(query);
  if (fuel === "LPG") return /lpg/i.test(query);
  if (fuel === "전기") return /전기|ev\b/i.test(query);
  return query.includes(fuel);
}

function buildFuelChips(
  query: string,
  vehicle: RecognizedVehicleResult | null,
  displayVehicleName: string,
): SearchUxChip[] {
  if (!vehicle?.href) return [];
  const slug = slugFromVehicleHref(vehicle.href);
  if (!slug) return [];
  const activeFuel =
    vehicle.fuelLabel && vehicle.fuelLabel !== "확인 필요" ? vehicle.fuelLabel : null;
  const chips: SearchUxChip[] = [];
  for (const fuel of FUEL_CHIP_ORDER) {
    chips.push({
      label: fuel,
      href: buildVehicleDetailHref(slug, fuel),
      active: activeFuel === fuel || queryMentionsFuel(query, fuel),
      variant: "fuel",
    });
  }
  if (!activeFuel && displayVehicleName) {
    chips.push({
      label: "연료 확인 필요",
      href: getSearchHref(`${displayVehicleName} 연료`),
      variant: "hint",
    });
  }
  return chips;
}

function buildYearChips(
  query: string,
  vehicle: RecognizedVehicleResult | null,
): SearchUxChip[] {
  if (!vehicle?.yearBranchLinks?.length || !porter2ContextFromVehicle(query, vehicle)) return [];
  const chips: SearchUxChip[] = vehicle.yearBranchLinks.map((link) => ({
    label: link.label,
    href: link.href,
    active:
      /2019|이전|90R/.test(query) && /이전|90R/.test(link.label)
        ? true
        : /2020|이후|20년|100R/.test(query) && /이후|100R/.test(link.label)
        ? true
        : false,
    variant: "year" as const,
  }));
  const vehicleName = vehicle.vehicleLabel.replace(/\s*배터리.*$/i, "").trim();
  chips.push({
    label: "연식 모름",
    href: getSearchHref(`${vehicleName} 배터리`),
    active: !chips.some((c) => c.active),
    variant: "hint",
  });
  return chips;
}

function buildRecommendationReasons(input: {
  mode: SearchUxMode;
  query: string;
  vehicle: RecognizedVehicleResult | null;
  compareCodes: string[] | null;
}): string[] {
  const reasons: string[] = [];
  const { mode, query, vehicle, compareCodes } = input;

  if (mode === "symptom") {
    reasons.push("방전 증상 검색이므로 배터리 상품보다 원인 점검을 먼저 표시합니다.");
    if (/블랙박스|블박/.test(query)) {
      reasons.push("블랙박스·상시전원 설정을 우선 확인하는 것이 좋습니다.");
    }
  }
  if (mode === "compare" && compareCodes && compareCodes.length >= 2) {
    reasons.push(`${compareCodes[0]}와 ${compareCodes[1]}는 단순 대체품이 아닐 수 있습니다.`);
    reasons.push("타입·용량·CCA·적용 차량을 함께 확인하세요.");
  }
  if (mode === "vehicle" && vehicle) {
    if (
      porter2ContextFromVehicle(query, vehicle) &&
      vehicle.candidateBatteryCodes &&
      vehicle.candidateBatteryCodes.length >= 2
    ) {
      reasons.push("포터2는 연식에 따라 90R/100R이 갈리므로 두 후보를 함께 표시합니다.");
    }
    if (vehicle.fuelLabel === "하이브리드" || /하이브|hev/i.test(query)) {
      reasons.push("하이브리드 연료 조건이 감지되어 AGM60L을 우선 추천합니다.");
    }
    if (vehicle.specDisplay && /DIN74L/i.test(vehicle.specDisplay) && /봉고/i.test(query)) {
      reasons.push("DIN74L 규격명과 봉고3 차량명이 함께 감지되어 차량 상세도 연결했습니다.");
    }
    if (vehicle.basisLabel && reasons.length < 3) {
      reasons.push(`추천 기준: ${vehicle.basisLabel}.`);
    }
  }
  if (mode === "spec") {
    reasons.push("규격명 기준으로 타입·용량·단자 정보를 먼저 정리했습니다.");
  }
  if (mode === "purpose") {
    reasons.push("지점·서비스·주문 목적 검색이므로 매장·택배 안내를 우선합니다.");
  }
  return reasons.slice(0, 3);
}

function buildHeroLines(input: {
  mode: SearchUxMode;
  query: string;
  vehicle: RecognizedVehicleResult | null;
  spec: RecognizedSpecResult | null;
  compareCodes: string[] | null;
  purposeBlurb: string | null;
}): string[] {
  const lines: string[] = [];
  const { mode, query, vehicle, spec, compareCodes, purposeBlurb } = input;

  if (purposeBlurb) lines.push(purposeBlurb);
  if (mode === "vehicle" && vehicle) {
    if (porter2ContextFromVehicle(query, vehicle) && vehicle.candidateBatteryCodes?.length) {
      lines.push("연식에 따라 규격이 달라질 수 있습니다.");
      lines.push("2020년 이전 90R · 2020년 이후 100R — 연식 칩으로 확인하세요.");
    } else if (vehicle.specDisplay) {
      lines.push(`추천 규격: ${vehicle.specDisplay}`);
      if (vehicle.guidance && vehicle.guidance !== vehicle.specDisplay) {
        lines.push(vehicle.guidance);
      }
    } else if (vehicle.bodyMessage) {
      lines.push(vehicle.bodyMessage);
    }
  }
  if (mode === "spec" && spec) {
    lines.push(`${spec.spec} 규격의 타입·용량·단자를 확인한 뒤 차량 적용 여부를 보세요.`);
  }
  if (mode === "compare" && compareCodes?.length === 2) {
    lines.push("단순 대체품이 아닐 수 있습니다. 차량 연식·연료·단자 방향을 함께 확인하세요.");
  }
  if (mode === "symptom") {
    lines.push("방전 원인 후보를 먼저 점검한 뒤, 필요할 때만 규격·차량 정보를 확인하세요.");
  }
  return lines.slice(0, 3);
}

function buildHeroCtas(input: {
  mode: SearchUxMode;
  query: string;
  vehicle: RecognizedVehicleResult | null;
  spec: RecognizedSpecResult | null;
  compareCodes: string[] | null;
}): SearchUxCta[] {
  const { mode, query, vehicle, spec, compareCodes } = input;
  const out: SearchUxCta[] = [];

  const push = (label: string, href: string, tier: SearchUxCta["tier"]) => {
    if (!out.some((c) => c.href === href && c.label === label)) out.push({ label, href, tier });
  };

  if (mode === "symptom") {
    push("점검 문의", "/service-center#contact", "primary");
    push("방전 가이드", "/guides", "secondary");
    return out.slice(0, 4);
  }

  if (mode === "purpose") {
    const hub = hubCtaForQuery(query);
    if (hub) push(hub.label, hub.href, "primary");
    if (/덕천/.test(query)) push("덕천점 안내", HUB_STORE_ANCHORS.deokcheon, "secondary");
    if (/학장/.test(query)) push("학장점 안내", HUB_STORE_ANCHORS.hakjang, "secondary");
    if (/택배|주문|배송/.test(query)) push("택배 주문", HUB_SHOP_ANCHORS.delivery, "primary");
    if (/상품/.test(query)) push("상품 보기", HUB_SHOP_ANCHORS.products, "primary");
    if (/출장|부산/.test(query)) push("출장 문의", HUB_STORE_ANCHORS.regions, "primary");
    push("지점 문의", HUB_STORE, "secondary");
    return out.slice(0, 4);
  }

  if (mode === "compare" && compareCodes && compareCodes.length >= 2) {
    push("규격 비교 보기", compareHref(compareCodes[0]!, compareCodes[1]!), "primary");
    push("차량 기준 재검색", "/vehicles", "secondary");
    return out;
  }

  if (mode === "spec" && spec?.primaryBatteryCode) {
    const code = spec.primaryBatteryCode;
    push(`${code} 상세`, batteryDetailHref(code), "primary");
    push("택배 주문", HUB_SHOP_ANCHORS.orderCheck, "secondary");
    push("차량 기준 확인", "/vehicles", "ghost");
    return out;
  }

  if (mode === "vehicle" && vehicle) {
    if (vehicle.candidateBatteryCodes?.length) {
      push("90R 규격 보기", batteryDetailHref("90R"), "primary");
      push("100R 규격 보기", batteryDetailHref("100R"), "primary");
      push("차량 상세", vehicle.href, "secondary");
    } else if (vehicle.primaryBatteryCode) {
      push("배터리 상세", batteryDetailHref(vehicle.primaryBatteryCode), "primary");
      push("차량 상세", vehicle.href, "secondary");
    } else {
      push("차량 상세", vehicle.href, "primary");
    }
    return out.slice(0, 4);
  }

  return out;
}

function buildMobileSticky(input: {
  mode: SearchUxMode;
  query: string;
  vehicle: RecognizedVehicleResult | null;
  spec: RecognizedSpecResult | null;
  compareCodes: string[] | null;
}): SearchUxCta[] {
  const photo = { ...PHOTO_CTA };
  const { mode, vehicle, spec, compareCodes } = input;

  if (mode === "symptom") {
    return [
      { label: "점검 문의", href: "/service-center#contact", tier: "primary" },
      photo,
      { label: "방전 가이드", href: "/guides", tier: "secondary" },
    ];
  }
  if (mode === "purpose") {
    const hub = hubCtaForQuery(input.query);
    return [
      hub
        ? { label: hub.label, href: hub.href, tier: "primary" }
        : { label: "지점 문의", href: HUB_STORE, tier: "primary" },
      { label: "출장 문의", href: HUB_STORE_ANCHORS.regions, tier: "secondary" },
      { label: "상품 보기", href: HUB_SHOP, tier: "secondary" },
    ];
  }
  if (mode === "compare" && compareCodes?.length === 2) {
    return [
      { label: "비교 보기", href: compareHref(compareCodes[0]!, compareCodes[1]!), tier: "primary" },
      photo,
      { label: "차량 확인", href: "/vehicles", tier: "secondary" },
    ];
  }
  if (mode === "spec" && spec?.primaryBatteryCode) {
    return [
      { label: "택배 주문", href: HUB_SHOP_ANCHORS.delivery, tier: "primary" },
      photo,
      { label: "차량 확인", href: "/vehicles", tier: "secondary" },
    ];
  }
  const code =
    vehicle?.primaryBatteryCode ??
    vehicle?.candidateBatteryCodes?.[0] ??
    spec?.primaryBatteryCode ??
    null;
  return [
    code
      ? { label: "배터리 상세", href: batteryDetailHref(code), tier: "primary" }
      : { label: "상세보기", href: vehicle?.href ?? "/vehicles", tier: "primary" },
    photo,
    { label: "문의", href: "/service-center#contact", tier: "secondary" },
  ];
}

function buildSpecMeta(code: string | null | undefined) {
  if (!code) return null;
  const displayCode = canonicalBatteryCode(code) || code;
  const b = getBattery(displayCode);
  const terminal = resolveBatteryTerminalLabel(displayCode)?.replace(/타입$/, "") ?? "—";
  return {
    code: displayCode,
    type: b.type ?? "—",
    capacity: b.capacity ? `${b.capacity}` : "—",
    cca: b.cca ? `${b.cca} CCA` : "—",
    terminal,
  };
}

function buildSampleVehicles(code: string | null | undefined, vehicles: SearchPageResults["vehicles"]) {
  if (!code) return [];
  const b = getBattery(code);
  const fromProduct = (b as { representativeVehicles?: string[] }).representativeVehicles;
  if (fromProduct?.length) {
    return fromProduct.slice(0, 6).map((label) => ({
      label,
      href: getSearchHref(label),
    }));
  }
  return vehicles.slice(0, 4).map((v) => ({
    label: v.model,
    href: v.href,
  }));
}

export function buildSearchUxPresentation(
  data: Pick<
    SearchPageResults,
    | "query"
    | "displayQuery"
    | "intent"
    | "summary"
    | "symptomDiagnosisFirst"
    | "compareIntent"
    | "compareBatteryCodes"
    | "recognizedVehicle"
    | "recognizedSpec"
    | "vehicles"
    | "intentMessage"
  > & { intentFlags?: QueryIntentFlags },
): SearchUxPresentation {
  const query = data.query;
  const vehicle = data.recognizedVehicle;
  const spec = data.recognizedSpec;
  const compareCodes = data.compareBatteryCodes;
  const hasBatteryAnswer =
    Boolean(vehicle?.primaryBatteryCode) ||
    Boolean(vehicle?.candidateBatteryCodes?.length) ||
    Boolean(spec?.primaryBatteryCode) ||
    Boolean(compareCodes?.length);

  const intentBadge = resolveSearchIntentLabel(query, {
    hasVehicle: Boolean(vehicle) || data.summary.vehicleKeywords.length > 0,
    hasAlias: false,
  });

  let mode: SearchUxMode = "generic";
  if (data.symptomDiagnosisFirst) mode = "symptom";
  else if (data.compareIntent && compareCodes && compareCodes.length >= 2) mode = "compare";
  else if (vehicle && hasBatteryAnswer) mode = "vehicle";
  else if (spec?.primaryBatteryCode && !vehicle?.primaryBatteryCode) mode = "spec";
  else if (isPurposeUxQuery(query, intentBadge) && !hasBatteryAnswer) mode = "purpose";
  else if (spec?.primaryBatteryCode) mode = "spec";
  else if (vehicle) mode = "vehicle";

  const vehicleName =
    vehicle?.vehicleLabel?.replace(/\s*배터리.*$/i, "").trim() ||
    data.summary.vehicleKeywords[0] ||
    "";

  const conditionChips = [
    ...buildYearChips(query, vehicle),
    ...(mode === "vehicle" && !vehicle?.yearBranchLinks?.length
      ? buildFuelChips(query, vehicle, vehicleName)
      : []),
  ];

  const purposeBlurb =
    mode === "purpose"
      ? (data.intentMessage ??
        (detectCustomerHubFromQuery(query) === "store"
          ? "매장·출장 교체 상담을 우선 안내합니다."
          : "택배·쇼핑 주문 전 확인 사항을 안내합니다."))
      : null;

  const specCode =
    spec?.primaryBatteryCode ??
    vehicle?.primaryBatteryCode ??
    compareCodes?.[0] ??
    null;

  return {
    mode,
    intentBadge,
    heroLines: buildHeroLines({ mode, query, vehicle, spec, compareCodes, purposeBlurb }),
    recommendationReasons: buildRecommendationReasons({ mode, query, vehicle, compareCodes }),
    conditionChips,
    photoCta: PHOTO_CTA,
    heroCtas: buildHeroCtas({ mode, query, vehicle, spec, compareCodes }),
    mobileSticky: buildMobileSticky({ mode, query, vehicle, spec, compareCodes }),
    symptomCauses: mode === "symptom" ? SYMPTOM_CAUSES : [],
    compareNote:
      mode === "compare"
        ? "타입·용량·CCA·적용 차량이 다를 수 있어 단순 대체로 보지 마세요."
        : null,
    yearBranchHint:
      porter2ContextFromVehicle(query, vehicle) && vehicle?.yearBranchLinks?.length
        ? "연식에 따라 규격이 달라질 수 있습니다"
        : null,
    specMeta: mode === "spec" || (mode === "vehicle" && specCode) ? buildSpecMeta(specCode) : null,
    sampleVehicles: mode === "spec" ? buildSampleVehicles(specCode, data.vehicles) : [],
    purposeBlurb,
  };
}

export function emptySearchUx(): SearchUxPresentation {
  return buildSearchUxPresentation({
    query: "",
    displayQuery: "",
    intent: classifySearch(""),
    summary: { vehicleKeywords: [], batterySpecs: [], symptomKeywords: [] },
    symptomDiagnosisFirst: false,
    compareIntent: false,
    compareBatteryCodes: null,
    recognizedVehicle: null,
    recognizedSpec: null,
    vehicles: [],
    intentMessage: null,
  });
}
