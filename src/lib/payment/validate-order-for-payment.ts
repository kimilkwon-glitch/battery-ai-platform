import { computeFinalFromStoredPromotions } from "@/lib/promotion/promotion-order-service";
import type { CommerceOrderRecord } from "@/types/commerce-payment";
import type { OrderRequestFulfillmentMethod } from "@/types/order-request";

const VALID_FULFILLMENT: OrderRequestFulfillmentMethod[] = [
  "delivery",
  "visit_install",
  "store_install",
  "store_pickup_self",
];

export type OrderPaymentValidation =
  | {
      ok: true;
      finalAmount: number;
      priceLines: CommerceOrderRecord["priceLines"];
      internetPrice: number | null;
      onsitePrice: number | null;
      deliveryFee: number;
      storeInstallDiscount: number;
      batteryReturnFee: number;
      promotionDiscountTotal: number;
      appliedPromotions: CommerceOrderRecord["appliedPromotions"];
    }
  | { ok: false; message: string; errors?: string[] };

export function validateOrderForPayment(order: CommerceOrderRecord): OrderPaymentValidation {
  const errors: string[] = [];

  if (!order.customerName?.trim()) errors.push("고객명이 없습니다.");
  if (!order.customerPhone?.replace(/\D/g, "").trim()) errors.push("연락처가 없습니다.");

  if (!VALID_FULFILLMENT.includes(order.fulfillmentType as OrderRequestFulfillmentMethod)) {
    errors.push("수령/장착 방식이 올바르지 않습니다.");
  }

  if (!order.itemsJson?.length) {
    errors.push("주문 상품이 없습니다.");
  }

  if (order.internetPrice == null && order.onsitePrice == null) {
    errors.push("상품 가격 정보가 없습니다.");
  }

  if (errors.length > 0) {
    return { ok: false, message: errors[0]!, errors };
  }

  const applied = order.appliedPromotions ?? [];
  const amounts = computeFinalFromStoredPromotions(
    order.itemsJson,
    order.fulfillmentType,
    order.returnBatteryOption,
    applied,
  );

  if (amounts.finalAmount == null) {
    return {
      ok: false,
      message: "결제 금액을 계산할 수 없습니다. 수령/장착 방식을 확인해 주세요.",
    };
  }

  if (amounts.internetPrice == null && amounts.onsitePrice == null) {
    return {
      ok: false,
      message: "상품 가격을 확인할 수 없습니다.",
    };
  }

  const storedDiscount = order.promotionDiscountTotal ?? 0;
  if (Math.abs(storedDiscount - amounts.promotionDiscountTotal) >= 1) {
    return {
      ok: false,
      message: "혜택 할인 정보가 일치하지 않습니다. 주문서를 다시 확인해 주세요.",
    };
  }

  return {
    ok: true,
    finalAmount: amounts.finalAmount,
    priceLines: amounts.priceLines,
    internetPrice: amounts.internetPrice,
    onsitePrice: amounts.onsitePrice,
    deliveryFee: amounts.deliveryFee,
    storeInstallDiscount: amounts.storeInstallDiscount,
    batteryReturnFee: amounts.batteryReturnFee,
    promotionDiscountTotal: amounts.promotionDiscountTotal,
    appliedPromotions: amounts.appliedPromotions,
  };
}
