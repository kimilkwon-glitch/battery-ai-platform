import type {
  BatteryCartItem,
  BatteryCartSummary,
  FitmentStatus,
  FulfillmentMethod,
  InstallMethod,
  UsedBatteryReturnOption,
} from "@/types/cart";
import { CUSTOMER_FULFILLMENT_LABELS } from "@/lib/pricing/customer-price-labels";
import {
  CART_DESIGN_PAGE,
  CUSTOMER_CENTER_ORDER_GUIDE,
  CUSTOMER_CENTER_USED_BATTERY,
  CUSTOMER_CENTER_HUB,
} from "@/lib/customer-center-routes";

export { CART_DESIGN_PAGE };
export const CART_PAGE_TARGET = "/cart" as const;
export const CART_DESIGN_DOC_PATH = "docs/cart-design-v1.md" as const;

export const CART_DESIGN_COPY = {
  pageTitle: "장바구니 기능 설계 미리보기",
  pageDescription:
    "Battery Manager 장바구니 UX·데이터 구조·주문 전 확인 흐름의 5차 설계안입니다. 실제 담기·결제·주문 생성은 6차에서 구현 예정입니다.",
  banner:
    "기능 설계 미리보기 · 장바구니 개발 예정 구조입니다. 담기·수량 변경·결제는 동작하지 않습니다.",
  philosophyTitle: "장바구니 기본 철학",
  philosophyBody:
    "일반 쇼핑몰처럼 상품명·수량·가격만 담지 않습니다. 차량 기준 규격, 단자 방향, 폐전지 반납 여부, 수령·설치 방식이 한 줄(item)에 묶여야 하며, 확인이 끝나기 전에는 결제보다 주문 전 확인을 강조합니다.",
} as const;

export const CART_DESIGN_PHILOSOPHY_BULLETS = [
  "담긴 상품이 어떤 차량·세대 기준인지 카드에 항상 표시",
  "폐전지 반납/미반납에 따라 가격·안내·회수 문구 분기",
  "규격 미확정 시 fitmentStatus로 확인 필요 상태 표시",
  "AGM80L/AGM80R 등 단자 방향 오주문 방지 강조",
  "장바구니 → 주문 전 체크리스트 → (필요 시) 사진 확인 → 주문",
] as const;

export type CartFlowScenario = {
  id: "A" | "B" | "C" | "D" | "E";
  title: string;
  steps: string[];
};

export const CART_FLOW_SCENARIOS: CartFlowScenario[] = [
  {
    id: "A",
    title: "차량 상세에서 장바구니 담기",
    steps: [
      "고객이 차량 검색",
      "차량 상세에서 추천 배터리 확인",
      "배터리 규격·단자 방향 확인",
      "폐전지 반납/미반납 선택",
      "수령 방식 선택",
      "장바구니 담기",
      "장바구니에서 주문 전 체크 확인",
    ],
  },
  {
    id: "B",
    title: "배터리 규격 상세에서 장바구니 담기",
    steps: [
      "고객이 AGM70L 등 규격 검색",
      "배터리 상세 페이지 진입",
      "차량 정보 입력 또는 선택 유도",
      "차량 미확인 시 fitmentStatus = needs_customer_confirm",
      "폐전지 반납/미반납 선택",
      "장바구니 담기",
      "결제 전 사진 확인 또는 고객 확인 안내",
    ],
  },
  {
    id: "C",
    title: "규격만 알고 주문",
    steps: [
      "고객이 규격명 검색",
      "상품 선택",
      "차량명/연식 입력은 선택·권장",
      "단자 방향 주의 안내",
      "장바구니 담기",
      "주문 전 확인 박스 표시",
    ],
  },
  {
    id: "D",
    title: "폐전지 반납 조건 선택",
    steps: [
      "반납 조건 선택",
      "반납 안내 확인 체크",
      "장바구니에 반납 조건 표시",
      "주문 전 반납 가능 여부 재확인",
      "주문 완료 후 회수 안내 메시지 연결 (2차 템플릿)",
    ],
  },
  {
    id: "E",
    title: "폐전지 미반납 선택",
    steps: [
      "미반납 조건 선택",
      "가격 차이 안내",
      "장바구니에 미반납 표시",
      "주문 전 폐전지 회수 없음 확인",
    ],
  },
];

export const FITMENT_STATUS_LABELS: Record<
  FitmentStatus,
  { badge: string; message: string }
