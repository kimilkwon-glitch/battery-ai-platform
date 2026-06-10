import "server-only";

import { cache } from "react";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { buildClaimWorkbenchContext } from "@/lib/admin/claim-dashboard-counts";
import { filterUnifiedRowsByDataScope } from "@/lib/admin/order-data-scope";
import { rowNeedsOperatorAction } from "@/lib/admin/order-workbench";
import {
  commerceToUnifiedRow,
  consultationToUnifiedRow,
  countWorkbenchView,
  type UnifiedAdminOrderRow,
} from "@/lib/admin/unified-orders";
import { claimList } from "@/lib/claims/claim-store";
import { listOrderRequests } from "@/lib/order-request/order-request-service";
import { isCommerceOrderStoreEnabled } from "@/lib/payment/payment-config";
import { storeCommerceOrderListItems } from "@/lib/payment/commerce-order-store";
import { batteryTalkCountByStatus } from "@/lib/battery-talk/battery-talk-store";
import { inquiryList } from "@/lib/inquiry/inquiry-store";
import type {
  AdminConsultationSummary,
  AdminRecentUnifiedOrder,
  AdminTodayTaskItem,
} from "@/types/admin";
import type { OrderWorkbenchClaimContext } from "@/lib/admin/order-workbench";

const COMMERCE_LIST_LIMIT = 120;
const CONSULTATION_LIMIT = 80;
const CLAIM_LIMIT = 80;

export type AdminWorkbenchSnapshot = {
  unifiedRows: UnifiedAdminOrderRow[];
  productionRows: UnifiedAdminOrderRow[];
  claimContext: OrderWorkbenchClaimContext;
  actionCards: AdminTodayTaskItem[];
  recentUnifiedOrders: AdminRecentUnifiedOrder[];
  ordersNavBadge: number;
  consultationSummary: AdminConsultationSummary;
};

function buildActionCards(
  unifiedRows: UnifiedAdminOrderRow[],
  claimContext: OrderWorkbenchClaimContext,
): AdminTodayTaskItem[] {
  const count = (view: Parameters<typeof countWorkbenchView>[1]) =>
    countWorkbenchView(unifiedRows, view, "production", claimContext);

  return [
    {
      label: "신규주문",
      description: "결제 완료·발주확인 전 주문입니다.",
      count: count("new_order"),
      view: "new_order",
      href: `${ADMIN_ROUTES.orders}?view=new_order`,
      tone: "urgent",
    },
    {
      label: "상품준비",
      description: "발주확인 후 포장·출고 준비 단계입니다.",
      count: count("preparing"),
      view: "preparing",
      href: `${ADMIN_ROUTES.orders}?view=preparing`,
      tone: "progress",
    },
    {
      label: "배송/출장중",
      description: "배송·출장·매장 방문이 진행 중입니다.",
      count: count("in_progress"),
      view: "in_progress",
      href: `${ADMIN_ROUTES.orders}?view=in_progress`,
      tone: "progress",
    },
    {
      label: "취소요청",
      description: "고객 취소 접수·처리 전입니다.",
      count: count("cancel_request"),
      view: "cancel_request",
      href: `${ADMIN_ROUTES.orders}?view=cancel_request`,
      tone: "urgent",
    },
    {
      label: "반품/교환요청",
      description: "반품·교환 접수·처리 전입니다.",
      count: count("return_exchange"),
      view: "return_exchange",
      href: `${ADMIN_ROUTES.orders}?view=return_exchange`,
      tone: "urgent",
    },
  ];
}

function buildRecentUnifiedOrders(rows: UnifiedAdminOrderRow[]): AdminRecentUnifiedOrder[] {
  return [...rows]
    .sort((a, b) => {
      const aAct = rowNeedsOperatorAction(a) ? 1 : 0;
      const bAct = rowNeedsOperatorAction(b) ? 1 : 0;
      if (bAct !== aAct) return bAct - aAct;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 10)
    .map((o) => ({
      id: o.id,
      channel: o.channel,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      productName: o.productName,
      batteryCode: o.batteryCode,
      fulfillmentLabel: o.fulfillmentLabel,
      finalAmount: o.finalAmount,
      orderStatusLabel: o.orderStatusLabel,
      createdAt: o.createdAt,
      isTestOrder: o.isTestOrder,
      needsAction: rowNeedsOperatorAction(o),
    }));
}

async function loadConsultationSummary(): Promise<AdminConsultationSummary> {
  try {
    const [inquiries, btCounts] = await Promise.all([
      inquiryList({ limit: 300 }),
      batteryTalkCountByStatus(),
    ]);
    const pendingInquiries = inquiries.filter((i) => i.status === "new").length;
    const pendingBatteryTalk = (btCounts.waiting ?? 0) + (btCounts.active ?? 0);
    return { pendingInquiries, pendingBatteryTalk };
  } catch {
    return { pendingInquiries: 0, pendingBatteryTalk: 0 };
  }
}

async function loadAdminWorkbenchSnapshotImpl(): Promise<AdminWorkbenchSnapshot> {
  const dbReady = isCommerceOrderStoreEnabled();

  const [commerceOrders, consultations, claims, consultationSummary] = await Promise.all([
    dbReady
      ? storeCommerceOrderListItems(COMMERCE_LIST_LIMIT).catch(() => [])
      : Promise.resolve([]),
    listOrderRequests({ limit: CONSULTATION_LIMIT }),
    claimList({ limit: CLAIM_LIMIT }),
    loadConsultationSummary(),
  ]);

  const claimContext = buildClaimWorkbenchContext(claims);
  const unifiedRows = [
    ...commerceOrders.map((o) => commerceToUnifiedRow(o)),
    ...consultations.map(consultationToUnifiedRow),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const productionRows = filterUnifiedRowsByDataScope(unifiedRows, "production");
  const actionCards = buildActionCards(unifiedRows, claimContext);

  return {
    unifiedRows,
    productionRows,
    claimContext,
    actionCards,
    recentUnifiedOrders: buildRecentUnifiedOrders(productionRows),
    ordersNavBadge: actionCards.reduce((sum, card) => sum + card.count, 0),
    consultationSummary,
  };
}

/** 대시보드·사이드바 배지 공용 — 요청당 1회만 조회 */
export const loadAdminWorkbenchSnapshot = cache(loadAdminWorkbenchSnapshotImpl);
