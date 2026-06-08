/**
 * Battery Manager 통합 플랫폼 데이터 (모든 페이지 공유)
 * 차량-배터리 원본: vehicle-battery-db.json → src/lib/data/getVehicles.ts
 * UI에는 displayName만 노출. id는 라우팅/연결용 내부 키.
 */
import {
  catalogBatteries,
  catalogExtraQuestions,
  catalogExtraSymptoms,
  catalogVehicles,
  contents,
  getVehicleBodyType,
  shopProducts,
  type ContentItem,
  type ShopProduct,
} from "./platform-catalog";
import { getCanonicalBatteryCode, getBatteryImageSet, normalizeBatteryCode as normalizeBatteryToken, EMPTY_BATTERY_IMAGE_SET, brandIdToBatteryBrandKey, findBatteryProductByCode } from "./battery-alias-map";
import {
  isBatteryMatched,
  isStrictProductCodeMatch,
  resolveBatteryDisplay,
  isRetiredBatterySpec,
} from "./batteryNormalize";
import { inferBatteryBrandKeyFromCode } from "./battery-brand-inference";
import { resolveBatteryImageSetForCode } from "./batteryImages";
import { getVehicleAsset, vehicleAssetBrandLabel } from "./car-assets";
import { getVehicleCardBatteryInfo } from "./vehicleBattery";
import {
  getDiagnosisBatteryRecommendations,
  getDiagnosisVerdict,
  resolveVehicleIdFromName,
} from "./diagnosis-result";
import { toMockAiAnswer } from "./qnaMatcher";
import { getFallback } from "@/data/common/fallback";

export type {
  Vehicle,
  Battery,
  Symptom,
  Guide,
  Question,
  Brand,
  Trend,
  ServiceCenter,
} from "./platform-types";

export type { ContentItem, ShopProduct };
export { contents, shopProducts, getVehicleBodyType };

export const vehicles: import("./platform-types").Vehicle[] = catalogVehicles;
export const batteries: import("./platform-types").Battery[] = catalogBatteries;

import type { Vehicle, Battery, Symptom, Guide, Question, Brand, Trend, ServiceCenter } from "./platform-types";

const baseSymptoms: Symptom[] = [
  { id: "slow-engine-start", title: "시동이 늦게 걸림", subtitle: "CCA/SOH·단거리 충전 부족", tags: ["CCA", "SOH"], metric: "원인 94%", vehicleIds: ["grandeur-ig", "seltos", "k5-dl3", "sonata"], batteryCodes: ["AGM80L", "AGM60L"], guideIds: ["cca-ah", "winter-cca"] },
  { id: "blackbox-drain", title: "블랙박스 방전", subtitle: "대기전류·컷오프 전압", tags: ["대기전류"], metric: "의심 68%", vehicleIds: ["sorento-mq4", "seltos", "palisade"], batteryCodes: ["AGM95L", "AGM60L"], guideIds: ["blackbox-cutoff"] },
  { id: "winter-discharge", title: "겨울철 방전", subtitle: "저온 CCA 저하", tags: ["겨울", "CCA"], metric: "위험 +31%", vehicleIds: ["grandeur-ig", "santa-fe"], batteryCodes: ["AGM80L", "DIN74L"], guideIds: ["winter-cca", "cca-ah"] },
  { id: "ev12v-discharge", title: "EV 12V 방전", subtitle: "보조배터리·대기전류", tags: ["EV", "12V"], metric: "재검색 +12%", vehicleIds: ["ev6", "ioniq5"], batteryCodes: ["EV 12V"], guideIds: ["ev-12v"] },
  { id: "agm-replacement", title: "AGM 교체 필요", subtitle: "ISG/BMS 호환", tags: ["AGM", "BMS"], metric: "호환 97%", vehicleIds: ["bmw-g30", "grandeur-ig"], batteryCodes: ["AGM92Ah", "AGM80L"], guideIds: ["agm-vs-din", "bms-register"] },
];

export const symptoms: Symptom[] = [...baseSymptoms, ...catalogExtraSymptoms];