> = {
  confirmed: {
    badge: "확인됨",
    message:
      "차량 기준 추천 규격입니다. 주문 전 실제 장착 배터리 사진 확인을 권장합니다.",
  },
  needs_photo_check: {
    badge: "사진 확인 권장",
    message:
      "차량 정보만으로 확정이 어려워 사진 확인을 권장합니다.",
  },
  needs_customer_confirm: {
    badge: "고객 확인 필요",
    message:
      "고객님이 입력한 차량 정보 기준으로 확인이 필요합니다.",
  },
  unknown: {
    badge: "규격 확인 필요",
    message: "차량 정보가 없어 규격 확인이 필요합니다.",
  },
};

export const USED_BATTERY_RETURN_LABELS: Record<
  UsedBatteryReturnOption,
  { badge: string; short: string }
> = {
  return: { badge: "반납 조건", short: "폐전지 반납 · 회수 필요" },
  no_return: { badge: "미반납", short: "폐전지 회수 없음" },
  undecided: { badge: "선택 필요", short: "반납 여부 미선택" },
};

/** 장바구니 카드 내 폐전지 옵션 설명 (6차) */
export const USED_BATTERY_RETURN_CARD_MESSAGES: Record<
  UsedBatteryReturnOption,
  string
> = {
  return: "폐전지 반납 조건입니다. 기존 배터리 회수가 필요합니다.",
  no_return: "폐전지 미반납 조건입니다. 반납 없이 주문하는 방식입니다.",
  undecided: "폐전지 반납 여부를 선택해 주세요.",
};

export const FULFILLMENT_METHOD_LABELS: Record<
  FulfillmentMethod,
  string
> = {
  delivery: CUSTOMER_FULFILLMENT_LABELS.delivery,
  visit_install: CUSTOMER_FULFILLMENT_LABELS.onsite_install,
  store_install: CUSTOMER_FULFILLMENT_LABELS.store_install,
  store_pickup_self: CUSTOMER_FULFILLMENT_LABELS.store_pickup_self,
  store_pickup: CUSTOMER_FULFILLMENT_LABELS.store_pickup_self,
  undecided: "수령 방식 미선택",
};

export const INSTALL_METHOD_LABELS: Record<InstallMethod, string> = {
  self: "직접 교체",
  store_install: "매장 장착",
  visit_install: "출장 교체",
  undecided: "설치 방식 미선택",
};

export const CART_NEEDS_REVIEW_COPY = {
  title: "주문 전 확인이 필요한 항목이 있습니다",
  body: "배터리는 차량 규격과 단자 방향이 맞지 않으면 장착이 어려울 수 있습니다.",
  triggers: [
    "차량 정보 없음",
    "단자 방향 불명확(unknown)",
    "fitmentStatus가 confirmed가 아님",
    "폐전지 반납 여부 undecided",
    "수령 방식 undecided",
  ],
} as const;

export const CART_USED_BATTERY_BOX_COPY = {
  title: "폐전지 반납 안내",
  body: "폐전지 반납 조건 상품은 기존 배터리 회수가 필요합니다. 반납이 어려운 경우 미반납 조건으로 변경해 주세요.",
  linkLabel: "폐전지 반납 안내 보기",
  href: CUSTOMER_CENTER_USED_BATTERY,
} as const;

export const CART_ORDER_CHECKLIST = [
  "차량명·연식(세대) 확인",
  "배터리 규격 확인",
  "단자 방향(L/R) 확인",
  "폐전지 반납 여부 확인",
  "수령·설치 방식 확인",
  "배송지·연락처 확인",
] as const;

/** confirmed가 아닐 때 주문하기 버튼 정책 (5차 설계) */
export const CART_CHECKOUT_POLICY = {
  title: "주문하기 버튼 정책 (6차 구현 기준)",
  recommendation: "soft_block_with_ack",
  rules: [
    {
      condition: "hasNeedsReviewItem && !allRequiredChecksAcknowledged",
      action: "disable_primary_cta",
      note: "주문하기 비활성. 사진 확인·고객센터·항목 수정 CTA 노출.",
    },
    {
      condition: "hasNeedsReviewItem && userAcknowledgedRisk",
      action: "allow_with_warning_modal",
      note: "경고 모달 1회 확인 후 진행 가능(비권장). 로그·분석용 플래그 저장.",
    },
    {
      condition: "allItemsConfirmed && usedBatteryDecided && fulfillmentDecided",
      action: "enable_checkout",
      note: "주문하기 활성. 6차에서도 결제 PG 전 주문서 작성 단계로만 연결.",
    },
  ],
  rationale:
    "배터리 오주문·폐전지 분쟁을 줄이기 위해 hard allow 없이 soft block을 기본으로 한다.",
} as const;

