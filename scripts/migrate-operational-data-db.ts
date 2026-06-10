/**
 * 운영 데이터 JSON → Postgres 마이그레이션 (일괄)
 * npm run db:migrate:operational-data
 * npm run db:migrate:operational-data -- --dry-run
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import type { CommerceClaimRecord, ClaimHistoryRecord } from "../src/types/commerce-claim";
import type { CustomerInquiryRecord } from "../src/types/customer-inquiry";
import type { PersistedOrderRequest } from "../src/types/order-request";
import type { BatteryTalkThread } from "../src/types/battery-talk";
import type { ConsultationChannelSettings } from "../src/lib/consultation/consultation-settings";

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

async function ensureSchema(sql: ReturnType<typeof neon>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS commerce_claims (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      order_number TEXT NOT NULL,
      claim_type TEXT NOT NULL,
      claim_status TEXT NOT NULL,
      reason_code TEXT NOT NULL,
      reason_text TEXT,
      customer_message TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      attachment_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
      admin_memo TEXT DEFAULT '',
      customer_reply TEXT,
      needs_customer_notice BOOLEAN NOT NULL DEFAULT FALSE,
      assigned_to TEXT,
      order_status TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      product_name TEXT NOT NULL,
      battery_code TEXT NOT NULL,
      fulfillment_type TEXT NOT NULL,
      return_battery_option TEXT NOT NULL,
      final_amount INTEGER,
      delivery_fee INTEGER NOT NULL DEFAULT 0,
      promotion_discount_total INTEGER DEFAULT 0,
      estimated_refund_amount INTEGER,
      requested_at TIMESTAMPTZ NOT NULL,
      reviewed_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS commerce_claim_histories (
      id TEXT PRIMARY KEY,
      claim_id TEXT NOT NULL REFERENCES commerce_claims(id) ON DELETE CASCADE,
      previous_status TEXT,
      next_status TEXT NOT NULL,
      memo TEXT,
      actor_type TEXT NOT NULL,
      actor_name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS order_requests (
      id TEXT PRIMARY KEY,
      request_number TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      vehicle_name TEXT,
      vehicle_year TEXT,
      vehicle_fuel_type TEXT,
      current_battery_spec TEXT,
      battery_spec_summary TEXT NOT NULL,
      terminal_direction TEXT,
      used_battery_return_option TEXT NOT NULL,
      fulfillment_method TEXT NOT NULL,
      store_id TEXT,
      requested_region TEXT,
      preferred_time TEXT,
      items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      memo TEXT,
      internal_memo TEXT DEFAULT '',
      review_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
      confirmations_json JSONB,
      source TEXT NOT NULL DEFAULT 'web_form',
      customer_type TEXT,
      guest_extras_json JSONB,
      contacted_at TIMESTAMPTZ,
      closed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS customer_inquiries (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'new',
      category TEXT NOT NULL DEFAULT 'other',
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      vehicle TEXT,
      region TEXT,
      message TEXT NOT NULL,
      title TEXT,
      battery_code TEXT,
      product_code TEXT,
      product_name TEXT,
      return_option TEXT,
      page_url TEXT,
      source TEXT,
      inquiry_type TEXT,
      coupon_code TEXT,
      admin_memo TEXT DEFAULT '',
      is_secret BOOLEAN NOT NULL DEFAULT FALSE,
      hidden BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
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
    CREATE TABLE IF NOT EXISTS commerce_order_admin_meta (
      order_id TEXT PRIMARY KEY,
      admin_memo TEXT DEFAULT '',
      shipping_carrier TEXT,
      shipping_tracking_number TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS support_notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      display_date TEXT NOT NULL,
      important BOOLEAN NOT NULL DEFAULT FALSE,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      show_in_hub BOOLEAN NOT NULL DEFAULT TRUE,
      category TEXT NOT NULL DEFAULT 'general',
      sort_order INTEGER NOT NULL DEFAULT 0,
      image_src TEXT,
      image_alt TEXT,
      body_html TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS consultation_settings (
      id TEXT PRIMARY KEY,
      settings_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

function readJson<T>(file: string): T | null {
  const p = path.join(process.cwd(), ".data", file);
  if (!existsSync(p)) {
    console.log(`  skip — no ${file}`);
    return null;
  }
  return JSON.parse(readFileSync(p, "utf8")) as T;
}

async function migrateClaims(sql: ReturnType<typeof neon>): Promise<number> {
  const data = readJson<{ claims?: CommerceClaimRecord[]; histories?: ClaimHistoryRecord[] }>(
    "commerce-claims.json",
  );
  if (!data?.claims?.length) return 0;
  let n = 0;
  for (const row of data.claims) {
    const exists = await sql`SELECT id FROM commerce_claims WHERE id = ${row.id} LIMIT 1`;
    if (Array.isArray(exists) && exists.length > 0) continue;
    if (!dryRun) {
      await sql`
        INSERT INTO commerce_claims (
          id, order_id, order_number, claim_type, claim_status, reason_code, reason_text,
          customer_message, customer_name, customer_phone, attachment_urls, admin_memo,
          customer_reply, needs_customer_notice, assigned_to, order_status, payment_status,
          product_name, battery_code, fulfillment_type, return_battery_option, final_amount,
          delivery_fee, promotion_discount_total, estimated_refund_amount, requested_at,
          reviewed_at, completed_at, created_at, updated_at
        ) VALUES (
          ${row.id}, ${row.orderId}, ${row.orderNumber}, ${row.claimType}, ${row.claimStatus},
          ${row.reasonCode}, ${row.reasonText ?? null}, ${row.customerMessage}, ${row.customerName},
          ${row.customerPhone}, ${JSON.stringify(row.attachmentUrls ?? [])}, ${row.adminMemo ?? ""},
          ${row.customerReply ?? null}, ${row.needsCustomerNotice ?? false}, ${row.assignedTo ?? null},
          ${row.orderStatus}, ${row.paymentStatus}, ${row.productName}, ${row.batteryCode},
          ${row.fulfillmentType}, ${row.returnBatteryOption}, ${row.finalAmount}, ${row.deliveryFee},
          ${row.promotionDiscountTotal ?? 0}, ${row.estimatedRefundAmount ?? null},
          ${row.requestedAt}, ${row.reviewedAt ?? null}, ${row.completedAt ?? null},
          ${row.createdAt}, ${row.updatedAt}
        )
      `;
    }
    n += 1;
  }
  for (const h of data.histories ?? []) {
    const exists = await sql`SELECT id FROM commerce_claim_histories WHERE id = ${h.id} LIMIT 1`;
    if (Array.isArray(exists) && exists.length > 0) continue;
    if (!dryRun) {
      await sql`
        INSERT INTO commerce_claim_histories (
          id, claim_id, previous_status, next_status, memo, actor_type, actor_name, created_at
        ) VALUES (
          ${h.id}, ${h.claimId}, ${h.previousStatus}, ${h.nextStatus}, ${h.memo ?? null},
          ${h.actorType}, ${h.actorName ?? null}, ${h.createdAt}
        ) ON CONFLICT (id) DO NOTHING
      `;
    }
  }
  return n;
}

async function migrateOrderRequests(sql: ReturnType<typeof neon>): Promise<number> {
  const data = readJson<{ records?: PersistedOrderRequest[] }>("order-requests.json");
  if (!data?.records?.length) return 0;
  let n = 0;
  for (const row of data.records) {
    const exists = await sql`SELECT id FROM order_requests WHERE id = ${row.id} LIMIT 1`;
    if (Array.isArray(exists) && exists.length > 0) continue;
    if (!dryRun) {
      await sql`
        INSERT INTO order_requests (
          id, request_number, status, customer_name, customer_phone, customer_email,
          vehicle_name, vehicle_year, vehicle_fuel_type, current_battery_spec, battery_spec_summary,
          terminal_direction, used_battery_return_option, fulfillment_method, store_id,
          requested_region, preferred_time, items_json, memo, internal_memo, review_flags,
          confirmations_json, source, customer_type, guest_extras_json, contacted_at, closed_at,
          created_at, updated_at
        ) VALUES (
          ${row.id}, ${row.requestNumber}, ${row.status}, ${row.customerName}, ${row.customerPhone},
          ${row.customerEmail ?? null}, ${row.vehicleName ?? null}, ${row.vehicleYear ?? null},
          ${row.vehicleFuelType ?? null}, ${row.currentBatterySpec ?? null}, ${row.batterySpecSummary},
          ${row.terminalDirection ?? null}, ${row.usedBatteryReturnOption}, ${row.fulfillmentMethod},
          ${row.storeId ?? null}, ${row.requestedRegion ?? null}, ${row.preferredTime ?? null},
          ${JSON.stringify(row.itemsJson)}, ${row.memo ?? null}, ${row.internalMemo ?? ""},
          ${JSON.stringify(row.reviewFlags)}, ${row.confirmationsJson ? JSON.stringify(row.confirmationsJson) : null},
          ${row.source}, ${row.customerType ?? null},
          ${row.guestExtrasJson ? JSON.stringify(row.guestExtrasJson) : null},
          ${row.contactedAt ?? null}, ${row.closedAt ?? null}, ${row.createdAt}, ${row.updatedAt}
        )
      `;
    }
    n += 1;
  }
  return n;
}

async function migrateInquiries(sql: ReturnType<typeof neon>): Promise<number> {
  const data = readJson<{ records?: CustomerInquiryRecord[] }>("inquiries.json");
  if (!data?.records?.length) return 0;
  let n = 0;
  for (const row of data.records) {
    const exists = await sql`SELECT id FROM customer_inquiries WHERE id = ${row.id} LIMIT 1`;
    if (Array.isArray(exists) && exists.length > 0) continue;
    if (!dryRun) {
      await sql`
        INSERT INTO customer_inquiries (
          id, status, category, name, contact, vehicle, region, message, title,
          battery_code, product_code, product_name, return_option, page_url, source,
          inquiry_type, coupon_code, admin_memo, is_secret, hidden, created_at, updated_at
        ) VALUES (
          ${row.id}, ${row.status}, ${row.category}, ${row.name}, ${row.contact},
          ${row.vehicle ?? null}, ${row.region ?? null}, ${row.message}, ${row.title ?? null},
          ${row.batteryCode ?? null}, ${row.productCode ?? null}, ${row.productName ?? null},
          ${row.returnOption ?? null}, ${row.pageUrl ?? null}, ${row.source ?? null},
          ${row.inquiryType ?? null}, ${row.couponCode ?? null}, ${row.adminMemo ?? ""},
          ${row.isSecret === true}, ${row.hidden === true}, ${row.createdAt}, ${row.updatedAt}
        )
      `;
    }
    n += 1;
  }
  return n;
}

async function migrateBatteryTalk(sql: ReturnType<typeof neon>): Promise<number> {
  const data = readJson<{ threads?: BatteryTalkThread[] }>("battery-talk-threads.json");
  if (!data?.threads?.length) return 0;
  let n = 0;
  for (const thread of data.threads) {
    const exists = await sql`SELECT id FROM battery_talk_sessions WHERE id = ${thread.threadId} LIMIT 1`;
    if (Array.isArray(exists) && exists.length > 0) continue;
    const ctx = thread.context ?? {};
    const last =
      [...thread.messages].reverse().find((m) => m.sender !== "system") ??
      thread.messages[thread.messages.length - 1];
    if (!dryRun) {
      await sql`
        INSERT INTO battery_talk_sessions (
          id, customer_name, customer_phone, source_page, product_id, product_name,
          battery_code, car_name, status, last_message, last_message_at, admin_memo,
          unread_by_admin, context_json, user_id, is_member, legacy_inquiry_id,
          created_at, updated_at
        ) VALUES (
          ${thread.threadId}, ${thread.customerName}, ${thread.phone},
          ${ctx.pageUrl ?? null}, ${ctx.productCode ?? null}, ${ctx.productName ?? null},
          ${ctx.batteryCode ?? null}, ${ctx.vehicleName ?? null}, ${thread.status},
          ${last?.body.slice(0, 200) ?? null}, ${thread.lastMessageAt}, ${thread.adminMemo ?? ""},
          ${thread.unreadByAdmin}, ${JSON.stringify(ctx)}, ${thread.userId ?? null},
          ${thread.isMember}, ${thread.legacyInquiryId ?? null},
          ${thread.createdAt}, ${thread.updatedAt}
        )
      `;
      for (const msg of thread.messages) {
        await sql`
          INSERT INTO battery_talk_messages (id, session_id, sender_type, message, created_at)
          VALUES (${msg.id}, ${thread.threadId}, ${msg.sender}, ${msg.body}, ${msg.createdAt})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }
    n += 1;
  }
  return n;
}

async function migrateOrderAdminMeta(sql: ReturnType<typeof neon>): Promise<number> {
  const data = readJson<{ metas?: Array<{
    orderId: string;
    adminMemo?: string;
    shippingCarrier?: string;
    shippingTrackingNumber?: string;
    updatedAt: string;
  }> }>("commerce-order-admin-meta.json");
  if (!data?.metas?.length) return 0;
  let n = 0;
  for (const row of data.metas) {
    const exists = await sql`SELECT order_id FROM commerce_order_admin_meta WHERE order_id = ${row.orderId} LIMIT 1`;
    if (Array.isArray(exists) && exists.length > 0) continue;
    if (!dryRun) {
      await sql`
        INSERT INTO commerce_order_admin_meta (
          order_id, admin_memo, shipping_carrier, shipping_tracking_number, updated_at
        ) VALUES (
          ${row.orderId}, ${row.adminMemo ?? ""}, ${row.shippingCarrier ?? null},
          ${row.shippingTrackingNumber ?? null}, ${row.updatedAt}
        )
      `;
    }
    n += 1;
  }
  return n;
}

async function migrateSupportNotices(sql: ReturnType<typeof neon>): Promise<number> {
  const data = readJson<{ records?: Array<{
    id: string;
    title: string;
    date: string;
    important?: boolean;
    visible: boolean;
    showInHub: boolean;
    category: string;
    sortOrder: number;
    imageSrc?: string;
    imageAlt?: string;
    bodyHtml: string;
    createdAt: string;
    updatedAt: string;
  }> }>("support-notices.json");
  if (!data?.records?.length) return 0;
  let n = 0;
  for (const row of data.records) {
    const exists = await sql`SELECT id FROM support_notices WHERE id = ${row.id} LIMIT 1`;
    if (Array.isArray(exists) && exists.length > 0) continue;
    if (!dryRun) {
      await sql`
        INSERT INTO support_notices (
          id, title, display_date, important, visible, show_in_hub, category, sort_order,
          image_src, image_alt, body_html, created_at, updated_at
        ) VALUES (
          ${row.id}, ${row.title}, ${row.date}, ${row.important ?? false},
          ${row.visible}, ${row.showInHub}, ${row.category}, ${row.sortOrder},
          ${row.imageSrc ?? null}, ${row.imageAlt ?? null}, ${row.bodyHtml},
          ${row.createdAt}, ${row.updatedAt}
        )
      `;
    }
    n += 1;
  }
  return n;
}

async function migrateConsultationSettings(sql: ReturnType<typeof neon>): Promise<number> {
  const p = path.join(process.cwd(), ".data", "consultation-settings.json");
  if (!existsSync(p)) {
    console.log("  skip — no consultation-settings.json");
    return 0;
  }
  const settings = JSON.parse(readFileSync(p, "utf8")) as Partial<ConsultationChannelSettings>;
  const exists = await sql`SELECT id FROM consultation_settings WHERE id = ${"default"} LIMIT 1`;
  if (Array.isArray(exists) && exists.length > 0) return 0;
  if (!dryRun) {
    await sql`
      INSERT INTO consultation_settings (id, settings_json, updated_at)
      VALUES (${"default"}, ${JSON.stringify(settings)}, ${new Date().toISOString()})
    `;
  }
  return 1;
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  if (dryRun) console.log("DRY RUN — no writes\n");

  const sql = neon(url);
  console.log("Ensuring operational schema...");
  if (!dryRun) await ensureSchema(sql);

  const results: Record<string, number> = {};
  console.log("Migrating commerce_claims...");
  results.claims = await migrateClaims(sql);
  console.log("Migrating order_requests...");
  results.order_requests = await migrateOrderRequests(sql);
  console.log("Migrating customer_inquiries...");
  results.inquiries = await migrateInquiries(sql);
  console.log("Migrating battery_talk...");
  results.battery_talk = await migrateBatteryTalk(sql);
  console.log("Migrating commerce_order_admin_meta...");
  results.order_admin_meta = await migrateOrderAdminMeta(sql);
  console.log("Migrating support_notices...");
  results.support_notices = await migrateSupportNotices(sql);
  console.log("Migrating consultation_settings...");
  results.consultation_settings = await migrateConsultationSettings(sql);

  console.log("\nMigration summary:");
  for (const [k, v] of Object.entries(results)) {
    console.log(`  ${k}: ${v} imported`);
  }
  if (dryRun) console.log("\n(dry-run — re-run without --dry-run to apply)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
