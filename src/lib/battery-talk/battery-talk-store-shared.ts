import { isAdminTestInquiry } from "@/lib/admin/admin-test-data-filter";
import { inferBatteryTalkPageType } from "@/lib/battery-talk/battery-talk-context";
import {
  BATTERY_TALK_SYSTEM_WELCOME,
  batteryTalkSystemProductLine,
} from "@/lib/battery-talk/battery-talk-chat-copy";
import type { CustomerInquiryRecord } from "@/types/customer-inquiry";
import type {
  BatteryTalkContext,
  BatteryTalkMessage,
  BatteryTalkThread,
  BatteryTalkThreadStatus,
  BatteryTalkThreadSummary,
} from "@/types/battery-talk";

export function newBatteryTalkId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export type BatteryTalkOpenThreadInput = {
  customerName?: string;
  phone?: string;
  userId?: string;
  isMember?: boolean;
  visitorId?: string;
  context?: BatteryTalkContext;
};

export type BatteryTalkListFilters = {
  status?: BatteryTalkThreadStatus | "all" | null;
  /** false(기본): 관리자 목록용 테스트 데이터 제외. true: 주문 상세 related-activity 등 매칭 전용 */
  includeTestData?: boolean;
  q?: string | null;
  limit?: number;
  visitorId?: string | null;
};

export function buildSystemMessages(context: BatteryTalkContext, now: string): BatteryTalkMessage[] {
  const messages: BatteryTalkMessage[] = [
    {
      id: newBatteryTalkId("btm"),
      sender: "system",
      body: BATTERY_TALK_SYSTEM_WELCOME,
      createdAt: now,
    },
  ];
  const productLabel =
    context.productName && context.batteryCode
      ? `${context.productName} · ${context.batteryCode}`
      : context.productName ?? context.batteryCode ?? context.productCode;
  if (productLabel) {
    messages.push({
      id: newBatteryTalkId("btm"),
      sender: "system",
      body: batteryTalkSystemProductLine(
        context.productName && context.batteryCode
          ? `${context.productName} 상품 문의`
          : `${productLabel} 상품 문의`,
      ),
      createdAt: now,
    });
  }
  return messages;
}

export function batteryTalkToSummary(thread: BatteryTalkThread): BatteryTalkThreadSummary {
  const last =
    [...thread.messages].reverse().find((m) => m.sender !== "system") ??
    thread.messages[thread.messages.length - 1];
  return {
    threadId: thread.threadId,
    status: thread.status,
    customerName: thread.customerName,
    phone: thread.phone,
    lastMessagePreview: last?.body.slice(0, 80) ?? "",
    lastMessageAt: thread.lastMessageAt,
    unreadByAdmin: thread.unreadByAdmin,
    hasProduct: Boolean(
      thread.context.productCode || thread.context.batteryCode || thread.context.productName,
    ),
    hasOrder: Boolean(thread.context.orderId || thread.context.orderNumber),
    vehicleName: thread.context.vehicleName,
    productName: thread.context.productName,
    pageType: thread.context.pageType,
  };
}

export function threadToInquiryShape(t: BatteryTalkThread): CustomerInquiryRecord {
  const lastCustomer = [...t.messages]
    .reverse()
    .find((m) => m.sender === "customer" && m.body.trim());
  return {
    id: t.threadId,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    status: "new",
    category: "other",
    name: t.customerName,
    contact: t.phone,
    message: lastCustomer?.body ?? t.messages.find((m) => m.sender === "customer")?.body ?? "",
    source: "batterytalk",
    adminMemo: t.adminMemo,
  };
}

export function countCustomerBatteryTalkMessages(messages: BatteryTalkMessage[]): number {
  return messages.filter((m) => m.sender === "customer" && m.body.trim()).length;
}

/** 시스템 환영만 있고 고객/운영자 실입력이 없는 빈 껍데기 */
export function isSystemOnlyBatteryTalkThread(
  thread: BatteryTalkThread,
  customerMessageCount?: number,
): boolean {
  const customerCount = customerMessageCount ?? countCustomerBatteryTalkMessages(thread.messages);
  if (customerCount > 0) return false;
  const hasAdminReply = thread.messages.some((m) => m.sender === "admin" && !m.recalledAt);
  const hasOrder = Boolean(thread.context.orderId || thread.context.orderNumber);
  return !hasAdminReply && !hasOrder;
}

