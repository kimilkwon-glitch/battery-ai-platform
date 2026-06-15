/**
 * 관리자 UX 검수용 테스트 주문 식별 (BM-TEST-*)
 * 정산·알림톡·배송조회·고객 조회에서 제외, 관리자 목록에는 표시
 */

export const ADMIN_UX_REVIEW_ORDER_PREFIX = "BM-TEST-";
export const ADMIN_UX_REVIEW_CUSTOMER_NAME = "운영검수 고객";
export const ADMIN_UX_REVIEW_CUSTOMER_PHONE = "010-0000-0000";
export const ADMIN_UX_REVIEW_MEMO =
  "관리자 주문·클레임 UX 검수용 테스트 주문입니다. 실제 결제·발송·알림 대상이 아닙니다.";

export function isAdminUxReviewOrderNumber(orderNumber: string | null | undefined): boolean {
  const n = (orderNumber ?? "").trim().toUpperCase();
  return n.startsWith(ADMIN_UX_REVIEW_ORDER_PREFIX);
}

export function isAdminUxReviewTestOrder(record: {
  orderNumber?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  requestMemo?: string | null;
}): boolean {
  if (isAdminUxReviewOrderNumber(record.orderNumber)) return true;
  const name = (record.customerName ?? "").trim();
  const phone = (record.customerPhone ?? "").replace(/\D/g, "");
  const memo = (record.requestMemo ?? "").trim();
  if (
    name === ADMIN_UX_REVIEW_CUSTOMER_NAME &&
    phone === "01000000000" &&
    memo.includes("UX 검수용 테스트 주문")
  ) {
    return true;
  }
  return false;
}

export function shouldSkipExternalOpsForOrder(record: {
  orderNumber?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  requestMemo?: string | null;
}): boolean {
  return isAdminUxReviewTestOrder(record);
}
