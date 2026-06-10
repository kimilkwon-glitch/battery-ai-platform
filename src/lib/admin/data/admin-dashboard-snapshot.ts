import "server-only";

import { cache } from "react";
import {
  buildClaimCards,
  buildConsultationCards,
  buildDelayCards,
  buildOrderFlowCards,
  buildProductCards,
  type AdminDashboardCard,
} from "@/lib/admin/dashboard-panel";
import { buildClaimWorkbenchContext } from "@/lib/admin/claim-dashboard-counts";
import {
  filterAdminTestCommerceOrders,
  filterAdminTestInquiries,
  isAdminTestOrderRequest,
} from "@/lib/admin/admin-test-data-filter";
import { filterUnifiedRowsByDataScope } from "@/lib/admin/order-data-scope";
import type { OrderWorkbenchClaimContext } from "@/lib/admin/order-workbench";
import {
  commerceToUnifiedRow,
  consultationToUnifiedRow,
  type UnifiedAdminOrderRow,
} from "@/lib/admin/unified-orders";
import { buildPhotoCheckRequestItems } from "@/lib/admin/data/photo-requests-admin";
import { loadAdminSettlementSummary, type AdminSettlementSummary } from "@/lib/admin/data/settlement-summary";
import { buildReviewCards } from "@/lib/admin/dashboard-panel";
import { buildAdminProductRows } from "@/lib/admin/products/products-admin-service";
import { loadAdminReviewsSummary } from "@/lib/admin/data/reviews-admin-summary";
import type { CustomerReviewRecord } from "@/types/customer-review";
import type { AdminProductRow } from "@/types/admin-product";
import { claimList } from "@/lib/claims/claim-store";
import { batteryTalkList } from "@/lib/battery-talk/battery-talk-store";
import { inquiryList } from "@/lib/inquiry/inquiry-store";
import { listOrderRequests } from "@/lib/order-request/order-request-service";
import { isCommerceOrderStoreEnabled } from "@/lib/payment/payment-config";
import { storeCommerceOrderListItems } from "@/lib/payment/commerce-order-store";
import type { CommerceClaimSummary } from "@/types/commerce-claim";
import type { CustomerInquiryRecord } from "@/types/customer-inquiry";
import type { BatteryTalkThreadSummary } from "@/types/battery-talk";
import {
  formatAdminCustomerName,
  formatAdminInquiryMessage,
} from "@/lib/admin/admin-display-labels";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { INQUIRY_CATEGORY_LABELS } from "@/types/customer-inquiry";
import { BATTERY_TALK_STATUS_LABELS } from "@/types/battery-talk";

const COMMERCE_LIMIT = 200;
const CONSULTATION_LIMIT = 80;
const CLAIM_LIMIT = 120;
const INQUIRY_LIMIT = 300;
const BT_LIMIT = 120;

export type AdminDashboardConsultationPreview = {
  id: string;
  kind: "battery_talk" | "inquiry";
  customerName: string;
  contact: string;
  inquiryType: string;
  summary: string;
  status: string;
  createdAt: string;
  href: string;
};

export type AdminDashboardSnapshot = {
  productionRows: UnifiedAdminOrderRow[];
  claimContext: OrderWorkbenchClaimContext;
  productionClaims: CommerceClaimSummary[];
  settlement: AdminSettlementSummary;
  orderFlowCards: AdminDashboardCard[];
  claimCards: AdminDashboardCard[];
  delayCards: AdminDashboardCard[];
  productCards: AdminDashboardCard[];
  consultationCards: AdminDashboardCard[];
  reviewCards: AdminDashboardCard[];
  reviewRows: CustomerReviewRecord[];
  productRows: AdminProductRow[];
  productionInquiries: CustomerInquiryRecord[];
  batteryTalkThreads: BatteryTalkThreadSummary[];
  photoCheckCount: number;
  recentConsultations: AdminDashboardConsultationPreview[];
};

function filterProductionClaims(claims: CommerceClaimSummary[]): CommerceClaimSummary[] {
  return filterAdminTestCommerceOrders(claims);
}