function isSystemOnlyPreview(summary: BatteryTalkThreadSummary): boolean {
  const preview = (summary.lastMessagePreview ?? "").trim();
  return (
    !preview ||
    preview === BATTERY_TALK_SYSTEM_WELCOME ||
    preview.startsWith("배터리매니저입니다.") ||
    preview.startsWith("현재 보고 계신 상품")
  );
}

/** @deprecated use isSystemOnlyBatteryTalkThread */
export function isAdminNoiseBatteryTalkSummary(summary: BatteryTalkThreadSummary): boolean {
  if (isAdminTestInquiry({
    name: summary.customerName,
    contact: summary.phone,
    message: summary.lastMessagePreview,
    vehicle: summary.vehicleName,
    inquiryType: summary.pageType,
  })) {
    return true;
  }
  return isSystemOnlyPreview(summary) && !summary.unreadByAdmin && !summary.hasOrder;
}

/** @deprecated use isSystemOnlyBatteryTalkThread */
export function isAdminNoiseBatteryTalkThread(thread: BatteryTalkThread): boolean {
  return shouldExcludeBatteryTalkThreadFromAdmin(thread);
}

/** 관리자 운영 목록에서 제외할 배터리톡 스레드 */
export function shouldExcludeBatteryTalkThreadFromAdmin(
  thread: BatteryTalkThread,
  meta?: { customerMessageCount?: number },
): boolean {
  if (isSystemOnlyBatteryTalkThread(thread, meta?.customerMessageCount)) return true;
  return isAdminTestInquiry(threadToInquiryShape(thread));
}

export function shouldExcludeBatteryTalkSummaryFromAdmin(summary: BatteryTalkThreadSummary): boolean {
  if (isSystemOnlyPreview(summary) && !summary.unreadByAdmin && !summary.hasOrder) return true;
  return isAdminTestInquiry({
    name: summary.customerName,
    contact: summary.phone,
    message: summary.lastMessagePreview,
    vehicle: summary.vehicleName,
    inquiryType: summary.pageType,
  });
}

export function filterBatteryTalkThreadsForAdmin(
  threads: BatteryTalkThread[],
  metaByThreadId?: Record<string, { customerMessageCount?: number }>,
): BatteryTalkThread[] {
  return threads.filter((t) => {
    const meta = metaByThreadId?.[t.threadId];
    return !shouldExcludeBatteryTalkThreadFromAdmin(t, meta);
  });
}

export function filterBatteryTalkSummariesForAdmin(
  summaries: BatteryTalkThreadSummary[],
): BatteryTalkThreadSummary[] {
  return summaries.filter((s) => !shouldExcludeBatteryTalkSummaryFromAdmin(s));
}

export function contextMatchesReuse(
  existing: BatteryTalkContext,
  incoming?: BatteryTalkContext,
): boolean {
  if (!incoming) return true;
  const battery = incoming.batteryCode?.trim();
  const product = incoming.productCode?.trim();
  if (battery && existing.batteryCode && existing.batteryCode !== battery) return false;
  if (product && existing.productCode && existing.productCode !== product) return false;
  return true;
}

export function normalizeOpenContext(input: BatteryTalkOpenThreadInput): BatteryTalkContext {
  const visitorId = input.visitorId?.trim() || input.context?.visitorId?.trim();
  return {
    ...input.context,
    pageType: input.context?.pageType ?? inferBatteryTalkPageType(input.context?.pageUrl),
    visitorId: visitorId || undefined,
  };
}

export function lastNonSystemPreview(messages: BatteryTalkMessage[]): string {
  const last = [...messages].reverse().find((m) => m.sender !== "system") ?? messages[messages.length - 1];
  return last?.body.slice(0, 200) ?? "";
}

export type BatteryTalkVisitorHistoryItem = {
  threadId: string;
  status: BatteryTalkThreadStatus;
  lastMessagePreview: string;
  lastMessageAt: string;
  hasAdminReply: boolean;
};
