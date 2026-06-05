import { computeServerOrderAmount } from "@/lib/payment/compute-order-amount";
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

  const amounts = computeServerOrderAmount(order.itemsJson, order.fulfillmentType);

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

  return {
    ok: true,
    finalAmount: amounts.finalAmount,
    priceLines: amounts.priceLines,
    internetPrice: amounts.internetPrice,
    onsitePrice: amounts.onsitePrice,
    deliveryFee: amounts.deliveryFee,
    storeInstallDiscount: amounts.storeInstallDiscount,
  };
}
