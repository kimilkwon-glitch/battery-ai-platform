import type { BatteryTalkRealtimeEvent } from "@/lib/battery-talk/battery-talk-realtime-hub";
import { subscribeBatteryTalkChannel } from "@/lib/battery-talk/battery-talk-realtime-hub";
import { ensureBatteryTalkPgListener } from "@/lib/battery-talk/battery-talk-realtime-pg";
import { isBatteryTalkDbMode } from "@/lib/battery-talk/battery-talk-store-config";

/**
 * SSE 구독 — EventEmitter 기반.
 * DB 모드: ensureBatteryTalkPgListener()로 pg_notify → EventEmitter 브리지 활성화 (멀티 인스턴스).
 */
export function subscribeBatteryTalkRealtime(
  channel: string,
  handler: (event: BatteryTalkRealtimeEvent) => void,
): () => void {
  if (isBatteryTalkDbMode()) {
    ensureBatteryTalkPgListener();
  }
  return subscribeBatteryTalkChannel(channel, handler);
}
