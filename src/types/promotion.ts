/** 쿠폰/혜택(프로모션) 타입 */

export type PromotionStatus = "active" | "inactive" | "scheduled" | "expired";
export type PromotionType = "automatic" | "coupon_code";
export type PromotionDiscountType = "percent" | "fixed_amount";

export type PromotionRecord = {
  id: string;
  title: string;
  description: string;
  status: PromotionStatus;
  type: PromotionType;
  discountType: PromotionDiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number | null;
  startsAt: string | null;
  endsAt: string | null;
  usageLimitTotal: number | null;
  usageLimitPerMember: number | null;
  firstOrderOnly: boolean;
  newMemberOnly: boolean;
  memberOnly: boolean;
  allowedFulfillmentTypes: string[] | null;
  allowedBatterySpecs: string[] | null;
  allowedBrands: string[] | null;
  excludedBatterySpecs: string[] | null;
  excludedBrands: string[] | null;
  stackable: boolean;
  priority: number;
  code: string | null;
  imageUrl: string | null;
  bannerImageUrl: string | null;
  badgeText: string | null;
  showOnMain: boolean;
  showOnBenefitsPage: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PromotionUsageRecord = {
  id: string;
  promotionId: string;
  memberId: string | null;
  orderId: string;
  discountAmount: number;
  usedAt: string;
  couponCode: string | null;
};

export type AppliedPromotion = {
  promotionId: string;
  title: string;
  code: string | null;
  discountType: PromotionDiscountType;
  discountValue: number;
  discountAmount: number;
  reason: string;
};

export type PromotionEvaluationContext = {
  memberId?: string | null;
  couponCode?: string | null;
  items: import("@/types/cart").BatteryCartItem[];
  fulfillmentType: import("@/types/order-request").OrderRequestFulfillmentMethod;
  returnBatteryOption: import("@/types/order-request").OrderRequestUsedBatteryOption;
  productSubtotal: number;
  batteryReturnFee: number;
  /** 결제 완료 주문 수 (첫 주문 판별) */
  completedOrderCount?: number;
  /** 회원 가입일 ISO (신규 회원 판별) */
  memberCreatedAt?: string | null;
  excludeOrderId?: string;
};

export type PromotionEvaluationResult = {
  appliedPromotions: AppliedPromotion[];
  promotionDiscountTotal: number;
  finalAmount: number;
  eligibleAutomatic: Array<{ promotion: PromotionRecord; reason: string }>;
  couponError?: string;
};

export type PublicPromotionCard = {
  id: string;
  title: string;
  description: string;
  type: PromotionType;
  discountType: PromotionDiscountType;
  discountValue: number;
  badgeText: string | null;
  imageUrl: string | null;
  bannerImageUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  code: string | null;
  showOnMain: boolean;
  showOnBenefitsPage: boolean;
  displayStatus: "active" | "scheduled" | "expired";
};

export type PromotionUpsertInput = Partial<Omit<PromotionRecord, "id" | "createdAt" | "updatedAt">>;

export type PromotionCreateInput = PromotionUpsertInput &
  Pick<PromotionRecord, "title" | "type" | "discountType" | "discountValue">;
