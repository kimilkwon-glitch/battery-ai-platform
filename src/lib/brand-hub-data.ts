import type { BatteryBrandKey } from "./battery-alias-map";
import { compareHref, guideHref, searchHref } from "./platform-data";

export type BrandProfile = {
  id: string;
  categoryLabel: string;
  description: string;
  featuredCodes: string[];
  heroImageCodes: string[];
  checkPoints: string[];
  linkedVehicles: { vehicleId: string; batteryHint: string }[];
  relatedComparisons: { label: string; href: string }[];
  relatedGuides: { label: string; href: string }[];
  imageBrandKey: BatteryBrandKey;
  cardThumbCode: string;
};

export const brandProfiles: Record<string, BrandProfile> = {
  rocket: {
    id: "rocket",
    categoryLabel: "AGM/DIN 대표 브랜드",
    description:
      "국산 차량과 SUV, 대형 세단에서 자주 확인되는 AGM/DIN 계열 배터리 브랜드입니다. ISG·대형 SUV·수입차 대체 규격 문의가 많습니다.",
    featuredCodes: ["AGM70L", "AGM80L", "AGM95L", "AGM105L"],
    heroImageCodes: ["AGM80L", "AGM95L"],
    checkPoints: ["AGM/DIN 구분", "단자 방향 L/R", "CCA·Ah 확인", "장착 공간·트레이"],
    linkedVehicles: [
      { vehicleId: "grandeur-ig", batteryHint: "AGM80L" },
      { vehicleId: "sorento-mq4", batteryHint: "AGM60L~AGM80L" },
      { vehicleId: "staria-us4", batteryHint: "AGM80R" },
      { vehicleId: "g80-rg3", batteryHint: "AGM95R" },
    ],
    relatedComparisons: [
      { label: "AGM70L vs AGM80L", href: compareHref("AGM70L", "AGM80L") },
      { label: "AGM80L vs DIN74L", href: compareHref("AGM80L", "DIN74L") },
      { label: "AGM80L vs AGM95L", href: compareHref("AGM80L", "AGM95L") },
    ],
    relatedGuides: [
      { label: "AGM vs DIN", href: guideHref("agm-vs-din") },
      { label: "L/R 단자 방향", href: guideHref("terminal-lr") },
      { label: "포터2 90R/100R", href: "/guides/porter2-year-battery-guide" },
      { label: "스타리아 AGM80R", href: "/guides/staria-agm80r-guide" },
    ],
    imageBrandKey: "rocket",
    cardThumbCode: "AGM80L",
  },
  solite: {
    id: "solite",
    categoryLabel: "CMF/DIN 계열",
    description:
      "CMF·DIN 계열 일반/상용차 배터리 브랜드입니다. 로케트와 표기·제품 코드가 다른 경우가 많아 규격 비교표 확인이 중요합니다.",
    featuredCodes: ["CMF80L", "CMF100R", "CMF57412", "CMF90R"],
    heroImageCodes: ["CMF80L", "CMF57412"],
    checkPoints: ["CMF/DIN 표기", "GB·CMF 코드 대응", "단자 L/R", "연식·트림"],
    linkedVehicles: [
      { vehicleId: "grandeur-ig", batteryHint: "CMF80L" },
      { vehicleId: "k5-dl3", batteryHint: "CMF57412" },
      { vehicleId: "porter2-new", batteryHint: "CMF100R" },
      { vehicleId: "seltos", batteryHint: "CMF60L" },
    ],
    relatedComparisons: [
      { label: "CMF57412 vs DIN74L", href: compareHref("CMF57412", "DIN74L") },
      { label: "CMF90R vs CMF100R", href: compareHref("CMF90R", "CMF100R") },
      { label: "GB100R vs CMF100R", href: compareHref("CMF100R", "CMF90R") },
    ],
    relatedGuides: [
      { label: "AGM vs DIN", href: guideHref("agm-vs-din") },
      { label: "DIN 규격 이해", href: guideHref("din-sizes") },
      { label: "포터2 90R/100R", href: "/guides/porter2-year-battery-guide" },
      { label: "L/R 단자 방향", href: guideHref("terminal-lr") },
    ],
    imageBrandKey: "solite",
    cardThumbCode: "CMF80L",
  },
  delco: {
    id: "delco",
    categoryLabel: "AGM 수입차",
    description: "수입차·프리미엄 세단에서 확인되는 AGM 브랜드입니다. BMS/IBS 등록 여부를 함께 확인하세요.",
    featuredCodes: ["AGM92Ah"],
    heroImageCodes: ["AGM92Ah"],
    checkPoints: ["BMS 등록", "순정 Ah/CCA", "단자 방향", "수입차 순정 코드"],
    linkedVehicles: [
      { vehicleId: "bmw-g30", batteryHint: "AGM92Ah" },
      { vehicleId: "grandeur-ig", batteryHint: "AGM80L" },
    ],
    relatedComparisons: [{ label: "AGM92Ah vs AGM80L", href: compareHref("AGM92Ah", "AGM80L") }],
    relatedGuides: [
      { label: "BMS 등록", href: guideHref("bms-register") },
      { label: "AGM vs DIN", href: guideHref("agm-vs-din") },
    ],
    imageBrandKey: "rocket",
    cardThumbCode: "AGM92Ah",
  },
  varta: {
    id: "varta",
    categoryLabel: "AGM/DIN 유럽차",
    description: "유럽 수입차·BMW 등에서 확인되는 AGM/DIN 브랜드입니다. 순정 규격과 등록 절차를 확인하세요.",
    featuredCodes: ["AGM92Ah"],
    heroImageCodes: ["AGM92Ah"],
    checkPoints: ["유럽 순정 코드", "BMS/IBS", "CCA", "등록 절차"],
    linkedVehicles: [
      { vehicleId: "bmw-g30", batteryHint: "AGM92Ah" },
      { vehicleId: "sorento-mq4", batteryHint: "AGM80L" },
    ],
    relatedComparisons: [{ label: "AGM92Ah vs AGM95L", href: compareHref("AGM92Ah", "AGM95L") }],
    relatedGuides: [
      { label: "BMS 등록", href: guideHref("bms-register") },
      { label: "AGM vs DIN", href: guideHref("agm-vs-din") },
    ],
    imageBrandKey: "rocket",
    cardThumbCode: "AGM92Ah",
  },
  atk: {
    id: "atk",
    categoryLabel: "일반/DIN",
    description: "일반 승용·DIN 계열 배터리 브랜드입니다. ISG 차량에서는 AGM 유지가 권장됩니다.",
    featuredCodes: ["DIN74L", "DIN60L"],
    heroImageCodes: ["DIN74L"],
    checkPoints: ["ISG 여부", "AGM vs DIN", "단자 방향", "호환 Ah"],
    linkedVehicles: [{ vehicleId: "k5-dl3", batteryHint: "DIN74L" }],
    relatedComparisons: [{ label: "DIN74L vs AGM80L", href: compareHref("DIN74L", "AGM80L") }],
    relatedGuides: [
      { label: "DIN 규격", href: guideHref("din-sizes") },
      { label: "AGM vs DIN", href: guideHref("agm-vs-din") },
    ],
    imageBrandKey: "rocket",
    cardThumbCode: "DIN74L",
  },
  infinit: {
    id: "infinit",
    categoryLabel: "EV 12V",
    description: "전기차 보조배터리(12V) 전문 브랜드입니다. EV 전용 규격과 충전·대기전류 특성을 확인하세요.",
    featuredCodes: ["EV 12V", "EV 12V AGM"],
    heroImageCodes: ["EV 12V"],
    checkPoints: ["EV 전용 규격", "SOH·대기전류", "일반 AGM 대체 주의", "충전 로그"],
    linkedVehicles: [
      { vehicleId: "ev6", batteryHint: "EV 12V" },
      { vehicleId: "ioniq5", batteryHint: "EV 12V" },
    ],
    relatedComparisons: [{ label: "EV 12V vs AGM70L", href: compareHref("EV 12V", "AGM70L") }],
    relatedGuides: [{ label: "EV 12V 가이드", href: guideHref("ev-12v") }],
    imageBrandKey: "rocket",
    cardThumbCode: "EV 12V",
  },
};