export const guides: Guide[] = [
  { id: "agm-vs-din", title: "AGM vs DIN", summary: "ISG/IBS 차량은 AGM 유지", body: "ISG·스마트충전 차량은 AGM/EFB 규격을 유지해야 충전 제어와 수명 관리가 안정적입니다. 일반 DIN으로 내리면 CCA·SOH 저하와 경고가 반복될 수 있습니다.", batteryCodes: ["AGM80L", "DIN74L"], vehicleIds: ["grandeur-ig", "seltos"], questionIds: ["q-grandeur-upgrade", "q-seltos-upgrade"], comparePair: ["AGM80L", "DIN74L"] },
  { id: "terminal-lr", title: "L/R 단자 방향", summary: "오주문 최다 항목", body: "플러스/마이너스 단자 위치(L/R)가 다르면 케이블 길이와 터미널 클램프가 맞지 않습니다. 교체 전 사진으로 확인하세요.", batteryCodes: ["AGM80L", "AGM60L"], vehicleIds: [], comparePair: ["AGM80L", "AGM70L"] },
  { id: "cca-ah", title: "CCA/Ah 의미", summary: "저온 시동·용량", body: "Ah는 저장 용량, CCA는 저온 시동 전류입니다. 겨울철에는 CCA 여유율이 특히 중요합니다.", batteryCodes: [], vehicleIds: [] },
  { id: "manufacture-date", title: "제조일자 확인법", summary: "각인·라벨", body: "라벨의 제조 주차/월을 확인하고 36개월 이상 경과 시 교체를 검토하세요.", batteryCodes: [], vehicleIds: [] },
  { id: "ev-12v", title: "EV 12V 보조배터리", summary: "EV6·EV9", body: "전기차 12V는 문잠금·통신·시동 준비에 사용됩니다. 반복 방전 시 대기전류와 충전 이벤트를 함께 점검하세요.", batteryCodes: ["EV 12V"], vehicleIds: ["ev6"], questionIds: ["q-ev6-12v"] },
  { id: "bms-register", title: "BMS/IBS 등록", summary: "수입차·현대 일부", body: "배터리 교체 후 BMS/IBS 등록을 하지 않으면 충전 제어 오차로 신품 수명이 줄 수 있습니다.", batteryCodes: ["AGM92Ah", "AGM80L"], vehicleIds: ["bmw-g30"], questionIds: ["q-bmw-bms"] },
  { id: "wrong-spec", title: "오주문 많은 규격", summary: "AGM80L↔DIN74L", body: "크기가 비슷해도 AGM과 DIN은 충방전 특성이 다릅니다. ISG 차량에서 DIN 교체는 비권장입니다.", batteryCodes: ["AGM80L", "DIN74L"], vehicleIds: ["grandeur-ig"], comparePair: ["AGM80L", "DIN74L"] },
  { id: "agm-sizes", title: "AGM60/70/80/95L 차이", summary: "용량 단계", body: "차량 ISG·용량·공간에 따라 AGM60L~95L 중 선택합니다. 업그레이드는 브라켓·CCA를 확인하세요.", batteryCodes: ["AGM60L", "AGM70L", "AGM80L", "AGM95L"], vehicleIds: ["seltos", "grandeur-ig"] },
  { id: "din-sizes", title: "DIN60/74/80L 차이", summary: "일반 차량", body: "DIN 규격은 H5/H6/H7 등 케이스로 구분됩니다. 순정 Ah와 단자 방향을 맞추세요.", batteryCodes: ["DIN74L"], vehicleIds: ["k5-dl3"] },
  { id: "winter-cca", title: "겨울철 CCA 점검", summary: "영하권 시동", body: "기온이 낮아지면 체감 CCA가 급격히 떨어집니다. 겨울 전 부하 테스트를 권장합니다.", batteryCodes: ["AGM80L"], vehicleIds: ["grandeur-ig"] },
  { id: "blackbox-cutoff", title: "블랙박스 컷오프", summary: "12.2V 이상 권장", body: "주차녹화·상시전원 사용 시 컷오프를 12.2V 이상으로 설정하면 방전 반복을 줄일 수 있습니다.", batteryCodes: [], vehicleIds: ["sorento-mq4", "seltos"] },
];

import { baseQuestions } from "./platform-base-questions";

export const questions: Question[] = [...baseQuestions, ...catalogExtraQuestions];

