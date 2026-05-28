import { getSearchHref } from "@/lib/battery-search";
import { buildVehicleDetailHref } from "@/lib/battery-cta";
import { getBatteryHref } from "@/lib/content";
import { HUB_PHOTO, HUB_SHOP, HUB_SHOP_ANCHORS, HUB_STORE, HUB_STORE_ANCHORS } from "@/lib/customer-hub-routes";
import { CORE_BATTERY_DETAIL_CODES } from "@/lib/battery-detail/core-battery-codes";

/** 메인 hero — 검색 유형·예시 */
export const HOME_HERO = {
  headline: "배터리 주문 전, 차종과 규격부터 맞춰보세요.",
  subline: "차량명이나 규격명을 입력하면 맞는 후보를 먼저 보여드립니다.",
  tagline: "규격이 헷갈릴 때는 사진으로 한 번 더 확인하는 것이 안전합니다.",
} as const;

export const HOME_SEARCH_TYPE_CHIPS = [
  { label: "차량명 검색", desc: "연식·연료별 추천", href: "/vehicles", tone: "primary" as const },
  { label: "배터리 규격 검색", desc: "AGM · DIN · CMF", href: getSearchHref("AGM70L"), tone: "default" as const },
  { label: "증상별 안내", desc: "방전·시동 지연", href: "/symptoms", tone: "default" as const },
  { label: "사진 확인", desc: "라벨·단자 보조 확인", href: HUB_PHOTO, tone: "secondary" as const },
] as const;

export const HOME_HERO_EXAMPLES = [
  "포터2 배터리",
  "그랜저 IG 가솔린",
  "AGM70L",
  "스포티지 NQ5 하이브리드",
  "레이 블랙박스 방전",
  "AGM95L",
] as const;

/** 많이 찾는 규격 랭킹 — 핵심 8종 */
export const HOME_POPULAR_BATTERIES = [
  {
    code: "AGM60L",
    summary: "소형·준중형 ISG 차량에서 자주 만나는 작은 AGM 규격입니다.",
    typeLabel: "AGM",
    terminal: "L타입",
    useCase: "HEV·ISG 보조 12V",
  },
  {
    code: "AGM70L",
    summary: "중형·준대형 승용에서 많이 쓰는 AGM 규격입니다.",
    typeLabel: "AGM",
    terminal: "L타입",
    useCase: "ISG·중형 승용",
  },
  {
    code: "AGM80L",
    summary: "스탑앤고·스마트충전 차량에서 자주 보이는 중대형 AGM 규격입니다.",
    typeLabel: "AGM",
    terminal: "L타입",
    useCase: "SUV·디젤 메인",
  },
  {
    code: "DIN74L",
    summary: "DIN 계열·봉고3 등에서 많이 찾는 규격입니다.",
    typeLabel: "DIN",
    terminal: "L타입",
    useCase: "유럽형·상용 DIN",
  },
  {
    code: "100R",
    summary: "상용차에서 많이 쓰이는 R타입 대용량 일반 배터리입니다.",
    typeLabel: "R타입(JIS)",
    terminal: "R타입",
    useCase: "상용·포터2 이후",
  },
  {
    code: "CMF80L",
    summary: "일반 충전계통 차량에 쓰이는 80Ah급 L타입 배터리입니다.",
    typeLabel: "CMF",
    terminal: "L타입",
    useCase: "중대형 CMF",
  },
  {
    code: "AGM95L",
    summary: "대형 AGM이며 100R과 단순 대체가 어렵습니다.",
    typeLabel: "AGM",
    terminal: "L타입",
    useCase: "대형 승용·SUV",
  },
  {
    code: "EV 12V",
    summary: "전기차 보조 12V — 고전압 메인 배터리와 다릅니다.",
    typeLabel: "EV 보조 12V",
    terminal: "확인 필요",
    useCase: "전기차 보조 12V",
  },
] as const;

export type HomePopularBattery = (typeof HOME_POPULAR_BATTERIES)[number];

