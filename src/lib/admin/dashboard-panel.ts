import type { CommerceClaimSummary } from "@/types/commerce-claim";
import {
  CLAIM_DONE_STATUSES,
  CLAIM_REQUEST_OPEN_STATUSES,
  countClaimsByTypeRequested,
  countClaimsCompleted,
} from "@/lib/admin/claim-dashboard-counts";
import {
  matchCommerceNewOrder,
  matchCommerceNeedsInvoice,
  matchesWorkbenchView,
  type OrderWorkbenchClaimContext,
} from "@/lib/admin/order-workbench";
import type { UnifiedAdminOrderRow } from "@/lib/admin/unified-orders";
import type { CustomerInquiryRecord } from "@/types/customer-inquiry";
import { isProductQnaSource } from "@/types/customer-inquiry";
import type { AdminProductRow } from "@/types/admin-product";
import type { BatteryTalkThreadSummary } from "@/types/battery-talk";
import type { AdminDashboardCardTone } from "@/types/admin";
import type { CustomerReviewRecord } from "@/types/customer-review";

const TEST_REVIEW_RE = /테스트|test|sample|demo|seed|fixture/i;

export function isAdminTestReview(record: CustomerReviewRecord): boolean {
  const hay = [record.authorName, record.content, record.orderId, record.batteryCode]
    .filter(Boolean)
    .join(" ");
  return TEST_REVIEW_RE.test(hay);
}

const PREPARING = new Set(["order_confirmed", "preparing", "shipping_prep"]);
const IN_PROGRESS = new Set(["shipping", "shipped", "in_transit", "visit_scheduled", "store_visit_scheduled"]);
const COMPLETED = new Set(["work_completed", "delivered", "picked_up", "completed"]);
const MS_24H = 24 * 60 * 60 * 1000;

/** 대시보드 카드·목록 필터 공통 패널 ID */
export type AdminDashboardPanel =
  | "new_order"
  | "preparing"
  | "needs_invoice"
  | "in_progress"
  | "completed"
  | "claim_cancel"
  | "claim_return"
  | "claim_exchange"
  | "claim_refund"
  | "claim_done"
  | "delay_confirm"
  | "delay_invoice"
  | "delay_consultation"
  | "delay_claim"
  | "product_selling"
  | "product_price"
  | "product_image"
  | "product_detail"
  | "product_review"
  | "talk_pending"
  | "inquiry_product"
  | "inquiry_order"
  | "inquiry_photo"
  | "review_new"
  | "review_reply"
  | "review_low"
  | "review_photo";

export type AdminDashboardCard = {
  panel: AdminDashboardPanel;
  label: string;
  description?: string;
  count: number;
  tone?: AdminDashboardCardTone;
  href?: string;
};

export { matchCommerceNeedsInvoice } from "@/lib/admin/order-workbench";

export function matchCommercePreparing(row: UnifiedAdminOrderRow): boolean {
  if (row.channel === "commerce") {
    return PREPARING.has(row.orderStatus) && !matchCommerceNeedsInvoice(row);
  }
  return row.orderStatus === "contacted";
}

export function matchesDashboardOrderPanel(
  row: UnifiedAdminOrderRow,
  panel: AdminDashboardPanel,
  claimContext: OrderWorkbenchClaimContext,
): boolean {
  if (panel === "needs_invoice") return matchCommerceNeedsInvoice(row);
  if (panel === "preparing") return matchCommercePreparing(row);
  if (
    panel === "new_order" ||
    panel === "in_progress" ||
    panel === "completed" ||
    panel === "claim_cancel" ||
    panel === "claim_return" ||
    panel === "claim_exchange"
  ) {
    const view =
      panel === "claim_cancel"
        ? "cancel_request"
        : panel === "claim_return" || panel === "claim_exchange"
          ? "return_exchange"
          : panel;
    return matchesWorkbenchView(row, view, claimContext);
  }
  return false;
}

export function isOlderThan24h(iso: string, now = Date.now()): boolean {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return now - t >= MS_24H;
}

