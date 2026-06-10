/**
 * 동일 Node 프로세스 내 SSE 즉시 전달용 EventEmitter.
 * production 멀티 인스턴스: battery-talk-realtime-pg.ts (Postgres LISTEN/NOTIFY)가
 * 다른 Vercel 인스턴스 이벤트를 이 허브로 브리지합니다.
 */
import { EventEmitter } from "node:events";
import type { BatteryTalkMessage, BatteryTalkThreadSummary } from "@/types/battery-talk";

export type BatteryTalkRealtimeMessageEvent = {
  type: "message";
  sessionId: string;
  message: BatteryTalkMessage;
};

export type BatteryTalkRealtimeSessionEvent = {
  type: "session";
  session: BatteryTalkThreadSummary;
};

export type BatteryTalkRealtimeEvent =
  | BatteryTalkRealtimeMessageEvent
  | BatteryTalkRealtimeSessionEvent
  | { type: "connected"; sessionId?: string };

const globalCache = globalThis as typeof globalThis & {
  __bmBatteryTalkRealtimeHub?: EventEmitter;
};

function getHub(): EventEmitter {
  if (!globalCache.__bmBatteryTalkRealtimeHub) {
    const hub = new EventEmitter();
    hub.setMaxListeners(200);
    globalCache.__bmBatteryTalkRealtimeHub = hub;
  }
  return globalCache.__bmBatteryTalkRealtimeHub;
}

export function sessionChannel(sessionId: string): string {
  return `session:${sessionId}`;
}

export const ADMIN_LIST_CHANNEL = "admin:list";

export function emitBatteryTalkMessage(sessionId: string, message: BatteryTalkMessage): void {
  const hub = getHub();
  const payload: BatteryTalkRealtimeMessageEvent = { type: "message", sessionId, message };
  hub.emit(sessionChannel(sessionId), payload);
  hub.emit(ADMIN_LIST_CHANNEL, payload);
}

export function emitBatteryTalkSessionUpdate(session: BatteryTalkThreadSummary): void {
  const hub = getHub();
  const payload: BatteryTalkRealtimeSessionEvent = { type: "session", session };
  hub.emit(sessionChannel(session.threadId), payload);
  hub.emit(ADMIN_LIST_CHANNEL, payload);
}

export function subscribeBatteryTalkChannel(
  channel: string,
  handler: (event: BatteryTalkRealtimeEvent) => void,
): () => void {
  const hub = getHub();
  const wrapped = (event: BatteryTalkRealtimeEvent) => handler(event);
  hub.on(channel, wrapped);
  return () => hub.off(channel, wrapped);
}