export const CART_GUEST_FLOW = {
  title: "비회원 장바구니·주문 흐름",
  storage: "localStorage 우선 (키: battery-manager-cart-v1-draft)",
  points: [
    "비회원: 동일 브라우저 localStorage에 CartItem 배열 저장",
    "주문 시 주문번호·비밀번호 발급 안내(기존 고객센터 주문 안내와 연결)",
    "로그인 연동·서버 동기화는 6차 후순위",
    "기기 변경·시크릿 모드 시 장바구니 소실 안내 배너",
  ],
} as const;

export const CART_PRODUCT_PAGE_LINKS = {
  batteryDetail: {
    addToCartPlacement: "규격·가격 블록 하단, 폐전지 옵션 선택 후",
    vehicleInput: "담기 전 차량 선택/입력 모달 또는 인라인 필드 권장",
    usedBatteryPlacement: "가격 옆 탭 또는 라디오(반납/미반납) + 안내 링크",
  },
  vehicleDetail: {
    addToCartPlacement: "추천 배터리 카드 CTA",
    vehicleAutoFill: "CartItem.vehicle에 displayName·generationName·year 자동 주입",
  },
  searchResults: {
    policy: "바로 담기 비활성 또는 2차 확인. 우선 차량/배터리 상세 이동 권장",
  },
  photoCheck: {
    policy:
      "사진 확인 완료 시 fitmentStatus를 confirmed 또는 needs_customer_confirm으로 갱신 가능(6차)",
  },
} as const;

export type CartRiskItem = {
  id: string;
  risk: string;
  mitigations: string[];
};

export const CART_RISK_ITEMS: CartRiskItem[] = [
  {
    id: "terminal-lr",
    risk: "단자 L/R 오주문",
    mitigations: [
      "단자 방향 배지·경고",
      "주문 전 체크리스트",
      "사진 확인 CTA",
      "AGM80L/R 대조 안내",
    ],
  },
  {
    id: "agm-confusion",
    risk: "AGM/일반 배터리 혼동",
    mitigations: ["규격 코드 강조", "확인 필요 배지", "고객센터 문의"],
  },
  {
    id: "used-battery",
    risk: "폐전지 반납 조건 미이해",
    mitigations: [
      "반납/미반납 가격 표시",
      "폐전지 안내 링크",
      "반납 조건 체크(6차)",
      "2차 메시지 템플릿 연결",
    ],
  },
  {
    id: "vehicle-year",
    risk: "차량 연식·세대 오입력",
    mitigations: ["차량명·세대 카드 표시", "needs_customer_confirm"],
  },
  {
    id: "fulfillment-mix",
    risk: "택배 vs 출장 교체 조건 혼동",
    mitigations: ["수령·설치 방식 별도 라벨", "매장 ID 표시"],
  },
  {
    id: "guest-storage",
    risk: "비회원 장바구니 유지",
    mitigations: ["localStorage 안내", "주문 전 데이터 재확인"],
  },
  {
    id: "mobile-options",
    risk: "모바일 옵션 선택 누락",
    mitigations: ["스티키 요약", "undecided 배지", "담기 전 필수 선택"],
  },
  {
    id: "checkout-skip",
    risk: "확인 필요 상태에서 바로 결제",
    mitigations: [
      CART_CHECKOUT_POLICY.recommendation,
      "주문하기 비활성",
      "확인 필요 박스",
    ],
  },
];

export const PHASE_6_SCOPE = [
  "/cart 페이지 생성",
  "localStorage 기반 임시 장바구니 저장",
  "BatteryCartItem 타입 적용 및 CartContext 마이그레이션",
  "상품 담기/삭제/수량 변경",
  "폐전지 반납/미반납 옵션 선택",
  "차량 정보 표시",
  "확인 필요 경고 표시",
  "주문 전 체크리스트 표시",
  "주문하기 → 주문서 작성 단계 또는 준비 중 처리(결제 PG 미연동)",
  "비회원 localStorage 우선, 로그인 동기화 후순위",
] as const;

const now = "2026-05-30T09:00:00.000Z";

