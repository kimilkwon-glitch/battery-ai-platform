import "server-only";

import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { batteryTalkList } from "@/lib/battery-talk/battery-talk-store";
import { claimList, claimListByOrderId } from "@/lib/claims/claim-store";
import { inquiryList } from "@/lib/inquiry/inquiry-store";
import {
  ADMIN_CLAIM_STATUS_LABELS,
  CLAIM_TYPE_LABELS,
  type CommerceClaimRecord,
  type CommerceClaimSummary,
} from "@/types/commerce-claim";
import {
  INQUIRY_STATUS_LABELS,
  isProductQnaSource,
  type CustomerInquiryRecord,
} from "@/types/customer-inquiry";
import { BATTERY_TALK_STATUS_LABELS, type BatteryTalkThreadSummary } from "@/types/battery-talk";

export type RelatedActivityKind =
  | "inquiry_consultation"
  | "inquiry_product"
  | "battery_talk"
  | "claim";

export type RelatedCustomerActivityItem = {
  id: string;
  kind: RelatedActivityKind;
  kindLabel: string;
  status: string;
  statusLabel: string;
  summary: string;
  customerName: string;
  customerPhone: string;
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
  href: string;
  matchReason: "phone" | "order_number" | "both";
};

export type OrderRelatedCustomerActivity = {
  phone: string;
  orderNumber: string;
  customerName?: string;
  counts: {
    inquiries: number;
    productQna: number;
    batteryTalk: number;
    claims: number;
    inquiryTotal: number;
  };
  recent: RelatedCustomerActivityItem[];
};

export function normalizeActivityPhone(phone: string | null | undefined): string {
  return (phone ?? "").replace(/\D/g, "");
}

export function activityPhonesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const da = normalizeActivityPhone(a);
  const db = normalizeActivityPhone(b);
  if (da.length < 10 || db.length < 10) return false;
  return da === db;
}

function truncate(text: string, max = 72): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function inquiryKind(record: CustomerInquiryRecord): RelatedActivityKind {
  return isProductQnaSource(record.source) ? "inquiry_product" : "inquiry_consultation";
}

function inquiryKindLabel(kind: RelatedActivityKind): string {
  if (kind === "inquiry_product") return "상품문의";
  return "상담문의";
}

function inquiryHref(record: CustomerInquiryRecord, phone: string): string {
  const query = encodeURIComponent(phone);
  if (isProductQnaSource(record.source)) {
    return `${ADMIN_ROUTES.inquiries}?type=product&query=${query}`;
  }
  return `${ADMIN_ROUTES.inquiries}?query=${query}`;
}

function batteryTalkHref(phone: string): string {
  return `${ADMIN_ROUTES.inquiries}?type=consultation&query=${encodeURIComponent(phone)}`;
}

function claimHref(claim: { orderNumber: string; orderId?: string }, phone: string): string {
  if (claim.orderId) {
    return `${ADMIN_ROUTES.commerceClaims}?orderId=${encodeURIComponent(claim.orderId)}&query=${encodeURIComponent(claim.orderNumber || phone)}`;
  }
  return `${ADMIN_ROUTES.commerceClaims}?query=${encodeURIComponent(claim.orderNumber || phone)}`;
}

function mapInquiry(
  record: CustomerInquiryRecord,
  orderNumber: string,
  phone: string,
): RelatedCustomerActivityItem {
  const kind = inquiryKind(record);
  const phoneMatch = activityPhonesMatch(record.contact, phone);
  const orderMatch = Boolean(
    record.message?.includes(orderNumber) ||
      record.adminMemo?.includes(orderNumber) ||
      record.productName?.includes(orderNumber),
  );
  return {
    id: record.id,
    kind,
    kindLabel: inquiryKindLabel(kind),
    status: record.status,
    statusLabel: INQUIRY_STATUS_LABELS[record.status] ?? record.status,
    summary: truncate(record.message),
    customerName: record.name,
    customerPhone: record.contact,
    orderNumber: orderMatch ? orderNumber : undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    href: inquiryHref(record, phone),
    matchReason: phoneMatch && orderMatch ? "both" : phoneMatch ? "phone" : "order_number",
  };
}

