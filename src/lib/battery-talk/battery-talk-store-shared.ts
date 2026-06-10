import { filterAdminTestInquiries, isAdminTestInquiry } from "@/lib/admin/admin-test-data-filter";
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
  context?: BatteryTalkContext;
};

export type BatteryTalkListFilters = {
  status?: BatteryTalkThreadStatus | "all" | null;
  /** false(기본): 관리자 목록용 테스트 데이터 제외. true: 주문 상세 related-activity 등 매칭 전용 */
  includeTestData?: boolean;
  q?: string | null;
  limit?: number;
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
  return {
    id: t.threadId,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    status: "new",
    category: "other",
    name: t.customerName,
    contact: t.phone,
    message: t.messages[0]?.body ?? "",
    source: "batterytalk",
    adminMemo: t.adminMemo,
  };
}

export function isAdminNoiseBatteryTalkSummary(summary: BatteryTalkThreadSummary): boolean {
  const shape = {
    id: summary.threadId,
    name: summary.customerName,
    contact: summary.phone,
    message: summary.lastMessagePreview,
    vehicle: summary.vehicleName,
    inquiryType: summary.pageType,
  };
  if (isAdminTestInquiry(shape)) return true;

  const name = (summary.customerName ?? "").trim();
  const preview = (summary.lastMessagePreview ?? "").trim();
  const isGenericName = name === "고객" || name === "비회원" || name === "고객님";
  const isSystemOnlyPreview =
    !preview ||
    preview === BATTERY_TALK_SYSTEM_WELCOME ||
    preview.startsWith("배터리매니저입니다.") ||
    preview.startsWith("현재 보고 계신 상품");

  if (isGenericName && isSystemOnlyPreview && !summary.hasOrder && !summary.unreadByAdmin) {
    return true;
  }
  return false;
}

export function isAdminNoiseBatteryTalkThread(thread: BatteryTalkThread): boolean {
  const summary = batteryTalkToSummary(thread);
  const customerMsgs = thread.messages.filter((m) => m.sender === "customer");
  if (customerMsgs.length === 0 && isAdminNoiseBatteryTalkSummary(summary)) {
    return true;
  }
  return isAdminNoiseBatteryTalkSummary(summary);
}

export function filterBatteryTalkThreadsForAdmin(threads: BatteryTalkThread[]): BatteryTalkThread[] {
  const allowed = new Set(
    filterAdminTestInquiries(threads.map(threadToInquiryShape)).map((r) => r.id),
  );
  return threads.filter((t) => allowed.has(t.threadId) && !isAdminNoiseBatteryTalkThread(t));
}

export function filterBatteryTalkSummariesForAdmin(
  summaries: BatteryTalkThreadSummary[],
): BatteryTalkThreadSummary[] {
  const allowed = new Set(
    filterAdminTestInquiries(
      summaries.map((s) => ({
        id: s.threadId,
        name: s.customerName,
        contact: s.phone,
        message: s.lastMessagePreview,
        vehicle: s.vehicleName,
        inquiryType: s.pageType,
      })),
    ).map((r) => r.id),
  );
  return summaries.filter((s) => allowed.has(s.threadId) && !isAdminNoiseBatteryTalkSummary(s));
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
  return {
    ...input.context,
    pageType: input.context?.pageType ?? inferBatteryTalkPageType(input.context?.pageUrl),
  };
}

export function lastNonSystemPreview(messages: BatteryTalkMessage[]): string {
  const last = [...messages].reverse().find((m) => m.sender !== "system") ?? messages[messages.length - 1];
  return last?.body.slice(0, 200) ?? "";
}
