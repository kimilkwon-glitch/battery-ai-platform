import { listOrderRequests } from "@/lib/order-request/order-request-service";
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

  return {
    todayOrders: todayOrders.length,
    todayInquiries: 0,
    guestOrders: guestOrders.length,
    pendingOrders: pendingOrders.length,
    photoCheckRequests: photoItems.length,
    vehicleMatchReview: countMatchingReview(matchingRows),
    batteryDbReview: countBatteriesNeedingReview(batteryRows),
    missingVehicleImages: countMissingVehicleImages(vehicleRows),
    missingBatteryImages: countMissingBatteryImages(batteryRows),
    ctaLinkErrors: countCtaLinkErrors(ctaRows),
    recentOrders,
    recentVehicles,
    recentBatteries,
  };
}
