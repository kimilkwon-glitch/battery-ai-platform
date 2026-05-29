/** 브랜드·메인 배너 정적 자산 경로 (public/assets) */

/** 실제 파일: public/assets/brand/battery-manager-logo.png → URL은 /assets/... (public 접두어 없음) */
export const BRAND_LOGO_SRC = "/assets/brand/battery-manager-logo.png";

export const BRAND_LOGO_ALT = "부산배터리매니저 로고";

/** 실제 제공 파일: public/assets/banners/ — 교체 시 MAIN_BANNER_ASSET_REV만 올려 캐시 무효화 */
export const MAIN_BANNER_ASSET_REV = "20260529-desktop-jpg-v1";

/** 실제 파일: main-hero-desktop.jpg, main-hero-mobile.png */
export const MAIN_BANNER_DESKTOP_SRC = `/assets/banners/main-hero-desktop.jpg?v=${MAIN_BANNER_ASSET_REV}`;
export const MAIN_BANNER_MOBILE_SRC = `/assets/banners/main-hero-mobile.png?v=${MAIN_BANNER_ASSET_REV}`;
