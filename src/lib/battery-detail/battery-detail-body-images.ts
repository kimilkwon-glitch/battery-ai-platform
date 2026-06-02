import { getBrandSpecsForNormalizedCode } from "@/data/battery/batterySpecIndex";
import type { BatteryBrand } from "@/data/battery/types";
import { getBattery, getBrand } from "@/lib/platform-data";

export type BatteryDetailBodyBrand = "rocket" | "solite";

export type BatteryDetailBodyImage = {
  src: string;
  alt: string;
};

const DETAIL_IMAGE_PATHS = {
  common: {
    authentic: "/assets/detail/common/01_정품배터리_안내.png",
    mfgDate: "/assets/detail/common/03_배터리_생산일자_확인.png",
    checklist: "/assets/detail/common/04_주문_전_체크리스트.png",
    sameDayShip: "/assets/detail/common/05_당일발송_안내.png",
    cancelChange: "/assets/detail/common/06_취소_및_배송지_변경_안내.jpg",
    tapeRemove: "/assets/detail/common/07_누액방지_테이프_제거_안내.jpg",
    returnPickup: "/assets/detail/common/08_폐배터리_회수신청_안내.png",
    asGuide: "/assets/detail/common/09_배터리_AS_접수_안내.png",
    photoReview: "/assets/detail/common/10_포토리뷰_포인트_이벤트.png",
  },
  brand: {
    rocket: "/assets/detail/brands/rocket/02_로케트_브랜드_소개.png",
    solite: "/assets/detail/brands/solite/02_쏠라이트_브랜드_소개.png",
  },
} as const;

function matchBrandToken(raw: string | undefined | null): BatteryDetailBodyBrand | null {
  if (!raw?.trim()) return null;
  const s = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (s.includes("rocket") || s.includes("로케트") || s === "rocket") return "rocket";
  if (s.includes("solite") || s.includes("쏠라이트") || s === "solite") return "solite";
  return null;
}

function brandFromBatteryBrandEnum(brand: BatteryBrand): BatteryDetailBodyBrand | null {
  if (brand === "ROCKET") return "rocket";
  if (brand === "SOLITE") return "solite";
  return null;
}

/**
 * 상품 brandId · displayName · 스펙 brand · 추가 힌트로 상세 본문 브랜드 이미지 판정.
 */
export function resolveBatteryDetailBodyBrand(
  code: string,
  hints?: { brand?: string; manufacturer?: string; brandId?: string },
): BatteryDetailBodyBrand | null {
  const tokens: string[] = [];

  if (hints?.brand) tokens.push(hints.brand);
  if (hints?.manufacturer) tokens.push(hints.manufacturer);
  if (hints?.brandId) tokens.push(hints.brandId);

  const bat = getBattery(code, hints?.brandId);
  tokens.push(bat.brandId);
  const platformBrand = getBrand(bat.brandId);
  tokens.push(platformBrand.id, platformBrand.displayName);

  for (const t of tokens) {
    const hit = matchBrandToken(t);
    if (hit) return hit;
  }

  const specs = getBrandSpecsForNormalizedCode(code);
  const rocket = specs.some((s) => s.brand === "ROCKET");
  const solite = specs.some((s) => s.brand === "SOLITE");
  if (rocket && !solite) return "rocket";
  if (solite && !rocket) return "solite";

  const primary = specs[0]?.brand;
  if (primary) return brandFromBatteryBrandEnum(primary);

  return null;
}

/** 상세 본문 안내 이미지 — 고정 순서 (택배 운영 개선 이미지 미포함) */
export function buildBatteryDetailBodyImages(
  brand: BatteryDetailBodyBrand | null,
): BatteryDetailBodyImage[] {
  const c = DETAIL_IMAGE_PATHS.common;
  const images: BatteryDetailBodyImage[] = [
    { src: c.authentic, alt: "정품 배터리 안내" },
  ];

  if (brand === "rocket") {
    images.push({ src: DETAIL_IMAGE_PATHS.brand.rocket, alt: "로케트 브랜드 소개" });
  } else if (brand === "solite") {
    images.push({ src: DETAIL_IMAGE_PATHS.brand.solite, alt: "쏠라이트 브랜드 소개" });
  }

  images.push(
    { src: c.mfgDate, alt: "배터리 생산일자 확인 안내" },
    { src: c.checklist, alt: "주문 전 체크리스트" },
    { src: c.sameDayShip, alt: "당일 발송 안내" },
    { src: c.cancelChange, alt: "취소 및 배송지 변경 안내" },
    { src: c.tapeRemove, alt: "누액방지 테이프 제거 안내" },
    { src: c.returnPickup, alt: "폐배터리 회수 신청 안내" },
    { src: c.asGuide, alt: "배터리 A/S 접수 안내" },
    { src: c.photoReview, alt: "포토리뷰 포인트 이벤트 안내" },
  );

  return images;
}

export function batteryDetailBodyImagesForCode(
  code: string,
  hints?: { brand?: string; manufacturer?: string; brandId?: string },
): BatteryDetailBodyImage[] {
  return buildBatteryDetailBodyImages(resolveBatteryDetailBodyBrand(code, hints));
}