export function countRefundNeededClaims(claims: CommerceClaimSummary[]): number {
  return claims.filter(
    (c) =>
      c.claimType === "REFUND" &&
      (CLAIM_REQUEST_OPEN_STATUSES.has(c.claimStatus) || c.claimStatus === "APPROVED"),
  ).length;
}

export function filterClaimsByPanel(
  claims: CommerceClaimSummary[],
  panel: AdminDashboardPanel,
): CommerceClaimSummary[] {
  switch (panel) {
    case "claim_cancel":
      return claims.filter(
        (c) => c.claimType === "CANCEL" && CLAIM_REQUEST_OPEN_STATUSES.has(c.claimStatus),
      );
    case "claim_return":
      return claims.filter(
        (c) => c.claimType === "RETURN" && CLAIM_REQUEST_OPEN_STATUSES.has(c.claimStatus),
      );
    case "claim_exchange":
      return claims.filter(
        (c) => c.claimType === "EXCHANGE" && CLAIM_REQUEST_OPEN_STATUSES.has(c.claimStatus),
      );
    case "claim_refund":
      return claims.filter(
        (c) =>
          c.claimType === "REFUND" &&
          (CLAIM_REQUEST_OPEN_STATUSES.has(c.claimStatus) || c.claimStatus === "APPROVED"),
      );
    case "claim_done":
      return claims.filter((c) => CLAIM_DONE_STATUSES.has(c.claimStatus));
    case "delay_claim":
      return claims.filter(
        (c) =>
          CLAIM_REQUEST_OPEN_STATUSES.has(c.claimStatus) && isOlderThan24h(c.requestedAt),
      );
    default:
      return [];
  }
}

export function filterDelayOrders(
  rows: UnifiedAdminOrderRow[],
  panel: AdminDashboardPanel,
): UnifiedAdminOrderRow[] {
  if (panel === "delay_confirm") {
    return rows.filter(
      (r) =>
        r.channel === "commerce" &&
        matchCommerceNewOrder(r.orderStatus, r.paymentStatus) &&
        isOlderThan24h(r.createdAt),
    );
  }
  if (panel === "delay_invoice") {
    return rows.filter((r) => matchCommerceNeedsInvoice(r) && isOlderThan24h(r.createdAt));
  }
  return [];
}

export function filterProductRows(rows: AdminProductRow[], panel: AdminDashboardPanel): AdminProductRow[] {
  switch (panel) {
    case "product_selling":
      return rows.filter((r) => r.saleStatus === "selling");
    case "product_price":
      return rows.filter((r) => r.reviewStatus === "price_missing");
    case "product_image":
      return rows.filter((r) => r.reviewStatus === "image_missing");
    case "product_detail":
      return rows.filter((r) => r.reviewStatus === "detail_missing");
    case "product_review":
      return rows.filter(
        (r) => r.reviewStatus === "needs_review" || r.reviewStatus === "notation_check",
      );
    default:
      return [];
  }
}

export function filterBatteryTalkThreads(
  threads: BatteryTalkThreadSummary[],
  panel: AdminDashboardPanel,
): BatteryTalkThreadSummary[] {
  if (panel === "talk_pending") {
    return threads.filter((t) => t.status === "waiting" || t.status === "active");
  }
  if (panel === "delay_consultation") {
    return threads.filter(
      (t) =>
        (t.status === "waiting" || t.status === "active") && isOlderThan24h(t.lastMessageAt),
    );
  }
  return [];
}

export function filterInquiries(
  inquiries: CustomerInquiryRecord[],
  panel: AdminDashboardPanel,
): CustomerInquiryRecord[] {
  if (panel === "inquiry_product") {
    return inquiries.filter((i) => i.status === "new" && isProductQnaSource(i.source));
  }
  if (panel === "inquiry_order") {
    return inquiries.filter(
      (i) => i.status === "new" && (i.category === "order" || i.category === "shipping"),
    );
  }
  if (panel === "delay_consultation") {
    return inquiries.filter((i) => i.status === "new" && isOlderThan24h(i.createdAt));
  }
  return inquiries.filter((i) => i.status === "new");
}

