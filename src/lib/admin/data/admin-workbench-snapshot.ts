import "server-only";

import { cache } from "react";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { buildClaimWorkbenchContext } from "@/lib/admin/claim-dashboard-counts";
import { buildOrderFlowCards } from "@/lib/admin/dashboard-panel";
import { filterUnifiedRowsByDataScope } from "@/lib/admin/order-data-scope";
import { rowNeedsOperatorAction } from "@/lib/admin/order-workbench";
import {
  commerceToUnifiedRow,
  consultationToUnifiedRow,
  type UnifiedAdminOrderRow,
} from "@/lib/admin/unified-orders";
import { claimList } from "@/lib/claims/claim-store";
import { listOrderRequests } from "@/lib/order-request/order-request-service";
import { isCommerceOrderStoreEnabled } from "@/lib/payment/payment-config";
import { storeCommerceOrderListItems } from "@/lib/payment/commerce-order-store";
import { batteryTalkList } from "@/lib/battery-talk/battery-talk-store";
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
  productionRows: UnifiedAdminOrderRow[],
  claimContext: OrderWorkbenchClaimContext,
): AdminTodayTaskItem[] {
  return buildOrderFlowCards(productionRows, claimContext).map((card) => ({
    label: card.label,
    description: card.description,
    count: card.count,
    view: card.panel as AdminTodayTaskItem["view"],
    href: `${ADMIN_ROUTES.orders}?view=${card.panel}`,
    tone: card.tone,
  }));
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
    const [inquiries, batteryTalkSummaries] = await Promise.all([
      inquiryList({ limit: 300 }),
      batteryTalkList({ limit: 500 }),
    ]);
    const pendingInquiries = inquiries.filter(
      (i) => i.status === "new" && i.source !== "batterytalk",
    ).length;
    const pendingBatteryTalk = batteryTalkSummaries.filter(
      (s) => s.status === "waiting" || s.status === "active",
    ).length;
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
  const actionCards = buildActionCards(productionRows, claimContext);

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
