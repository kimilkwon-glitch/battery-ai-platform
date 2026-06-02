import {
  buildBatteryDetailBodyImages,
  resolveBatteryDetailBodyBrand,
  type BatteryDetailBodyImage,
} from "@/lib/battery-detail/battery-detail-body-images";

export type DetailPointCard = {
  title: string;
  description: string;
  emphasis?: boolean;
};

export type DetailBodySectionVariant = "hero" | "brand" | "cards" | "gallery" | "muted";

export type DetailBodySection = {
  id: string;
  title: string;
  lead?: string;
  variant: DetailBodySectionVariant;
  images?: BatteryDetailBodyImage[];
  cards?: DetailPointCard[];
};

/** 상품 상세/구매 — 섹션 단위 (교육형 브랜드·규격 카드는 /brands 등에서만 사용) */
export function buildBatteryDetailBodySections(
  code: string,
  hints?: { brand?: string; manufacturer?: string; brandId?: string },
): DetailBodySection[] {
  const brand = resolveBatteryDetailBodyBrand(code, hints);
  const flat = buildBatteryDetailBodyImages(brand);
  const byAlt = (alt: string) => flat.find((i) => i.alt === alt);

  const authentic = byAlt("정품 배터리 안내");
  const brandImg =
    brand === "rocket"
      ? byAlt("로케트 브랜드 소개")
      : brand === "solite"
        ? byAlt("쏠라이트 브랜드 소개")
        : undefined;

  const orderAlts = [
    "배터리 생산일자 확인 안내",
    "주문 전 체크리스트",
    "당일 발송 안내",
    "취소 및 배송지 변경 안내",
    "누액방지 테이프 제거 안내",
  ];
  const supportAlts = ["폐배터리 회수 신청 안내", "배터리 A/S 접수 안내", "포토리뷰 포인트 이벤트 안내"];

  const sections: DetailBodySection[] = [];

  if (authentic) {
    sections.push({
      id: "authentic",
      title: "정품 배터리 안내",
      lead: "정품 확인과 교체 전 기본 안내입니다.",
      variant: "hero",
      images: [authentic],
    });
  }

  if (brandImg) {
    sections.push({
      id: "brand-intro",
      title: brand === "rocket" ? "로케트 브랜드 소개" : "쏠라이트 브랜드 소개",
      lead: "브랜드 특성과 제품군을 한눈에 확인합니다.",
      variant: "brand",
      images: [brandImg],
    });
  }

  const orderImages = orderAlts.map((a) => byAlt(a)).filter(Boolean) as BatteryDetailBodyImage[];
  if (orderImages.length) {
    sections.push({
      id: "order-guide",
      title: "주문 · 배송 안내",
      lead: "주문 전후에 확인하면 좋은 운영 안내입니다.",
      variant: "gallery",
      images: orderImages,
    });
  }

  const supportImages = supportAlts.map((a) => byAlt(a)).filter(Boolean) as BatteryDetailBodyImage[];
  if (supportImages.length) {
    sections.push({
      id: "support-guide",
      title: "회수 · A/S · 혜택",
      lead: "교체 이후 회수·A/S·리뷰 혜택 안내입니다.",
      variant: "gallery",
      images: supportImages,
    });
  }

  return sections;
}

export function batteryDetailBodySectionsForCode(
  code: string,
  hints?: { brand?: string; manufacturer?: string; brandId?: string },
): DetailBodySection[] {
  return buildBatteryDetailBodySections(code, hints);
}
