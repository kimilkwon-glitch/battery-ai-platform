export type CheckoutChecklistItem = {
  id: string;
  label: string;
  required: boolean;
};

export const CHECKOUT_PAGE_COPY = {
  title: "주문서 작성",
  description: "고객·차량·수령 정보를 확인하고 결제 예정금액을 검토해 주세요.",
  checklistIntro: "주문 전 아래 내용을 한 번만 확인해 주세요.",
  fitmentNote: "배터리는 차량 규격과 단자 방향이 맞아야 장착 가능합니다.",
  consultationTitle: "결제 안내",
  consultationBody:
    "현재 자사몰 결제 시스템을 준비 중입니다. 상품과 결제 예정금액 확인은 가능하며, 결제 기능은 곧 제공될 예정입니다.",
  submitLabel: "결제 예정금액 확인",
  backToCart: "장바구니로 돌아가기",
} as const;

export const CHECKOUT_CHECKLIST_ITEMS: CheckoutChecklistItem[] = [
  { id: "vehicle", label: "차량명·연식 확인", required: true },
  { id: "spec", label: "배터리 규격 확인", required: true },
  { id: "terminal", label: "단자 방향 확인", required: true },
  { id: "contact", label: "연락처 확인", required: true },
  { id: "fulfillment", label: "수령/장착 방식 확인", required: true },
  { id: "price", label: "결제 예정금액 확인", required: true },
];
