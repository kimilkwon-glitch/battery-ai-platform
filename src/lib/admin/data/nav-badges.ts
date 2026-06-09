import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import {
  commerceToUnifiedRow,
  consultationToUnifiedRow,
  countOrdersByStatusFilter,
} from "@/lib/admin/unified-orders";
import { batteryTalkCountUnread } from "@/lib/battery-talk/battery-talk-store";
import { claimList } from "@/lib/claims/claim-store";
import { inquiryList } from "@/lib/inquiry/inquiry-store";
import { buildAdminVehicleRows, countMissingVehicleImages, countVehiclesNeedingReview } from "@/lib/admin/data/vehicles-admin";
import { buildCtaLinkAuditRows, countCtaLinkErrors } from "@/lib/admin/data/cta-links-audit";
import { buildMatchingAuditRows, countMatchingReview } from "@/lib/admin/data/matching-audit";
import { buildPhotoCheckRequestItems } from "@/lib/admin/data/photo-requests-admin";
import { listOrderRequests } from "@/lib/order-request/order-request-service";
import { commerceOrderToListItem } from "@/lib/payment/commerce-order-admin-mapper";
import { isCommerceOrderStoreEnabled } from "@/lib/payment/payment-config";
import { storeCommerceOrderList } from "@/lib/payment/commerce-order-store";
import {
  buildAdminProductRows,
  countProductsByReview,
} from "@/lib/admin/products/products-admin-service";
import type { ClaimStatus } from "@/types/commerce-claim";

export type AdminNavBadges = Partial<Record<string, number>>;

const OPEN_CLAIM = new Set<ClaimStatus>(["REQUESTED", "REVIEWING", "APPROVED", "RETURN_PICKUP_PENDING"]);

export async function loadAdminNavBadges(): Promise<AdminNavBadges> {
  const consultations = await listOrderRequests({ limit: 200 });
  const vehicleRows = buildAdminVehicleRows();
  const matchingRows = buildMatchingAuditRows();
  const ctaRows = buildCtaLinkAuditRows();
  const photoItems = buildPhotoCheckRequestItems(consultations);
  const productCounts = countProductsByReview(buildAdminProductRows());

  let commerceOrders: ReturnType<typeof commerceOrderToListItem>[] = [];
  if (isCommerceOrderStoreEnabled()) {
    try {
      const records = await storeCommerceOrderList(200);
      commerceOrders = records.map(commerceOrderToListItem);
    } catch {
      commerceOrders = [];
    }
  }

  const unifiedRows = [
    ...commerceOrders.map((o) => commerceToUnifiedRow(o)),
    ...consultations.map(consultationToUnifiedRow),
  ];

  const actionOrders =
    countOrdersByStatusFilter(unifiedRows, "order_created") +
    countOrdersByStatusFilter(unifiedRows, "preparing") +
    countOrdersByStatusFilter(unifiedRows, "in_progress");

  const claims = await claimList({ limit: 200 });
  const openClaims = claims.filter((c) => OPEN_CLAIM.has(c.claimStatus)).length;

  const inquiries = await inquiryList({ limit: 200 });
  const productInquiries = await inquiryList({ productQnaOnly: true, limit: 200 });
  const pendingInquiries =
    inquiries.filter((i) => i.status === "new").length +
    productInquiries.filter((i) => i.status !== "done").length +
    (await batteryTalkCountUnread().catch(() => 0));

  return {
    [ADMIN_ROUTES.orders]: actionOrders,
    [ADMIN_ROUTES.commerceClaims]: openClaims,
    [ADMIN_ROUTES.inquiries]: pendingInquiries,
    [ADMIN_ROUTES.photoRequests]: photoItems.length,
    [ADMIN_ROUTES.vehicles]: countVehiclesNeedingReview(vehicleRows),
    [ADMIN_ROUTES.matching]: countMatchingReview(matchingRows),
    [ADMIN_ROUTES.assets]: countMissingVehicleImages(vehicleRows),
    [ADMIN_ROUTES.ctaLinks]: countCtaLinkErrors(ctaRows),
    [ADMIN_ROUTES.products]: productCounts.needs_review,
  };
}