export const brands: Brand[] = [
  { id: "rocket", displayName: "로케트", line: "AGM/DIN 프리미엄", popularCodes: ["AGM60L", "AGM70L", "AGM80L", "AGM95L", "AGM95R", "AGM105L"], vehicleIds: ["grandeur-ig", "sorento-mq4", "seltos"], types: ["AGM", "DIN"], guideIds: ["agm-vs-din"] },
  { id: "solite", displayName: "쏠라이트", line: "CMF/DIN", popularCodes: ["CMF80L", "CMF60L", "CMF57412", "CMF54459"], vehicleIds: ["seltos", "k5-dl3", "grandeur-ig"], types: ["CMF", "DIN"], guideIds: ["din-sizes", "agm-sizes"] },
  { id: "delco", displayName: "델코", line: "AGM 수입차", popularCodes: ["AGM92Ah"], vehicleIds: ["bmw-g30", "grandeur-ig"], types: ["AGM"], guideIds: ["bms-register"] },
  { id: "varta", displayName: "바르타", line: "AGM/DIN 유럽", popularCodes: ["AGM92Ah"], vehicleIds: ["bmw-g30", "sorento-mq4"], types: ["AGM", "DIN"], guideIds: ["agm-vs-din"] },
  { id: "atk", displayName: "한국AT", line: "일반/DIN", popularCodes: ["DIN74L"], vehicleIds: ["k5-dl3"], types: ["DIN"], guideIds: ["din-sizes"] },
  { id: "infinit", displayName: "INFINIT", line: "EV 12V", popularCodes: ["EV 12V"], vehicleIds: ["ev6"], types: ["EV"], guideIds: ["ev-12v"] },
];

export const trends: Trend[] = [
  { id: "t1", label: "쏘렌토 MQ4", reason: "하이브리드·MQ4 교체 문의", href: "/search?q=쏘렌토%20MQ4%20AGM95L", kind: "vehicle" },
  { id: "t2", label: "AGM80L", reason: "ISG 세단에서 자주 확인", href: "/search?q=AGM80L", kind: "battery" },
  { id: "t3", label: "EV6 12V 방전", reason: "보조배터리 재방전 사례", href: "/diagnosis/ev12v-discharge", kind: "caution" },
  { id: "t4", label: "겨울철 CCA", reason: "기온 하락·시동 지연 문의", href: "/guide/spec?guide=winter-cca", kind: "season" },
  { id: "t5", label: "블랙박스 상시전원", reason: "장기주차 방전 문의", href: "/diagnosis/blackbox-drain", kind: "keyword" },
  { id: "t6", label: "AGM70L vs AGM80L", reason: "용량업 비교 문의", href: "/compare?items=AGM70L,AGM80L", kind: "keyword" },
  { id: "t7", label: "BMS 등록", reason: "수입차 교체 후 경고", href: "/guide/spec?guide=bms-register", kind: "keyword" },
  { id: "t8", label: "그랜저 IG", reason: "연료별 AGM·DIN 확인", href: "/search?q=그랜저%20IG%20AGM80L", kind: "vehicle" },
  { id: "t9", label: "셀토스 AGM60L", reason: "AGM70L 업그레이드 Q&A", href: "/search?q=셀토스%20AGM60L", kind: "vehicle" },
];

export const serviceCenters: ServiceCenter[] = [
  { id: "sc1", name: "강남 배터리 진단센터", location: "서울 강남", distance: "1.2km", status: "영업중", batteries: ["AGM80L", "AGM95L", "DIN74L"], vehicleIds: ["grandeur-ig", "sorento-mq4"], capabilities: ["AGM 교체", "BMS 등록", "출장 가능", "내방 가능", "배터리 사진 확인"], review: "리뷰 4.8" },
  { id: "sc2", name: "수원 EV 12V 센터", location: "경기 수원", distance: "3.4km", status: "예약가능", batteries: ["EV 12V", "EV 12V AGM", "AGM70L"], vehicleIds: ["ev6", "ioniq5"], capabilities: ["EV 12V", "블랙박스 방전 진단", "내방 가능"], review: "리뷰 4.7" },
  { id: "sc3", name: "부산 AGM 전문점", location: "부산 해운대", distance: "5.1km", status: "영업중", batteries: ["DIN74L", "AGM60L", "AGM70L"], vehicleIds: ["k5-dl3", "seltos"], capabilities: ["AGM 교체", "내방 가능", "대형차 가능"], review: "리뷰 4.6" },
  { id: "sc4", name: "대전 블랙박스 방전 클리닉", location: "대전 서구", distance: "2.8km", status: "마감임박", batteries: ["AGM95L", "AGM80L", "AGM105L"], vehicleIds: ["sorento-mq4", "palisade"], capabilities: ["블랙박스 방전 진단", "출장 가능", "배터리 사진 확인"], review: "리뷰 4.5" },
];

