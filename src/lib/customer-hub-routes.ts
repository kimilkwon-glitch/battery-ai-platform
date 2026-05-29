/** 고객 목적별 대표 URL — 메뉴·CTA·검색 연결 단일 소스 */

export const HUB_SEARCH = "/search";
export const HUB_VEHICLES = "/vehicles";
export const HUB_BATTERY = "/guide/spec";
/** 사진 확인 안내 (가이드) */
export const HUB_PHOTO = "/photo-check";
/** 매장·출장·택배 안내 */
export const HUB_STORE = "/service";
/** 직영점 상세·앵커 (매장 지도·연락) */
export const HUB_STORE_DETAIL = "/service-center";
export const HUB_SHOP = "/shop";
export const HUB_QA = "/community";
/** 브랜드 안내 (로케트·쏠라이트 선택은 페이지 내부) */
export const HUB_BRANDS = "/brands";
/** Q&A·콘텐츠·가이드 허브 */
export const HUB_GUIDE = "/guides";
export const HUB_REVIEWS = "/reviews";
export const HUB_LOGIN = "/login";
export const HUB_SIGNUP = "/signup";

export const HUB_STORE_ANCHORS = {
  stores: `${HUB_STORE_DETAIL}#stores`,
  regions: `${HUB_STORE_DETAIL}#regions`,
  visit: `${HUB_STORE_DETAIL}#visit`,
  consultPrep: `${HUB_STORE_DETAIL}#consult-prep`,
  photo: `${HUB_STORE_DETAIL}#photo-guide`,
  contact: `${HUB_STORE_DETAIL}#contact`,
  deokcheon: `${HUB_STORE_DETAIL}#store-deokcheon`,
  hakjang: `${HUB_STORE_DETAIL}#store-hakjang`,
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

/** 예전 더보기 메뉴 라벨 → 대표 URL(앵커) */
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
