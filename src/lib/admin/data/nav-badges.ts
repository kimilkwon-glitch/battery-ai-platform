import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { batteryTalkCountUnread } from "@/lib/battery-talk/battery-talk-store";
import { buildAdminVehicleRows, countMissingVehicleImages, countVehiclesNeedingReview } from "@/lib/admin/data/vehicles-admin";
import { buildCtaLinkAuditRows, countCtaLinkErrors } from "@/lib/admin/data/cta-links-audit";
import { buildMatchingAuditRows, countMatchingReview } from "@/lib/admin/data/matching-audit";
import { buildPhotoCheckRequestItems } from "@/lib/admin/data/photo-requests-admin";
import { listOrderRequests } from "@/lib/order-request/order-request-service";
import {
  buildAdminProductRows,
  countProductsByReview,
} from "@/lib/admin/products/products-admin-service";

export type AdminNavBadges = Partial<Record<string, number>>;

export async function loadAdminNavBadges(): Promise<AdminNavBadges> {
  const orders = await listOrderRequests({ limit: 200 });
  const vehicleRows = buildAdminVehicleRows();
  const matchingRows = buildMatchingAuditRows();
  const ctaRows = buildCtaLinkAuditRows();
  const photoItems = buildPhotoCheckRequestItems(orders);
  const productCounts = countProductsByReview(buildAdminProductRows());

  const pendingOrders = orders.filter(
    (o) => o.status === "pending_review" || o.status === "waiting_customer",
  ).length;

  const batteryTalkUnread = await batteryTalkCountUnread().catch(() => 0);

  return {
    [ADMIN_ROUTES.orders]: pendingOrders,
    [ADMIN_ROUTES.batteryTalk]: batteryTalkUnread,
    [ADMIN_ROUTES.guestOrders]: orders.filter((o) => o.customerType === "guest").length,
    [ADMIN_ROUTES.photoRequests]: photoItems.length,
    [ADMIN_ROUTES.vehicles]: countVehiclesNeedingReview(vehicleRows),
    [ADMIN_ROUTES.matching]: countMatchingReview(matchingRows),
    [ADMIN_ROUTES.assets]: countMissingVehicleImages(vehicleRows),
    [ADMIN_ROUTES.ctaLinks]: countCtaLinkErrors(ctaRows),
    [ADMIN_ROUTES.products]: productCounts.needs_review,
  };
}
