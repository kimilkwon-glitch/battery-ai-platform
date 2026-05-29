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

export type HomeCatalogProduct = {
  code: string;
  imageCode: string;
  typeTag: HomeProductTypeTag;
  summary: string;
};

export const HOME_MAIN_SEARCH_PLACEHOLDER = "차량명·연식·규격 검색";

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

function product(
  code: string,
  typeTag: HomeProductTypeTag,
  opts?: { imageCode?: string; summary?: string },
): HomeCatalogProduct {
  const imageCode = opts?.imageCode ?? code;
  return {
    code,
    imageCode,
    typeTag,
    summary:
      opts?.summary ??
      getHomeCardCopy(code) ??
      `${code} 규격 — 차종·라벨과 함께 확인하세요.`,
  };
}

/** 로케트 대표 라인업 (이미지 있는 항목만 메인 노출) */
export const rocketLineup: HomeCatalogProduct[] = [
  product("AGM60L", "AGM"),
  product("AGM70L", "AGM"),
  product("AGM80L", "AGM"),
  product("AGM95L", "AGM"),
  product("CMF80L", "일반형"),
  product("DIN74L", "DIN"),
  product("DIN62L", "DIN"),
  product("90R", "일반형"),
  product("100R", "일반형"),
].filter((p) => hasStrictBrandProductImage(p.imageCode, "rocket"));

/** 쏠라이트 대표 라인업 — 로케트 이미지 fallback 없음, 없으면 중립 placeholder */
export const soliteLineup: HomeCatalogProduct[] = [
  product("CMF80L", "일반형", {
    imageCode: "CMF80L",
    summary: "쏠라이트 CMF80L — 일반 충전계통 중대형 L타입 규격입니다.",
  }),
  product("57412", "DIN", {
    imageCode: "57412",
    summary: "쏠라이트 CMF57412 — DIN H6(74Ah) 계열 표기입니다.",
  }),
  product("54459", "DIN", {
    imageCode: "54459",
    summary: "쏠라이트 CMF54459 — 소형 DIN 계열 표기입니다.",
  }),
  product("eAGM60", "EV 보조 12V", {
    imageCode: "AGM60L",
    summary: "쏠라이트 EV 보조 12V(eAGM60) — 차종·라벨로 최종 확인하세요.",
  }),
  product("EV 12V", "EV 보조 12V", {
    imageCode: "EV 12V",
    summary: "전기차 보조 12V — 고전압 메인 배터리와 별도입니다.",
  }),
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
