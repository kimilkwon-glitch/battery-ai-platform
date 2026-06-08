export type CheckoutChecklistItem = {
  id: string;
  label: string;
  required: boolean;
};

export const CHECKOUT_PAGE_COPY = {
  title: "주문 및 결제",
  description: "주문 정보를 확인한 뒤 결제를 진행해 주세요.",
  descriptionSub: "차량 정보와 수령 방식을 한 번 더 점검해 주세요.",
  checklistIntro: "결제 전 아래를 확인해 주세요.",
  fitmentNote: "배터리는 차량 규격과 단자 방향이 맞아야 장착 가능합니다.",
  submitLabel: "주문 확인 및 결제",
  backToCart: "장바구니로 돌아가기",
} as const;

export const CHECKOUT_CHECKLIST_ITEMS: CheckoutChecklistItem[] = [
  {
    id: "vehicle",
    label: "차량 정보가 있다면 확인했습니다. (없어도 주문 가능)",
    required: false,
  },
  { id: "spec", label: "선택한 배터리 규격을 확인했습니다.", required: true },
  { id: "fulfillment", label: "수령/장착 방식을 확인했습니다.", required: true },
  { id: "usedBattery", label: "폐배터리 반납 여부를 확인했습니다.", required: true },
  { id: "order", label: "주문 정보를 확인했습니다.", required: true },
];
