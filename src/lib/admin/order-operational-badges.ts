import type { CommerceOrderAdminMeta } from "@/lib/admin/commerce-order-admin-meta-store";
import type { CommerceOrderRecord } from "@/types/commerce-payment";
import type { OrderRelatedCustomerActivity } from "@/lib/admin/order-related-customer-activity";

export type OrderOperationalBadgeId =
  | "no_return"
  | "today_priority"
  | "phone_callback"
  | "spec_confirm"
  | "has_claims"
  | "has_inquiries";

export type OrderOperationalBadge = {
  id: OrderOperationalBadgeId;
  label: string;
  tone: "amber" | "rose" | "sky" | "violet" | "slate";
};

const BADGE_META: Record<OrderOperationalBadgeId, { label: string; tone: OrderOperationalBadge["tone"] }> = {
  no_return: { label: "미반납", tone: "amber" },
  today_priority: { label: "오늘처리", tone: "rose" },
  phone_callback: { label: "전화콜백", tone: "rose" },
  spec_confirm: { label: "규격확인필요", tone: "sky" },
  has_claims: { label: "클레임있음", tone: "violet" },
  has_inquiries: { label: "관련문의있음", tone: "slate" },
};

function memoHaystack(order: CommerceOrderRecord, adminMeta?: CommerceOrderAdminMeta | null): string {
  return [order.requestMemo, adminMeta?.adminMemo].filter(Boolean).join(" ");
}

export function deriveOrderOperationalBadges(
  order: CommerceOrderRecord,
  activity: OrderRelatedCustomerActivity | null | undefined,
  adminMeta?: CommerceOrderAdminMeta | null,
): OrderOperationalBadge[] {
  const badges: OrderOperationalBadgeId[] = [];
  const hay = memoHaystack(order, adminMeta);

  if (order.returnBatteryOption === "no_return" || (order.batteryReturnFee ?? 0) > 0) {
    badges.push("no_return");
  }
  if (/오늘처리|오늘\s*처리|today\s*priority/i.test(hay)) {
    badges.push("today_priority");
  }
  if (/전화\s*콜백|전화콜백|callback/i.test(hay)) {
    badges.push("phone_callback");
  }

  const needsSpecConfirm =
    order.itemsJson?.some((item) => item.fitmentStatus === "needs_customer_confirm") ||
    /규격\s*확인|규격확인|spec\s*confirm/i.test(hay);
  if (needsSpecConfirm) {
    badges.push("spec_confirm");
  }

  if ((activity?.counts.claims ?? 0) > 0) {
    badges.push("has_claims");
  }

  const inquiryTotal =
    (activity?.counts.inquiries ?? 0) + (activity?.counts.productQna ?? 0) + (activity?.counts.batteryTalk ?? 0);
  if (inquiryTotal > 0) {
    badges.push("has_inquiries");
  }

  return badges.map((id) => ({ id, ...BADGE_META[id] }));
}