export const DASHBOARD_PANEL_LIST_TITLES: Record<AdminDashboardPanel, string> = {
  new_order: "신규주문 목록",
  preparing: "상품준비 목록",
  needs_invoice: "송장등록 필요 목록",
  in_progress: "배송/출장중 목록",
  completed: "완료/구매확정 목록",
  claim_cancel: "취소요청 목록",
  claim_return: "반품요청 목록",
  claim_exchange: "교환요청 목록",
  claim_refund: "환불처리 필요 목록",
  claim_done: "처리완료 클레임 목록",
  delay_confirm: "발주확인 지연 목록",
  delay_invoice: "송장등록 지연 목록",
  delay_consultation: "상담 미답변 지연 목록",
  delay_claim: "클레임 처리 지연 목록",
  product_selling: "판매중 상품 목록",
  product_price: "가격 누락 상품 목록",
  product_image: "이미지 누락 상품 목록",
  product_detail: "상세 누락 상품 목록",
  product_review: "검수 필요 상품 목록",
  talk_pending: "배터리톡 미확인 상담 목록",
  inquiry_product: "상품문의 목록",
  inquiry_order: "주문문의 목록",
  inquiry_photo: "사진확인 요청 목록",
  review_new: "새 리뷰 목록",
  review_reply: "답글 대기 리뷰 목록",
  review_low: "평점 낮은 리뷰 목록",
  review_photo: "사진 리뷰 목록",
};

export const DASHBOARD_PANEL_EMPTY_MESSAGES: Record<AdminDashboardPanel, string> = {
  new_order: "현재 처리할 신규주문이 없습니다.",
  preparing: "현재 처리할 상품준비 주문이 없습니다.",
  needs_invoice: "송장등록이 필요한 주문이 없습니다.",
  in_progress: "현재 처리할 배송·출장 주문이 없습니다.",
  completed: "완료·구매확정된 주문이 없습니다.",
  claim_cancel: "현재 처리할 취소요청이 없습니다.",
  claim_return: "현재 처리할 반품요청이 없습니다.",
  claim_exchange: "현재 처리할 교환요청이 없습니다.",
  claim_refund: "환불 처리가 필요한 건이 없습니다.",
  claim_done: "처리완료된 클레임이 없습니다.",
  delay_confirm: "발주확인이 24시간 이상 지연된 주문이 없습니다.",
  delay_invoice: "송장등록이 24시간 이상 지연된 주문이 없습니다.",
  delay_consultation: "24시간 이상 미답변인 상담이 없습니다.",
  delay_claim: "24시간 이상 처리 지연된 클레임이 없습니다.",
  product_selling: "판매중인 상품이 없습니다.",
  product_price: "보완이 필요한 상품이 없습니다.",
  product_image: "보완이 필요한 상품이 없습니다.",
  product_detail: "보완이 필요한 상품이 없습니다.",
  product_review: "검수가 필요한 상품이 없습니다.",
  talk_pending: "확인할 상담이 없습니다.",
  inquiry_product: "확인할 상품문의가 없습니다.",
  inquiry_order: "확인할 주문문의가 없습니다.",
  inquiry_photo: "확인할 사진 요청이 없습니다.",
  review_new: "새로 등록된 리뷰가 없습니다.",
  review_reply: "답글이 필요한 리뷰가 없습니다.",
  review_low: "평점이 낮은 리뷰가 없습니다.",
  review_photo: "사진 리뷰가 없습니다.",
};

export function panelListKind(
  panel: AdminDashboardPanel,
): "order" | "claim" | "product" | "consultation" | "photo" | "review" {
  if (panel.startsWith("review_")) return "review";
  if (panel.startsWith("claim_") || panel === "delay_claim") return "claim";
  if (panel.startsWith("product_")) return "product";
  if (
    panel === "talk_pending" ||
    panel === "inquiry_product" ||
    panel === "inquiry_order" ||
    panel === "delay_consultation"
  ) {
    return "consultation";
  }
  if (panel === "inquiry_photo") return "photo";
  return "order";
}

