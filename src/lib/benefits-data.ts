import type { LucideIcon } from "lucide-react";
import { Percent, Store, Wrench } from "lucide-react";
import {
  BENEFIT_3PERCENT_CARD_SRC,
  BENEFIT_SERVICE_CARD_SRC,
  BENEFIT_STORE_DISCOUNT_CARD_SRC,
} from "@/lib/brand-assets";
import { HUB_BENEFITS } from "@/lib/customer-hub-routes";

/** 혜택 이미지 디렉터리 — public/assets/benefits/ */
export const BENEFITS_IMAGE_DIR = "/assets/benefits";

export type BenefitStatus = "active" | "coming_soon";

export type BenefitFallbackIcon = "percent" | "service" | "store";

export type BenefitCardConfig = {
  id: string;
  title: string;
  label: string;
  description: string;
  /** 카드 하단 보조 문구 (meta/subtext) */
  note?: string;
  image?: string;
  imageAlt?: string;
  fallbackIcon: BenefitFallbackIcon;
  status: BenefitStatus;
  href: string;
  /** 쿠폰 발급 연동 ID */
  couponBenefitId?: string;
  /** 상세 페이지 본문 */
  detailIntro?: string;
  detailBullets?: string[];
};

export const BENEFIT_FALLBACK_ICONS: Record<BenefitFallbackIcon, LucideIcon> = {
  percent: Percent,
  service: Wrench,
  store: Store,
};

export const HUB_BENEFIT_FIRST_ORDER_3 = "/benefits/first-order-3";
export const HUB_BENEFIT_BASIC_SERVICE = "/benefits/basic-service";
export const HUB_BENEFIT_STORE_DISCOUNT = "/benefits/store-visit-discount-5000";
export { HUB_BENEFITS };

/** 메인·/benefits 혜택 카드 3종 — 단일 데이터 소스, 노출 순서 고정 */
export const BENEFIT_CARDS: BenefitCardConfig[] = [
  {
    id: "first-order-3",
    title: "첫 주문 3% 혜택",
    label: "자동 적용",
    description: "회원가입 후 첫 주문 시 주문 단계에서 자동 적용됩니다.",
    note: "회원가입 후 첫 주문 1회",
    image: BENEFIT_3PERCENT_CARD_SRC,
    imageAlt: "첫 주문 3% 혜택 카드",
    fallbackIcon: "percent",
    status: "active",
    href: HUB_BENEFIT_FIRST_ORDER_3,
    couponBenefitId: "first-order-3",
    detailIntro:
      "첫 주문 고객을 위한 3% 혜택입니다. 회원가입 후 첫 주문 조건을 만족하면 주문·결제 단계에서 자동으로 반영됩니다.",
    detailBullets: [
      "일부 상품·차량·규격에만 적용될 수 있습니다.",
      "첫 주문 여부·반납 조건·프로모션 중복 여부는 주문 전 확인합니다.",
      "정확한 할인 금액은 주문 확정 전 안내드립니다.",
    ],
  },
  {
    id: "replacement-service",
    title: "교체 고객 기본 서비스",
    label: "기본 서비스",
    description: "출장·매장 공통으로 제공되는 기본 서비스입니다.",
    note: "엔진룸 클리닝 · 워셔액 보충 · 공기압 점검",
    image: BENEFIT_SERVICE_CARD_SRC,
    imageAlt: "교체 고객 기본 서비스 혜택 카드",
    fallbackIcon: "service",
    status: "active",
    href: HUB_BENEFIT_BASIC_SERVICE,
    detailIntro:
      "배터리 교체 고객에게 출장·매장 방문 시 공통으로 제공하는 기본 서비스입니다. 교체 작업과 함께 차량 상태를 빠르게 점검합니다.",
    detailBullets: [
      "엔진룸 클리닝으로 엔진룸 오염·먼지를 정리합니다.",
      "워셔액 보충으로 전면 유리 세척 준비를 돕습니다.",
      "공기압 점검으로 타이어 공기압 상태를 확인합니다.",
      "출장·매장 경로에 따라 가능 항목은 현장에서 안내드립니다.",
    ],
  },
  {
    id: "store-visit-discount-5000",
    title: "직영점 방문 5,000원 할인",
    label: "내방 할인",
    description: "덕천점·학장점 방문 고객 대상 혜택입니다.",
    note: "조건 확인 후 적용 가능",
    image: BENEFIT_STORE_DISCOUNT_CARD_SRC,
    imageAlt: "내방 할인 5,000원 혜택 카드",
    fallbackIcon: "store",
    status: "active",
    href: HUB_BENEFIT_STORE_DISCOUNT,
    detailIntro:
      "배터리매니저 직영점(덕천점·학장점)을 방문하시는 고객을 위한 5,000원 할인 혜택입니다. 적용 가능 여부와 조건은 방문·상담 시 확인됩니다.",
    detailBullets: [
      "덕천점·학장점 방문 고객 대상입니다.",
      "다른 프로모션·쿠폰과 중복 적용 여부는 상담 시 확인합니다.",
      "할인 적용 금액과 조건은 주문·결제 전 안내드립니다.",
    ],
  },
];

export const BENEFITS_HUB_BADGE = "BENEFIT";
export const BENEFITS_HUB_TITLE = "배터리매니저 혜택";
export const BENEFITS_HUB_SUBTITLE = "첫 주문 혜택부터 기본 서비스까지 한눈에 확인하세요.";

export const FIRST_ORDER_3_BENEFIT = BENEFIT_CARDS[0]!;
export const BASIC_SERVICE_BENEFIT = BENEFIT_CARDS[1]!;
export const STORE_VISIT_DISCOUNT_BENEFIT = BENEFIT_CARDS[2]!;

export function getBenefitById(id: string): BenefitCardConfig | undefined {
  return BENEFIT_CARDS.find((c) => c.id === id);
}