export const popularComparisons: [string, string, string][] = [
  ["AGM70L", "AGM80L", "2,944"],
  ["AGM80L", "DIN74L", "4,218"],
  ["AGM80L", "AGM95L", "1,870"],
  ["EV 12V", "AGM70L", "1,228"],
];

// ——— 조회 ———
const KNOWN_VEHICLE_DISPLAY_NAMES: Record<string, string> = {
  "g80-rg3": "G80 RG3",
  gv80: "GV80",
  gv70: "GV70",
  g90: "G90",
  "bmw-g30": "BMW 520i (G30)",
  seltos: "셀토스",
  ev6: "EV6",
  ioniq5: "아이오닉5",
};

function stubVehicle(id: string): Vehicle {
  const displayName =
    KNOWN_VEHICLE_DISPLAY_NAMES[id] ??
    id.replace(/-/g, " ").replace(/\b[a-z]/g, (c) => c.toUpperCase());
  const brand = /g80|gv|g90/i.test(id)
    ? "제네시스"
    : /bmw|audi|benz/i.test(id)
      ? "수입"
      : /ev6|ioniq/i.test(id)
        ? "기타"
        : "기타";
  return {
    id,
    displayName,
    brand,
    yearRange: "연식 확인 필요",
    fuel: "연료별",
    batteryCode: "",
    upgradeCodes: [],
    symptomIds: [],
    guideIds: [],
    questionIds: [],
    brandIds: [],
    searchVolume: "-",
  };
}

export function getVehicle(id: string) {
  return vehicles.find((v) => v.id === id) ?? stubVehicle(id);
}

export function getVehicleName(id: string) {
  const known = KNOWN_VEHICLE_DISPLAY_NAMES[id];
  if (known) return known;
  const v = vehicles.find((x) => x.id === id);
  return v?.displayName ?? id;
}

export function getBattery(code: string, brandId?: string) {
  const display = resolveBatteryDisplay(code);
  const brandKey = brandId
    ? brandIdToBatteryBrandKey(brandId) ?? inferBatteryBrandKeyFromCode(display.displayCode)
    : inferBatteryBrandKeyFromCode(display.displayCode);
  const resolvedBrandId = brandId ?? (brandKey === "solite" ? "solite" : "rocket");
  const productCode = findBatteryProductByCode(code, brandKey, { strictBrand: true });
  const canonical = productCode ?? getCanonicalBatteryCode(code);

  const found =
    batteries.find(
      (b) => b.brandId === resolvedBrandId && isStrictProductCodeMatch(code, b.code),
    ) ??
    batteries.find((b) => isStrictProductCodeMatch(code, b.code)) ??
    (productCode
      ? batteries.find((b) => b.code === productCode || isStrictProductCodeMatch(b.code, productCode))
      : undefined);

  const inferType = (): Battery["type"] => {
    const c = display.displayCode.toUpperCase();
    if (c.startsWith("CMF")) return "CMF";
    if (c.startsWith("DIN")) return "DIN";
    if (c.startsWith("EV")) return "EV";
    if (c.startsWith("EFB")) return "EFB";
    return "AGM";
  };

  const stub: Battery = {
    code: display.displayCode,
    brandId: resolvedBrandId,
    type: inferType(),
    capacity: "",
    cca: "",
    terminal: "",
    size: "",
    vehicleIds: [],
    compareWith: [],
    pros: "",
    cons: "",
    isgFit: "",
    bmsNote: "",
    images: EMPTY_BATTERY_IMAGE_SET,
  };

  const base = found ?? stub;
  const images = resolveBatteryImageSetForCode(code, brandKey);

  return {
    ...base,
    brandId: base.brandId || resolvedBrandId,
    code: display.displayCode,
    productCode: canonical ?? base.code,
    images: images.main ? images : EMPTY_BATTERY_IMAGE_SET,
  };
}

export {
  batteryAliasMap,
  getBatteryBrandBadges,
  getBatteryDisplaySpec,
  type BatteryBrandBadge,
  getBatteryImageSet,
  getCanonicalBatteryCode,
  hasRocketBatteryAssets,
  hasSoliteBatteryAssets,
  hasBatteryAssets,
  resolveBatteryImageSet,
  brandIdToBatteryBrandKey,
  normalizeBatteryCode,
  findBatteryProductByCode,
  AGM60L_IMAGE_SET,
  AGM70L_IMAGE_SET,
  ROCKET_BATTERY_FOLDERS as ROCKET_ASSET_BATTERY_CODES,
  SOLITE_BATTERY_FOLDERS,
  getBatteryImageSet as getRocketBatteryImageSet,
  getBatteryImageSet as rocketBatteryImageSet,
} from "./battery-alias-map";

