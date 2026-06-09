import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { commerceOrderAdminMetaListAll } from "@/lib/admin/commerce-order-admin-meta-store";
import {
  commerceToUnifiedRow,
  consultationToUnifiedRow,
  countOrdersByStatusFilter,
} from "@/lib/admin/unified-orders";
import { batteryTalkCountUnread } from "@/lib/battery-talk/battery-talk-store";
import { claimList } from "@/lib/claims/claim-store";
import { inquiryList } from "@/lib/inquiry/inquiry-store";
import { listOrderRequests } from "@/lib/order-request/order-request-service";
import { commerceOrderToListItem } from "@/lib/payment/commerce-order-admin-mapper";
import { isCommerceOrderStoreEnabled } from "@/lib/payment/payment-config";
import { storeCommerceOrderList } from "@/lib/payment/commerce-order-store";
import { listHubSupportNotices } from "@/lib/support-notices-store";
import { buildVehicleImageInventory } from "@/lib/vehicle-image-inventory";
import type { AdminTodayTaskItem } from "@/types/admin";
import type { ClaimStatus, ClaimType } from "@/types/commerce-claim";
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

const OPEN_CLAIM_STATUSES = new Set<ClaimStatus>([
  "REQUESTED",
  "REVIEWING",
  "APPROVED",
  "RETURN_PICKUP_PENDING",
]);

function countClaimsByType(claims: Awaited<ReturnType<typeof claimList>>, type: ClaimType): number {
  return claims.filter((c) => c.claimType === type && OPEN_CLAIM_STATUSES.has(c.claimStatus)).length;
}

