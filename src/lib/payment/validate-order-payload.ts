import type { CreateOrderRequestBody } from "@/types/commerce-payment";
import type { OrderRequestFulfillmentMethod } from "@/types/order-request";

const VALID_FULFILLMENT: OrderRequestFulfillmentMethod[] = [
  "delivery",
  "visit_install",
  "store_install",
  "store_pickup_self",
];

export function validateCreateOrderBody(
  body: unknown,
): { ok: true; data: CreateOrderRequestBody } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!body || typeof body !== "object") {
    return { ok: false, errors: ["요청 형식이 올바르지 않습니다."] };
  }
  const b = body as Partial<CreateOrderRequestBody>;

  if (!Array.isArray(b.cartItems) || b.cartItems.length === 0) {
    errors.push("주문 상품이 없습니다.");
  }

  const name = b.customerInfo?.name?.trim();
  const phone = b.customerInfo?.phone?.replace(/\D/g, "");
  if (!name) errors.push("고객명을 입력해 주세요.");
  if (!phone || phone.length < 9) errors.push("연락처를 확인해 주세요.");

  if (!b.fulfillmentType || !VALID_FULFILLMENT.includes(b.fulfillmentType)) {
    errors.push("수령/장착 방식을 선택해 주세요.");
  }

  if (
    !b.returnBatteryOption ||
    !["return", "no_return", "unknown"].includes(b.returnBatteryOption)
  ) {
    errors.push("폐배터리 반납 여부를 선택해 주세요.");
  }

  if (b.fulfillmentType === "delivery" && !b.addressInfo?.deliveryAddress?.trim()) {
    errors.push("배송지 주소를 입력해 주세요.");
  }
  if (b.fulfillmentType === "visit_install" && !b.addressInfo?.visitRegion?.trim()) {
    errors.push("출장 주소 또는 지역을 입력해 주세요.");
  }
  if (
    (b.fulfillmentType === "store_install" || b.fulfillmentType === "store_pickup_self") &&
    b.selectedStore !== "deokcheon" &&
    b.selectedStore !== "hakjang" &&
    b.addressInfo?.storeId !== "deokcheon" &&
    b.addressInfo?.storeId !== "hakjang"
  ) {
    errors.push("방문 지점을 선택해 주세요.");
  }

  if (errors.length > 0) return { ok: false, errors };

  return { ok: true, data: b as CreateOrderRequestBody };
}
