import type { BatteryCartItem } from "@/types/cart";

/** 상담 주문 요청 — 폐전지 (폼 단일 선택) */
export type OrderRequestUsedBatteryOption = "return" | "no_return" | "unknown";

export type OrderRequestFulfillmentMethod =
  | "delivery"
  | "store_pickup"
  | "visit_install"
  | "undecided";

export type OrderRequestStoreId = "deokcheon" | "hakjang" | "undecided";

export type OrderRequestStatus = "draft" | "prepared";

/** 관리자 워크플로 상태 (9차 — localStorage) */
export type OrderRequestAdminStatus =
  | "prepared"
  | "pending_review"
  | "contacted"
  | "closed"
  | "canceled";

export type OrderRequestCustomer = {
  name: string;
  phone: string;
  email?: string;
  orderMemo?: string;
};

export type OrderRequestVehicle = {
  name?: string;
  year?: string;
  fuelType?: string;
  currentBatterySpec?: string;
  photoCheckNeeded?: boolean;
};

export type OrderRequestFulfillment = {
  method: OrderRequestFulfillmentMethod;
  storeId?: OrderRequestStoreId;
  region?: string;
  preferredTime?: string;
};

export type OrderRequestConfirmations = {
  fitmentNeedsFinalCheck: boolean;
  usedBatteryPriceMayDiffer: boolean;
  bankTransferDeadlineAware: boolean;
  orderWillBeGuidedSeparately: boolean;
};

/** 직원 확인용 요약 */
export type OrderRequestStaffSummary = {
  customerLine: string;
  vehicleLine: string;
  batteryLine: string;
  usedBatteryLine: string;
  fulfillmentLine: string;
  storeOrRegionLine?: string;
  reviewFlags: string[];
  customerMemo?: string;
};

/** 상담 주문 요청 (8차 — localStorage, API 연동 전) */
export type OrderRequest = {
  id: string;
  items: BatteryCartItem[];
  customer: OrderRequestCustomer;
  vehicle?: OrderRequestVehicle;
  usedBatteryReturnOption: OrderRequestUsedBatteryOption;
  fulfillment: OrderRequestFulfillment;
  memo?: string;
  confirmations: OrderRequestConfirmations;
  staffSummary: OrderRequestStaffSummary;
  status: OrderRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export const ORDER_REQUEST_DRAFT_KEY =
  "battery-manager-order-request-draft-v1" as const;
export const ORDER_REQUEST_LAST_KEY =
  "battery-manager-last-order-request-v1" as const;

/** 관리자 목록용 (동일 브라우저 localStorage) */
export const ORDER_REQUESTS_LIST_KEY =
  "battery-manager-order-requests-v1" as const;

/** 관리자 메타 (상태·직원 메모) */
export type OrderRequestAdminMeta = {
  adminStatus: OrderRequestAdminStatus;
  staffNotes?: string;
  updatedAt: string;
};

// --- 10차 API/DB 설계 확장 (8~9차 클라이언트 타입과 병행) ---

/** 운영 DB·API 워크플로 상태 */
export type OrderRequestWorkflowStatus =
  | "pending_review"
  | "contacted"
  | "waiting_customer"
  | "quoted"
  | "closed"
  | "canceled";

export type OrderRequestReviewFlag =
  | "vehicle_info_missing"
  | "terminal_direction_unknown"
  | "battery_spec_unknown"
  | "used_battery_return_undecided"
  | "visit_region_check_needed"
  | "photo_check_needed"
  | "phone_check_needed";

/** API·DB 워크플로 상태 (8차 draft/prepared OrderRequestStatus와 구분) */
export type OrderRequestApiStatus = OrderRequestWorkflowStatus;

/** 저장·관리 화면용 레코드 */
export type OrderRequestRecord = OrderRequest &
  OrderRequestAdminMeta & {
    /** 11차 API 접수번호 */
    requestNumber?: string;
    /** 11차 API 워크플로 (상세 PATCH용) */
    workflowStatus?: OrderRequestWorkflowStatus;
    /** API review_flags (12차) */
    reviewFlagKeys?: OrderRequestReviewFlag[];
  };

/** POST /api/order-requests */
export type CreateOrderRequestInput = {
  customerName?: string;
  customerPhone: string;
  customerEmail?: string;
  customerOrderMemo?: string;
  vehicle?: OrderRequestVehicle;
  usedBatteryReturnOption: OrderRequestUsedBatteryOption;
  fulfillment: OrderRequestFulfillment;
  items: BatteryCartItem[];
  memo?: string;
  confirmations: OrderRequestConfirmations;
  /** 스팸 방지 honeypot — 반드시 빈 값 */
  website?: string;
};

/** PATCH /api/admin/order-requests/:id */
export type UpdateOrderRequestInput = {
  status?: OrderRequestWorkflowStatus;
  internalMemo?: string;
  reviewFlags?: OrderRequestReviewFlag[];
  contactedAt?: string | null;
  closedAt?: string | null;
};

/** DB/API 영속 레코드 (11차) */
export type PersistedOrderRequest = {
  id: string;
  requestNumber: string;
  status: OrderRequestWorkflowStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  vehicleName?: string;
  vehicleYear?: string;
  vehicleFuelType?: string;
  currentBatterySpec?: string;
  batterySpecSummary: string;
  terminalDirection?: BatteryCartItem["terminalDirection"];
  usedBatteryReturnOption: OrderRequestUsedBatteryOption;
  fulfillmentMethod: OrderRequestFulfillmentMethod;
  storeId?: OrderRequestStoreId;
  requestedRegion?: string;
  preferredTime?: string;
  itemsJson: BatteryCartItem[];
  memo?: string;
  internalMemo?: string;
  reviewFlags: OrderRequestReviewFlag[];
  confirmationsJson?: OrderRequestConfirmations;
  source: "web_form" | "admin_manual";
  createdAt: string;
  updatedAt: string;
  contactedAt?: string;
  closedAt?: string;
};

/** GET /api/admin/order-requests 목록 DTO */
export type AdminOrderRequestListItem = {
  id: string;
  requestNumber: string;
  status: OrderRequestWorkflowStatus;
  customerName: string;
  customerPhoneMasked: string;
  vehicleSummary: string;
  batterySpecSummary: string;
  usedBatteryReturnOption: OrderRequestUsedBatteryOption;
  fulfillmentMethod: OrderRequestFulfillmentMethod;
  reviewFlags: OrderRequestReviewFlag[];
  hasInternalMemo: boolean;
  createdAt: string;
};

/** POST /api/order-requests/lookup — 고객 공개 DTO (13차) */
export type CustomerOrderRequestLookup = {
  requestNumber: string;
  status: OrderRequestWorkflowStatus;
  statusLabel: string;
  statusDescription: string;
  customerGuide: string;
  createdAt: string;
  updatedAt: string;
  customerNameMasked: string;
  vehicleName?: string;
  vehicleYear?: string;
  batterySpecSummary: string;
  productSummaries: string[];
  usedBatteryReturnOption: OrderRequestUsedBatteryOption;
  usedBatteryReturnLabel: string;
  fulfillmentMethod: OrderRequestFulfillmentMethod;
  fulfillmentLabel: string;
  storeLabel?: string;
  requestedRegion?: string;
  preferredTime?: string;
  /** 고객이 입력한 요청사항만 (internalMemo 제외) */
  customerMemo?: string;
};

/** POST 성공 응답 (11차) */
export type CreateOrderRequestResponse = {
  id: string;
  requestNumber: string;
  status: OrderRequestWorkflowStatus;
  /** 고객 단건 조회용 opaque token (선택) */
  lookupToken?: string;
};
