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
  const phoneDigits = fulfillment.recipientPhone?.replace(/\D/g, "") ?? "";
  return Boolean(
    fulfillment.recipientName?.trim() &&
      phoneDigits.length >= 9 &&
      fulfillment.postalCode?.trim() &&
      fulfillment.address1?.trim() &&
      fulfillment.address2?.trim(),
  );
}

export function checkoutContactFromFulfillment(
  fulfillment: OrderRequestFulfillment,
  customer: { name: string; phone: string },
): { name: string; phone: string } {
  if (fulfillment.method === "delivery" || fulfillment.method === "visit_install") {
    return {
      name: fulfillment.recipientName?.trim() ?? "",
      phone: fulfillment.recipientPhone?.trim() ?? "",
    };
  }
  return { name: customer.name.trim(), phone: customer.phone.trim() };
}

export function checkoutContactValid(
  fulfillment: OrderRequestFulfillment,
  customer: { name: string; phone: string },
): boolean {
  const { name, phone } = checkoutContactFromFulfillment(fulfillment, customer);
  const phoneDigits = phone.replace(/\D/g, "");
  return Boolean(name && phoneDigits.length >= 9);
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

export function checkoutFulfillmentStepValid(
  fulfillment: OrderRequestFulfillment,
  customer: { name: string; phone: string },
  vehicle: { name?: string },
): boolean {
  if (!checkoutContactValid(fulfillment, customer)) return false;
  if (!fulfillmentAddressValid(fulfillment)) return false;
  if (fulfillment.method === "visit_install" || fulfillment.method === "store_install") {
    return Boolean(vehicle.name?.trim());
  }
  return true;
}
