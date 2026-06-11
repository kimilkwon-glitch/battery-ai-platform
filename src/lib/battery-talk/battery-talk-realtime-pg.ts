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
  __bmBatteryTalkPgListenerReady?: Promise<void>;
  __bmBatteryTalkPgListenerResolve?: () => void;
};

function dispatchToHub(event: BatteryTalkRealtimeEvent): void {
  if (event.type === "message") {
    emitBatteryTalkMessage(event.sessionId, event.message);
  } else if (event.type === "session") {
    emitBatteryTalkSessionUpdate(event.session);
  }
}

function waitForPgClientEnd(
  pgClient: {
    on: (event: string, cb: (...args: unknown[]) => void) => void;
  },
): Promise<void> {
  return new Promise((_, reject) => {
    pgClient.on("error", (err: unknown) => reject(err instanceof Error ? err : new Error(String(err))));
    pgClient.on("end", () => reject(new Error("pg listener connection ended")));
  });
}

async function runPgListenerLoop(databaseUrl: string): Promise<void> {
  const { Pool, neonConfig } = await import("@neondatabase/serverless");
  const ws = await import("ws");
  neonConfig.webSocketConstructor = ws.default;

  let attempt = 0;

  while (true) {
    let pool: InstanceType<typeof Pool> | null = null;
    try {
      pool = new Pool({ connectionString: databaseUrl });
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

      attempt = 0;
      globalCache.__bmBatteryTalkPgListenerResolve?.();

      await waitForPgClientEnd(pgClient);
    } catch {
      attempt += 1;
      const delayMs = Math.min(30_000, 500 * 2 ** Math.min(attempt, 6));
      await new Promise((r) => setTimeout(r, delayMs));
    } finally {
      try {
        await pool?.end();
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * Postgres LISTEN/NOTIFY — 프로세스당 1 WebSocket 연결로 pg_notify 수신 → EventEmitter 전달.
 * Vercel 멀티 인스턴스: 각 인스턴스가 자체 LISTEN → 해당 인스턴스의 SSE 클라이언트에 push.
 */
export function ensureBatteryTalkPgListener(): void {
  if (!isPostgresConfigured()) return;
  if (globalCache.__bmBatteryTalkPgListenerReady) return;

  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return;

  globalCache.__bmBatteryTalkPgListenerReady = new Promise<void>((resolve) => {
    globalCache.__bmBatteryTalkPgListenerResolve = resolve;
  });
  void runPgListenerLoop(databaseUrl);
}

/** SSE route에서 LISTEN 브리지 최초 연결 대기 (cross-instance push) */
export async function awaitBatteryTalkPgListenerReady(): Promise<void> {
  if (!isPostgresConfigured()) return;
  ensureBatteryTalkPgListener();
  const ready = globalCache.__bmBatteryTalkPgListenerReady;
  if (!ready) return;
  await Promise.race([
    ready,
    new Promise<void>((resolve) => setTimeout(resolve, 3000)),
  ]);
}

/** DB write 후 cross-instance push — 동일 인스턴스 즉시 hub + pg_notify */
export async function publishBatteryTalkRealtime(
  sql: { (strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown> },
  event: BatteryTalkRealtimeEvent,
): Promise<void> {
  ensureBatteryTalkPgListener();
  dispatchToHub(event);
  const payload = JSON.stringify({ event } satisfies PgNotifyEnvelope);
  await sql`SELECT pg_notify(${BATTERY_TALK_PG_NOTIFY_CHANNEL}, ${payload})`;
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
