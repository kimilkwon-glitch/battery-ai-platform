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
export const MAIN_BANNER_ASSET_REV = "20260605-hero-banners-v4";
export const BENEFITS_ASSET_REV = "20260605-benefit-images-v2";

const mainBanner = (name: string) =>
  `/assets/main-banners/${name}?v=${MAIN_BANNER_ASSET_REV}`;
const benefit = (name: string) => `/assets/benefits/${name}?v=${BENEFITS_ASSET_REV}`;

/** 메인 히어로 — PC/모바일 분리 (public/assets/main-banners/) */
export const MAIN_BANNER_DELIVERY_ORDER_PC_SRC = mainBanner(
  "main-banner-delivery-order-pc.png",
);
export const MAIN_BANNER_DELIVERY_ORDER_MOBILE_SRC = mainBanner(
  "main-banner-delivery-order-mobile.png",
);
export const MAIN_BANNER_STORE_ONSITE_PC_SRC = mainBanner("main-banner-store-onsite-pc.png");
export const MAIN_BANNER_STORE_ONSITE_MOBILE_SRC = mainBanner(
  "main-banner-store-onsite-mobile.png",
);
export const MAIN_BANNER_NIGHT_UNMANNED_PC_SRC = mainBanner(
  "main-banner-night-unmanned-pc.png",
);
export const MAIN_BANNER_NIGHT_UNMANNED_MOBILE_SRC = mainBanner(
  "main-banner-night-unmanned-mobile.png",
);

/** @deprecated 20260605 — PC/모바일 분리 경로 사용 */
export const MAIN_BANNER_STORE_VISIT_ONSITE_SRC = MAIN_BANNER_STORE_ONSITE_PC_SRC;
export const MAIN_BANNER_NATIONWIDE_DELIVERY_SRC = MAIN_BANNER_DELIVERY_ORDER_PC_SRC;
export const MAIN_BANNER_HAKJANG_NIGHT_SRC = MAIN_BANNER_NIGHT_UNMANNED_PC_SRC;
export const MAIN_HERO_DELIVERY_ORDER_DESKTOP_SRC = MAIN_BANNER_DELIVERY_ORDER_PC_SRC;
export const MAIN_HERO_DELIVERY_ORDER_MOBILE_SRC = MAIN_BANNER_DELIVERY_ORDER_MOBILE_SRC;
export const MAIN_HERO_VISIT_DELIVERY_DESKTOP_SRC = MAIN_BANNER_STORE_ONSITE_PC_SRC;
export const MAIN_HERO_VISIT_DELIVERY_MOBILE_SRC = MAIN_BANNER_STORE_ONSITE_MOBILE_SRC;
export const MAIN_BANNER_DESKTOP_SRC = MAIN_BANNER_NIGHT_UNMANNED_PC_SRC;
export const MAIN_BANNER_MOBILE_SRC = MAIN_BANNER_NIGHT_UNMANNED_MOBILE_SRC;

/** 혜택 카드 — PC/모바일 분리 (public/assets/benefits/) */
export const BENEFIT_FIRST_ORDER_3_PERCENT_PC_SRC = benefit(
  "benefit-first-order-3-percent-pc.png",
);
export const BENEFIT_FIRST_ORDER_3_PERCENT_MOBILE_SRC = benefit(
  "benefit-first-order-3-percent-mobile.png",
);
export const BENEFIT_SAFE_DRIVING_FREE_CHECK_PC_SRC = benefit(
  "benefit-safe-driving-free-check-pc.png",
);
export const BENEFIT_SAFE_DRIVING_FREE_CHECK_MOBILE_SRC = benefit(
  "benefit-safe-driving-free-check-mobile.png",
);
export const BENEFIT_VISIT_5000_DISCOUNT_PC_SRC = benefit(
  "benefit-visit-5000-discount-pc.png",
);
export const BENEFIT_VISIT_5000_DISCOUNT_MOBILE_SRC = benefit(
  "benefit-visit-5000-discount-mobile.png",
);

/** 기본 image 필드 — PC */
export const BENEFIT_FIRST_ORDER_3_PERCENT_SRC = BENEFIT_FIRST_ORDER_3_PERCENT_PC_SRC;
export const BENEFIT_SAFE_DRIVING_FREE_CHECK_SRC = BENEFIT_SAFE_DRIVING_FREE_CHECK_PC_SRC;
export const BENEFIT_VISIT_5000_DISCOUNT_SRC = BENEFIT_VISIT_5000_DISCOUNT_PC_SRC;

/** @deprecated 새 파일명 사용 */
export const BENEFIT_3PERCENT_CARD_SRC = BENEFIT_FIRST_ORDER_3_PERCENT_SRC;
export const BENEFIT_SERVICE_CARD_SRC = BENEFIT_SAFE_DRIVING_FREE_CHECK_SRC;
export const BENEFIT_STORE_DISCOUNT_CARD_SRC = BENEFIT_VISIT_5000_DISCOUNT_SRC;
export const BENEFIT_3PERCENT_SRC = BENEFIT_FIRST_ORDER_3_PERCENT_SRC;