export {
  normalizeBatteryCode as normalizeBatteryFamilyKey,
  getBatteryAliases,
  isBatteryMatched,
  resolveBatteryDisplay,
  isRetiredBatterySpec,
  BATTERY_ALIAS_MAP,
} from "./batteryNormalize";

export {
  findBatteryImage,
  findBatteryBrandImages,
  getBatteryImageCandidates,
  getBatteryImageManifest,
  resolveBatteryImageSetForCode,
  getGuideHeroImageForArticle,
  getGuideSectionImagesForArticle,
} from "./batteryImages";

export {
  pickBatteryImage,
  batteryImageSetForCode,
  batteryGalleryUrls,
  batteryImageCandidates,
  batteryImagesForCode,
  type BatteryImageRole,
  type BatteryImageSet,
} from "./battery-image";

export function getSymptom(id: string) {
  return symptoms.find((s) => s.id === id) ?? symptoms[0];
}

export function getGuide(id: string) {
  return guides.find((g) => g.id === id) ?? guides[0];
}

export function getQuestion(id: string) {
  return questions.find((q) => q.id === id) ?? questions[0];
}

export function getBrand(id: string) {
  return brands.find((b) => b.id === id) ?? brands[0];
}

export function getShopProduct(id: string) {
  return shopProducts.find((p) => p.id === id) ?? shopProducts[0];
}

export function shopHref() {
  return "/search";
}

export function cartHref() {
  return "/cart";
}

// ——— URL (내부 id는 URL에만 사용, UI 미노출) ———
export function searchHref(q: string) {
  return `/search?q=${encodeURIComponent(q)}`;
}

export function vehicleHref(id: string) {
  return `/vehicle/${id}`;
}

export function compareHref(...codes: string[]) {
  return `/compare?items=${codes.map(encodeURIComponent).join(",")}`;
}

export function diagnosisHref(symptomId?: string) {
  return symptomId ? `/diagnosis/${symptomId}` : "/diagnosis";
}

export function guideHref(guideId?: string) {
  return guideId ? `/guide/spec?guide=${guideId}` : "/guide/spec";
}

export function communityHref(q?: string) {
  return q ? `/qa?q=${encodeURIComponent(q)}` : "/qa";
}

export function photoHref(q?: string, vehicleId?: string) {
  const p = new URLSearchParams();
  if (q) p.set("battery", q);
  if (vehicleId) p.set("vehicle", vehicleId);
  const s = p.toString();
  return s ? `/photo-check?${s}` : "/photo-check";
}

export function serviceHref(vehicleId?: string, battery?: string, symptomId?: string) {
  const p = new URLSearchParams();
  if (vehicleId) p.set("vehicle", getVehicle(vehicleId).displayName);
  if (battery) p.set("battery", battery);
  if (symptomId) p.set("symptom", symptomId);
  const s = p.toString();
  return s ? `/service?${s}` : "/service";
}

export function aiHref(q?: string) {
  return q ? `/ai?q=${encodeURIComponent(q)}` : "/ai";
}

export function brandHref(brandId: string) {
  return `/brands?brand=${brandId}`;
}

// ——— 검색 분류 ———
export type SearchIntent = {
  type: "vehicle" | "battery" | "symptom" | "question" | "mixed";
  label: string;
  summary: string;
  vehicle?: Vehicle;
  battery?: Battery;
  symptom?: Symptom;
  question?: Question;
};

