/** 고객 목적별 대표 허브 URL — 메뉴·CTA·검색 연결 단일 소스 */

export const HUB_SEARCH = "/search";
export const HUB_VEHICLES = "/vehicles";
export const HUB_BATTERY = "/guide/spec";
export const HUB_PHOTO = "/analysis/photo";
export const HUB_STORE = "/service-center";
export const HUB_SHOP = "/shop";
export const HUB_QA = "/community";

export const HUB_STORE_ANCHORS = {
  stores: `${HUB_STORE}#stores`,
  regions: `${HUB_STORE}#regions`,
  visit: `${HUB_STORE}#visit`,
  consultPrep: `${HUB_STORE}#consult-prep`,
  photo: `${HUB_STORE}#photo-guide`,
  contact: `${HUB_STORE}#contact`,
  deokcheon: `${HUB_STORE}#store-deokcheon`,
  hakjang: `${HUB_STORE}#store-hakjang`,
} as const;

export const HUB_SHOP_ANCHORS = {
  orderCheck: `${HUB_SHOP}#order-check`,
  products: `${HUB_SHOP}#shop-products`,
  delivery: `${HUB_SHOP}#delivery-notes`,
  photo: `${HUB_SHOP}#photo-send`,
  terminal: `${HUB_SHOP}#terminal-lr`,
  returns: `${HUB_SHOP}#return-policy`,
  contact: `${HUB_SHOP}#shop-contact`,
} as const;

/** 예전 더보기 메뉴 라벨 → 대표 허브(앵커) */
export const LEGACY_MENU_HREF: Record<string, string> = {
  "직영점 안내": HUB_STORE_ANCHORS.stores,
  "출장/내방 가능 지역": HUB_STORE_ANCHORS.regions,
  "교체 상담": HUB_STORE_ANCHORS.consultPrep,
  "부산 배터리 교체 가능 지역": HUB_STORE_ANCHORS.regions,
  쇼핑: HUB_SHOP,
  "배터리 상품 확인": HUB_SHOP_ANCHORS.products,
  "주문 전 규격 확인": HUB_SHOP_ANCHORS.orderCheck,
  "택배 주문 전 확인": HUB_SHOP_ANCHORS.delivery,
};
