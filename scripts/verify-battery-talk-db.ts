/**
 * 배터리톡 Postgres 저장소 스모크 테스트 (neon 직접 호출)
 * npx tsx scripts/verify-battery-talk-db.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

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

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }
  const sql = neon(url);
  const sessionId = `btt_verify_${Date.now()}`;
  const now = new Date().toISOString();
  const customerMsgId = `btm_c_${Date.now()}`;
  const adminMsgId = `btm_a_${Date.now()}`;

  await sql`
    INSERT INTO battery_talk_sessions (
      id, customer_name, customer_phone, status, last_message, last_message_at,
      unread_by_admin, context_json, created_at, updated_at
    ) VALUES (
      ${sessionId}, ${"DB검증"}, ${"01099990002"}, ${"waiting"},
      ${"고객 DB 저장 테스트"}, ${now}, ${true}, ${JSON.stringify({ productName: "검증" })},
      ${now}, ${now}
    )
  `;

  await sql`
    INSERT INTO battery_talk_messages (id, session_id, sender_type, message, created_at)
    VALUES (${customerMsgId}, ${sessionId}, ${"customer"}, ${"고객 DB 저장 테스트"}, ${now})
  `;

  await sql`
    INSERT INTO battery_talk_messages (id, session_id, sender_type, message, created_at)
    VALUES (${adminMsgId}, ${sessionId}, ${"admin"}, ${"관리자 DB 답장 테스트"}, ${now})
  `;

  const sessions = await sql`
    SELECT id, last_message, unread_by_admin, status FROM battery_talk_sessions WHERE id = ${sessionId}
  `;
  const messages = await sql`
    SELECT sender_type, message FROM battery_talk_messages WHERE session_id = ${sessionId} ORDER BY created_at
  `;

  console.log("session row:", sessions[0]);
  console.log("messages:", messages);
  if (!sessions[0] || (messages as unknown[]).length < 2) {
    throw new Error("DB verify failed");
  }
  console.log("PASS — battery_talk_sessions / battery_talk_messages read/write OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
