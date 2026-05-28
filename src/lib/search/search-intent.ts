import type { SearchIntent } from "@/lib/platform-data";
import type { SearchCta } from "@/lib/search-page-results";
import { HUB_PHOTO, HUB_SHOP, HUB_SHOP_ANCHORS, HUB_STORE } from "@/lib/customer-hub-routes";
import { detectCustomerHubFromQuery, prependHubCtas } from "@/lib/search/search-hub-cta";
import { extractQuerySpecTokens } from "@/lib/search/search-query-specs";

const SYMPTOM_INTENT_RE =
  /방전|완전\s*방전|시동\s*지연|시동\s*안|블랙박스|블박|경고등|전압|12\s*v\s*방전/i;
const COMPARE_INTENT_RE = /가격\s*비교|비교|\bvs\b|\bVS\b|차이/i;
const UPGRADE_INTENT_RE = /업그레이드|상향|큰\s*배터리|용량\s*업|검토/i;
const TERMINAL_INTENT_RE =
  /단자\s*방향|단자방향|단자|L\s*타입|R\s*타입|\+단자|플러스\s*위치|마이너스\s*단자|\bL\s*\/\s*R\b|좌우/i;

const OUTBOUND_SERVICE_RE = /출장|출장\s*교체|배터리\s*출장|부산.*배터리.*출장/i;
const STORE_VISIT_RE = /덕천|학장|매장|지점|방문|내방|교체\s*상담/i;
const DELIVERY_ORDER_RE = /택배|온라인\s*주문|배송\s*주문/i;
const PRODUCT_BROWSE_RE = /상품\s*확인|배터리\s*상품|쇼핑|상품\s*보기/i;

export type QueryIntentFlags = {
  photo: boolean;
  symptom: boolean;
  inquiry: boolean;
  order: boolean;
  upgrade: boolean;
  price: boolean;
  specCheck: boolean;
  batteryPurpose: boolean;
  compare: boolean;
  terminalDirection: boolean;
};

const PHOTO = /사진|사진으로\s*확인|촬영|ocr|라벨|배터리\s*사진|사진.*배터리/i;
const SYMPTOM = /방전|블랙박스|시동\s*지연|시동|재방전|딸깍|겨울|cca|12\s*v|12v|보조\s*배터리/i;
const INQUIRY = /문의|상담|전화|가격\s*문의/i;
const ORDER = /택배|주문|배송|구매|반납/i;
const UPGRADE = /업그레이드|교체\s*예정|교체\s*검토|대체|배터리\s*교체/i;
const PRICE = /가격|비교|저렴/i;
const SPEC_CHECK = /규격\s*확인|배터리\s*규격|순정|호환/i;
const COMPARE = /\bvs\b|차이|대체|호환/i;
const BATTERY = /배터리/i;

export function detectQueryIntentFlags(query: string): QueryIntentFlags {
  return {
    photo: PHOTO.test(query),
    symptom: SYMPTOM_INTENT_RE.test(query) || SYMPTOM.test(query) || query.includes("증상"),
    inquiry: INQUIRY.test(query),
    order: ORDER.test(query),
    upgrade: UPGRADE_INTENT_RE.test(query) || UPGRADE.test(query),
    price: PRICE.test(query),
    specCheck: SPEC_CHECK.test(query),
    batteryPurpose: BATTERY.test(query),
    compare: COMPARE_INTENT_RE.test(query) || COMPARE.test(query),
    terminalDirection: TERMINAL_INTENT_RE.test(query),
  };
}

/** /search 상단 라벨 — classifySearch와 별도로 검색어 의도 우선 */
export function resolveSearchIntentLabel(
  query: string,
  options?: { hasVehicle?: boolean; hasAlias?: boolean },
): string {
  const specTokens = extractQuerySpecTokens(query);
  if (SYMPTOM_INTENT_RE.test(query)) return "증상 검색";
  if (COMPARE_INTENT_RE.test(query)) return "비교 검색";
  if (UPGRADE_INTENT_RE.test(query)) return "업그레이드 검색";
  if (TERMINAL_INTENT_RE.test(query)) return "단자 방향 검색";
  if (DELIVERY_ORDER_RE.test(query) && /주문|택배|배송/i.test(query)) return "택배 주문 검색";
  if (PRODUCT_BROWSE_RE.test(query)) return "배터리 상품 검색";
  if (OUTBOUND_SERVICE_RE.test(query)) return "출장 서비스 검색";
  if (/덕천/.test(query)) return "덕천점 검색";
  if (/학장/.test(query)) return "학장점 검색";
  if (STORE_VISIT_RE.test(query) && /배터리|교체|매장|점/i.test(query)) return "매장 교체 검색";
  if (specTokens.length > 0) return "규격 검색";
  if (options?.hasVehicle || options?.hasAlias) return "차량 검색";
  return "통합검색";
}

export function hasActionIntent(flags: QueryIntentFlags): boolean {
  return Object.values(flags).some(Boolean);
}

/** 차량 + 목적 조합이면 CTA·안내 우선 */
export function shouldPrioritizeGuidance(flags: QueryIntentFlags, hasVehicle: boolean, purposeCount: number): boolean {
  if (hasActionIntent(flags)) return true;
  return hasVehicle && (purposeCount > 0 || flags.batteryPurpose);
}