/** 설계 미리보기용 더미 아이템 (실제 상품 DB와 무관) */
export const CART_DEMO_ITEMS: BatteryCartItem[] = [
  {
    id: "demo-1",
    productId: "demo-rocket-agm80r",
    productName: "로케트 AGM80R",
    brandName: "로케트",
    batterySpec: "AGM80R",
    terminalDirection: "R",
    quantity: 1,
    basePrice: 189000,
    finalPrice: 179000,
    vehicle: {
      vehicleId: "hyundai-staria-us4",
      displayName: "현대 스타리아",
      generationName: "US4",
      year: "2021–",
      fuelType: "디젤",
    },
    recommendationStatus: "vehicle_recommended",
    fitmentStatus: "confirmed",
    usedBatteryReturn: {
      option: "return",
      priceImpact: 0,
      guideRequired: true,
      guideAcknowledged: true,
    },
    fulfillment: { method: "delivery" },
    install: { method: "self" },
    preOrderCheckRequired: false,
    photoCheckRequired: false,
    warnings: [],
    source: "vehicle_detail",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "demo-2",
    productId: "demo-varta-agm70l",
    productName: "바르타 AGM70L",
    brandName: "바르타",
    batterySpec: "AGM70L",
    terminalDirection: "L",
    quantity: 1,
    basePrice: 165000,
    vehicle: {
      displayName: "기아 쏘렌토 MQ4",
      generationName: "MQ4",
      year: "2020",
    },
    recommendationStatus: "customer_selected",
    fitmentStatus: "needs_photo_check",
    usedBatteryReturn: {
      option: "undecided",
      guideRequired: true,
    },
    fulfillment: { method: "undecided" },
    install: { method: "undecided" },
    preOrderCheckRequired: true,
    photoCheckRequired: true,
    warnings: [
      "단자 방향은 기존 배터리 사진으로 재확인해 주세요.",
      "폐전지 반납 여부를 선택해 주세요.",
    ],
    source: "battery_detail",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "demo-3",
    productId: "demo-delta-agm80l",
    productName: "델타 AGM80L",
    brandName: "델타",
    batterySpec: "AGM80L",
    terminalDirection: "unknown",
    quantity: 1,
    basePrice: 172000,
    finalPrice: 182000,
    fitmentStatus: "unknown",
    usedBatteryReturn: {
      option: "no_return",
      priceImpact: 25000,
      guideRequired: false,
    },
    fulfillment: { method: "store_pickup", storeId: "deokcheon" },
    install: { method: "store_install" },
    preOrderCheckRequired: true,
    photoCheckRequired: false,
    warnings: [
      "차량 정보가 없습니다. 규격·단자 방향을 확인해 주세요.",
    ],
    customerMemo: "오후 3시 이후 매장 방문 예정",
    source: "search",
    createdAt: now,
    updatedAt: now,
  },
];

export function summarizeCartDemo(items: BatteryCartItem[]): BatteryCartSummary {
  const subtotal = items.reduce((s, i) => {
    const unit = i.finalPrice ?? i.basePrice;
    if (unit == null || Number.isNaN(unit)) return s;
    return s + unit * i.quantity;
  }, 0);
  const usedBatteryReturnAdjustment = items.reduce(
    (s, i) => s + (i.usedBatteryReturn.priceImpact ?? 0) * i.quantity,
    0,
  );
  const hasNeedsReviewItem = items.some(
    (i) =>
      i.fitmentStatus !== "confirmed" ||
      i.usedBatteryReturn.option === "undecided" ||
      i.fulfillment.method === "undecided" ||
      i.terminalDirection === "unknown" ||
      !i.vehicle?.displayName,
  );
  return {
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    usedBatteryReturnAdjustment,
    estimatedTotal: subtotal,
    hasNeedsReviewItem,
    hasNoReturnItem: items.some((i) => i.usedBatteryReturn.option === "no_return"),
    hasUndecidedUsedBattery: items.some(
      (i) => i.usedBatteryReturn.option === "undecided",
    ),
    hasUndecidedFulfillment: items.some(
      (i) => i.fulfillment.method === "undecided",
    ),
  };
}

export const CART_DESIGN_LINKS = {
  hub: CUSTOMER_CENTER_HUB,
  orderGuide: CUSTOMER_CENTER_ORDER_GUIDE,
  usedBattery: CUSTOMER_CENTER_USED_BATTERY,
  orderChecklist: "/order-checklist",
  photoCheck: "/photo-check",
  existingShopCart: "/cart",
  doc: CART_DESIGN_DOC_PATH,
} as const;
