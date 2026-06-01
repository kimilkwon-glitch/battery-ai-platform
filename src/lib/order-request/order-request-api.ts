/**
 * 주문 요청 API — 검증·매핑 (10~11차)
 */

import type { BatteryCartItem } from "@/types/cart";
import type {
  CreateOrderRequestInput,
  OrderRequestReviewFlag,
  PersistedOrderRequest,
} from "@/types/order-request";
import { maskPhone } from "@/lib/order-request/order-request-summary";
import {
  PHONE_RE,
  validateCreateOrderRequestInput,
  type ValidationResult,
} from "@/lib/order-request/order-request-validation";

export { maskPhone, validateCreateOrderRequestInput, PHONE_RE, type ValidationResult };

export function computeReviewFlags(input: {
  items: BatteryCartItem[];
  vehicleName?: string;
  usedBatteryReturnOption: string;
  fulfillmentMethod: string;
  phone: string;
  photoCheckNeeded?: boolean;
  region?: string;
}): OrderRequestReviewFlag[] {
  const flags: OrderRequestReviewFlag[] = [];
  if (!input.vehicleName?.trim()) flags.push("vehicle_info_missing");
  if (input.items.some((i) => !i.batterySpec || i.batterySpec === "규격 확인 필요")) {
    flags.push("battery_spec_unknown");
  }
  if (
    input.items.some(
      (i) => i.terminalDirection === "unknown" || !i.terminalDirection,
    )
  ) {
    flags.push("terminal_direction_unknown");
  }
  if (input.usedBatteryReturnOption === "unknown") {
    flags.push("used_battery_return_undecided");
  }
  if (input.fulfillmentMethod === "visit_install" && !input.region?.trim()) {
    flags.push("visit_region_check_needed");
  }
  if (
    input.photoCheckNeeded ||
    input.items.some((i) => i.fitmentStatus === "needs_photo_check")
  ) {
    flags.push("photo_check_needed");
  }
  if (!PHONE_RE.test(input.phone.replace(/\s/g, ""))) {
    flags.push("phone_check_needed");
  }
  return flags;
}

export function toPersistedOrderRequest(
  input: CreateOrderRequestInput,
  id: string,
  requestNumber: string,
): PersistedOrderRequest {
  const now = new Date().toISOString();
  const combinedMemo = [input.memo, input.customerOrderMemo]
    .filter(Boolean)
    .join("\n")
    .trim();
  const flags = computeReviewFlags({
    items: input.items,
    vehicleName: input.vehicle?.name,
    usedBatteryReturnOption: input.usedBatteryReturnOption,
    fulfillmentMethod: input.fulfillment.method,
    phone: input.customerPhone,
    photoCheckNeeded: input.vehicle?.photoCheckNeeded,
    region: input.fulfillment.region,
  });

  return {
    id,
    requestNumber,
    status: "pending_review",
    customerName: input.customerName?.trim() || "",
    customerPhone: input.customerPhone.trim(),
    customerEmail: input.customerEmail?.trim(),
    vehicleName: input.vehicle?.name,
    vehicleYear: input.vehicle?.year,
    vehicleFuelType: input.vehicle?.fuelType,
    currentBatterySpec: input.vehicle?.currentBatterySpec,
    batterySpecSummary: [
      ...new Set(input.items.map((i) => i.batterySpec).filter(Boolean)),
    ].join(", "),
    terminalDirection: input.items[0]?.terminalDirection,
    usedBatteryReturnOption: input.usedBatteryReturnOption,
    fulfillmentMethod: input.fulfillment.method,
    storeId: input.fulfillment.storeId,
    requestedRegion: input.fulfillment.region,
    preferredTime: input.fulfillment.preferredTime,
    itemsJson: input.items,
    memo: combinedMemo || undefined,
    reviewFlags: flags,
    confirmationsJson: input.confirmations,
    source: "web_form",
    createdAt: now,
    updatedAt: now,
  };
}
