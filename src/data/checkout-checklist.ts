export type CheckoutChecklistItem = {
  id: string;
  label: string;
  required: boolean;
};

export const CHECKOUT_PAGE_COPY = {
  title: "주문 정보 확인",
  description: "주문 전 상품과 차량 정보를 확인해 주세요.",
  checklistIntro: "주문 전 아래 내용을 한 번만 확인해 주세요.",
  fitmentNote: "배터리는 차량 규격과 단자 방향이 맞아야 장착 가능합니다.",
  usedBatteryNote: "폐전지 반납 여부에 따라 금액이 달라질 수 있습니다.",
  consultationTitle: "상담 주문 접수",
  consultationBody:
    "현재는 상담 주문 접수 방식으로 운영됩니다. 접수 후 담당자가 배터리 규격과 주문 조건을 확인해 안내드립니다.",
  submitLabel: "구매하기",
  backToCart: "장바구니로 돌아가기",
} as const;

export const CHECKOUT_CHECKLIST_ITEMS: CheckoutChecklistItem[] = [
  { id: "vehicle", label: "차량명·연식 확인", required: true },
  { id: "spec", label: "배터리 규격 확인", required: true },
  { id: "terminal", label: "단자 방향 확인", required: true },
  { id: "used-battery", label: "폐전지 반납 여부 확인", required: true },
  { id: "contact", label: "연락처·수령 정보 확인", required: true },
];
