export type HomeBenefitCard = {
  id: string;
  title: string;
  description: string;
  status: "active" | "coming_soon";
  footnote?: string;
};

/** 확정되지 않은 혜택은 준비중 — 3%도 조건 확인 필요 문구 */
export const HOME_BENEFIT_CARDS: HomeBenefitCard[] = [
  {
    id: "benefit-3pct",
    title: "3% 혜택",
    description: "일부 상품·조건에 적용 가능한 혜택입니다.",
    status: "active",
    footnote: "혜택 조건·적용 범위는 주문 상담 시 안내드립니다.",
  },
  {
    id: "benefit-prep-1",
    title: "준비중 혜택",
    description: "새 혜택을 준비 중입니다.",
    status: "coming_soon",
  },
  {
    id: "benefit-prep-2",
    title: "준비중 혜택",
    description: "곧 안내드릴 예정입니다.",
    status: "coming_soon",
  },
];

export const HOME_BENEFITS_TITLE = "배터리매니저 혜택";
export const HOME_BENEFITS_SUBTITLE = "주문 전 확인하면 좋은 혜택";
