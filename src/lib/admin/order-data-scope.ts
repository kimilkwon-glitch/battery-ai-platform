import {
  isAdminTestCommerceOrder,
  isAdminTestOrderRequest,
} from "@/lib/admin/admin-test-data-filter";
import type { UnifiedAdminOrderRow } from "@/lib/admin/unified-orders";

/** 관리자 주문 목록·대시보드 데이터 범위 */
export type AdminOrderDataScope = "all" | "production" | "test";

export function parseAdminOrderDataScope(raw: string | null | undefined): AdminOrderDataScope {
  if (raw === "test" || raw === "production" || raw === "all") return raw;
  return "production";
}

/**
 * 테스트/UX/더미 주문 판별 (목록·집계 공통)
 * - order_number: BM-UX, BM-UX2, TEST, DEMO, SEED
 * - customer_name: UX, 테스트, 운영검수, [UX2-운영검수]
 */
export function isAdminTestUnifiedOrder(row: UnifiedAdminOrderRow): boolean {
  if (row.channel === "commerce") {
    return isAdminTestCommerceOrder({
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      orderNumber: row.orderNumber,
      productName: row.productName,
    });
  }
  return isAdminTestOrderRequest({
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    requestNumber: row.orderNumber,
    batterySpecSummary: row.batteryCode,
    productName: row.productName,
  });
}

export function filterUnifiedRowsByDataScope(
  rows: UnifiedAdminOrderRow[],
  scope: AdminOrderDataScope,
): UnifiedAdminOrderRow[] {
  if (scope === "all") return rows;
  if (scope === "test") return rows.filter(isAdminTestUnifiedOrder);
  return rows.filter((r) => !isAdminTestUnifiedOrder(r));
}
