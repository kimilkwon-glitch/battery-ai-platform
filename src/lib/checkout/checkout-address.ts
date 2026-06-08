import type { OrderRequestFulfillment } from "@/types/order-request";

export function formatDeliveryAddress(fulfillment: OrderRequestFulfillment): string {
  const parts = [
    fulfillment.postalCode?.trim(),
    fulfillment.address1?.trim(),
    fulfillment.address2?.trim(),
  ].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return fulfillment.region?.trim() ?? "";
}

export function deliveryAddressValid(fulfillment: OrderRequestFulfillment): boolean {
  const phoneDigits = fulfillment.recipientPhone?.replace(/\D/g, "") ?? "";
  return Boolean(
    fulfillment.recipientName?.trim() &&
      phoneDigits.length >= 9 &&
      fulfillment.postalCode?.trim() &&
      fulfillment.address1?.trim() &&
      fulfillment.address2?.trim(),
  );
}

export function visitAddressValid(fulfillment: OrderRequestFulfillment): boolean {
  return Boolean(
    fulfillment.postalCode?.trim() &&
      fulfillment.address1?.trim() &&
      fulfillment.address2?.trim(),
  );
}

export function storeSelectionValid(fulfillment: OrderRequestFulfillment): boolean {
  return fulfillment.storeId === "deokcheon" || fulfillment.storeId === "hakjang";
}

export function fulfillmentAddressValid(fulfillment: OrderRequestFulfillment): boolean {
  if (fulfillment.method === "undecided") return false;
  if (fulfillment.method === "delivery") return deliveryAddressValid(fulfillment);
  if (fulfillment.method === "visit_install") return visitAddressValid(fulfillment);
  if (fulfillment.method === "store_install" || fulfillment.method === "store_pickup_self") {
    return storeSelectionValid(fulfillment);
  }
  return true;
}
