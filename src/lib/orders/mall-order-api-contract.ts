/**
 * 자사몰 주문 API 계약 (다음 단계 구현용 — 현재 미구현)
 *
 * 원칙:
 * - 토스페이먼츠는 PG 결제 수단만 담당한다.
 * - 주문 생성·조회·회원/비회원 목록은 자사몰 서버(commerce_orders)가 관리한다.
 * - 기존 createCommerceOrder / commerce_orders 테이블을 확장·재사용한다. 별도 주문 DB를 새로 만들지 않는다.
 *
 * 현재 구현 상태:
 * - POST /api/orders/create — 결제 대기 주문 생성 (서버 세션 userId 바인딩)
 * - GET  /api/orders/[orderId] — 결제 흐름 단건 조회 (paymentRequestId 검증)
 * - GET  /api/orders/mine — 회원 주문 목록 (user_id 기준)
 * - POST /api/orders/lookup — commerce 주문 조회 (orderId/orderNumber + phone)
 * - POST /api/order-requests/lookup — 상담 주문 조회 (commerce와 별도)
 *
 * DB 갭 (commerce_orders):
 * - amountBreakdown / batteryReturnFee 컬럼 분리 저장 — 다음 단계 (read 시 재계산)
 */

import type { FulfillmentMethod } from "@/types/cart";
import type {
  OrderRequestFulfillmentMethod,
  OrderRequestUsedBatteryOption,
} from "@/types/order-request";

/** 다음 단계 POST /api/orders (또는 기존 create 확장) 요청 본문 */
export type MallOrderCreateBody = {
  userId?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
  productCode: string;
  productName: string;
  brand?: string;
  batterySpec: string;
  baseProductPrice: number | null;
  fulfillmentType: OrderRequestFulfillmentMethod;
  fulfillmentBasePrice: number | null;
  batteryReturnType: OrderRequestUsedBatteryOption;
  usedBatteryReturnSurcharge: number;
  finalAmount: number;
  address?: string;
  detailAddress?: string;
  zonecode?: string;
  vehicleInfo?: {
    name?: string;
    year?: string;
    fuel?: string;
    plateSuffix?: string;
  } | null;
};

/** 생성 직후 기본 상태 */
export const MALL_ORDER_DEFAULT_STATUS = {
  orderStatus: "order_created" as const,
  paymentStatus: "payment_pending" as const,
};

/** GET /api/orders/mine 응답 항목 (마이페이지 카드) */
export type MallOrderMineListItem = {
  orderId: string;
  orderNumber: string;
  productName: string;
  batteryCode: string;
  fulfillmentType: FulfillmentMethod;
  batteryReturnType: OrderRequestUsedBatteryOption;
  finalAmount: number | null;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
};

/** POST /api/orders/lookup 요청 */
export type MallOrderGuestLookupBody = {
  orderId: string;
  phone: string;
};

/** POST /api/orders/lookup 응답 */
export type MallOrderGuestLookupResult = {
  orderNumber: string;
  createdAt: string;
  productName: string;
  fulfillmentType: FulfillmentMethod;
  batteryReturnType: OrderRequestUsedBatteryOption;
  finalAmount: number | null;
  orderStatus: string;
  paymentStatus: string;
};

/** GET /api/auth/check-login-id?loginId= — 회원가입 다음 단계 */
export type CheckLoginIdResponse = {
  available: boolean;
};
