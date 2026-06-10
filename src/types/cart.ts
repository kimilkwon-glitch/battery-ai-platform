/**
 * Battery Manager 장바구니 — 5차 설계 초안 (6차 구현 시 검토)
 *
 * @remarks
 * - `CartContext`의 기존 `CartItem`(productId + qty)과 별개입니다. 6차에서 마이그레이션 예정.
 * - DB·결제·재고와 직접 연결하지 않습니다.
 */

export type TerminalDirection = "L" | "R" | "unknown";

export type FitmentStatus =
  | "confirmed"
  | "needs_photo_check"
  | "needs_customer_confirm"
  | "unknown";

export type UsedBatteryReturnOption = "return" | "no_return" | "undecided";

export type FulfillmentMethod =
  | "delivery"
  | "visit_install"
  | "store_install"
  | "store_pickup_self"
  /** @deprecated — store_pickup_self 로 통합 */
  | "store_pickup"
  | "undecided";

export type InstallMethod =
  | "self"
  | "store_install"
  | "visit_install"
  | "undecided";

export type StoreLocationId = "deokcheon" | "hakjang";

export type RecommendationStatus =
  | "vehicle_recommended"
  | "spec_matched"
  | "customer_selected"
  | "unverified";

/** 장바구니 라인 아이템 (설계 초안 — 6차 `BatteryCartItem` 구현 기준) */
export type BatteryCartItem = {
  id: string;
  productId: string;
  productName: string;
  /** solite | rocket 등 — 이미지·브랜드 표시 fallback */
  brandId?: string;
  brandName?: string;
  batterySpec: string;
  terminalDirection?: TerminalDirection;
  quantity: number;
  basePrice?: number;
  imageSrc?: string | null;
  /** 폐전지 반납/미반납·프로모션 반영 후 (6차 계산) */
  finalPrice?: number;

  vehicle?: {
    vehicleId?: string;
    displayName?: string;
    generationName?: string;
    year?: string;
    fuelType?: string;
    isg?: boolean;
  };

  recommendationStatus?: RecommendationStatus;
  fitmentStatus: FitmentStatus;

  usedBatteryReturn: {
    option: UsedBatteryReturnOption;
    /** 반납/미반납 가격 차이 (원, 설계용) */
    priceImpact?: number;
    guideRequired: boolean;
    /** 반납 조건 안내 페이지 확인 여부 (6차) */
    guideAcknowledged?: boolean;
  };

  fulfillment: {
    method: FulfillmentMethod;
    storeId?: StoreLocationId;
    requestedRegion?: string;
  };

  install: {
    method: InstallMethod;
  };

  /** 주문 전 확인·사진 확인·고객 메모 */
  preOrderCheckRequired: boolean;
  photoCheckRequired: boolean;
  customerMemo?: string;

  warnings: string[];

  /** 담기 경로 (분석·UX 개선용) */
  source?: "vehicle_detail" | "battery_detail" | "search" | "manual";

  createdAt: string;
  updatedAt: string;
};

/** 장바구니 상단 요약 (설계 초안) */
export type BatteryCartSummary = {
  itemCount: number;
  subtotal: number;
  usedBatteryReturnAdjustment: number;
  estimatedTotal: number;
  hasNeedsReviewItem: boolean;
  hasNoReturnItem: boolean;
  hasUndecidedUsedBattery: boolean;
  hasUndecidedFulfillment: boolean;
};

/** localStorage 장바구니 키 (6차) */
export const CART_STORAGE_KEY = "battery-manager-cart-v1" as const;

/** @deprecated — 초기 설계안 키 */
export const CART_STORAGE_KEY_DRAFT = "battery-manager-cart-v1-draft" as const;

/** @deprecated 6차 전 — 기존 쇼핑몰 스텁과 구분용 별칭 */
export type CartItem = BatteryCartItem;

/** @deprecated 6차 전 — 기존 쇼핑몰 스텁과 구분용 별칭 */
export type CartSummary = BatteryCartSummary;
