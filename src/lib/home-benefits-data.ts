import type { LucideIcon } from "lucide-react";
import { CalendarDays, Gift, Percent } from "lucide-react";

/** 혜택 이미지는 public/assets/benefits/ 폴더에 추가 후 image 경로에 연결 */
export const HOME_BENEFITS_IMAGE_DIR = "/assets/benefits";

export type HomeBenefitStatus = "active" | "coming_soon";

export type HomeBenefitFallbackIcon = "percent" | "calendar" | "gift";

export type HomeBenefitCard = {
  id: string;
  title: string;
  label: string;
  description: string;
  note?: string;
  /** public 경로 — 파일 없으면 fallbackIcon 표시 */
  image?: string;
  fallbackIcon: HomeBenefitFallbackIcon;
  status: HomeBenefitStatus;
};

export const HOME_BENEFIT_FALLBACK_ICONS: Record<HomeBenefitFallbackIcon, LucideIcon> = {
  percent: Percent,
  calendar: CalendarDays,
  gift: Gift,
};

/** 확정되지 않은 혜택은 준비중 — 3%도 조건 확인 필요 문구 유지 */
export const HOME_BENEFIT_CARDS: HomeBenefitCard[] = [
  {
    id: "benefit-3percent",
    title: "3% 혜택",
    label: "확인 가능",
    description: "일부 상품·조건에 적용 가능한 혜택입니다.",
    note: "정확한 조건은 주문 상담 시 안내드립니다.",
    image: `${HOME_BENEFITS_IMAGE_DIR}/benefit-3percent.png`,
    fallbackIcon: "percent",
    status: "active",
  },
  {
    id: "season-benefit",
    title: "시즌 혜택 준비중",
    label: "준비중",
    description: "시즌별 혜택을 준비 중입니다.",
    note: "확정 후 안내 예정입니다.",
    image: `${HOME_BENEFITS_IMAGE_DIR}/benefit-season.png`,
    fallbackIcon: "calendar",
    status: "coming_soon",
  },
  {
    id: "coming-soon-benefit",
    title: "준비중 혜택",
    label: "준비중",
    description: "곧 안내드릴 예정입니다.",
    image: `${HOME_BENEFITS_IMAGE_DIR}/benefit-coming-soon.png`,
    fallbackIcon: "gift",
    status: "coming_soon",
  },
];

export const HOME_BENEFITS_TITLE = "배터리매니저 혜택";
export const HOME_BENEFITS_SUBTITLE = "주문 전 확인하면 좋은 혜택";
