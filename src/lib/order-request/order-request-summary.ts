import { checkoutItemNeedsReview } from "@/lib/checkout/checkout-review";
import type { BatteryCartItem } from "@/types/cart";
import type {
  OrderRequest,
  OrderRequestFulfillment,
  OrderRequestStaffSummary,
  OrderRequestUsedBatteryOption,
  OrderRequestVehicle,
} from "@/types/order-request";

const USED_BATTERY_LABELS: Record<OrderRequestUsedBatteryOption, string> = {
  return: "반납",
  no_return: "미반납",
  unknown: "상담 시 확인",
};

const FULFILLMENT_LABELS: Record<OrderRequestFulfillment["method"], string> = {
  delivery: "택배수령",
  store_pickup: "매장방문",
  visit_install: "출장상담",
  undecided: "상담 시 정리",
};

const STORE_LABELS = {
  deokcheon: "덕천점",
  hakjang: "학장점",
  undecided: "매장 미정",
} as const;

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return "***";
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-****-${digits.slice(7)}`;
  }
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
}

export function buildStaffSummary(params: {
  items: BatteryCartItem[];
  customerName: string;
  customerPhone: string;
  vehicle?: OrderRequestVehicle;
  usedBatteryReturnOption: OrderRequestUsedBatteryOption;
  fulfillment: OrderRequestFulfillment;
  memo?: string;
}): OrderRequestStaffSummary {
  const specs = [...new Set(params.items.map((i) => i.batterySpec).filter(Boolean))];
  const vehicles = params.items
    .map((i) => i.vehicle?.displayName?.trim() || i.customerMemo?.trim())
    .filter(Boolean) as string[];
  const vehicleName =
    params.vehicle?.name?.trim() ||
    vehicles[0] ||
    "(차량 정보 미입력)";
  const vehicleLine = [
    vehicleName,
    params.vehicle?.year,
    params.vehicle?.fuelType,
  ]
    .filter(Boolean)
    .join(" · ");

  const reviewFlags: string[] = [];
  const hasVehicleInfo =
    Boolean(params.vehicle?.name?.trim()) || vehicles.length > 0;
  if (!hasVehicleInfo) {
    reviewFlags.push("차량 정보 미입력");
  }
  for (const item of params.items) {
    if (checkoutItemNeedsReview(item)) {
      if (item.terminalDirection === "unknown" || !item.terminalDirection) {
        if (!reviewFlags.includes("단자 방향 확인 필요")) {
          reviewFlags.push("단자 방향 확인 필요");
        }
      }
      if (item.fitmentStatus === "needs_photo_check") {
        if (!reviewFlags.includes("배터리 규격 사진 확인 필요")) {
          reviewFlags.push("배터리 규격 사진 확인 필요");
        }
      }
    }
  }
  if (params.usedBatteryReturnOption === "unknown") {
    reviewFlags.push("폐전지 반납 — 상담 시 확인");
  }
  if (params.fulfillment.method === "visit_install" && !params.fulfillment.region?.trim()) {
    reviewFlags.push("출장 가능 지역 확인 필요");
  }
  if (params.fulfillment.method === "undecided") {
    reviewFlags.push("수령/설치 방식 미정");
  }
  if (params.vehicle?.photoCheckNeeded) {
    if (!reviewFlags.includes("배터리 규격 사진 확인 필요")) {
      reviewFlags.push("배터리 규격 사진 확인 필요");
    }
  }

  let storeOrRegionLine: string | undefined;
  if (params.fulfillment.method === "store_pickup" && params.fulfillment.storeId) {
    storeOrRegionLine = STORE_LABELS[params.fulfillment.storeId] ?? "매장 미정";
  }
  if (params.fulfillment.method === "visit_install") {
    const parts = [params.fulfillment.region, params.fulfillment.preferredTime].filter(
      Boolean,
    );
    if (parts.length) storeOrRegionLine = parts.join(" · ");
  }

  return {
    customerLine: `${params.customerName} / ${params.customerPhone}`,
    vehicleLine: vehicleLine || "(차량 정보 미입력)",
    batteryLine: specs.length ? specs.join(", ") : "규격 확인 필요",
    usedBatteryLine: USED_BATTERY_LABELS[params.usedBatteryReturnOption],
    fulfillmentLine: FULFILLMENT_LABELS[params.fulfillment.method],
    storeOrRegionLine,
    reviewFlags,
    customerMemo: params.memo?.trim() || undefined,
  };
}

export function buildOrderRequestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `or-${crypto.randomUUID()}`;
  }
  return `or-${Date.now()}`;
}
