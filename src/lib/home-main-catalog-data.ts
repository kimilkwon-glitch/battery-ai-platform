import { getHomeCardCopy } from "@/data/battery/batterySpecIndex";
import { hasStrictBrandProductImage } from "@/lib/battery-alias-map";
import { getSearchHref } from "@/lib/battery-search";
import { batteryDetailHref } from "@/lib/home-upgrade-v2-data";
import { HUB_PHOTO, HUB_SHOP_ANCHORS, HUB_STORE_ANCHORS } from "@/lib/customer-hub-routes";
import { HUB_ORDER_CHECKLIST } from "@/lib/platform-hub-routes";
import type { BatteryBrandKey } from "@/lib/battery-alias-map";

export type HomeCatalogBrandId = "rocket" | "solite";

export type HomeProductTypeFilter = "전체" | "AGM" | "일반형" | "DIN" | "EV 보조 12V";

export type HomeProductTypeTag = "AGM" | "일반형" | "DIN" | "EV 보조 12V";

/** 메인 라인업 카드 — 표시명·이미지·검색 연결 분리 */
export type HomeCatalogProduct = {
  id: string;
  displayName: string;
  /** 검색·상세·CTA — 기존 alias/canonical 경로 */
  searchCode: string;
  /** strict solite/rocket 이미지 lookup */
  imageKey: string;
  typeTag: HomeProductTypeTag;
  summary: string;
  specAliases?: readonly string[];
};

/** 메인 검색창 — placeholder 없음 (안내는 아래 예시 영역) */
export const HOME_MAIN_SEARCH_PLACEHOLDER = "";

/** 메인 — 차종명 중심 간단 예시 (검색 흐름은 기존 getSearchHref) */
export const HOME_MAIN_SEARCH_EXAMPLES = [
  { label: "쏘렌토MQ4", href: getSearchHref("쏘렌토 MQ4") },
  { label: "쏘렌토", href: getSearchHref("쏘렌토") },
  { label: "포터2", href: getSearchHref("포터2") },
  { label: "그랜저IG", href: getSearchHref("그랜저 IG") },
  { label: "스타리아", href: getSearchHref("스타리아") },
  { label: "K3", href: getSearchHref("K3") },
] as const;

export const HOME_MAIN_AUX_LINKS = [
  { label: "사진으로 확인하기", href: HUB_PHOTO },
  { label: "주문 전 체크리스트", href: HUB_ORDER_CHECKLIST },
  { label: "EV/하이브리드 보조배터리 안내", href: "/guides/knowledge/bk-ev-aux-12v" },
] as const;

export const HOME_CATALOG_TYPE_FILTERS: HomeProductTypeFilter[] = [
  "전체",
  "AGM",
  "일반형",
  "DIN",
  "EV 보조 12V",
];

function catalogProduct(
  id: string,
  displayName: string,
  searchCode: string,
  typeTag: HomeProductTypeTag,
  opts?: {
    imageKey?: string;
    summary?: string;
    specAliases?: readonly string[];
  },
): HomeCatalogProduct {
  const imageKey = opts?.imageKey ?? displayName;
  return {
    id,
    displayName,
    searchCode,
    imageKey,
    typeTag,
    specAliases: opts?.specAliases,
    summary:
      opts?.summary ??
      getHomeCardCopy(searchCode) ??
      `${displayName} 규격 — 차종·라벨과 함께 확인하세요.`,
  };
}

/** 로케트 대표 라인업 (strict 브랜드 이미지 있는 항목만) */
export const rocketLineup: HomeCatalogProduct[] = [
  catalogProduct("rocket-agm60l", "AGM60L", "AGM60L", "AGM"),
  catalogProduct("rocket-agm70l", "AGM70L", "AGM70L", "AGM"),
  catalogProduct("rocket-agm80l", "AGM80L", "AGM80L", "AGM"),
  catalogProduct("rocket-agm95l", "AGM95L", "AGM95L", "AGM"),
  catalogProduct("rocket-cmf80l", "CMF80L", "CMF80L", "일반형"),
  catalogProduct("rocket-din74l", "DIN74L", "DIN74L", "DIN"),
  catalogProduct("rocket-din62l", "DIN62L", "DIN62L", "DIN"),
  catalogProduct("rocket-90r", "90R", "90R", "일반형"),
  catalogProduct("rocket-100r", "100R", "100R", "일반형"),
].filter((p) => hasStrictBrandProductImage(p.imageKey, "rocket"));

