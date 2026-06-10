export type CheckoutChecklistItem = {
  id: string;
  label: string;
  required: boolean;
};

export const CHECKOUT_PAGE_COPY = {
  title: "주문 및 결제",
  description: "주문 정보를 확인한 뒤 결제를 진행해 주세요.",
  descriptionSub: "차량 정보와 수령 방식을 한 번 더 점검해 주세요.",
  checklistIntro: "아래 항목을 확인해 주세요.",
  fitmentNote:
    "배터리는 차량 연식·옵션·기존 장착 상태에 따라 달라질 수 있습니다. 주문 전 차량명과 기존 배터리 사진을 확인하면 오주문을 줄일 수 있습니다.",
  submitLabel: "주문 확인 및 결제",
  backToCart: "장바구니로 돌아가기",
  guestLead: "비회원으로도 주문할 수 있습니다.",
  guestLoginHint: "회원이면 로그인 후 회원정보를 불러올 수 있습니다.",
  firstOrderPromoHint:
    "회원가입 후 첫 주문 3% 혜택은 로그인 후 조건 충족 시 주문 단계에서 자동 적용됩니다.",
} as const;

export const CART_PAGE_COPY = {
  title: "장바구니",
  subtitle: "담긴 상품과 예상 금액을 확인한 뒤 주문서로 이동해 주세요.",
  checkoutCta: "주문하러 가기",
  continueCta: "계속 둘러보기",
  fulfillmentHint:
    "수령방식은 여기서 미리 고르거나, 주문서에서 다시 선택할 수 있습니다.",
} as const;

export const CART_EMPTY_COPY = {
  title: "장바구니에 담긴 배터리가 없습니다.",
  body: "차량명으로 맞는 배터리를 찾아보세요.",
  vehicleCta: "차량으로 배터리 찾기",
} as const;

export const CHECKOUT_PRICE_POLICY_HINTS = {
  delivery: "택배 발송 선택 시 배송비 15,000원이 추가됩니다.",
  store_pickup_self: "내방수령(셀프교체)은 제품 구매가 기준이며 택배비가 추가되지 않습니다.",
  store_install: "내방교체는 출장 교체가에서 5,000원이 할인됩니다.",
  visit_install: "출장교체는 출장 교체가 기준으로 안내됩니다.",
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
