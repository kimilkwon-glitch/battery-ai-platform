/** 브랜드·메인 배너·혜택 배너 정적 자산 경로 (public/assets) */

/** 실제 파일: public/assets/brand/battery-manager-logo.png → URL은 /assets/... (public 접두어 없음) */
export const BRAND_LOGO_SRC = "/assets/brand/battery-manager-logo.png";

export const BRAND_LOGO_ALT = "부산배터리매니저 로고";

/** 배너·혜택 교체 시 rev만 올려 CDN/브라우저 캐시 무효화 */
export const MAIN_BANNER_ASSET_REV = "20260529-banner-png-v1";
export const BENEFITS_ASSET_REV = "20260529-benefit-3pct-v1";

/** 실제 파일: public/assets/banners/main-hero-desktop.png, main-hero-mobile.png */
export const MAIN_BANNER_DESKTOP_SRC = `/assets/banners/main-hero-desktop.png?v=${MAIN_BANNER_ASSET_REV}`;
export const MAIN_BANNER_MOBILE_SRC = `/assets/banners/main-hero-mobile.png?v=${MAIN_BANNER_ASSET_REV}`;

/** 실제 파일: public/assets/benefits/benefit-3percent.png */
export const BENEFIT_3PERCENT_SRC = `/assets/benefits/benefit-3percent.png?v=${BENEFITS_ASSET_REV}`;
