import type { BatteryCartItem } from "@/types/cart";
import type { CheckoutSessionPayload } from "@/types/commerce-payment";
import type { OrderRequestFulfillment, OrderRequestFulfillmentMethod } from "@/types/order-request";

export function fulfillmentFromCartItems(items: BatteryCartItem[]): OrderRequestFulfillment {
  const first = items.find((i) => i.fulfillment.method !== "undecided");
  if (first?.fulfillment.method && first.fulfillment.method !== "undecided") {
    return {
      method: first.fulfillment.method,
      storeId: first.fulfillment.storeId ?? "undecided",
      region: first.fulfillment.requestedRegion,
    };
  }
  return { method: "undecided", storeId: "undecided" };
}

export function cartFulfillmentSignature(items: BatteryCartItem[]): string {
  return items
    .map((i) => `${i.id}:${i.fulfillment.method}:${i.fulfillment.storeId ?? ""}`)
    .join("|");
}

export type FulfillmentMergeReason = "init" | "cart_external_sync";

/**
 * Cart/session의 canonical method를 checkout state에 반영한다.
 * 기존 버그: `{ ...fromCart, ...prev }`에서 prev.method가 "delivery"면 cart 선택을 덮어씀.
 */
export function mergeCheckoutFulfillmentState(
  prev: OrderRequestFulfillment,
  fromCart: OrderRequestFulfillment,
  reason: FulfillmentMergeReason,
): OrderRequestFulfillment {
  const cartMethod = fromCart.method;
  const cartHasMethod = cartMethod !== "undecided";

  if (reason === "init") {
    if (!cartHasMethod) return prev;
    return {
      ...prev,
      method: cartMethod,
      storeId:
        fromCart.storeId && fromCart.storeId !== "undecided"
          ? fromCart.storeId
          : prev.storeId ?? "undecided",
      region: prev.region ?? fromCart.region,
    };
  }

  if (!cartHasMethod) return prev;
  return {
    ...prev,
    method: cartMethod,
    storeId:
      fromCart.storeId && fromCart.storeId !== "undecided" ? fromCart.storeId : prev.storeId,
  };
}

/** 주소·연락처 입력만으로 cart item sync를 트리거하지 않는다 (fulfillment 덮어쓰기 방지). */
export function shouldSyncCartItemsForFulfillmentPatch(
  patch: Partial<OrderRequestFulfillment>,
  current: OrderRequestFulfillment,
): boolean {
  if (patch.method != null && patch.method !== current.method) return true;
  if (patch.storeId != null && patch.storeId !== current.storeId) return true;
  return false;
}

export function checkoutVehicleInfoRequired(method: OrderRequestFulfillmentMethod): boolean {
  return method !== "store_pickup_self" && method !== "undecided";
}

export function checkoutFormPanelsForMethod(method: OrderRequestFulfillmentMethod): {
  deliveryAddress: boolean;
  visitAddress: boolean;
  storePickup: boolean;
  storeInstall: boolean;
  vehicle: boolean;
} {
  return {
    deliveryAddress: method === "delivery",
    visitAddress: method === "visit_install",
    storePickup: method === "store_pickup_self",
    storeInstall: method === "store_install",
    vehicle: checkoutVehicleInfoRequired(method),
  };
}

/** 주문 session / payload — 현재 방식에 필요한 필드만 포함 */
export function buildCheckoutSessionFulfillment(
  f: OrderRequestFulfillment,
): CheckoutSessionPayload["fulfillment"] {
  const storeId =
    f.storeId === "deokcheon" || f.storeId === "hakjang" ? f.storeId : undefined;

  switch (f.method) {
    case "delivery":
      return {
        method: f.method,
        storeId,
        region: f.region,
        preferredTime: f.preferredTime,
        recipientName: f.recipientName,
        recipientPhone: f.recipientPhone,
        postalCode: f.postalCode,
        address1: f.address1,
        address2: f.address2,
        deliveryMessage: f.deliveryMessage,
      };
    case "visit_install":
      return {
        method: f.method,
        storeId,
        region: f.region,
        preferredTime: f.preferredTime,
        recipientName: f.recipientName,
        recipientPhone: f.recipientPhone,
        postalCode: f.postalCode,
        address1: f.address1,
        address2: f.address2,
        visitMessage: f.visitMessage,
      };
    case "store_install":
      return {
        method: f.method,
        storeId,
        preferredTime: f.preferredTime,
        storeMessage: f.storeMessage,
      };
    case "store_pickup_self":
      return {
        method: f.method,
        storeId,
        preferredTime: f.preferredTime,
        storeMessage: f.storeMessage,
      };
    default:
      return { method: f.method, storeId };
  }
}

export function parseFulfillmentMethodFromQuery(
  raw: string | null | undefined,
): OrderRequestFulfillmentMethod | null {
  const v = raw?.trim();
  if (
    v === "delivery" ||
    v === "visit_install" ||
    v === "store_install" ||
    v === "store_pickup_self" ||
    v === "store_pickup"
  ) {
    return v === "store_pickup" ? "store_pickup_self" : v;
  }
  return null;
}
