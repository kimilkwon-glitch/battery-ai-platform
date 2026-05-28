import { getSearchHref } from "@/lib/battery-search";
import { buildVehicleDetailHref } from "@/lib/battery-cta";
import { getBatteryHref } from "@/lib/content";
import { HUB_PHOTO, HUB_SHOP, HUB_SHOP_ANCHORS, HUB_STORE } from "@/lib/customer-hub-routes";
import { CORE_BATTERY_DETAIL_CODES } from "@/lib/battery-detail/core-battery-codes";

/** 메인 hero — 검색 유형·예시 */
export const HOME_HERO = {
  headline: "내 차 배터리, 차종·규격·증상 기준으로 한 번에 확인",
  subline: "차종으로 찾거나, AGM80L처럼 규격명으로 바로 확인하세요.",
  tagline: "DB 매칭으로 먼저 답을 보여주고, 사진은 마지막 검증입니다.",
} as const;

export const HOME_SEARCH_TYPE_CHIPS = [
  { label: "차량명 검색", desc: "연식·연료별 추천", href: "/vehicles", tone: "primary" as const },
  { label: "배터리 규격 검색", desc: "AGM · DIN · CMF", href: getSearchHref("AGM70L"), tone: "default" as const },
  { label: "증상 진단", desc: "방전·시동지연 허브", href: "/symptoms", tone: "default" as const },
  { label: "사진 확인", desc: "라벨·단자 최종 검증", href: HUB_PHOTO, tone: "secondary" as const },
] as const;

export const HOME_HERO_EXAMPLES = [
  "포터2 배터리",
  "그랜저 IG 가솔린",
  "AGM70L",
  "스포티지 NQ5 하이브리드",
  "레이 블랙박스 방전",
  "100R vs AGM95L",
] as const;

/** 많이 찾는 규격 랭킹 — 핵심 8종 */
export const HOME_POPULAR_BATTERIES = [
  {
    code: "AGM60L",
    summary: "하이브리드/보조 12V 확인",
    typeLabel: "AGM",
    terminal: "L타입",
    useCase: "HEV·ISG 보조 12V",
  },
  {
    code: "AGM70L",
    summary: "중형·준대형 승용 AGM",
    typeLabel: "AGM",
    terminal: "L타입",
    useCase: "ISG·중형 승용",
  },
  {
    code: "AGM80L",
    summary: "SUV·디젤·대형 승용 AGM",
    typeLabel: "AGM",
    terminal: "L타입",
    useCase: "SUV·디젤 메인",
  },
  {
    code: "DIN74L",
    summary: "DIN 계열/봉고3 등 확인",
    typeLabel: "DIN",
    terminal: "L타입",
    useCase: "유럽형·상용 DIN",
  },
  {
    code: "100R",
    summary: "포터2 2020년 이후 R타입",
    typeLabel: "R타입(JIS)",
    terminal: "R타입",
    useCase: "상용·포터2 이후",
  },
  {
    code: "CMF80L",
    summary: "CMF80L 표기 보존, 80L 축약 주의",
    typeLabel: "CMF",
    terminal: "L타입",
    useCase: "중대형 CMF",
  },
  {
    code: "AGM95L",
    summary: "대형 AGM, 100R 단순 대체 금지",
    typeLabel: "AGM",
    terminal: "L타입",
    useCase: "대형 승용·SUV",
  },
  {
    code: "EV 12V",
    summary: "전기차 보조 12V",
    typeLabel: "EV 보조 12V",
    terminal: "확인 필요",
    useCase: "고전압 메인 아님",
  },
] as const;

export type HomePopularBattery = (typeof HOME_POPULAR_BATTERIES)[number];

/** 인기 차량 빠른 검색 */
export const HOME_POPULAR_VEHICLES = [
  {
    title: "포터2",
    hint: "2020년 이전 90R / 이후 100R",
    spec: "90R · 100R",
    href: getSearchHref("포터2 배터리"),
    slug: "porter2-new",
  },
  {
    title: "그랜저 IG",
    hint: "가솔린 AGM70L / 디젤 AGM80L",
    spec: "AGM70L · AGM80L",
    href: buildVehicleDetailHref("grandeur-ig"),
    slug: "grandeur-ig",
  },
  {
    title: "쏘렌토 MQ4",
    hint: "연료·트림별 확인",
    spec: "AGM60L · AGM80L",
    href: buildVehicleDetailHref("sorento-mq4"),
    slug: "sorento-mq4",
  },
  {
    title: "스포티지 NQ5",
    hint: "하이브리드 AGM60L",
    spec: "AGM60L",
    href: buildVehicleDetailHref("sportage-nq5", "하이브리드"),
    slug: "sportage-nq5",
  },
  {
    title: "K8",
    hint: "하이브리드 AGM60L",
    spec: "AGM60L",
    href: buildVehicleDetailHref("k8-gl3", "하이브리드"),
    slug: "k8-gl3",
  },
  {
    title: "스타리아",
    hint: "디젤 CMF80L · 연식 확인",
    spec: "CMF80L",
    href: getSearchHref("스타리아 CMF80L"),
    slug: "staria-us4",
  },
  {
    title: "EV6",
    hint: "보조 12V EV 12V",
    spec: "EV 12V",
    href: getSearchHref("EV6 보조배터리"),
    slug: "ev6",
  },
  {
    title: "아이오닉5",
    hint: "보조 12V EV 12V",
    spec: "EV 12V",
    href: getSearchHref("아이오닉5 배터리"),
    slug: "ioniq5-ne",
  },
  {
    title: "봉고3",
    hint: "DIN74L · 상용 DIN",
    spec: "DIN74L",
    href: buildVehicleDetailHref("bongo3-truck"),
    slug: "bongo3-truck",
  },
] as const;