export function classifySearch(query: string): SearchIntent {
  const q = query.trim().toLowerCase();
  if (isRetiredBatterySpec(query)) {
    return { type: "mixed", label: "검색", summary: "해당 규격은 더 이상 제공되지 않습니다." };
  }
  const canonicalFromQuery = getCanonicalBatteryCode(query);
  const vehicle = vehicles.find(
    (v) =>
      q.includes(v.displayName.replace(/\s/g, "").toLowerCase()) ||
      q.includes(v.id.replace(/-/g, "")) ||
      v.batteryCode.toLowerCase() === q ||
      (canonicalFromQuery != null && v.batteryCode === canonicalFromQuery),
  );
  const battery =
    (canonicalFromQuery
      ? batteries.find((b) => (getCanonicalBatteryCode(b.code) ?? b.code) === canonicalFromQuery)
      : undefined) ?? batteries.find((b) => q.includes(b.code.toLowerCase()));
  const symptom = symptoms.find(
    (s) => q.includes(s.title.replace(/\s/g, "")) || ["시동", "방전", "블랙박스", "겨울", "cca"].some((k) => q.includes(k) && s.id.includes("slow") || s.id.includes("drain") || s.id.includes("winter")),
  );
  const question = questions.find((x) => q.length > 8 && (x.title.includes(query) || q.includes("가능") || q.includes("대신")));

  if (question || (q.includes("가능") && q.includes("?"))) {
    return { type: "question", label: "질문/호환 문의", summary: "규격 문의·Q&A로 연결합니다.", question: question ?? questions.find((x) => x.id === "q-din-agm") };
  }
  if (symptom && !vehicle) {
    return { type: "symptom", label: "증상 검색", summary: "증상 확인 페이지로 연결합니다.", symptom };
  }
  if (vehicle && battery) {
    return { type: "mixed", label: "차량+배터리", summary: `${vehicle.displayName} · ${battery.code} 통합 결과`, vehicle, battery };
  }
  if (battery) {
    return { type: "battery", label: "배터리 규격", summary: `${battery.code} 규격·호환 차종`, battery };
  }
  if (vehicle) {
    return { type: "vehicle", label: "차량 검색", summary: `${vehicle.displayName} 배터리 정보`, vehicle };
  }
  return { type: "mixed", label: "통합 검색", summary: "차량·배터리·증상·가이드를 함께 표시합니다." };
}

// ——— Mock AI / 진단 / 사진 ———
export function mockAiAnswer(question: string) {
  const matched = toMockAiAnswer(question);
  return {
    question: matched.question,
    summary: matched.summary,
    warnings: matched.warnings,
    checks: matched.checks,
    vehicle: matched.vehicle,
    battery: matched.battery,
    guideId: matched.guideId,
  };
}

export function mockDiagnosisResult(input: {
  symptomId: string;
  vehicleName: string;
  drainCount: string;
  blackbox: string;
  voltage: string;
  fuel?: string;
}) {
  const symptom = getSymptom(input.symptomId);
  const vehicleId = resolveVehicleIdFromName(input.vehicleName);
  const vehicle = getVehicle(vehicleId);
  const batteryRec = getDiagnosisBatteryRecommendations(vehicleId, {
    fuelHint: input.fuel,
    symptomId: input.symptomId,
  });
  const battery = getBattery(batteryRec.primaryCode);
  const risk = input.voltage && parseFloat(input.voltage) < 12.3 ? "높음" : "중상";

  return {
    symptom,
    vehicle,
    battery,
    batteryRec,
    verdict: getDiagnosisVerdict(symptom.id, vehicle.displayName, batteryRec),
    causes: [
      { title: "SOH/CCA 저하", prob: "42%", detail: "단거리·노후 시 흔함" },
      { title: "대기전류", prob: input.blackbox === "예" ? "28%" : "12%", detail: "블랙박스·상시전원" },
      { title: "충전 부족", prob: "18%", detail: `방전 ${input.drainCount}회 패턴` },
    ],
    risk,
    urgency: symptom.id === "ev12v-discharge" ? "48시간 내" : "7일 내",
    actions: ["전압/OCV 측정", "CCA 부하 테스트", symptom.id === "blackbox-drain" ? "컷오프 12.2V+" : "충전 패턴 점검"],
    batteries: batteryRec.codes,
  };
}

export function mockPhotoAnalysis(batteryCode: string) {
  const b = getBattery(batteryCode);
  const v = getVehicle(b.vehicleIds[0] ?? "grandeur-ig");
  const disclaimer = getFallback("photoAnalysis");
  return {
    ocr: b.code,
    terminal: `${b.terminal} 타입`,
    manufacture: "제조 34개월",
    type: b.type,
    risk: b.type === "DIN" && v.batteryCode.startsWith("AGM") ? "AGM→DIN 오주문 위험" : "정상 범위",
    vehicle: v,
    battery: b,
    disclaimerTitle: disclaimer.title,
    disclaimerBody: disclaimer.body,
  };
}

export type ActionLink = { title: string; description: string; href: string };