async function loadAdminDashboardSnapshotImpl(): Promise<AdminDashboardSnapshot> {
  const dbReady = isCommerceOrderStoreEnabled();

  const [
    commerceOrders,
    consultations,
    claims,
    inquiries,
    batteryTalk,
    orderRequests,
    settlement,
    reviewsSummary,
  ] = await Promise.all([
    dbReady
      ? storeCommerceOrderListItems(COMMERCE_LIMIT).catch(() => [])
      : Promise.resolve([]),
    listOrderRequests({ limit: CONSULTATION_LIMIT }),
    claimList({ limit: CLAIM_LIMIT }).catch(() => []),
    inquiryList({ limit: INQUIRY_LIMIT }).catch(() => []),
    batteryTalkList({ limit: BT_LIMIT }).catch(() => []),
    listOrderRequests({ limit: 500 }),
    loadAdminSettlementSummary(),
    loadAdminReviewsSummary(),
  ]);

  const claimContext = buildClaimWorkbenchContext(claims);
  const unifiedRows = [
    ...commerceOrders.map((o) => commerceToUnifiedRow(o)),
    ...consultations.map(consultationToUnifiedRow),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const productionRows = filterUnifiedRowsByDataScope(unifiedRows, "production");
  const productionClaims = filterProductionClaims(claims);
  const productionInquiries = filterAdminTestInquiries(inquiries);

  const photoItems = buildPhotoCheckRequestItems(
    orderRequests.filter((o) => !isAdminTestOrderRequest(o)),
  );
  const photoCheckCount = photoItems.filter(
    (i) => i.status === "reviewing" || i.status === "received",
  ).length;

  const productRows = buildAdminProductRows();

  const recentConsultations: AdminDashboardConsultationPreview[] = [];

  for (const t of batteryTalk
    .filter((x) => x.status === "waiting" || x.status === "active")
    .slice(0, 3)) {
    recentConsultations.push({
      id: t.threadId,
      kind: "battery_talk",
      customerName: formatAdminCustomerName(t.customerName),
      contact: t.phone,
      inquiryType: "배터리톡",
      summary: formatAdminInquiryMessage(t.lastMessagePreview),
      status: BATTERY_TALK_STATUS_LABELS[t.status],
      createdAt: t.lastMessageAt,
      href: `${ADMIN_ROUTES.inquiries}?type=consultation&threadId=${encodeURIComponent(t.threadId)}`,
    });
  }

  for (const i of productionInquiries.filter((x) => x.status === "new").slice(0, 5)) {
    if (recentConsultations.length >= 5) break;
    recentConsultations.push({
      id: i.id,
      kind: "inquiry",
      customerName: formatAdminCustomerName(i.name),
      contact: i.contact,
      inquiryType: INQUIRY_CATEGORY_LABELS[i.category] ?? "문의",
      summary: formatAdminInquiryMessage(i.message).slice(0, 80),
      status: "신규",
      createdAt: i.createdAt,
      href: `${ADMIN_ROUTES.inquiries}?id=${encodeURIComponent(i.id)}`,
    });
  }

  recentConsultations.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    productionRows,
    claimContext,
    productionClaims,
    settlement,
    orderFlowCards: buildOrderFlowCards(productionRows, claimContext),
    claimCards: buildClaimCards(productionClaims),
    delayCards: buildDelayCards(
      productionRows,
      productionClaims,
      productionInquiries,
      batteryTalk,
    ),
    productCards: buildProductCards(productRows),
    consultationCards: buildConsultationCards(
      batteryTalk,
      productionInquiries,
      photoCheckCount,
    ),
    reviewCards: buildReviewCards(reviewsSummary.productionReviews),
    reviewRows: reviewsSummary.productionReviews,
    productRows,
    productionInquiries,
    batteryTalkThreads: batteryTalk,
    photoCheckCount,
    recentConsultations: recentConsultations.slice(0, 5),
  };
}

export const loadAdminDashboardSnapshot = cache(loadAdminDashboardSnapshotImpl);
