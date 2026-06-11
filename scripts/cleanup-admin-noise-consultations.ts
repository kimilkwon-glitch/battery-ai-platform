/**
 * 관리자 상담 노이즈 정리 — mock/persona/UX2/빈 배터리톡 shell
 *
 * npm run admin:cleanup-noise-consultations -- --dry-run
 * npm run admin:cleanup-noise-consultations
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { isAdminTestInquiry } from "../src/lib/admin/admin-test-data-filter";
import {
  shouldExcludeBatteryTalkThreadFromAdmin,
} from "../src/lib/battery-talk/battery-talk-store-shared";
import type { BatteryTalkThread } from "../src/types/battery-talk";
import type { CustomerInquiryRecord } from "../src/types/customer-inquiry";

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

const dryRun = process.argv.includes("--dry-run");
const INQUIRY_FILE = join(".data", "inquiries.json");
const BT_FILE = join(".data", "battery-talk-threads.json");

function cleanupJsonStores(): {
  inquiriesRemoved: number;
  batteryTalkRemoved: number;
} {
  let inquiriesRemoved = 0;
  let batteryTalkRemoved = 0;

  if (existsSync(INQUIRY_FILE)) {
    const payload = JSON.parse(readFileSync(INQUIRY_FILE, "utf8")) as {
      version: number;
      records: CustomerInquiryRecord[];
    };
    const kept = payload.records.filter((r) => !isAdminTestInquiry(r));
    inquiriesRemoved = payload.records.length - kept.length;
    if (!dryRun && inquiriesRemoved > 0) {
      writeFileSync(INQUIRY_FILE, JSON.stringify({ version: 1, records: kept }, null, 2), "utf8");
    }
  }

  if (existsSync(BT_FILE)) {
    const payload = JSON.parse(readFileSync(BT_FILE, "utf8")) as {
      version: number;
      threads: BatteryTalkThread[];
    };
    const kept = payload.threads.filter((t) => !shouldExcludeBatteryTalkThreadFromAdmin(t));
    batteryTalkRemoved = payload.threads.length - kept.length;
    if (!dryRun && batteryTalkRemoved > 0) {
      writeFileSync(BT_FILE, JSON.stringify({ version: 1, threads: kept }, null, 2), "utf8");
    }
  }

  return { inquiriesRemoved, batteryTalkRemoved };
}

async function cleanupPostgres(): Promise<{
  inquiriesRemoved: number;
  batteryTalkSessionsRemoved: number;
  batteryTalkMessagesRemoved: number;
}> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    return { inquiriesRemoved: 0, batteryTalkSessionsRemoved: 0, batteryTalkMessagesRemoved: 0 };
  }

  const sql = neon(url);
  const inquiryRows = (await sql`
    SELECT id, name, contact, message, vehicle, inquiry_type, admin_memo
    FROM customer_inquiries
  `) as Array<{
    id: string;
    name: string;
    contact: string;
    message: string;
    vehicle: string | null;
    inquiry_type: string | null;
    admin_memo: string | null;
  }>;

  const testInquiryIds = inquiryRows
    .filter((r) =>
      isAdminTestInquiry({
        name: r.name,
        contact: r.contact,
        message: r.message,
        vehicle: r.vehicle,
        inquiryType: r.inquiry_type,
        adminMemo: r.admin_memo,
      }),
    )
    .map((r) => r.id);

  const sessionRows = (await sql`
    SELECT id, customer_name, customer_phone, admin_memo, context_json
    FROM battery_talk_sessions
  `) as Array<{
    id: string;
    customer_name: string | null;
    customer_phone: string;
    admin_memo: string | null;
    context_json: unknown;
  }>;

  const noiseSessionIds: string[] = [];
  for (const row of sessionRows) {
    const messages = (await sql`
      SELECT sender_type, message, recalled_at FROM battery_talk_messages WHERE session_id = ${row.id}
    `) as Array<{ sender_type: string; message: string; recalled_at: string | null }>;

    const thread: BatteryTalkThread = {
      threadId: row.id,
      source: "batterytalk",
      status: "waiting",
      customerName: row.customer_name ?? "고객",
      phone: row.customer_phone,
      messages: messages.map((m, i) => ({
        id: `m${i}`,
        sender: m.sender_type as BatteryTalkThread["messages"][number]["sender"],
        body: m.message,
        recalledAt: m.recalled_at ?? undefined,
        createdAt: "",
      })),
      context: (row.context_json ?? {}) as BatteryTalkThread["context"],
      createdAt: "",
      updatedAt: "",
      lastMessageAt: "",
      adminMemo: row.admin_memo ?? "",
      unreadByAdmin: false,
    };

    if (shouldExcludeBatteryTalkThreadFromAdmin(thread)) {
      noiseSessionIds.push(row.id);
    }
  }

  let batteryTalkMessagesRemoved = 0;
  if (noiseSessionIds.length) {
    const msgCount = (await sql`
      SELECT COUNT(*)::int AS c FROM battery_talk_messages WHERE session_id = ANY(${noiseSessionIds})
    `) as { c: number }[];
    batteryTalkMessagesRemoved = msgCount[0]?.c ?? 0;
  }

  if (!dryRun) {
    if (testInquiryIds.length) {
      await sql`DELETE FROM customer_inquiries WHERE id = ANY(${testInquiryIds})`;
    }
    if (noiseSessionIds.length) {
      await sql`DELETE FROM battery_talk_messages WHERE session_id = ANY(${noiseSessionIds})`;
      await sql`DELETE FROM battery_talk_sessions WHERE id = ANY(${noiseSessionIds})`;
    }
  }

  return {
    inquiriesRemoved: testInquiryIds.length,
    batteryTalkSessionsRemoved: noiseSessionIds.length,
    batteryTalkMessagesRemoved,
  };
}

async function main(): Promise<void> {
  mkdirSync(".data", { recursive: true });
  const json = cleanupJsonStores();
  const pg = await cleanupPostgres();

  console.log(
    JSON.stringify(
      {
        dryRun,
        json,
        postgres: pg,
      },
      null,
      2,
    ),
  );

  if (dryRun) {
    console.log("(dry-run — 삭제하지 않음)");
  } else {
    console.log("Admin noise consultation cleanup complete.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
