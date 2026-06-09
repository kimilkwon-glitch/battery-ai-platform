import type { BatteryTalkContext, BatteryTalkMessage } from "@/types/battery-talk";

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
  messages?: BatteryTalkMessage[];
  phone?: string;
  status?: string;
};

export async function openBatteryTalkThread(input: {
  customerName?: string;
  phone?: string;
  userId?: string;
  isMember?: boolean;
  context?: BatteryTalkContext;
}): Promise<BatteryTalkThreadResponse> {
  try {
    const res = await fetch("/api/battery-talk/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as BatteryTalkThreadResponse;
    if (res.ok && data.ok && data.threadId) {
      return data;
    }
  } catch {
    /* ignore */
  }
  return { ok: false };
}

export async function fetchBatteryTalkThread(
  threadId: string,
): Promise<BatteryTalkThreadResponse> {
  try {
    const res = await fetch(`/api/battery-talk/threads/${threadId}`, { cache: "no-store" });
    const data = (await res.json()) as BatteryTalkThreadResponse;
    if (res.ok && data.ok) return data;
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
    const res = await fetch(`/api/battery-talk/threads/${input.threadId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: input.body,
        phone: input.phone,
        customerName: input.customerName,
      }),
    });
    const data = (await res.json()) as BatteryTalkThreadResponse;
    if (res.ok && data.ok) return data;
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
