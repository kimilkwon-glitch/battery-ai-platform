/** 브랜드·메인 배너·혜택 배너 정적 자산 경로 (public/assets) */

/** 실제 파일: public/assets/brand/battery-manager-logo.png → URL은 /assets/... (public 접두어 없음) */
export const BRAND_LOGO_SRC = "/assets/brand/battery-manager-logo.png";

export const BRAND_LOGO_ALT = "부산배터리매니저 로고";

/** 배너·혜택 교체 시 rev만 올려 CDN/브라우저 캐시 무효화 */
export const MAIN_BANNER_ASSET_REV = "20260530-hero-triple-v1";
export const BENEFITS_ASSET_REV = "20260530-benefit-card-v1";

const banner = (name: string) => `/assets/banners/${name}?v=${MAIN_BANNER_ASSET_REV}`;

/** 1) 택배 주문 */
export const MAIN_HERO_DELIVERY_ORDER_DESKTOP_SRC = banner("main-hero-delivery-order-desktop.png");
export const MAIN_HERO_DELIVERY_ORDER_MOBILE_SRC = banner("main-hero-delivery-order-mobile.png");

/** 2) 매장 방문 · 출장 교체 */
export const MAIN_HERO_VISIT_DELIVERY_DESKTOP_SRC = banner("main-hero-visit-delivery-desktop.png");
export const MAIN_HERO_VISIT_DELIVERY_MOBILE_SRC = banner("main-hero-visit-delivery-mobile.png");

/** 3) 학장점 야간 무인 */
export const MAIN_BANNER_DESKTOP_SRC = banner("main-hero-desktop.png");
export const MAIN_BANNER_MOBILE_SRC = banner("main-hero-mobile.png");

/** 혜택 카드 — public/assets/benefits/benefit-3percent-card.png */
export const BENEFIT_3PERCENT_CARD_SRC = `/assets/benefits/benefit-3percent-card.png?v=${BENEFITS_ASSET_REV}`;

/** @deprecated benefit-3percent-card.png 사용 */
export const BENEFIT_3PERCENT_SRC = BENEFIT_3PERCENT_CARD_SRC;
