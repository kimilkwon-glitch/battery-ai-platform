import { loadAdminWorkbenchSnapshot } from "@/lib/admin/data/admin-workbench-snapshot";
import type { AdminDashboardStats } from "@/types/admin";

const EMPTY_SECTIONS = {
  todayOrders: 0,
  todayInquiries: 0,
  newInquiries: 0,
  guestOrders: 0,
  pendingOrders: 0,
  photoCheckRequests: 0,
  vehicleMatchReview: 0,
  batteryDbReview: 0,
  missingVehicleImages: 0,
  missingBatteryImages: 0,
  vehicleImageReviewPending: 0,
  publishedNotices: 0,
  ctaLinkErrors: 0,
  productPriceMissing: 0,
  productImageMissing: 0,
  productDetailMissing: 0,
  todayTasks: [],
  orderOverviewSections: [],
  claimSections: [],
  inquirySections: [],
  productSections: [],
  recentOrders: [],
  recentVehicles: [],
  recentBatteries: [],
};

/** /admin 대시보드 SSR — 카드 5개 + 최근 주문 10건만 조회 */
export async function loadAdminDashboardStats(): Promise<AdminDashboardStats> {
  const snapshot = await loadAdminWorkbenchSnapshot();

  return {
    ...EMPTY_SECTIONS,
    todayActionSections: snapshot.actionCards,
    orderSections: snapshot.actionCards,
    recentUnifiedOrders: snapshot.recentUnifiedOrders,
  };
}
