import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { loadAdminWorkbenchSnapshot } from "@/lib/admin/data/admin-workbench-snapshot";

export type AdminNavBadges = Partial<Record<string, number>>;

/** 사이드바 배지 — 주문 작업대 건수만 (대시보드와 동일 스냅샷 재사용) */
export async function loadAdminNavBadges(): Promise<AdminNavBadges> {
  const snapshot = await loadAdminWorkbenchSnapshot();
  const consultationTotal =
    snapshot.consultationSummary.pendingInquiries +
    snapshot.consultationSummary.pendingBatteryTalk;

  return {
    [ADMIN_ROUTES.orders]: snapshot.ordersNavBadge,
    [`${ADMIN_ROUTES.inquiries}?type=consultation`]: snapshot.consultationSummary.pendingBatteryTalk || undefined,
    [ADMIN_ROUTES.inquiries]: consultationTotal || undefined,
  };
}