/** EV·하이브리드 보조 12V */
export const HOME_EV_HYBRID_ITEMS = [
  {
    label: "EV6 보조배터리",
    href: getSearchHref("EV6 보조배터리"),
    battery: "EV 12V",
    vehicleSlug: "ev6",
  },
  {
    label: "아이오닉5 보조배터리",
    href: getSearchHref("아이오닉5 배터리"),
    battery: "EV 12V",
    vehicleSlug: "ioniq5-ne",
  },
  {
    label: "스포티지 NQ5 하이브리드",
    href: getSearchHref("스포티지 NQ5 하이브리드"),
    battery: "AGM60L",
    vehicleSlug: "sportage-nq5",
    fuel: "하이브리드",
  },
  {
    label: "K8 하이브리드",
    href: getSearchHref("K8 하이브리드"),
    battery: "AGM60L",
    vehicleSlug: "k8-gl3",
    fuel: "하이브리드",
  },
  {
    label: "쏘렌토 MQ4 하이브리드",
    href: getSearchHref("쏘렌토 MQ4 하이브리드"),
    battery: "AGM60L",
    vehicleSlug: "sorento-mq4",
    fuel: "하이브리드",
  },
  {
    label: "싼타페 MX5 하이브리드",
    href: getSearchHref("싼타페 MX5 하이브리드"),
    battery: "AGM60L",
    vehicleSlug: "santafe-mx5",
    fuel: "하이브리드",
  },
] as const;

/** 많이 찾는 조건 — 실시간 과장 없음 */
export const HOME_TRENDING_PATTERNS = [
  { label: "포터2 90R/100R", href: getSearchHref("포터2 배터리"), tag: "연식" },
  { label: "그랜저 IG AGM70L/AGM80L", href: getSearchHref("그랜저 IG 가솔린"), tag: "연료" },
  { label: "스포티지 NQ5 하이브리드 AGM60L", href: getSearchHref("스포티지 NQ5 하이브리드"), tag: "HEV" },
  { label: "스타리아 CMF80L", href: getSearchHref("스타리아 CMF80L"), tag: "CMF" },
  { label: "100R vs AGM95L", href: getSearchHref("100R vs AGM95L"), tag: "비교" },
  { label: "EV6 EV 12V", href: getBatteryHref("EV 12V"), tag: "EV" },
  { label: "레이 블랙박스 방전", href: getSearchHref("레이 블랙박스 방전"), tag: "증상" },
] as const;

export const HOME_DELIVERY_STEPS = [
  {
    title: "규격을 알고 주문",
    desc: "AGM70L처럼 규격을 알고 있다면 바로 상세페이지에서 확인",
    href: getBatteryHref("AGM70L"),
  },
  {
    title: "차량 기준으로 확인 후 주문",
    desc: "규격이 애매하면 차량명 검색으로 연식·연료부터 확인",
    href: "/vehicles",
  },
  {
    title: "사진 확인 후 주문",
    desc: "라벨·단자 사진으로 최종 규격 확정",
    href: HUB_PHOTO,
  },
] as const;

export const HOME_STORE_CARDS = [
  {
    id: "deokcheon",
    name: "덕천점",
    region: "북구 중심",
    areas: "덕천·구포·만덕·화명·대저·동래·금정",
    scenarios: "아파트 지하주차장 · 출근 전 방전 · 생활권 긴급",
    href: `${HUB_STORE}#store-deokcheon`,
  },
  {
    id: "hakjang",
    name: "학장점",
    region: "사상구 중심",
    areas: "학장·감전·괘법·모라·주례·엄궁·사하·강서",
    scenarios: "업무차·법인차·중고차·물류차량",
    href: `${HUB_STORE}#store-hakjang`,
  },
  {
    id: "outbound",
    name: "출장 교체",
    region: "부산 권역",
    areas: "직영점 기준 출장·내방 일정 안내",
    scenarios: "현장 교체 · 긴급 시동불량",
    href: `${HUB_STORE}#visit`,
  },
  {
    id: "photo-guide",
    name: "사진확인 후 안내",
    region: "오주문 방지",
    areas: "라벨·단자·연식 확인 후 규격 확정",
    scenarios: "확실하지 않을 때 우선 권장",
    href: HUB_PHOTO,
  },
] as const;

export function batteryDetailHref(code: string): string {
  return getBatteryHref(code);
}

export function isCoreHomeBattery(code: string): boolean {
  return (CORE_BATTERY_DETAIL_CODES as readonly string[]).includes(code);
}
