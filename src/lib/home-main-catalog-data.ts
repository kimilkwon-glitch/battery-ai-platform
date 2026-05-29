import { getHomeCardCopy } from "@/data/battery/batterySpecIndex";
import { getSearchHref } from "@/lib/battery-search";
import { batteryDetailHref } from "@/lib/home-upgrade-v2-data";
import { HUB_PHOTO, HUB_SHOP_ANCHORS, HUB_STORE_ANCHORS } from "@/lib/customer-hub-routes";
import { HUB_ORDER_CHECKLIST } from "@/lib/platform-hub-routes";

export type HomeCatalogBrandId = "rocket" | "solite";

export type HomeProductTypeFilter = "전체" | "AGM" | "일반형" | "DIN" | "EV 보조 12V";

export type HomeProductTypeTag = "AGM" | "일반형" | "DIN" | "EV 보조 12V";

export type HomeCatalogProduct = {
  code: string;
  typeTag: HomeProductTypeTag;
  summary: string;
};

export const HOME_MAIN_SEARCH_PLACEHOLDER =
  "K3 2018, 그랜저 IG AGM80L, 포터2 100R, AGM70L 검색";

export const HOME_MAIN_SEARCH_EXAMPLES = [
  { label: "포터2 90R/100R", href: getSearchHref("포터2 배터리") },
  { label: "그랜저 IG AGM70L/AGM80L", href: getSearchHref("그랜저 IG 가솔린") },
  { label: "스타리아 CMF80L", href: getSearchHref("스타리아 CMF80L") },
  { label: "EV6 EV 12V", href: batteryDetailHref("EV 12V") },
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

function product(code: string, typeTag: HomeProductTypeTag): HomeCatalogProduct {
  return {
    code,
    typeTag,
    summary: getHomeCardCopy(code) ?? `${code} 규격 — 차종·라벨과 함께 확인하세요.`,
  };
}

export const HOME_ROCKET_PRODUCTS: HomeCatalogProduct[] = [
  product("AGM60L", "AGM"),
  product("AGM70L", "AGM"),
  product("AGM80L", "AGM"),
  product("AGM95L", "AGM"),
  product("90R", "일반형"),
  product("100R", "일반형"),
  product("CMF80L", "일반형"),
  product("DIN74L", "DIN"),
  product("DIN62L", "DIN"),
];

export const HOME_SOLITE_PRODUCTS: HomeCatalogProduct[] = [
  product("AGM60L", "AGM"),
  product("AGM70L", "AGM"),
  product("AGM80L", "AGM"),
  product("AGM95L", "AGM"),
  product("57412", "DIN"),
  product("54459", "DIN"),
  product("CMF80L", "일반형"),
  product("EV 12V", "EV 보조 12V"),
];

export const HOME_CATALOG_BY_BRAND: Record<HomeCatalogBrandId, HomeCatalogProduct[]> = {
  rocket: HOME_ROCKET_PRODUCTS,
  solite: HOME_SOLITE_PRODUCTS,
};

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
