import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { loadAdminWorkbenchSnapshot } from "@/lib/admin/data/admin-workbench-snapshot";

export type AdminNavBadges = Partial<Record<string, number>>;

/** 사이드바 배지 — 주문 작업대 건수만 (대시보드와 동일 스냅샷 재사용) */
export async function loadAdminNavBadges(): Promise<AdminNavBadges> {
  const snapshot = await loadAdminWorkbenchSnapshot();
  return {
    [ADMIN_ROUTES.orders]: snapshot.ordersNavBadge,
  };
}
