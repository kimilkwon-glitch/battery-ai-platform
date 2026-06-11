import type { BatteryTalkContext, BatteryTalkMessage } from "@/types/battery-talk";
import {
  getBatteryTalkThreadIdsForVisitor,
  getOrCreateBatteryTalkVisitorId,
  registerBatteryTalkThreadForVisitor,
} from "@/lib/battery-talk/battery-talk-visitor";

export function getBatteryTalkThreadStorageKey(scope?: {
  pathname?: string;
  batteryCode?: string;
  productCode?: string;
}): string {
  const path = scope?.pathname ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const code = scope?.batteryCode ?? scope?.productCode ?? "";
  return `bm-bt-thread:${path}:${code}`;
}

export type BatteryTalkThreadResponse = {
  ok: boolean;
  threadId?: string;
  sessionId?: string;
  messages?: BatteryTalkMessage[];
  phone?: string;
  status?: string;
  message?: string;
};

export type BatteryTalkVisitorHistoryItem = {
  threadId: string;
  status: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  hasAdminReply: boolean;
};

export async function openBatteryTalkThread(input: {
  customerName?: string;
  phone?: string;
  userId?: string;
  isMember?: boolean;
  visitorId?: string;
  context?: BatteryTalkContext;
}): Promise<BatteryTalkThreadResponse> {
  const visitorId = input.visitorId?.trim() || getOrCreateBatteryTalkVisitorId();
  try {
    const res = await fetch("/api/battery-talk/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, visitorId, context: { ...input.context, visitorId } }),
    });
    const data = (await res.json()) as BatteryTalkThreadResponse;
    if (res.ok && data.ok && (data.sessionId || data.threadId)) {
      const threadId = data.sessionId ?? data.threadId!;
      registerBatteryTalkThreadForVisitor(threadId, visitorId);
      return {
        ...data,
        threadId,
      };
    }
  } catch {
    /* ignore */
  }
  return { ok: false };
}

export async function fetchBatteryTalkVisitorHistory(): Promise<BatteryTalkVisitorHistoryItem[]> {
  const visitorId = getOrCreateBatteryTalkVisitorId();
  if (!visitorId) return [];
  const threadIds = getBatteryTalkThreadIdsForVisitor(visitorId);
  const params = new URLSearchParams({ visitorId });
  if (threadIds.length > 0) params.set("threadIds", threadIds.join(","));
  try {
    const res = await fetch(`/api/battery-talk/sessions?${params.toString()}`, { cache: "no-store" });
    const data = (await res.json()) as { ok?: boolean; items?: BatteryTalkVisitorHistoryItem[] };
    if (res.ok && data.ok && Array.isArray(data.items)) return data.items;
  } catch {
    /* ignore */
  }
  return [];
}

export async function fetchBatteryTalkThread(
  threadId: string,
): Promise<BatteryTalkThreadResponse> {
  try {
    const res = await fetch(`/api/battery-talk/sessions/${encodeURIComponent(threadId)}`, {
      cache: "no-store",
    });
    const data = (await res.json()) as BatteryTalkThreadResponse;
    if (res.ok && data.ok) {
      return { ...data, threadId: data.sessionId ?? data.threadId ?? threadId };
    }
  } catch {
    /* ignore */
  }
  return { ok: false };
}

export async function sendBatteryTalkMessage(input: {
  threadId: string;
  body: string;
  phone?: string;
  customerName?: string;
}): Promise<BatteryTalkThreadResponse> {
  try {
    const res = await fetch(
      `/api/battery-talk/sessions/${encodeURIComponent(input.threadId)}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: input.body,
          phone: input.phone,
          customerName: input.customerName,
        }),
      },
    );
    const data = (await res.json()) as BatteryTalkThreadResponse;
    if (res.ok && data.ok) {
      return { ...data, threadId: data.sessionId ?? data.threadId ?? input.threadId };
    }
  } catch {
    /* ignore */
  }
  return { ok: false };
}

export function getStoredBatteryTalkThreadId(scope?: {
  pathname?: string;
  batteryCode?: string;
  productCode?: string;
}): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(getBatteryTalkThreadStorageKey(scope));
}

export function storeBatteryTalkThreadId(
  threadId: string,
  scope?: { pathname?: string; batteryCode?: string; productCode?: string },
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(getBatteryTalkThreadStorageKey(scope), threadId);
}
