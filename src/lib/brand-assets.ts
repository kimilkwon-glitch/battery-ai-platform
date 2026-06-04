/** 브랜드·메인 배너·혜택 배너 정적 자산 경로 (public/assets) */

/** 원본(1024², 투명 여백 큼): public/assets/brand/battery-manager-logo.png */
/** 헤더용 trim(615×627): public/assets/brand/battery-manager-logo-tight.png */
export const BRAND_LOGO_ASSET_REV = "20260530-logo-tight-v1";
export const BRAND_LOGO_SRC = `/assets/brand/battery-manager-logo-tight.png?v=${BRAND_LOGO_ASSET_REV}`;

/** trim 후 시각 영역 비율 — wrapper는 정사각형 쓰지 않음 */
export const BRAND_LOGO_VISUAL_WIDTH = 615;
export const BRAND_LOGO_VISUAL_HEIGHT = 627;

export const BRAND_LOGO_ALT = "부산배터리매니저 로고";

/** 배너·혜택 교체 시 rev만 올려 CDN/브라우저 캐시 무효화 */
export const MAIN_BANNER_ASSET_REV = "20260530-hero-triple-v1";
export const BENEFITS_ASSET_REV = "20260604-benefit-images-v1";

const banner = (name: string) => `/assets/banners/${name}?v=${MAIN_BANNER_ASSET_REV}`;
const benefit = (name: string) => `/assets/benefits/${name}?v=${BENEFITS_ASSET_REV}`;

/** 1) 택배 주문 */
export const MAIN_HERO_DELIVERY_ORDER_DESKTOP_SRC = banner("main-hero-delivery-order-desktop.png");
export const MAIN_HERO_DELIVERY_ORDER_MOBILE_SRC = banner("main-hero-delivery-order-mobile.png");

/** 2) 매장 방문 · 출장 교체 */
export const MAIN_HERO_VISIT_DELIVERY_DESKTOP_SRC = banner("main-hero-visit-delivery-desktop.png");
export const MAIN_HERO_VISIT_DELIVERY_MOBILE_SRC = banner("main-hero-visit-delivery-mobile.png");

/** 3) 학장점 야간 무인 */
export const MAIN_BANNER_DESKTOP_SRC = banner("main-hero-desktop.png");
export const MAIN_BANNER_MOBILE_SRC = banner("main-hero-mobile.png");

/** 혜택 카드 상단 이미지 — public/assets/benefits/ */
export const BENEFIT_FIRST_ORDER_3_PERCENT_SRC = benefit("benefit-first-order-3-percent.png");
export const BENEFIT_SAFE_DRIVING_FREE_CHECK_SRC = benefit("benefit-safe-driving-free-check.png");
export const BENEFIT_VISIT_5000_DISCOUNT_SRC = benefit("benefit-visit-5000-discount.png");

/** @deprecated 새 파일명 사용 */
export const BENEFIT_3PERCENT_CARD_SRC = BENEFIT_FIRST_ORDER_3_PERCENT_SRC;
export const BENEFIT_SERVICE_CARD_SRC = BENEFIT_SAFE_DRIVING_FREE_CHECK_SRC;
export const BENEFIT_STORE_DISCOUNT_CARD_SRC = BENEFIT_VISIT_5000_DISCOUNT_SRC;
export const BENEFIT_3PERCENT_SRC = BENEFIT_FIRST_ORDER_3_PERCENT_SRC;
