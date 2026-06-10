/**
 * 배터리톡 실시간 채팅 DB 스키마 + (선택) JSON → Postgres 마이그레이션
 * npm run db:migrate:battery-talk
 * npm run db:migrate:battery-talk -- --import-json
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import type { BatteryTalkThread } from "../src/types/battery-talk";

function loadEnvLocal(): void {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvLocal();

async function runMigration(sql: ReturnType<typeof neon>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS battery_talk_sessions (
      id TEXT PRIMARY KEY,
      customer_name TEXT,
      customer_phone TEXT NOT NULL DEFAULT '',
      source_page TEXT,
      product_id TEXT,
      product_name TEXT,
      battery_code TEXT,
      car_name TEXT,
      status TEXT NOT NULL DEFAULT 'waiting',
      assigned_admin_id TEXT,
      last_message TEXT,
      last_message_at TIMESTAMPTZ,
      admin_memo TEXT DEFAULT '',
      unread_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
      context_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      user_id TEXT,
      is_member BOOLEAN NOT NULL DEFAULT FALSE,
      legacy_inquiry_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS battery_talk_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES battery_talk_sessions(id) ON DELETE CASCADE,
      sender_type TEXT NOT NULL,
      sender_name TEXT,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      read_at TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_battery_talk_messages_session_created
      ON battery_talk_messages (session_id, created_at)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_battery_talk_sessions_status_updated
      ON battery_talk_sessions (status, updated_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_battery_talk_sessions_phone_created
      ON battery_talk_sessions (customer_phone, created_at DESC)
  `;
}

function lastNonSystemBody(thread: BatteryTalkThread): string {
  const last =
    [...thread.messages].reverse().find((m) => m.sender !== "system") ??
    thread.messages[thread.messages.length - 1];
  return last?.body.slice(0, 200) ?? "";
}

async function importFromJson(sql: ReturnType<typeof neon>): Promise<number> {
  const jsonPath = path.join(process.cwd(), ".data", "battery-talk-threads.json");
  if (!existsSync(jsonPath)) {
    console.log("No .data/battery-talk-threads.json — skip JSON import.");
    return 0;
  }

  const raw = readFileSync(jsonPath, "utf8");
  const parsed = JSON.parse(raw) as { threads?: BatteryTalkThread[] };
  const threads = parsed.threads ?? [];
  if (threads.length === 0) return 0;

  let imported = 0;
  for (const thread of threads) {
    const existing = await sql`
      SELECT id FROM battery_talk_sessions WHERE id = ${thread.threadId} LIMIT 1
    `;
    if (Array.isArray(existing) && existing.length > 0) continue;

    const ctx = thread.context ?? {};
    await sql`
      INSERT INTO battery_talk_sessions (
        id, customer_name, customer_phone, source_page, product_id, product_name,
        battery_code, car_name, status, assigned_admin_id, last_message, last_message_at,
        admin_memo, unread_by_admin, context_json, user_id, is_member, legacy_inquiry_id,
        created_at, updated_at
      ) VALUES (
        ${thread.threadId},
        ${thread.customerName},
        ${thread.phone},
        ${ctx.pageUrl ?? null},
        ${ctx.productCode ?? null},
        ${ctx.productName ?? null},
        ${ctx.batteryCode ?? null},
        ${ctx.vehicleName ?? null},
        ${thread.status},
        ${thread.assignedTo ?? null},
        ${lastNonSystemBody(thread)},
        ${thread.lastMessageAt},
        ${thread.adminMemo ?? ""},
        ${thread.unreadByAdmin},
        ${JSON.stringify(ctx)},
        ${thread.userId ?? null},
        ${thread.isMember},
        ${thread.legacyInquiryId ?? null},
        ${thread.createdAt},
        ${thread.updatedAt}
      )
    `;

    for (const msg of thread.messages) {
      await sql`
        INSERT INTO battery_talk_messages (id, session_id, sender_type, message, created_at)
        VALUES (${msg.id}, ${thread.threadId}, ${msg.sender}, ${msg.body}, ${msg.createdAt})
        ON CONFLICT (id) DO NOTHING
      `;
    }
    imported += 1;
  }
  return imported;
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("DATABASE_URL is not set. Add it to .env.local first.");
    process.exit(1);
  }
  const sql = neon(url);
  await runMigration(sql);
  console.log("battery_talk_sessions / battery_talk_messages migration complete.");

  const importJson = process.argv.includes("--import-json");
  if (importJson) {
    const count = await importFromJson(sql);
    console.log(`Imported ${count} thread(s) from .data/battery-talk-threads.json`);
  } else {
    console.log("Tip: npm run db:migrate:battery-talk -- --import-json to migrate dev JSON data.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