/** 인기 차량 빠른 검색 */
export const HOME_POPULAR_VEHICLES = [
  {
    title: "포터2",
    hint: "연식에 따라 90R·100R이 갈릴 수 있어 사진 확인이 도움이 됩니다.",
    spec: "90R · 100R",
    href: getSearchHref("포터2 배터리"),
    slug: "porter2-new",
  },
  {
    title: "그랜저 IG",
    hint: "가솔린 AGM70L, 디젤 AGM80L처럼 연료별로 달라집니다.",
    spec: "AGM70L · AGM80L",
    href: buildVehicleDetailHref("grandeur-ig"),
    slug: "grandeur-ig",
  },
  {
    title: "쏘렌토 MQ4",
    hint: "연료·트림에 따라 추천 규격이 달라집니다.",
    spec: "AGM60L · AGM80L",
    href: buildVehicleDetailHref("sorento-mq4"),
    slug: "sorento-mq4",
  },
  {
    title: "스포티지 NQ5",
    hint: "하이브리드는 보조 12V AGM60L부터 보세요.",
    spec: "AGM60L",
    href: buildVehicleDetailHref("sportage-nq5", "하이브리드"),
    slug: "sportage-nq5",
  },
  {
    title: "K8",
    hint: "하이브리드 보조 12V는 AGM60L이 대표입니다.",
    spec: "AGM60L",
    href: buildVehicleDetailHref("k8-gl3", "하이브리드"),
    slug: "k8-gl3",
  },
  {
    title: "스타리아",
    hint: "디젤 CMF80L — 연식까지 같이 보는 것이 안전합니다.",
    spec: "CMF80L",
    href: getSearchHref("스타리아 CMF80L"),
    slug: "staria-us4",
  },
  {
    title: "EV6",
    hint: "전기차 보조 12V는 EV 12V 규격입니다.",
    spec: "EV 12V",
    href: getSearchHref("EV6 보조배터리"),
    slug: "ev6",
  },
  {
    title: "아이오닉5",
    hint: "보조 12V는 고전압 메인과 별도입니다.",
    spec: "EV 12V",
    href: getSearchHref("아이오닉5 배터리"),
    slug: "ioniq5-ne",
  },
  {
    title: "봉고3",
    hint: "상용 DIN74L — 연식·트림을 함께 보세요.",
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
  { label: "AGM95L 제원", href: getBatteryHref("AGM95L"), tag: "AGM" },
  { label: "EV6 EV 12V", href: getBatteryHref("EV 12V"), tag: "EV" },
  { label: "레이 블랙박스 방전", href: getSearchHref("레이 블랙박스 방전"), tag: "증상" },
] as const;

export const HOME_DELIVERY_STEPS = [
  {
    title: "규격을 알고 주문",
    desc: "AGM70L처럼 규격을 알고 있다면 상세에서 바로 볼 수 있습니다.",
    href: getBatteryHref("AGM70L"),
  },
  {
    title: "차량 기준으로 보기",
    desc: "규격이 애매하면 차량명으로 연식·연료부터 보세요.",
    href: "/vehicles",
  },
  {
    title: "사진 확인 후 주문",
    desc: "라벨·단자 사진으로 오주문을 줄일 수 있습니다.",
    href: HUB_PHOTO,
  },
] as const;

export const HOME_STORE_CARDS = [
  {
    id: "deokcheon",
    name: "덕천점",
    region: "북구 중심",
    areas: "덕천·구포·만덕·화명·대저·동래·금정",
    scenarios: "북구·동래·금정권 내방 교체",
    href: HUB_STORE_ANCHORS.deokcheon,
  },
  {
    id: "hakjang",
    name: "학장점",
    region: "사상구 중심",
    areas: "학장·감전·괘법·모라·주례·엄궁·사하·강서",
    scenarios: "사상·사하·강서권 업무·화물 상담",
    href: HUB_STORE_ANCHORS.hakjang,
  },
  {
    id: "outbound",
    name: "출장 교체",
    region: "부산 권역",
    areas: "직영점 기준 출장·내방 일정 안내",
    scenarios: "시동 불가·주차장 방전",
    href: HUB_STORE_ANCHORS.visit,
  },
  {
    id: "photo-guide",
    name: "사진 확인 후 안내",
    region: "오주문 방지",
    areas: "라벨·단자·연식을 함께 보면 안전합니다",
    scenarios: "규격이 헷갈릴 때 먼저 권장",
    href: HUB_PHOTO,
  },
] as const;

export function batteryDetailHref(code: string): string {
  return getBatteryHref(code);
}

export function isCoreHomeBattery(code: string): boolean {
  return (CORE_BATTERY_DETAIL_CODES as readonly string[]).includes(code);
}
