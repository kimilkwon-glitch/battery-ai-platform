import type { LucideIcon } from "lucide-react";
import { Percent, Store, Wrench } from "lucide-react";
import {
  BENEFIT_3PERCENT_CARD_SRC,
  BENEFIT_SERVICE_CARD_SRC,
  BENEFIT_STORE_DISCOUNT_CARD_SRC,
} from "@/lib/brand-assets";
import { HUB_BENEFITS, HUB_STORE_ANCHORS, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

/** 혜택 이미지 디렉터리 — public/assets/benefits/ */
export const BENEFITS_IMAGE_DIR = "/assets/benefits";

export type BenefitStatus = "active" | "coming_soon";

export type BenefitFallbackIcon = "percent" | "service" | "store";

export type BenefitCardConfig = {
  id: string;
  title: string;
  label: string;
  description: string;
  note?: string;
  image?: string;
  imageAlt?: string;
  fallbackIcon: BenefitFallbackIcon;
  status: BenefitStatus;
  href: string;
  /** 쿠폰 발급 연동 ID */
  couponBenefitId?: string;
};

export const BENEFIT_FALLBACK_ICONS: Record<BenefitFallbackIcon, LucideIcon> = {
  percent: Percent,
  service: Wrench,
  store: Store,
};

export const HUB_BENEFIT_FIRST_ORDER_3 = "/benefits/first-order-3";
export { HUB_BENEFITS };

/** 메인·/benefits 혜택 카드 3종 — 노출 순서 고정 */
export const BENEFIT_CARDS: BenefitCardConfig[] = [
  {
    id: "first-order-3",
    title: "첫 주문 3% 혜택",
    label: "확인 가능",
    description: "조건 확인 후 적용 가능한 혜택입니다.",
    note: "일부 조건 적용 · 주문 상담 시 확인",
    image: BENEFIT_3PERCENT_CARD_SRC,
    imageAlt: "첫 주문 3% 혜택 카드",
    fallbackIcon: "percent",
    status: "active",
    href: HUB_BENEFIT_FIRST_ORDER_3,
    couponBenefitId: "first-order-3",
  },
  {
    id: "replacement-service",
    title: "교체 고객 기본 서비스",
    label: "출장·매장",
    description: "엔진룸 클리닝 · 워셔액 보충 · 공기압 점검",
    note: "출장 및 매장 방문 고객 공통 제공",
    image: BENEFIT_SERVICE_CARD_SRC,
    imageAlt: "교체 고객 기본 서비스 혜택 카드",
    fallbackIcon: "service",
    status: "active",
    href: HUB_STORE_ANCHORS.visit,
  },
  {
    id: "store-visit-discount-5000",
    title: "내방 할인 5,000원",
    label: "조건 확인",
    description: "직영점 방문 고객 할인 혜택입니다.",
    note: "조건 확인 후 적용 가능",
    image: BENEFIT_STORE_DISCOUNT_CARD_SRC,
    imageAlt: "내방 할인 5,000원 혜택 카드",
    fallbackIcon: "store",
    status: "active",
    href: HUB_STORE_DETAIL,
  },
];

export const BENEFITS_HUB_TITLE = "배터리매니저 혜택";
export const BENEFITS_HUB_SUBTITLE = "현재 확인 가능한 혜택을 한눈에 확인하세요.";

export const FIRST_ORDER_3_BENEFIT = BENEFIT_CARDS[0]!;