/** href 기준 중복 제거 (첫 항목 유지) */
export function uniqueCrossLinks(links: ActionLink[]): ActionLink[] {
  return Array.from(new Map(links.map((link) => [link.href, link])).values());
}

export function nextActionsFor(page: string, ctx?: { vehicleId?: string; batteryCode?: string; symptomId?: string; guideId?: string; query?: string }): ActionLink[] {
  // navigationGraph ↔ platform-data 순환 참조 방지 — 호출 시점에만 로드
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nav = require("./navigationGraph") as typeof import("./navigationGraph");
  return nav.getNextActions(nav.buildContextFromPage(page, ctx));
}

// portal-data 호환 re-export
export const portalVehicles = vehicles.map((v) => ({
  slug: v.id,
  name: v.displayName,
  brand: v.brand,
  yearRange: v.yearRange,
  fuel: v.fuel,
  recommendedBattery: v.batteryCode,
  upgradeOptions: v.upgradeCodes,
  symptomSlugs: v.symptomIds,
  relatedGuides: v.guideIds.map((id) => getGuide(id).title),
}));
export const portalBatteries = batteries.map((b) => ({
  code: b.code,
  type: b.type,
  capacity: b.capacity,
  cca: b.cca,
  terminal: b.terminal,
  compatibleVehicleSlugs: b.vehicleIds,
  compareTargets: b.compareWith,
  relatedGuides: b.vehicleIds.flatMap((vid) => getVehicle(vid).guideIds.map((id) => getGuide(id).title)),
}));
export const portalQuestions = questions.map((q) => ({
  title: q.title,
  vehicleSlug: q.vehicleId,
  batteryCode: q.batteryCode,
  tags: q.tags,
  relatedGuide: q.guideId ? getGuide(q.guideId).title : undefined,
}));
export const searchUrl = searchHref;
export const vehicleUrl = vehicleHref;
export const compareUrl = compareHref;
export const diagnosisUrl = diagnosisHref;
export const guideUrl = guideHref;
export const communityUrl = communityHref;
export const photoUrl = photoHref;
export const serviceUrl = serviceHref;
export const aiChatUrl = (q: string) => aiHref(q);
export const popularComparePairs = popularComparisons;
export const trendingKeywords = trends;
export function getPortalVehicle(id: string) {
  const catalogVehicle = vehicles.find((item) => item.id === id);
  const asset = getVehicleAsset(id);

  if (!catalogVehicle && asset) {
    const db = getVehicleCardBatteryInfo(asset.catalogId ?? asset.id);
    const battery =
      (db.hasConfirmedDb && db.displayCode) ||
      db.displayCode ||
      asset.defaultBatteryCode ||
      (db.needsPhotoReview ? "사진 확인 필요" : "규격 확인 필요");
    return {
      slug: asset.catalogId ?? asset.id,
      name: asset.displayName,
      brand: vehicleAssetBrandLabel(asset.brand),
      yearRange: asset.yearRange ?? "-",
      fuel: asset.tags?.includes("EV") ? "전기" : "연료별 확인",
      recommendedBattery: battery,
      upgradeOptions: [],
      searchKeywords: asset.aliases.slice(0, 6),
      symptomSlugs: [],
      relatedQuestions: [],
      relatedGuides: asset.tags ?? [],
    };
  }

  const v = catalogVehicle ?? getVehicle(id);
  return {
    slug: v.id,
    name: v.displayName,
    brand: v.brand,
    yearRange: v.yearRange,
    fuel: v.fuel,
    recommendedBattery: v.batteryCode,
    upgradeOptions: v.upgradeCodes,
    searchKeywords: [`${v.displayName} ${v.batteryCode}`],
    symptomSlugs: v.symptomIds,
    relatedQuestions: questions.filter((q) => q.vehicleId === v.id).map((q) => q.title),
    relatedGuides: v.guideIds.map((id) => getGuide(id).title),
  };
}
export function getPortalBattery(code: string) {
  const b = getBattery(code);
  const guideTitles = [...new Set(b.vehicleIds.flatMap((vid) => getVehicle(vid).guideIds.map((id) => getGuide(id).title)))];
  return {
    code: b.code,
    type: b.type,
    capacity: b.capacity,
    cca: b.cca,
    terminal: b.terminal,
    compatibleVehicleSlugs: b.vehicleIds,
    compareTargets: b.compareWith,
    relatedGuides: guideTitles.length ? guideTitles : ["AGM vs DIN"],
  };
}

