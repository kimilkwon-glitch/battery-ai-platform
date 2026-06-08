import type { BatteryCartItem } from "@/types/cart";

/** 상담 주문 요청 — 폐전지 (폼 단일 선택) */
export type OrderRequestUsedBatteryOption = "return" | "no_return" | "unknown";

export type OrderRequestFulfillmentMethod =
  | "delivery"
  | "visit_install"
  | "store_install"
  | "store_pickup_self"
  /** @deprecated — store_pickup_self 로 통합 */
  | "store_pickup"
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
  plateSuffix?: string;
  photoCheckNeeded?: boolean;
  registrationPhotoNeeded?: boolean;
};

export type OrderRequestFulfillment = {
  method: OrderRequestFulfillmentMethod;
  storeId?: OrderRequestStoreId;
  /** @deprecated — postalCode + address1 + address2 사용 */
  region?: string;
  preferredTime?: string;
  recipientName?: string;
  recipientPhone?: string;
  postalCode?: string;
  address1?: string;
  address2?: string;
  deliveryMessage?: string;
  visitMessage?: string;
  storeMessage?: string;
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

/** 회원/비회원 주문 구분 */
export type OrderRequestCustomerType = "member" | "guest";

/** 비회원 주문 선택 입력 */
export type GuestOrderExtras = {
  plateSuffix?: string;
  preferredTime?: string;
  /** TODO: 파일 스토리지 연동 후 실제 URL 저장 */
  photoAttachmentCount?: number;
  hasExistingBatteryPhoto?: boolean;
  hasBatteryBayPhoto?: boolean;
};

/** POST /api/order-requests */
export type CreateOrderRequestInput = {
  customerName?: string;
  customerPhone: string;
  customerEmail?: string;
  customerOrderMemo?: string;
  customerType?: OrderRequestCustomerType;
  guestExtras?: GuestOrderExtras;
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
  source: "web_form" | "admin_manual" | "guest_form";
  customerType?: OrderRequestCustomerType;
  guestExtrasJson?: GuestOrderExtras;
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
  customerType?: OrderRequestCustomerType;
  vehicleSummary: string;
  batterySpecSummary: string;
  brandSummary?: string;
  usedBatteryReturnOption: OrderRequestUsedBatteryOption;
  fulfillmentMethod: OrderRequestFulfillmentMethod;
  storeId?: OrderRequestStoreId;
  reviewFlags: OrderRequestReviewFlag[];
  hasInternalMemo: boolean;
  /** PG 연동 후 결제 금액 스냅샷 */
  estimatedTotalWon?: number | null;
  paymentStatus?: import("@/types/commerce-order").CommercePaymentStatus;
  lifecycleStatus?: import("@/types/commerce-order").CommerceOrderLifecycleStatus;
  createdAt: string;
};

/** 사진 확인 요청 운영 상태 */
export type PhotoCheckRequestStatus =
  | "received"
  | "reviewing"
  | "more_photos"
  | "guided"
  | "converted"
  | "on_hold";

/** 사진 확인 요청 (주문 요청 photo_check_needed 플래그 기반 + 추후 전용 API) */
export type PhotoCheckRequestItem = {
  id: string;
  requestNumber?: string;
  requestedAt: string;
  customerName: string;
  customerPhoneMasked: string;
  vehicleName: string;
  vehicleYear?: string;
  photoCount: number;
  status: PhotoCheckRequestStatus;
  hasInternalMemo: boolean;
  reviewFlags: OrderRequestReviewFlag[];
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
