import "server-only";

import type { BatteryTalkRealtimeEvent } from "@/lib/battery-talk/battery-talk-realtime-hub";
import {
  emitBatteryTalkMessage,
  emitBatteryTalkSessionUpdate,
} from "@/lib/battery-talk/battery-talk-realtime-hub";
import { getDatabaseUrl, isPostgresConfigured } from "@/lib/db/postgres";
import type { BatteryTalkMessage, BatteryTalkThreadSummary } from "@/types/battery-talk";

export const BATTERY_TALK_PG_NOTIFY_CHANNEL = "battery_talk_events";

type PgNotifyEnvelope = {
  event: BatteryTalkRealtimeEvent;
};

const globalCache = globalThis as typeof globalThis & {
  __bmBatteryTalkPgListenerStarted?: boolean;
};

function dispatchToHub(event: BatteryTalkRealtimeEvent): void {
  if (event.type === "message") {
    emitBatteryTalkMessage(event.sessionId, event.message);
  } else if (event.type === "session") {
    emitBatteryTalkSessionUpdate(event.session);
  }
}

/**
 * Postgres LISTEN/NOTIFY — 프로세스당 1 WebSocket 연결로 pg_notify 수신 → EventEmitter 전달.
 * Vercel 멀티 인스턴스: 각 인스턴스가 자체 LISTEN → 해당 인스턴스의 SSE 클라이언트에 push.
 */
export function ensureBatteryTalkPgListener(): void {
  if (!isPostgresConfigured()) return;
  if (globalCache.__bmBatteryTalkPgListenerStarted) return;
  globalCache.__bmBatteryTalkPgListenerStarted = true;

  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return;

  void (async () => {
    try {
      const { Pool, neonConfig } = await import("@neondatabase/serverless");
      const ws = await import("ws");
      neonConfig.webSocketConstructor = ws.default;

      const pool = new Pool({ connectionString: databaseUrl });
      const client = await pool.connect();
      await client.query(`LISTEN ${BATTERY_TALK_PG_NOTIFY_CHANNEL}`);

      const pgClient = client as unknown as {
        on: (event: string, cb: (msg: { channel?: string; payload?: string }) => void) => void;
      };

      pgClient.on("notification", (msg) => {
        if (msg.channel !== BATTERY_TALK_PG_NOTIFY_CHANNEL || !msg.payload) return;
        try {
          const envelope = JSON.parse(msg.payload) as PgNotifyEnvelope;
          if (envelope.event) dispatchToHub(envelope.event);
        } catch {
          /* malformed */
        }
      });
    } catch {
      globalCache.__bmBatteryTalkPgListenerStarted = false;
    }
  })();
}

/** DB write 후 cross-instance push — pg_notify + 동일 인스턴스 즉시 EventEmitter (LISTEN 지연 대비) */
export async function publishBatteryTalkRealtime(
  sql: { (strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown> },
  event: BatteryTalkRealtimeEvent,
): Promise<void> {
  ensureBatteryTalkPgListener();
  const payload = JSON.stringify({ event } satisfies PgNotifyEnvelope);
  await sql`SELECT pg_notify(${BATTERY_TALK_PG_NOTIFY_CHANNEL}, ${payload})`;
  dispatchToHub(event);
}

export function messageRealtimeEvent(
  sessionId: string,
  message: BatteryTalkMessage,
): BatteryTalkRealtimeEvent {
  return { type: "message", sessionId, message };
}

export function sessionRealtimeEvent(session: BatteryTalkThreadSummary): BatteryTalkRealtimeEvent {
  return { type: "session", session };
}