export function getBatteryCrossLinks(code: string) {
  const b = getBattery(code);
  const v = getVehicle(b.vehicleIds[0] ?? "grandeur-ig");
  return nextActionsFor("photo", { vehicleId: v.id, batteryCode: b.code });
}
export function getVehicleCrossLinksForBattery(id: string, recommended: string, model: string, upgrade?: string) {
  const v = getVehicle(id);
  const up = upgrade ?? v.upgradeCodes[0];
  return nextActionsFor("diagnosis", { vehicleId: id, batteryCode: recommended }).slice(0, 8);
}
export function getDiagnosisContextLinks(symptomId: string) {
  const s = getSymptom(symptomId);
  const v = getVehicle(s.vehicleIds[0]);
  const b = getBattery(s.batteryCodes[0]);
  return {
    crossLinks: nextActionsFor("diagnosis", { vehicleId: v.id, batteryCode: b.code, symptomId: s.id }),
    related: {
      vehicles: [{ label: v.displayName, meta: b.code, href: vehicleHref(v.id) }],
      batteries: s.batteryCodes.map((c) => ({ label: c, meta: "검색", href: searchHref(c) })),
      guides: s.guideIds.map((id) => ({ label: getGuide(id).title, meta: "가이드", href: guideHref(id) })),
      questions: questions
        .filter((q) => s.vehicleIds.includes(q.vehicleId ?? ""))
        .map((q) => ({ label: q.title.slice(0, 30), meta: "Q&A", href: communityHref(q.title) })),
    },
  };
}
export function tagToHref(tag: string, q: Question) {
  const vehicle = vehicles.find((v) => tag.includes(v.displayName) || tag === v.brand);
  if (vehicle) return vehicleHref(vehicle.id);
  const bat = batteries.find((b) => tag.toUpperCase().includes(b.code));
  if (bat) return searchHref(bat.code);
  if (tag === "용량업" && q.batteryCode) return compareHref(q.batteryCode, getBattery(q.batteryCode).compareWith[0]);
  if (tag === "BMS") return guideHref("bms-register");
  return searchHref(tag);
}
export function resolveKeywordHref(keyword: string) {
  return trends.find((t) => t.label === keyword)?.href ?? searchHref(keyword);
}
export function getRelatedForVehicle(id: string) {
  const v = getVehicle(id);
  return {
    vehicles: vehicles.filter((x) => x.id !== id).slice(0, 4).map((x) => ({ label: x.displayName, meta: x.batteryCode, href: vehicleHref(x.id) })),
    batteries: [v.batteryCode, ...v.upgradeCodes].map((c) => ({ label: c, meta: "규격", href: searchHref(c) })),
    guides: v.guideIds.map((id) => ({ label: getGuide(id).title, meta: "가이드", href: guideHref(id) })),
    questions: questions
      .filter((q) => q.vehicleId === id)
      .map((q) => ({ label: q.title.slice(0, 36), meta: "Q&A", href: communityHref(q.title) })),
  };
}
export function getRelatedForQuery(q: string) {
  const intent = classifySearch(q);
  const v = intent.vehicle;
  return {
    vehicle: v
      ? {
          slug: v.id,
          name: v.displayName,
          recommendedBattery: v.batteryCode,
          symptomSlugs: v.symptomIds,
          relatedGuides: v.guideIds.map((id) => getGuide(id).title),
        }
      : undefined,
    battery: intent.battery
      ? { code: intent.battery.code, compareWith: intent.battery.compareWith, type: intent.battery.type }
      : undefined,
    compareHref: compareHref(intent.battery?.code ?? v?.batteryCode ?? "AGM80L", intent.battery?.compareWith[0] ?? "DIN74L"),
    intent,
  };
}
export const portalCTA = { checkSpec: "내 차량 규격 확인", photoCheck: "사진으로 확인", diagnose: "증상 확인", compare: "배터리 비교", relatedQuestions: "Q&A", serviceCenter: "작업 가능점", searchBattery: "규격 검색", specGuide: "가이드", lifeCalc: "수명 계산" };
export const diagnosisContext: Record<string, { vehicleSlug: string; battery: string; guides: string[] }> = Object.fromEntries(
  symptoms.map((s) => [s.id, { vehicleSlug: s.vehicleIds[0], battery: s.batteryCodes[0], guides: s.guideIds }]),
);