export function countOrderFlowPanel(
  rows: UnifiedAdminOrderRow[],
  panel: AdminDashboardPanel,
  claimContext: OrderWorkbenchClaimContext,
): number {
  if (panel === "needs_invoice") return rows.filter(matchCommerceNeedsInvoice).length;
  if (panel === "preparing") return rows.filter(matchCommercePreparing).length;
  if (panel === "delay_confirm") return filterDelayOrders(rows, panel).length;
  if (panel === "delay_invoice") return filterDelayOrders(rows, panel).length;
  return rows.filter((r) => matchesDashboardOrderPanel(r, panel, claimContext)).length;
}

export function buildOrderFlowCards(
  rows: UnifiedAdminOrderRow[],
  claimContext: OrderWorkbenchClaimContext,
): AdminDashboardCard[] {
  const panels: { panel: AdminDashboardPanel; label: string; description: string; tone: AdminDashboardCardTone }[] =
    [
      {
        panel: "new_order",
        label: "신규주문",
        description: "결제 완료·발주확인 전",
        tone: "urgent",
      },
      {
        panel: "preparing",
        label: "상품준비",
        description: "발주확인 후 포장·작업 준비",
        tone: "progress",
      },
      {
        panel: "needs_invoice",
        label: "송장등록 필요",
        description: "택배 주문·송장 미등록",
        tone: "warn",
      },
      {
        panel: "in_progress",
        label: "배송/출장중",
        description: "배송·출장·매장 방문 진행",
        tone: "progress",
      },
      {
        panel: "completed",
        label: "완료/구매확정",
        description: "배송·작업·수령 완료",
        tone: "done",
      },
    ];
  return panels.map((p) => ({
    ...p,
    count: countOrderFlowPanel(rows, p.panel, claimContext),
  }));
}

export function buildClaimCards(claims: CommerceClaimSummary[]): AdminDashboardCard[] {
  return [
    {
      panel: "claim_cancel",
      label: "취소요청",
      description: "고객 취소 접수·처리 전",
      count: countClaimsByTypeRequested(claims, "CANCEL"),
      tone: "urgent",
    },
    {
      panel: "claim_return",
      label: "반품요청",
      description: "반품 접수·처리 전",
      count: countClaimsByTypeRequested(claims, "RETURN"),
      tone: "urgent",
    },
    {
      panel: "claim_exchange",
      label: "교환요청",
      description: "교환 접수·처리 전",
      count: countClaimsByTypeRequested(claims, "EXCHANGE"),
      tone: "urgent",
    },
    {
      panel: "claim_refund",
      label: "환불처리 필요",
      description: "환불 승인·처리 대기",
      count: countRefundNeededClaims(claims),
      tone: "warn",
    },
    {
      panel: "claim_done",
      label: "처리완료",
      description: "종료된 클레임",
      count: countClaimsCompleted(claims),
      tone: "done",
    },
  ];
}

export function buildDelayCards(
  rows: UnifiedAdminOrderRow[],
  claims: CommerceClaimSummary[],
  inquiries: CustomerInquiryRecord[],
  batteryTalk: BatteryTalkThreadSummary[],
): AdminDashboardCard[] {
  const delayConsultation =
    filterInquiries(inquiries, "delay_consultation").length +
    filterBatteryTalkThreads(batteryTalk, "delay_consultation").length;

  return [
    {
      panel: "delay_confirm",
      label: "발주확인 지연",
      description: "24시간 이상 발주 미확인",
      count: filterDelayOrders(rows, "delay_confirm").length,
      tone: "warn",
    },
    {
      panel: "delay_invoice",
      label: "송장등록 지연",
      description: "24시간 이상 송장 미등록",
      count: filterDelayOrders(rows, "delay_invoice").length,
      tone: "warn",
    },
    {
      panel: "delay_consultation",
      label: "상담 미답변 지연",
      description: "24시간 이상 미답변",
      count: delayConsultation,
      tone: "warn",
    },
    {
      panel: "delay_claim",
      label: "클레임 처리 지연",
      description: "24시간 이상 미처리",
      count: filterClaimsByPanel(claims, "delay_claim").length,
      tone: "warn",
    },
  ];
}

