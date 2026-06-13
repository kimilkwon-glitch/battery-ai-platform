import type { OrderRequestFulfillmentMethod } from "@/types/order-request";

export type CheckoutVehicleSectionCopy = {
  titleSuffix: string;
  /** 비어 있을 때 제목 아래 보조문구. 없으면 null */
  emptyHint: string | null;
};

export function checkoutVehicleSectionCopy(
  method: OrderRequestFulfillmentMethod,
): CheckoutVehicleSectionCopy {
  if (method === "visit_install" || method === "store_install") {
    return {
      titleSuffix: "교체 준비용",
      emptyHint: "원활한 교체 준비를 위해 차량 정보를 입력해 주세요.",
    };
  }
  return {
    titleSuffix: "공구확인용",
    emptyHint: null,
  };
}

export type CheckoutRequestMessageCopy = {
  label: string;
  field: "deliveryMessage" | "visitMessage" | "storeMessage";
};

export function checkoutRequestMessageCopy(
  method: OrderRequestFulfillmentMethod,
): CheckoutRequestMessageCopy | null {
  switch (method) {
    case "delivery":
      return { label: "배송메시지 (선택)", field: "deliveryMessage" };
    case "visit_install":
      return { label: "출장 요청사항 (선택)", field: "visitMessage" };
    case "store_install":
    case "store_pickup_self":
      return { label: "방문 요청사항 (선택)", field: "storeMessage" };
    default:
      return null;
  }
}

/** 금지 표현 — copy 회귀 검증용 */
export const CHECKOUT_VEHICLE_FORBIDDEN_PHRASES = [
  "배터리 규격 확인용",
  "작업 난이도 확인",
  "공구와 작업 난이도 확인",
] as const;

export const CHECKOUT_REQUEST_FORBIDDEN_PLACEHOLDERS = [
  "부재 시 문 앞에 놓아주세요",
  "차량정보를 모르시면",
  "방문 전 연락 부탁드립니다",
  "차량정보는 현장에서 확인",
  "지하주차장",
] as const;