export type BrandSpecRow = {
  canonical: string;
  rocket: string;
  solite: string;
  note: string;
};

export const brandSpecMatchingTable: BrandSpecRow[] = [
  { canonical: "AGM80L", rocket: "AGM80L", solite: "CMF80L", note: "SUV·대형 세단" },
  { canonical: "DIN74L", rocket: "GB57820", solite: "CMF57412", note: "일반 DIN 대체" },
  { canonical: "100R", rocket: "GB100R", solite: "CMF100R", note: "포터2 2020년 이후" },
  { canonical: "90R", rocket: "GB90R", solite: "CMF90R", note: "상용차 기본 규격" },
  { canonical: "AGM60L", rocket: "AGM60L", solite: "CMF60L", note: "소형 SUV·ISG" },
];

export const brandSelectorMeta: Record<
  string,
  { categoryLabel: string; displayCodes: string[]; cardThumbCode: string; imageBrandKey: BatteryBrandKey }
> = {
  rocket: { categoryLabel: "AGM/DIN 대표", displayCodes: ["AGM60L", "AGM70L", "AGM80L", "AGM95L"], cardThumbCode: "AGM80L", imageBrandKey: "rocket" },
  solite: { categoryLabel: "CMF/DIN 계열", displayCodes: ["CMF80L", "CMF100R", "CMF57412"], cardThumbCode: "CMF80L", imageBrandKey: "solite" },
  delco: { categoryLabel: "AGM 수입차", displayCodes: ["AGM92Ah"], cardThumbCode: "AGM92Ah", imageBrandKey: "rocket" },
  varta: { categoryLabel: "AGM/DIN 유럽", displayCodes: ["AGM92Ah"], cardThumbCode: "AGM92Ah", imageBrandKey: "rocket" },
  atk: { categoryLabel: "일반/DIN", displayCodes: ["DIN74L"], cardThumbCode: "DIN74L", imageBrandKey: "rocket" },
  infinit: { categoryLabel: "EV 12V", displayCodes: ["EV 12V"], cardThumbCode: "EV 12V", imageBrandKey: "rocket" },
};

export const brandNextActions = [
  { title: "인기 규격 검색", description: "규격·호환 차종", href: searchHref("AGM80L") },
  { title: "브랜드 비교", description: "로케트 vs 쏠라이트", href: compareHref("AGM80L", "CMF80L") },
  { title: "차량별 규격 확인", description: "차종·연료별 안내", href: "/vehicles" },
  { title: "Q&A", description: "브랜드·규격 문의", href: "/community" },
] as const;

export const BRAND_HUB_LABEL = "BATTERY MANAGER · 브랜드 안내";

export function getBrandProfile(brandId: string): BrandProfile {
  const base = brandProfiles[brandId] ?? brandProfiles.rocket;
  const seen = new Set<string>();
  const linkedVehicles = base.linkedVehicles.filter((v) => {
    if (seen.has(v.vehicleId)) return false;
    seen.add(v.vehicleId);
    return true;
  });
  return { ...base, linkedVehicles };
}

export const BRAND_LINKED_VEHICLES_LABEL = "자주 함께 확인되는 차량·규격 예시";
export const BRAND_LINKED_HINT_PREFIX = "규격 예시";