export function buildProductCards(rows: AdminProductRow[]): AdminDashboardCard[] {
  return [
    {
      panel: "product_selling",
      label: "판매중 상품",
      count: rows.filter((r) => r.saleStatus === "selling").length,
      tone: "info",
    },
    {
      panel: "product_price",
      label: "가격 누락",
      count: rows.filter((r) => r.reviewStatus === "price_missing").length,
      tone: "warn",
    },
    {
      panel: "product_image",
      label: "이미지 누락",
      count: rows.filter((r) => r.reviewStatus === "image_missing").length,
      tone: "warn",
    },
    {
      panel: "product_detail",
      label: "상세 누락",
      count: rows.filter((r) => r.reviewStatus === "detail_missing").length,
      tone: "warn",
    },
    {
      panel: "product_review",
      label: "검수 필요",
      count: rows.filter(
        (r) => r.reviewStatus === "needs_review" || r.reviewStatus === "notation_check",
      ).length,
      tone: "warn",
    },
  ];
}

export function buildConsultationCards(
  batteryTalk: BatteryTalkThreadSummary[],
  inquiries: CustomerInquiryRecord[],
  photoCheckCount: number,
): AdminDashboardCard[] {
  return [
    {
      panel: "talk_pending",
      label: "배터리톡 미확인",
      count: batteryTalk.filter((t) => t.status === "waiting" || t.status === "active").length,
      tone: "urgent",
    },
    {
      panel: "inquiry_product",
      label: "상품문의",
      count: inquiries.filter((i) => i.status === "new" && isProductQnaSource(i.source)).length,
      tone: "info",
    },
    {
      panel: "inquiry_order",
      label: "주문문의",
      count: inquiries.filter(
        (i) => i.status === "new" && (i.category === "order" || i.category === "shipping"),
      ).length,
      tone: "info",
    },
    {
      panel: "inquiry_photo",
      label: "사진확인",
      count: photoCheckCount,
      tone: "warn",
    },
  ];
}

const MS_7D = 7 * 24 * 60 * 60 * 1000;

export function filterReviewRows(
  rows: CustomerReviewRecord[],
  panel: AdminDashboardPanel,
): CustomerReviewRecord[] {
  const production = rows.filter((r) => !isAdminTestReview(r));
  const weekAgo = Date.now() - MS_7D;
  switch (panel) {
    case "review_new":
      return production.filter(
        (r) => new Date(r.createdAt).getTime() >= weekAgo && r.status === "active",
      );
    case "review_reply":
      return production.filter((r) => !r.operatorReply?.trim() && r.status === "active");
    case "review_low":
      return production.filter((r) => r.rating <= 3 && r.status === "active");
    case "review_photo":
      return production.filter((r) => (r.images?.length ?? 0) > 0 || Boolean(r.imageUrl));
    default:
      return production;
  }
}

export function buildReviewCards(rows: CustomerReviewRecord[]): AdminDashboardCard[] {
  const production = rows.filter((r) => !isAdminTestReview(r));
  const weekAgo = Date.now() - MS_7D;
  return [
    {
      panel: "review_new",
      label: "새 리뷰",
      count: production.filter(
        (r) => new Date(r.createdAt).getTime() >= weekAgo && r.status === "active",
      ).length,
      tone: "info",
      href: "/admin/reviews",
    },
    {
      panel: "review_reply",
      label: "답글 대기",
      count: production.filter((r) => !r.operatorReply?.trim() && r.status === "active").length,
      tone: "urgent",
      href: "/admin/reviews",
    },
    {
      panel: "review_low",
      label: "평점 낮은 리뷰",
      count: production.filter((r) => r.rating <= 3 && r.status === "active").length,
      tone: "warn",
      href: "/admin/reviews",
    },
    {
      panel: "review_photo",
      label: "사진 리뷰",
      count: production.filter((r) => (r.images?.length ?? 0) > 0 || Boolean(r.imageUrl)).length,
      tone: "info",
      href: "/admin/reviews",
    },
  ];
}