export function buildIntentMessage(query: string, flags: QueryIntentFlags, intent: SearchIntent): string | null {
  if (flags.photo) {
    return "사진으로 규격 확인이 필요한 검색입니다. 차량 연식·연료 또는 현재 장착 배터리 사진을 확인하면 더 정확합니다.";
  }
  if (flags.symptom && /블랙박스/.test(query)) {
    return "블랙박스 방전은 배터리 상태, 주차 시간, 상시전원 설정에 따라 원인이 달라질 수 있습니다.";
  }
  if (flags.symptom && intent.type === "symptom" && intent.symptom) {
    return `${intent.symptom.title} 관련 검색입니다. ${intent.symptom.subtitle}`;
  }
  if (flags.order) {
    return "택배 주문 전에는 차량 연식·연료·단자 방향·현재 장착 배터리 사진 확인이 필요합니다.";
  }
  if (flags.compare) {
    return "규격 비교·대체·호환 검색입니다. 단자 방향(L/R)과 차량 연식·연료를 함께 확인하세요.";
  }
  if (flags.upgrade) {
    return "업그레이드·대체 규격은 트림·ISG·장착 공간에 따라 달라질 수 있습니다.";
  }
  if (flags.specCheck) {
    return "규격 확인이 필요한 검색입니다. 차량 연식·연료와 단자 방향을 함께 확인하세요.";
  }
  return null;
}

export function buildIntentCtas(
  flags: QueryIntentFlags,
  specHref: string,
  vehicleHref?: string,
  symptomHref?: string,
  guideHref?: string,
  compareHref?: string,
  query = "",
): SearchCta[] {
  const ctas: SearchCta[] = [];
  const seen = new Set<string>();

  const add = (label: string, href: string) => {
    if (seen.has(label)) return;
    seen.add(label);
    ctas.push({ label, href });
  };

  const hub = detectCustomerHubFromQuery(query);

  if (flags.compare) {
    add("규격 비교 보기", compareHref ?? specHref);
    add("사진으로 확인", HUB_PHOTO);
    add("문의하기", "/ai");
    if (vehicleHref) add("차량 상세 보기", vehicleHref);
    add("차량 정보 더 입력", "/vehicles");
    return prependHubCtas(ctas, query, flags);
  }

  if (flags.order) {
    add("택배·쇼핑", HUB_SHOP);
    add("주문 전 규격 확인", HUB_SHOP_ANCHORS.orderCheck);
    add("택배 주문 전 확인", HUB_SHOP_ANCHORS.delivery);
    add("단자 방향 확인", HUB_SHOP_ANCHORS.terminal);
    add("사진으로 확인", HUB_PHOTO);
    add("문의하기", "/ai");
    return prependHubCtas(ctas, query, flags);
  }

  if (flags.photo) {
    add("사진으로 확인", HUB_PHOTO);
    add("문의하기", "/ai");
    add(flags.compare ? "규격 비교 보기" : "규격 가이드 보기", compareHref ?? specHref);
    if (vehicleHref) add("차량 상세 보기", vehicleHref);
    if (guideHref) add("규격 가이드 보기", guideHref);
    return prependHubCtas(ctas, query, flags);
  }

  if (flags.symptom) {
    add("증상 확인", symptomHref ?? "/diagnosis");
    add("사진으로 확인", HUB_PHOTO);
    add("문의하기", "/ai");
    add("규격 가이드 보기", specHref);
    if (vehicleHref) add("차량 상세 보기", vehicleHref);
    if (hub === "store") add("매장·출장 안내", HUB_STORE);
    return prependHubCtas(ctas, query, flags);
  }

  if (flags.inquiry || flags.price) {
    add("문의하기", "/ai");
    add(flags.compare ? "규격 비교 보기" : "규격 가이드 보기", compareHref ?? specHref);
    add("사진으로 확인", HUB_PHOTO);
    if (vehicleHref) add("차량 상세 보기", vehicleHref);
    return prependHubCtas(ctas, query, flags);
  }

  if (flags.upgrade || flags.specCheck) {
    add(flags.compare ? "규격 비교 보기" : "규격 가이드 보기", compareHref ?? specHref);
    add("사진으로 확인", HUB_PHOTO);
    add("문의하기", "/ai");
    if (vehicleHref) add("차량 상세 보기", vehicleHref);
    if (guideHref) add("규격 가이드 보기", guideHref);
    if (flags.terminalDirection) add("단자 방향 확인", HUB_SHOP_ANCHORS.terminal);
    return prependHubCtas(ctas, query, flags);
  }

  if (flags.batteryPurpose) {
    add("사진으로 확인", HUB_PHOTO);
    add("문의하기", "/ai");
    add("규격 가이드 보기", specHref);
    if (vehicleHref) add("차량 상세 보기", vehicleHref);
    add("차량 정보 더 입력", "/vehicles");
    return prependHubCtas(ctas, query, flags);
  }

  add("사진으로 확인", HUB_PHOTO);
  add("문의하기", "/ai");
  add(flags.compare ? "규격 비교 보기" : "규격 가이드 보기", compareHref ?? specHref);
  add("차량 정보 더 입력", "/vehicles");
  if (vehicleHref) add("차량 상세 보기", vehicleHref);
  if (hub === "store") add("매장·출장 안내", HUB_STORE);
  if (hub === "shop") add("택배·쇼핑", HUB_SHOP);
  return prependHubCtas(ctas, query, flags);
}

export function symptomHrefFromIntent(intent: SearchIntent, query: string): string | undefined {
  if (intent.type === "symptom" && intent.symptom) return `/diagnosis/${intent.symptom.id}`;
  if (/블랙박스/.test(query)) return "/diagnosis/blackbox-drain";
  if (/시동/.test(query)) return "/diagnosis/slow-engine-start";
  if (/방전|12V|EV/.test(query)) return "/diagnosis/ev12v-discharge";
  return undefined;
}
