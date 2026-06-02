import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import {
  buildBatteryDetailBodyImages,
  resolveBatteryDetailBodyBrand,
  type BatteryDetailBodyBrand,
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

function brandPointCards(brand: BatteryDetailBodyBrand | null): DetailPointCard[] {
  if (brand === "rocket") {
    return [
      {
        title: "검증된 시동 성능",
        description: "국산차 교체 현장에서 익숙한 대표 브랜드로, 시동·전장 부하에 맞춘 제품군을 구성합니다.",
      },
      {
        title: "폭넓은 규격 라인업",
        description: "일반형·DIN·AGM까지 한 흐름에서 비교할 수 있어 차종별 안내가 수월합니다.",
      },
      {
        title: "ISG·하이브리드 대응",
        description: "AGM 계열 중심으로 ISG 차량 문의에 맞는 규격을 단계별로 확인할 수 있습니다.",
      },
    ];
  }
  if (brand === "solite") {
    return [
      {
        title: "CMF·DIN 표기 체계",
        description: "쏠라이트 품번은 라벨 표기와 함께 대조하는 것이 안전합니다. 규격 코드를 먼저 확인하세요.",
      },
      {
        title: "상용·밴 규격 강점",
        description: "포터·봉고·스타리아 등 상용·MPV 계열 CMF/R타입 안내에 자주 활용됩니다.",
      },
      {
        title: "단자 방향 확인",
        description: "L/R 표기는 장착 각도와 직결됩니다. 기존 배터리와 동일한 방향인지 확인하세요.",
      },
    ];
  }
  return [
    {
      title: "라벨 규격 코드",
      description: "차량 트레이에 맞는 규격 코드·용량·단자 방향을 라벨에서 먼저 확인하세요.",
    },
    {
      title: "브랜드별 제원",
      description: "로케트·쏠라이트 등 브랜드 표기가 다를 수 있어 상세 제원을 함께 보는 것이 좋습니다.",
    },
    {
      title: "사진 보조 확인",
      description: "헷갈리는 경우 라벨·단자 사진으로 한 번 더 확인할 수 있습니다.",
    },
  ];
}

function typeCompareCards(code: string): DetailPointCard[] {
  const spec = parseBatterySpecDisplay(code);
  const active = spec.typeLabel?.toUpperCase() ?? "배터리";
  const types = [
    { key: "일반형", body: "CMF·GB 계열. 일반 승용·상용 내연기관에 많이 쓰입니다." },
    { key: "DIN", body: "유럽형 규격. 승용·수입차 트레이에 맞춘 DIN 표기를 확인합니다." },
    { key: "AGM", body: "ISG·하이브리드·전장 부하 차량. 흡수식 유지보수-free 계열입니다." },
  ];
  return types.map((t) => ({
    title: t.key,
    description: t.body,
    emphasis: t.key === active || (active === "CMF" && t.key === "일반형"),
  }));
}

/** 상세 본문 — 섹션 단위 구조 (이미지 순서는 기존 buildBatteryDetailBodyImages와 동일 소스) */
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

  sections.push({
    id: "brand-points",
    title: "브랜드 포인트",
    lead: "교체 상담 시 자주 확인하는 핵심 포인트입니다.",
    variant: "cards",
    cards: brandPointCards(brand),
  });

  sections.push({
    id: "type-guide",
    title: "일반형 · DIN · AGM 안내",
    lead: "표기 체계가 다르면 트레이·단자 호환이 달라질 수 있습니다.",
    variant: "muted",
    cards: typeCompareCards(code),
  });

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
