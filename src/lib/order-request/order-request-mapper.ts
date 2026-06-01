import { REVIEW_FLAG_LABELS } from "@/lib/order-request/order-request-admin-constants";
import { buildStaffSummary } from "@/lib/order-request/order-request-summary";
import type {
  AdminOrderRequestListItem,
  OrderRequestAdminStatus,
  OrderRequestRecord,
  OrderRequestWorkflowStatus,
  PersistedOrderRequest,
} from "@/types/order-request";

export function workflowToAdminStatus(
  status: OrderRequestWorkflowStatus,
): OrderRequestAdminStatus {
  switch (status) {
    case "pending_review":
      return "pending_review";
    case "contacted":
      return "contacted";
    case "waiting_customer":
    case "quoted":
      return "contacted";
    case "closed":
      return "closed";
    case "canceled":
      return "canceled";
    default:
      return "pending_review";
  }
}

export function adminStatusToWorkflow(
  status: OrderRequestAdminStatus,
): OrderRequestWorkflowStatus {
  switch (status) {
    case "prepared":
    case "pending_review":
      return "pending_review";
    case "contacted":
      return "contacted";
    case "closed":
      return "closed";
    case "canceled":
      return "canceled";
    default:
      return "pending_review";
  }
}

export function persistedToOrderRequestRecord(
  p: PersistedOrderRequest,
): OrderRequestRecord {
  const fulfillment = {
    method: p.fulfillmentMethod,
    storeId: p.storeId,
    region: p.requestedRegion,
    preferredTime: p.preferredTime,
  };

  const staffSummary = buildStaffSummary({
    items: p.itemsJson,
    customerName: p.customerName || "(이름 미입력)",
    customerPhone: p.customerPhone,
    vehicle: {
      name: p.vehicleName,
      year: p.vehicleYear,
      fuelType: p.vehicleFuelType,
      currentBatterySpec: p.currentBatterySpec,
    },
    usedBatteryReturnOption: p.usedBatteryReturnOption,
    fulfillment,
    memo: p.memo,
  });

  const flagLabels = p.reviewFlags.map((f) => REVIEW_FLAG_LABELS[f] ?? f);

  return {
    id: p.id,
    requestNumber: p.requestNumber,
    workflowStatus: p.status,
    reviewFlagKeys: p.reviewFlags,
    items: p.itemsJson,
    customer: {
      name: p.customerName,
      phone: p.customerPhone,
      email: p.customerEmail,
    },
    vehicle: p.vehicleName
      ? {
          name: p.vehicleName,
          year: p.vehicleYear,
          fuelType: p.vehicleFuelType,
          currentBatterySpec: p.currentBatterySpec,
        }
      : undefined,
    usedBatteryReturnOption: p.usedBatteryReturnOption,
    fulfillment,
    memo: p.memo,
    confirmations: p.confirmationsJson ?? {
      fitmentNeedsFinalCheck: true,
      usedBatteryPriceMayDiffer: true,
      bankTransferDeadlineAware: true,
      orderWillBeGuidedSeparately: true,
    },
    staffSummary: { ...staffSummary, reviewFlags: flagLabels },
    status: "prepared",
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    adminStatus: workflowToAdminStatus(p.status),
    staffNotes: p.internalMemo,
  };
}

/** 목록 API DTO → 리스트 행 (상세는 선택 시 로드) */
export function listItemToOrderRequestRecord(
  item: AdminOrderRequestListItem,
): OrderRequestRecord {
  const fulfillment = { method: item.fulfillmentMethod };
  const flagLabels = item.reviewFlags.map((f) => REVIEW_FLAG_LABELS[f] ?? f);
  return {
    id: item.id,
    requestNumber: item.requestNumber,
    workflowStatus: item.status,
    reviewFlagKeys: item.reviewFlags,
    items: [],
    customer: {
      name: item.customerName,
      phone: item.customerPhoneMasked,
    },
    usedBatteryReturnOption: item.usedBatteryReturnOption,
    fulfillment,
    confirmations: {
      fitmentNeedsFinalCheck: true,
      usedBatteryPriceMayDiffer: true,
      bankTransferDeadlineAware: true,
      orderWillBeGuidedSeparately: true,
    },
    staffSummary: {
      customerLine: item.customerName,
      vehicleLine: item.vehicleSummary,
      batteryLine: item.batterySpecSummary,
      usedBatteryLine: item.usedBatteryReturnOption,
      fulfillmentLine: item.fulfillmentMethod,
      reviewFlags: flagLabels,
    },
    status: "prepared",
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
    adminStatus: workflowToAdminStatus(item.status),
    staffNotes: item.hasInternalMemo ? "(메모 있음)" : undefined,
  };
}
