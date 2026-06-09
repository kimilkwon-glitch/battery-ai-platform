import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { inquiryList } from "@/lib/inquiry/inquiry-store";
import { listOrderRequests } from "@/lib/order-request/order-request-service";
import { listHubSupportNotices } from "@/lib/support-notices-store";
import { buildVehicleImageInventory } from "@/lib/vehicle-image-inventory";
import type { AdminTodayTaskItem } from "@/types/admin";
import {
  buildAdminVehicleRows,
  countMissingVehicleImages,
  countVehiclesNeedingReview,
  vehicleAdminStatusLine,
  vehicleReviewReasonLabel,
} from "@/lib/admin/data/vehicles-admin";
import { buildAdminBatteryRows, countBatteriesNeedingReview, countMissingBatteryImages } from "@/lib/admin/data/batteries-admin";
import { buildMatchingAuditRows, countMatchingReview } from "@/lib/admin/data/matching-audit";
import { buildCtaLinkAuditRows, countCtaLinkErrors } from "@/lib/admin/data/cta-links-audit";
import { buildPhotoCheckRequestItems } from "@/lib/admin/data/photo-requests-admin";
import {
  buildAdminProductRows,
  countProductsByReview,
} from "@/lib/admin/products/products-admin-service";
import type { AdminDashboardStats } from "@/types/admin";

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export async function loadAdminDashboardStats(): Promise<AdminDashboardStats> {
  const orders = await listOrderRequests({ limit: 200 });
  const vehicleRows = buildAdminVehicleRows();
  const batteryRows = buildAdminBatteryRows();
  const matchingRows = buildMatchingAuditRows();
  const ctaRows = buildCtaLinkAuditRows();
  const photoItems = buildPhotoCheckRequestItems(orders);
  const productCounts = countProductsByReview(buildAdminProductRows());

  const todayOrders = orders.filter((o) => isToday(o.createdAt));
  const guestOrders = orders.filter((o) => o.customerType === "guest");
  const pendingOrders = orders.filter(
    (o) => o.status === "pending_review" || o.status === "waiting_customer",
  );

  const STORE_LABELS: Record<string, string> = {
    deokcheon: "덕천점",
    hakjang: "학장점",
    undecided: "미정",
  };

  const recentOrders = orders.slice(0, 10).map((o) => ({
    id: o.id,
    requestNumber: o.requestNumber,
    customerName: o.customerName,
    customerPhoneMasked: o.customerPhoneMasked,
    customerType: o.customerType ?? "member",
    vehicleSummary: o.vehicleSummary,
    batterySpecSummary: o.batterySpecSummary,
    status: o.status,
    storeLabel: o.storeId ? STORE_LABELS[o.storeId] ?? o.storeId : "—",
    createdAt: o.createdAt,
  }));

  const recentVehicles = vehicleRows
    .filter(
      (v) =>
        (v.vehicleStatus !== "ok" && v.vehicleStatus !== "sales_excluded") ||
        (v.vehicleStatus === "ok" && !v.hasBatteryMatch),
    )
    .slice(0, 10)
    .map((v) => ({
      id: v.slug,
      label: v.displayName,
      sublabel: vehicleAdminStatusLine(v),
      href:
        !v.hasBatteryMatch || v.vehicleStatus === "db_fix_needed"
          ? "/admin/matching"
          : v.vehicleStatus === "image_needed"
            ? "/admin/assets"
            : "/admin/vehicles",
      reviewStatus: v.vehicleStatus,
      reviewReason: vehicleReviewReasonLabel(v),
    }));

  const recentBatteries = batteryRows
    .filter((b) => b.missingSpecs)
    .slice(0, 10)
    .map((b) => ({
      id: b.specCode,
      label: b.specCode,
      sublabel: b.batteryType,
      href: b.detailHref,
    }));

  const inquiries = await inquiryList({ limit: 500 });
  const newInquiries = inquiries.filter((i) => i.status === "new").length;
  const todayInquiries = inquiries.filter((i) => isToday(i.createdAt)).length;

  const { entries: imageEntries } = buildVehicleImageInventory();
  const vehicleImageReviewPending = imageEntries.filter(
    (e) => !e.primaryExists || e.visualRiskStatus !== "OK",
  ).length;

  const hubNotices = await listHubSupportNotices();
  const publishedNotices = hubNotices.length;

  const matchReview = countMatchingReview(matchingRows);

  const todayTasks: AdminTodayTaskItem[] = [
    {
      label: "신규 주문",
      count: pendingOrders.length,
      href: ADMIN_ROUTES.orders,
    },
    {
      label: "신규 문의",
      count: newInquiries,
      href: ADMIN_ROUTES.inquiries,
    },
    {
      label: "매칭 확인 필요",
      count: matchReview,
      href: ADMIN_ROUTES.matching,
    },
    {
      label: "차량 이미지 검수 대기",
      count: vehicleImageReviewPending,
      href: ADMIN_ROUTES.vehicleImageReview,
    },
    {
      label: "노출 중인 공지",
      count: publishedNotices,
      href: ADMIN_ROUTES.notices,
    },
  ].filter((t) => t.count > 0);

  return {
    todayOrders: todayOrders.length,
    todayInquiries,
    newInquiries,
    guestOrders: guestOrders.length,
    pendingOrders: pendingOrders.length,
    photoCheckRequests: photoItems.length,
    vehicleMatchReview: matchReview,
    batteryDbReview: countBatteriesNeedingReview(batteryRows),
    missingVehicleImages: countMissingVehicleImages(vehicleRows),
    missingBatteryImages: countMissingBatteryImages(batteryRows),
    vehicleImageReviewPending,
    publishedNotices,
    ctaLinkErrors: countCtaLinkErrors(ctaRows),
    productPriceMissing: productCounts.price_missing,
    productImageMissing: productCounts.image_missing,
    productDetailMissing: productCounts.detail_missing,
    todayTasks,
    recentOrders,
    recentVehicles,
    recentBatteries,
  };
}