function mapBatteryTalk(
  thread: BatteryTalkThreadSummary,
  orderNumber: string,
  phone: string,
): RelatedCustomerActivityItem {
  const orderMatch = Boolean(thread.hasOrder || thread.lastMessagePreview.includes(orderNumber));
  return {
    id: thread.threadId,
    kind: "battery_talk",
    kindLabel: "배터리톡",
    status: thread.status,
    statusLabel: BATTERY_TALK_STATUS_LABELS[thread.status] ?? thread.status,
    summary: truncate(thread.lastMessagePreview || thread.productName || "배터리톡 상담"),
    customerName: thread.customerName ?? "고객",
    customerPhone: thread.phone,
    orderNumber: orderMatch ? orderNumber : undefined,
    createdAt: thread.lastMessageAt,
    updatedAt: thread.lastMessageAt,
    href: batteryTalkHref(phone),
    matchReason: orderMatch ? "both" : "phone",
  };
}

function mapClaim(
  claim: CommerceClaimRecord | CommerceClaimSummary,
  phone: string,
  orderNumber: string,
): RelatedCustomerActivityItem {
  const orderMatch = claim.orderNumber === orderNumber;
  const phoneMatch = activityPhonesMatch(claim.customerPhone, phone);
  return {
    id: claim.id,
    kind: "claim",
    kindLabel: "클레임",
    status: claim.claimStatus,
    statusLabel: ADMIN_CLAIM_STATUS_LABELS[claim.claimStatus] ?? claim.claimStatus,
    summary: truncate(
      "customerMessage" in claim && typeof claim.customerMessage === "string" && claim.customerMessage
        ? claim.customerMessage
        : `${CLAIM_TYPE_LABELS[claim.claimType]} · ${claim.orderNumber}`,
    ),
    customerName: claim.customerName,
    customerPhone: claim.customerPhone,
    orderNumber: claim.orderNumber,
    createdAt: claim.requestedAt,
    updatedAt: claim.updatedAt,
    href: claimHref(claim, phone),
    matchReason: phoneMatch && orderMatch ? "both" : orderMatch ? "order_number" : "phone",
  };
}

export async function loadOrderRelatedCustomerActivity(input: {
  orderId: string;
  orderNumber: string;
  customerPhone: string;
  customerName?: string;
}): Promise<OrderRelatedCustomerActivity> {
  const phone = input.customerPhone.trim();
  const phoneDigits = normalizeActivityPhone(phone);

  const [inquiries, productQna, batteryTalk, claimsByOrder, claimsByPhone] = await Promise.all([
    inquiryList({ limit: 500, productQnaOnly: false, includeTestData: true }),
    inquiryList({ limit: 500, productQnaOnly: true, includeTestData: true }),
    batteryTalkList({ limit: 500, includeTestData: true }),
    claimListByOrderId(input.orderId),
    claimList({ q: phoneDigits || phone, limit: 200 }),
  ]);

  const consultationInquiries = inquiries.filter(
    (r) =>
      activityPhonesMatch(r.contact, phone) &&
      r.source !== "batterytalk" &&
      !isProductQnaSource(r.source),
  );
  const productInquiries = productQna.filter((r) => activityPhonesMatch(r.contact, phone));
  const talkThreads = batteryTalk.filter((t) => activityPhonesMatch(t.phone, phone));

  const claimMap = new Map<string, CommerceClaimRecord | CommerceClaimSummary>();
  for (const c of claimsByOrder) claimMap.set(c.id, c);
  for (const c of claimsByPhone) {
    if (activityPhonesMatch(c.customerPhone, phone) || c.orderNumber === input.orderNumber) {
      claimMap.set(c.id, c);
    }
  }
  const claims = [...claimMap.values()];

  const allItems: RelatedCustomerActivityItem[] = [
    ...consultationInquiries.map((r) => mapInquiry(r, input.orderNumber, phone)),
    ...productInquiries.map((r) => mapInquiry(r, input.orderNumber, phone)),
    ...talkThreads.map((t) => mapBatteryTalk(t, input.orderNumber, phone)),
    ...claims.map((c) => mapClaim(c, phone, input.orderNumber)),
  ];

  const recent = [...allItems]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return {
    phone,
    orderNumber: input.orderNumber,
    customerName: input.customerName,
    counts: {
      inquiries: consultationInquiries.length,
      productQna: productInquiries.length,
      batteryTalk: talkThreads.length,
      claims: claims.length,
      inquiryTotal: consultationInquiries.length + productInquiries.length,
    },
    recent,
  };
}
