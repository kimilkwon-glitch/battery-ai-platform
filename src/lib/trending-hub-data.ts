import {
  aiHref,
  compareHref,
  diagnosisHref,
  guideHref,
  searchHref,
  serviceHref,
  vehicleHref,
} from "./platform-data";

export type TrendBadge =
  | "차량"
  | "규격"
  | "증상"
  | "가이드"
  | "오주문"
  | "상용차"
  | "관리"
  | "확인 권장";

export type TrendHeroIssue = {
  id: string;
  badge: "차량" | "규격" | "증상";
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
};

export type TrendTopicItem = {
  label: string;
  description: string;
  badge: TrendBadge;
  href: string;
  featured?: boolean;
};

export type TrendVehicleItem = {
  vehicleId: string;
  label: string;
  reason: string;
  batteryHint: string;
  href: string;
};

export type TrendBatteryItem = {
  code: string;
  label: string;
  reason: string;
  relatedVehicles: string;
  href: string;
};

export type TrendPhotoReviewItem = {
  vehicleId: string;
  label: string;
  reason: string;
  href: string;
};

export type TrendSearchPattern = {
  label: string;
  badge: TrendBadge;
  href: string;
};

export type TrendSeasonalItem = {
  title: string;
  description: string;
  href: string;
  guideLabel: string;
};

export const trendingHeroIssues: TrendHeroIssue[] = [
  {
    id: "sorento-mq4",
    badge: "차량",
    title: "쏘렌토 MQ4",
    description: "하이브리드 AGM60L 규격 확인이 많습니다.",
    href: vehicleHref("sorento-mq4"),
    buttonLabel: "차량 보기",
  },
  {
    id: "agm80l",
    badge: "규격",
    title: "AGM80L",
    description: "ISG 차량 대체 규격 문의가 많습니다.",
    href: searchHref("AGM80L"),
    buttonLabel: "규격 보기",
  },
  {
    id: "ev12v",
    badge: "증상",
    title: "EV 12V 방전",
    description: "전기차 보조배터리 문의가 늘었습니다.",
    href: guideHref("ev-12v"),
    buttonLabel: "가이드 보기",
  },
];

export const trendingTodaySummary = [
  "AGM80L 문의가 많이 확인됩니다",
  "포터2 100R 확인 문의가 이어집니다",
  "겨울철 CCA 점검 관련 문의가 있습니다",
] as const;

export const trendingPopularSpecs = [
  { code: "AGM80L", href: searchHref("AGM80L") },
  { code: "AGM95L", href: searchHref("AGM95L") },
  { code: "AGM60L", href: searchHref("AGM60L") },
  { code: "100R", href: searchHref("100R") },
  { code: "AGM70L", href: searchHref("AGM70L") },
] as const;

export const trendingQuickLinks = [
  { label: "차량 검색", href: "/vehicles" },
  { label: "배터리 비교", href: compareHref("AGM70L", "AGM80L") },
  { label: "사진으로 규격 확인", href: "/analysis/photo" },
  { label: "증상 확인", href: diagnosisHref() },
] as const;

export const trendingFeaturedTopics: TrendTopicItem[] = [
  {
    label: "쏘렌토 MQ4",
    description: "하이브리드 AGM60L 관련 문의",
    badge: "차량",
    href: vehicleHref("sorento-mq4"),
    featured: true,
  },
  {
    label: "AGM80L",
    description: "ISG 차량 대체 규격 문의",
    badge: "규격",
    href: searchHref("AGM80L"),
    featured: true,
  },
  {
    label: "EV6 12V 방전",
    description: "전기차 보조배터리 이슈",
    badge: "증상",
    href: diagnosisHref("ev12v-discharge"),
    featured: true,
  },
  {
    label: "겨울철 CCA",
    description: "저온 시동·CCA 점검 문의",
    badge: "관리",
    href: guideHref("winter-cca"),
  },
  {
    label: "AGM70L vs AGM80L",
    description: "용량업·비교 문의",
    badge: "규격",
    href: compareHref("AGM70L", "AGM80L"),
  },
  {
    label: "BMS 등록",
    description: "교체 후 등록·학습 문의",
    badge: "오주문",
    href: guideHref("bms-register"),
  },
  {
    label: "그랜저 IG",
    description: "연료별 AGM·DIN 확인",
    badge: "차량",
    href: vehicleHref("grandeur-ig"),
  },
  {
    label: "블랙박스 상시전원",
    description: "장기주차 방전 문의",
    badge: "증상",
    href: diagnosisHref("blackbox-drain"),
  },
];

export const trendingVehicleHighlights: TrendVehicleItem[] = [
  {
    vehicleId: "sorento-mq4",
    label: "쏘렌토 MQ4",
    reason: "하이브리드 AGM60L 문의 증가",
    batteryHint: "AGM60L · AGM80L",
    href: vehicleHref("sorento-mq4"),
  },
  {
    vehicleId: "grandeur-ig",
    label: "그랜저 IG",
    reason: "AGM80L / LPG DIN 규격 확인",
    batteryHint: "AGM80L · DIN74L",
    href: vehicleHref("grandeur-ig"),
  },
  {
    vehicleId: "porter2-new",
    label: "포터2",
    reason: "2020년 전후 90R/100R 확인",
    batteryHint: "90R · 100R",
    href: vehicleHref("porter2-new"),
  },
  {
    vehicleId: "staria-us4",
    label: "스타리아",
    reason: "AGM80R 단자 방향 확인",
    batteryHint: "AGM80R",
    href: vehicleHref("staria-us4"),
  },
];

