import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import type { AdminDashboardPanel } from "@/lib/admin/dashboard-panel";

/** 대시보드 판매관리 카드 → 주문관리 필터 URL */
export function dashboardOrderHref(panel: AdminDashboardPanel): string | null {
  switch (panel) {
    case "new_order":
      return `${ADMIN_ROUTES.orders}?view=new_order`;
    case "preparing":
      return `${ADMIN_ROUTES.orders}?view=preparing`;
    case "needs_invoice":
      return `${ADMIN_ROUTES.orders}?view=needs_invoice`;
    case "in_progress":
      return `${ADMIN_ROUTES.orders}?view=in_progress`;
    case "completed":
      return `${ADMIN_ROUTES.orders}?view=completed`;
    default:
      return null;
  }
}

/** 대시보드 클레임 카드 → 클레임관리 필터 URL */
export function dashboardClaimHref(panel: AdminDashboardPanel): string | null {
  switch (panel) {
    case "claim_cancel":
      return `${ADMIN_ROUTES.commerceClaims}?type=CANCEL&filter=open`;
    case "claim_return":
      return `${ADMIN_ROUTES.commerceClaims}?type=RETURN&filter=open`;
    case "claim_exchange":
      return `${ADMIN_ROUTES.commerceClaims}?type=EXCHANGE&filter=open`;
    case "claim_refund":
      return `${ADMIN_ROUTES.commerceClaims}?type=REFUND&filter=refund_required`;
    default:
      return null;
  }
}

/** 주문 상세 페이지 URL (목록 복귀용 쿼리 포함) */
export function adminOrderDetailHref(orderId: string, listQuery?: string): string {
  const base = `${ADMIN_ROUTES.orders}/${encodeURIComponent(orderId)}`;
  if (!listQuery?.trim()) return base;
  return `${base}?return=${encodeURIComponent(listQuery.trim())}`;
}
