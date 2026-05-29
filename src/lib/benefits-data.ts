import type { LucideIcon } from "lucide-react";
import { CalendarDays, Gift, Percent } from "lucide-react";
import { BENEFIT_3PERCENT_CARD_SRC } from "@/lib/brand-assets";
import { HUB_BENEFITS } from "@/lib/customer-hub-routes";

/** 혜택 이미지 — public/assets/benefits/ (없으면 fallback) */
export const BENEFITS_IMAGE_DIR = "/assets/benefits";

export type BenefitStatus = "active" | "coming_soon";

export type BenefitFallbackIcon = "percent" | "calendar" | "gift";

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
  calendar: CalendarDays,
  gift: Gift,
};

export const HUB_BENEFIT_FIRST_ORDER_3 = "/benefits/first-order-3";
export { HUB_BENEFITS };

/** 실제 파일: benefit-3percent-card.png — season/coming-soon 없으면 fallback */
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
    id: "season-benefit",
    title: "시즌 혜택 준비중",
    label: "준비중",
    description: "추후 운영 상황에 맞춰 안내됩니다.",
    note: "확정 후 안내 예정입니다.",
    image: `${BENEFITS_IMAGE_DIR}/benefit-season.png`,
    fallbackIcon: "calendar",
    status: "coming_soon",
    href: HUB_BENEFITS,
  },
  {
    id: "coming-soon-benefit",
    title: "추가 혜택 준비중",
    label: "준비중",
    description: "곧 안내드릴 예정입니다.",
    image: `${BENEFITS_IMAGE_DIR}/benefit-coming-soon.png`,
    fallbackIcon: "gift",
    status: "coming_soon",
    href: HUB_BENEFITS,
  },
];

export const BENEFITS_HUB_TITLE = "배터리매니저 혜택";
export const BENEFITS_HUB_SUBTITLE = "현재 확인 가능한 혜택과 준비 중인 혜택을 확인하세요.";

export const FIRST_ORDER_3_BENEFIT = BENEFIT_CARDS[0]!;