export const trendingBatteryHighlights: TrendBatteryItem[] = [
  {
    code: "AGM80L",
    label: "AGM80L",
    reason: "SUV·대형 세단에서 자주 확인되는 규격",
    relatedVehicles: "그랜저 IG · 싼타페 · K5",
    href: searchHref("AGM80L"),
  },
  {
    code: "100R",
    label: "100R",
    reason: "포터2 2020년 이후 상용차 문의",
    relatedVehicles: "포터2 · 봉고3",
    href: searchHref("100R"),
  },
  {
    code: "DIN74L",
    label: "DIN74L",
    reason: "일반 DIN 대체 규격 문의",
    relatedVehicles: "K5 · 그랜저 (일반)",
    href: searchHref("DIN74L"),
  },
  {
    code: "AGM60L",
    label: "AGM60L",
    reason: "하이브리드·소형 SUV 확인",
    relatedVehicles: "셀토스 · 쏘렌토 HEV",
    href: searchHref("AGM60L"),
  },
];

export const trendingPhotoReviewItems: TrendPhotoReviewItem[] = [
  {
    vehicleId: "bmw-g30",
    label: "BMW 520i",
    reason: "BMS 등록과 AGM 규격 확인 필요",
    href: vehicleHref("bmw-g30"),
  },
  {
    vehicleId: "k5-dl3",
    label: "K5 DL3",
    reason: "연료·트림별 규격 차이 확인",
    href: vehicleHref("k5-dl3"),
  },
  {
    vehicleId: "g90",
    label: "G90",
    reason: "연식별 AGM105L/R 구분 필요",
    href: searchHref("G90 AGM105"),
  },
  {
    vehicleId: "staria-us4",
    label: "스타리아",
    reason: "AGM80R 단자 방향 확인",
    href: vehicleHref("staria-us4"),
  },
];

export const trendingSearchPatterns: TrendSearchPattern[] = [
  { label: "AGM80L 대체 규격", badge: "규격", href: aiHref("AGM80L 대신 DIN74L 가능?") },
  { label: "EV 12V 방전", badge: "증상", href: diagnosisHref("ev12v-discharge") },
  { label: "포터2 100R", badge: "상용차", href: aiHref("포터2 2020년식 100R") },
  { label: "겨울철 CCA", badge: "관리", href: guideHref("winter-cca") },
  { label: "블랙박스 방전", badge: "증상", href: diagnosisHref("blackbox-drain") },
];

export const trendingSeasonalIssues: TrendSeasonalItem[] = [
  {
    title: "EV 12V 방전",
    description: "전기차 보조배터리 SOH·대기전류 확인",
    href: diagnosisHref("ev12v-discharge"),
    guideLabel: "EV 12V 가이드",
  },
  {
    title: "겨울철 CCA",
    description: "저온 시동 지연·CCA 점검",
    href: guideHref("winter-cca"),
    guideLabel: "CCA 가이드",
  },
  {
    title: "블랙박스 방전",
    description: "상시전원·컷오프 전압 확인",
    href: diagnosisHref("blackbox-drain"),
    guideLabel: "컷오프 가이드",
  },
  {
    title: "장기주차 방전",
    description: "OCV 하락·방전 예방 점검",
    href: guideHref("cca-ah"),
    guideLabel: "관리 가이드",
  },
];

export const trendingNextActions = [
  { title: "통합검색", description: "차량·규격·증상 검색", href: "/search" },
  { title: "배터리 비교", description: "AGM70L vs AGM80L", href: compareHref("AGM70L", "AGM80L") },
  { title: "사진으로 확인", description: "라벨·단자 확인", href: "/analysis/photo" },
  { title: "증상 확인", description: "방전·시동 지연", href: diagnosisHref() },
  { title: "작업 가능점 찾기", description: "교체·BMS", href: serviceHref() },
  { title: "Q&A", description: "실제 문의 사례", href: "/community" },
] as const;

export const BADGE_TONE: Record<TrendBadge, string> = {
  차량: "bg-blue-50 text-blue-700 ring-blue-100",
  규격: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  증상: "bg-violet-50 text-violet-700 ring-violet-100",
  가이드: "bg-cyan-50 text-cyan-800 ring-cyan-100",
  오주문: "bg-amber-50 text-amber-800 ring-amber-100",
  상용차: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  관리: "bg-sky-50 text-sky-700 ring-sky-100",
  "확인 권장": "bg-orange-50 text-orange-800 ring-orange-100",
};

export const BRAND_TRENDING_LABEL = "BATTERY MANAGER · 트렌드·주의";