export async function loadAdminDashboardStats(): Promise<AdminDashboardStats> {
  const consultations = await listOrderRequests({ limit: 500 });
  const vehicleRows = buildAdminVehicleRows();
  const batteryRows = buildAdminBatteryRows();
  const matchingRows = buildMatchingAuditRows();
  const ctaRows = buildCtaLinkAuditRows();
  const photoItems = buildPhotoCheckRequestItems(consultations);
  const productRows = buildAdminProductRows();
  const productCounts = countProductsByReview(productRows);

  const dbReady = isCommerceOrderStoreEnabled();
  const metaList = await commerceOrderAdminMetaListAll();
  const metaByOrderId = new Map(metaList.map((m) => [m.orderId, m]));
  let commerceOrders: ReturnType<typeof commerceOrderToListItem>[] = [];
  if (dbReady) {
    try {
      const records = await storeCommerceOrderList(500);
      commerceOrders = records.map(commerceOrderToListItem);
    } catch {
      commerceOrders = [];
    }
  }

  const unifiedRows = [
    ...commerceOrders.map((o) => commerceToUnifiedRow(o, metaByOrderId.get(o.orderId))),
    ...consultations.map(consultationToUnifiedRow),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const todayOrders = unifiedRows.filter((o) => isToday(o.createdAt));
  const guestOrders = unifiedRows.filter((o) => o.customerType === "guest");
  const pendingOrders = unifiedRows.filter((o) =>
    ["pending_review", "waiting_customer", "payment_completed", "order_created"].includes(o.orderStatus),
  );

  const recentUnifiedOrders = unifiedRows.slice(0, 10).map((o) => ({
    id: o.id,
    channel: o.channel,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    productName: o.productName,
    fulfillmentLabel: o.fulfillmentLabel,
    finalAmount: o.finalAmount,
    orderStatusLabel: o.orderStatusLabel,
    createdAt: o.createdAt,
  }));

  const STORE_LABELS: Record<string, string> = {
    deokcheon: "덕천점",
    hakjang: "학장점",
    undecided: "미정",
  };

  const recentOrders = consultations.slice(0, 10).map((o) => ({
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
  const productInquiries = await inquiryList({ productQnaOnly: true, limit: 500 });
  const newInquiries = inquiries.filter((i) => i.status === "new").length;
  const todayInquiries = inquiries.filter((i) => isToday(i.createdAt)).length;
  const productQnaPending = productInquiries.filter((i) => i.status !== "done").length;
  const orderInquiries = inquiries.filter((i) => i.category === "order" && i.status !== "done").length;
  const batteryTalkUnread = await batteryTalkCountUnread().catch(() => 0);
  const pendingAnswer =
    newInquiries + productQnaPending + orderInquiries + batteryTalkUnread;

  const claims = await claimList({ limit: 500 });
  const needsNotice = claims.filter(
    (c) => c.claimStatus !== "COMPLETED" && c.claimStatus !== "REJECTED" && c.claimStatus !== "REFUNDED",
  ).length;

  const { entries: imageEntries } = buildVehicleImageInventory();
  const vehicleImageReviewPending = imageEntries.filter(
    (e) => !e.primaryExists || e.visualRiskStatus !== "OK",
  ).length;

  const hubNotices = await listHubSupportNotices();
  const publishedNotices = hubNotices.length;
  const matchReview = countMatchingReview(matchingRows);
  const productIssues = productCounts.price_missing + productCounts.needs_review;

  const sellingCount = productRows.filter(
    (r) => r.saleStatus === "selling" && r.sellable && r.reviewStatus === "ok",
  ).length;
  const outOfStockCount = productRows.filter(
    (r) => r.saleStatus !== "selling" || !r.sellable,
  ).length;

  const orderSections: AdminTodayTaskItem[] = [
    { label: "신규 주문", count: countOrdersByStatusFilter(unifiedRows, "new"), href: `${ADMIN_ROUTES.orders}?view=new` },
    {
      label: "결제 완료",
      count: countOrdersByStatusFilter(unifiedRows, "payment_completed"),
      href: `${ADMIN_ROUTES.orders}?view=paid`,
    },
    {
      label: "발주확인 대기",
      count: countOrdersByStatusFilter(unifiedRows, "order_created"),
      href: `${ADMIN_ROUTES.orders}?view=confirm_pending`,
    },
    {
      label: "상품 준비",
      count: countOrdersByStatusFilter(unifiedRows, "preparing"),
      href: `${ADMIN_ROUTES.orders}?view=preparing`,
    },
    {
      label: "배송/출장 진행",
      count: countOrdersByStatusFilter(unifiedRows, "in_progress"),
      href: `${ADMIN_ROUTES.orders}?view=in_progress`,
    },
    {
      label: "완료/구매확정",
      count: countOrdersByStatusFilter(unifiedRows, "completed"),
      href: `${ADMIN_ROUTES.orders}?view=completed`,
    },
    {
      label: "취소/환불",
      count: countOrdersByStatusFilter(unifiedRows, "canceled"),
      href: `${ADMIN_ROUTES.orders}?view=canceled`,
    },
  ];

  const claimSections: AdminTodayTaskItem[] = [
    {
      label: "취소 요청",
      count: countClaimsByType(claims, "CANCEL"),
      href: `${ADMIN_ROUTES.commerceClaims}?type=CANCEL&status=REQUESTED`,
    },
    {
      label: "반품 요청",
      count: countClaimsByType(claims, "RETURN"),
      href: `${ADMIN_ROUTES.commerceClaims}?type=RETURN&status=REQUESTED`,
    },
    {
      label: "환불 요청",
      count: countClaimsByType(claims, "REFUND"),
      href: `${ADMIN_ROUTES.commerceClaims}?type=REFUND&status=REQUESTED`,
    },
    {
      label: "교환 요청",
      count: countClaimsByType(claims, "EXCHANGE"),
      href: `${ADMIN_ROUTES.commerceClaims}?type=EXCHANGE&status=REQUESTED`,
    },
    {
      label: "고객 안내 필요",
      count: needsNotice,
      href: `${ADMIN_ROUTES.commerceClaims}?status=REVIEWING`,
    },
  ];

  const inquirySections: AdminTodayTaskItem[] = [
    {
      label: "상품 문의",
      count: productQnaPending,
      href: `${ADMIN_ROUTES.inquiries}?type=product`,
    },
    {
      label: "주문 문의",
      count: orderInquiries,
      href: `${ADMIN_ROUTES.inquiries}?type=order`,
    },
    {
      label: "사진 확인 요청",
      count: photoItems.length,
      href: ADMIN_ROUTES.photoRequests,
    },
    {
      label: "상담 문의",
      count: batteryTalkUnread,
      href: `${ADMIN_ROUTES.inquiries}?type=consultation`,
    },
    {
      label: "답변 대기",
      count: pendingAnswer,
      href: `${ADMIN_ROUTES.inquiries}?status=new`,
    },
  ];

  const productSections: AdminTodayTaskItem[] = [
    { label: "판매중 상품", count: sellingCount, href: `${ADMIN_ROUTES.products}?sale=selling` },
    { label: "품절 상품", count: outOfStockCount, href: `${ADMIN_ROUTES.products}?sale=stopped` },
    {
      label: "검수 필요 상품",
      count: productCounts.needs_review,
      href: `${ADMIN_ROUTES.products}?review=needs_review`,
    },
    {
      label: "이미지 누락 상품",
      count: productCounts.image_missing,
      href: `${ADMIN_ROUTES.products}?review=image_missing`,
    },
    {
      label: "가격 확인 필요 상품",
      count: productCounts.price_missing,
      href: `${ADMIN_ROUTES.products}?review=price_missing`,
    },
  ];

  const todayTasks: AdminTodayTaskItem[] = [
    ...orderSections.filter((t) => t.count > 0),
    ...claimSections.filter((t) => t.count > 0),
    ...inquirySections.filter((t) => t.count > 0),
    {
      label: "확인 필요 매칭",
      count: matchReview,
      href: ADMIN_ROUTES.matching,
    },
    {
      label: "이미지 검수 대기",
      count: vehicleImageReviewPending,
      href: ADMIN_ROUTES.vehicleImageReview,
    },
    {
      label: "가격/검수 제품",
      count: productIssues,
      href: `${ADMIN_ROUTES.products}?review=price_missing`,
    },
    {
      label: "최근 공지",
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
    orderSections,
    claimSections,
    inquirySections,
    productSections,
    recentUnifiedOrders,
    recentOrders,
    recentVehicles,
    recentBatteries,
  };
}
