import type { BatteryTalkContext } from "@/types/battery-talk";

export type SubmitBatteryTalkInput = {
  customerName: string;
  phone: string;
  message: string;
  userId?: string;
  isMember?: boolean;
  context?: BatteryTalkContext;
};

export async function submitBatteryTalk(
  input: SubmitBatteryTalkInput,
): Promise<{ ok: boolean; threadId?: string }> {
  try {
    const res = await fetch("/api/battery-talk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { ok?: boolean; threadId?: string };
    if (res.ok && data.ok) {
      return { ok: true, threadId: data.threadId };
    }
  } catch {
    /* ignore */
  }
  return { ok: false };
}