/** 쏠라이트 — 이미지 asset 우선 순서 (public/assets/batteries CMF* 기준) */
const SOLITE_LINEUP_WITH_IMAGE: HomeCatalogProduct[] = [
  catalogProduct("solite-cmf57412", "CMF57412", "CMF57412", "DIN", {
    imageKey: "CMF57412",
    specAliases: ["57412", "CMF57412", "DIN74L", "DIN78L", "H6"],
    summary: "쏠라이트 CMF57412 — DIN H6 / DIN74L 계열 표기입니다.",
  }),
  catalogProduct("solite-cmf54459", "CMF54459", "CMF54459", "DIN", {
    imageKey: "CMF54459",
    specAliases: ["54459", "CMF54459", "DIN50L", "DIN44L"],
    summary: "쏠라이트 CMF54459 — 소형 DIN 계열에서 함께 확인되는 표기입니다.",
  }),
  catalogProduct("solite-cmf80l", "CMF80L", "CMF80L", "일반형", {
    imageKey: "CMF80L",
    specAliases: ["CMF80L", "80L"],
    summary: "쏠라이트 CMF80L — 일반 충전계통 중대형 L타입 규격입니다.",
  }),
  catalogProduct("solite-cmf56219", "CMF56219", "CMF56219", "DIN", {
    imageKey: "CMF56219",
    specAliases: ["56219", "CMF56219", "DIN62L", "DIN60L"],
    summary: "쏠라이트 CMF56219 — DIN62L / DIN60L 계열 표기입니다.",
  }),
  catalogProduct("solite-cmf60l", "CMF60L", "CMF60L", "일반형", {
    imageKey: "CMF60L",
    specAliases: ["CMF60L", "60L"],
    summary: "쏠라이트 CMF60L — 일반형 L타입 규격입니다.",
  }),
  catalogProduct("solite-cmf40l", "CMF40L", "CMF40L", "일반형", {
    imageKey: "CMF40L",
    specAliases: ["CMF40L", "40L"],
    summary: "쏠라이트 CMF40L — 소형 일반형 L타입 규격입니다.",
  }),
  catalogProduct("solite-cmf90l", "CMF90L", "CMF90L", "일반형", {
    imageKey: "CMF90L",
    specAliases: ["CMF90L", "90L"],
    summary: "쏠라이트 CMF90L — 일반형 L타입 규격입니다.",
  }),
  catalogProduct("solite-cmf90r", "CMF90R", "CMF90R", "일반형", {
    imageKey: "CMF90R",
    specAliases: ["CMF90R", "90R"],
    summary: "쏠라이트 CMF90R — 일반형 R타입 규격입니다.",
  }),
  catalogProduct("solite-cmf100l", "CMF100L", "CMF100L", "일반형", {
    imageKey: "CMF100L",
    specAliases: ["CMF100L", "100L"],
    summary: "쏠라이트 CMF100L — 일반형 L타입 규격입니다.",
  }),
  catalogProduct("solite-cmf100r", "CMF100R", "CMF100R", "일반형", {
    imageKey: "CMF100R",
    specAliases: ["CMF100R", "100R"],
    summary: "쏠라이트 CMF100R — 일반형 R타입 규격입니다.",
  }),
  catalogProduct("solite-cmf80r", "CMF80R", "CMF80R", "일반형", {
    imageKey: "CMF80R",
    specAliases: ["CMF80R", "80R"],
    summary: "쏠라이트 CMF80R — 일반형 R타입 규격입니다.",
  }),
];

/** 쏠라이트 전용 이미지 없음 — placeholder만 (로케트 fallback 금지) */
const SOLITE_LINEUP_PLACEHOLDER: HomeCatalogProduct[] = [
  catalogProduct("solite-eagm60", "eAGM60", "eAGM60", "EV 보조 12V", {
    imageKey: "eAGM60",
    specAliases: ["eAGM60", "AGM60L", "AGM LN2"],
    summary: "쏠라이트 EV 보조 12V(eAGM60) — 차종·라벨로 최종 확인하세요.",
  }),
  catalogProduct("solite-ev12v", "EV 12V", "EV 12V", "EV 보조 12V", {
    imageKey: "EV 12V",
    specAliases: ["EV 12V", "EV12V"],
    summary: "전기차 보조 12V — 고전압 메인 배터리와 별도입니다.",
  }),
];

export const soliteLineup: HomeCatalogProduct[] = [
  ...SOLITE_LINEUP_WITH_IMAGE.filter((p) =>
    hasStrictBrandProductImage(p.imageKey, "solite"),
  ),
  ...SOLITE_LINEUP_PLACEHOLDER,
];

export const HOME_CATALOG_BY_BRAND: Record<HomeCatalogBrandId, HomeCatalogProduct[]> = {
  rocket: rocketLineup,
  solite: soliteLineup,
};

export const HOME_CATALOG_BRAND_KEY: Record<HomeCatalogBrandId, BatteryBrandKey> = {
  rocket: "rocket",
  solite: "solite",
};

export function getCurrentLineup(brand: HomeCatalogBrandId): HomeCatalogProduct[] {
  return HOME_CATALOG_BY_BRAND[brand];
}

export function filterCatalogProducts(
  products: HomeCatalogProduct[],
  typeFilter: HomeProductTypeFilter,
): HomeCatalogProduct[] {
  if (typeFilter === "전체") return products;
  return products.filter((p) => p.typeTag === typeFilter);
}

export const HOME_SPEC_CARD_ACTIONS = {
  fitCheck: (code: string) => getSearchHref(code),
  photo: HUB_PHOTO,
  outbound: HUB_STORE_ANCHORS.regions,
  store: HUB_STORE_ANCHORS.visit,
  delivery: HUB_SHOP_ANCHORS.delivery,
  detail: (code: string) => batteryDetailHref(code),
} as const;

export const HOME_SPEC_CARD_CTA_ORDER = [
  { key: "store", label: "매장방문", href: HOME_SPEC_CARD_ACTIONS.store },
  { key: "outbound", label: "출장교체", href: HOME_SPEC_CARD_ACTIONS.outbound },
  { key: "delivery", label: "택배주문", href: HOME_SPEC_CARD_ACTIONS.delivery },
  { key: "photo", label: "사진확인", href: HOME_SPEC_CARD_ACTIONS.photo },
] as const;
