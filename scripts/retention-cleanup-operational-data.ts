/**
 * 문의·배터리톡 운영 데이터 보관 정책 정리
 *
 * npm run retention:cleanup -- --dry-run
 * npm run retention:cleanup
 * npm run retention:cleanup -- --mode=delete --confirm-delete
 * npm run retention:cleanup -- --mode=anonymize
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import {
  RETENTION_ANONYMIZED_CUSTOMER_NAME,
  RETENTION_ANONYMIZED_INQUIRY_MESSAGE,
  RETENTION_ANONYMIZED_TALK_MESSAGE,
  RETENTION_MASKED_CONTACT,
  appendRetentionAdminMemo,
  batteryTalkSessionActivityAt,
  batteryTalkSessionHasOrderLink,
  formatRetentionCutoffIso,
  getBatteryTalkCutoff,
  getGeneralInquiryCutoff,
  isGeneralInquirySource,
  isRetentionAnonymizedBatteryTalkMessage,
  isRetentionAnonymizedBatteryTalkSession,
  isRetentionAnonymizedInquiry,
  isRetentionExcludedTestBatteryTalk,
  isRetentionExcludedTestInquiry,
  type RetentionCleanupMode,
} from "../src/lib/retention/operational-data-retention";

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

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const modeArg = argv.find((a) => a.startsWith("--mode="));
const mode: RetentionCleanupMode =
  modeArg?.split("=")[1] === "delete" ? "delete" : "anonymize";
const confirmDelete = argv.includes("--confirm-delete");

const SAMPLE_LIMIT = 8;
const LAST_RUN_PATH = join(".data", "retention-cleanup-last-run.json");

type InquiryRow = {
  id: string;
  name: string;
  contact: string;
  message: string;
  source: string | null;
  admin_memo: string | null;
  updated_at: string;
  created_at: string;
};

type TalkSessionRow = {
  id: string;
  customer_name: string | null;
  customer_phone: string;
  admin_memo: string | null;
  last_message: string | null;
  last_message_at: string | null;
  updated_at: string;
  context_json: unknown;
  status: string;
};

type TalkMessageRow = {
  id: string;
  session_id: string;
  sender_type: string;
  message: string;
};

function sampleIds(ids: string[]): string[] {
  return ids.slice(0, SAMPLE_LIMIT);
}

function isProductionEnv(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL === "1"
  );
}

function assertCanRun(): void {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("[retention:cleanup] DATABASE_URL이 없습니다. 실행을 중단합니다.");
    process.exit(1);
  }
  if (mode === "delete" && !confirmDelete) {
    console.error(
      "[retention:cleanup] delete 모드는 위험합니다. --mode=delete 와 함께 --confirm-delete 플래그가 필요합니다.",
    );
    process.exit(1);
  }
}

async function main(): Promise<void> {
  assertCanRun();
  const started = Date.now();
  const now = new Date();
  const inquiryCutoff = getGeneralInquiryCutoff(now);
  const talkCutoff = getBatteryTalkCutoff(now);
  const sql = neon(process.env.DATABASE_URL!);

  const allInquiries = (await sql`
    SELECT id, name, contact, message, source, admin_memo, updated_at, created_at
    FROM customer_inquiries
  `) as InquiryRow[];

  const productQnaExcluded = allInquiries.filter(
    (r) => r.source === "product_qna" || r.source === "product_detail",
  ).length;

  const inquiryTargets: InquiryRow[] = [];
  let inquiryExcludedRecent = 0;
  let inquiryExcludedAlready = 0;
  let inquiryExcludedTest = 0;

  for (const row of allInquiries) {
    if (!isGeneralInquirySource(row.source)) continue;
    if (isRetentionAnonymizedInquiry({
      name: row.name,
      contact: row.contact,
      message: row.message,
      adminMemo: row.admin_memo,
    })) {
      inquiryExcludedAlready += 1;
      continue;
    }
    if (new Date(row.updated_at) >= inquiryCutoff) {
      inquiryExcludedRecent += 1;
      continue;
    }
    if (
      isRetentionExcludedTestInquiry({
        name: row.name,
        contact: row.contact,
        message: row.message,
        adminMemo: row.admin_memo,
      })
    ) {
      inquiryExcludedTest += 1;
      continue;
    }
    inquiryTargets.push(row);
  }

  const allSessions = (await sql`
    SELECT id, customer_name, customer_phone, admin_memo, last_message, last_message_at, updated_at, context_json, status
    FROM battery_talk_sessions
  `) as TalkSessionRow[];

  const sessionTargets: TalkSessionRow[] = [];
  let talkExcludedRecent = 0;
  let talkExcludedAlready = 0;
  let talkExcludedTest = 0;
  let talkForceAnonymizeOnDelete = 0;

  for (const row of allSessions) {
    if (
      isRetentionAnonymizedBatteryTalkSession({
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        adminMemo: row.admin_memo,
        lastMessage: row.last_message,
      })
    ) {
      talkExcludedAlready += 1;
      continue;
    }
    const activityAt = batteryTalkSessionActivityAt({
      lastMessageAt: row.last_message_at,
      updatedAt: row.updated_at,
    });
    if (activityAt >= talkCutoff) {
      talkExcludedRecent += 1;
      continue;
    }
    if (
      isRetentionExcludedTestBatteryTalk({
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        adminMemo: row.admin_memo,
      })
    ) {
      talkExcludedTest += 1;
      continue;
    }
    if (mode === "delete" && batteryTalkSessionHasOrderLink(row.context_json)) {
      talkForceAnonymizeOnDelete += 1;
    }
    sessionTargets.push(row);
  }

  const sessionTargetIds = sessionTargets.map((s) => s.id);
  let messageTargets: TalkMessageRow[] = [];

  if (sessionTargetIds.length > 0) {
    const allMessages = (await sql`
      SELECT id, session_id, sender_type, message
      FROM battery_talk_messages
      WHERE session_id = ANY(${sessionTargetIds})
    `) as TalkMessageRow[];
    messageTargets = allMessages.filter(
      (m) => !isRetentionAnonymizedBatteryTalkMessage(m.message),
    );
  }

  const report = {
    mode,
    dryRun,
    inquiryCutoff: formatRetentionCutoffIso(inquiryCutoff),
    talkCutoff: formatRetentionCutoffIso(talkCutoff),
    generalInquiry: {
      targets: inquiryTargets.length,
      excludedProductQna: productQnaExcluded,
      excludedRecent: inquiryExcludedRecent,
      excludedAlreadyAnonymized: inquiryExcludedAlready,
      excludedTestData: inquiryExcludedTest,
      sampleIds: sampleIds(inquiryTargets.map((r) => r.id)),
    },
    batteryTalk: {
      sessionTargets: sessionTargets.length,
      messageTargets: messageTargets.length,
      excludedRecent: talkExcludedRecent,
      excludedAlreadyAnonymized: talkExcludedAlready,
      excludedTestData: talkExcludedTest,
      forceAnonymizeOnDeleteDueToOrderLink: talkForceAnonymizeOnDelete,
      sampleSessionIds: sampleIds(sessionTargetIds),
      sampleMessageIds: sampleIds(messageTargets.map((m) => m.id)),
    },
  };

  console.log("=== 문의·상담 데이터 보관 정리 ===");
  console.log(`mode: ${mode}${dryRun ? " (dry-run)" : ""}`);
  console.log(`일반 상담문의 cutoff (updated_at <): ${report.inquiryCutoff}`);
  console.log(`배터리톡 cutoff (last_message_at/updated_at <): ${report.talkCutoff}`);
  console.log("");
  console.log("[일반 상담문의]");
  console.log(`  정리 대상: ${report.generalInquiry.targets}건`);
  console.log(`  제외 — 상품문의/Q&A (전체 보관): ${report.generalInquiry.excludedProductQna}건`);
  console.log(`  제외 — 최근 데이터 (6개월 미경과): ${report.generalInquiry.excludedRecent}건`);
  console.log(`  제외 — 이미 비식별: ${report.generalInquiry.excludedAlreadyAnonymized}건`);
  console.log(`  제외 — 테스트/UX2 데이터: ${report.generalInquiry.excludedTestData}건`);
  if (report.generalInquiry.sampleIds.length) {
    console.log(`  샘플 ID: ${report.generalInquiry.sampleIds.join(", ")}`);
  }
  console.log("");
  console.log("[배터리톡]");
  console.log(`  세션 정리 대상: ${report.batteryTalk.sessionTargets}건`);
  console.log(`  메시지 정리 대상: ${report.batteryTalk.messageTargets}건`);
  console.log(`  제외 — 최근 데이터 (1년 미경과): ${report.batteryTalk.excludedRecent}건`);
  console.log(`  제외 — 이미 비식별: ${report.batteryTalk.excludedAlreadyAnonymized}건`);
  console.log(`  제외 — 테스트/UX2 데이터: ${report.batteryTalk.excludedTestData}건`);
  if (mode === "delete" && talkForceAnonymizeOnDelete > 0) {
    console.log(
      `  delete 모드 — 주문 연결 세션은 삭제 대신 비식별: ${talkForceAnonymizeOnDelete}건`,
    );
  }
  if (report.batteryTalk.sampleSessionIds.length) {
    console.log(`  샘플 세션 ID: ${report.batteryTalk.sampleSessionIds.join(", ")}`);
  }
  if (report.batteryTalk.sampleMessageIds.length) {
    console.log(`  샘플 메시지 ID: ${report.batteryTalk.sampleMessageIds.join(", ")}`);
  }

  if (dryRun) {
    console.log("");
    console.log("dry-run 완료 — 변경 없음");
    return;
  }

  const failures: { scope: string; id: string; error: string }[] = [];
  let inquiryProcessed = 0;
  let talkSessionsProcessed = 0;
  let talkMessagesProcessed = 0;

  for (const row of inquiryTargets) {
    try {
      if (mode === "delete") {
        await sql`DELETE FROM customer_inquiries WHERE id = ${row.id}`;
      } else {
        const adminMemo = appendRetentionAdminMemo(row.admin_memo);
        await sql`
          UPDATE customer_inquiries
          SET
            name = ${RETENTION_ANONYMIZED_CUSTOMER_NAME},
            contact = ${RETENTION_MASKED_CONTACT},
            message = ${RETENTION_ANONYMIZED_INQUIRY_MESSAGE},
            vehicle = NULL,
            region = NULL,
            title = NULL,
            coupon_code = NULL,
            admin_memo = ${adminMemo}
          WHERE id = ${row.id}
        `;
      }
      inquiryProcessed += 1;
    } catch (err) {
      failures.push({
        scope: "inquiry",
        id: row.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const sessionsToDelete: TalkSessionRow[] = [];
  const sessionsToAnonymize: TalkSessionRow[] = [];

  for (const row of sessionTargets) {
    if (mode === "delete" && !batteryTalkSessionHasOrderLink(row.context_json)) {
      sessionsToDelete.push(row);
    } else {
      sessionsToAnonymize.push(row);
    }
  }

  for (const row of sessionsToAnonymize) {
    try {
      const adminMemo = appendRetentionAdminMemo(row.admin_memo);
      const nextStatus = row.status === "done" ? "done" : "done";
      await sql`
        UPDATE battery_talk_sessions
        SET
          customer_name = ${RETENTION_ANONYMIZED_CUSTOMER_NAME},
          customer_phone = ${RETENTION_MASKED_CONTACT},
          last_message = ${RETENTION_ANONYMIZED_TALK_MESSAGE},
          admin_memo = ${adminMemo},
          status = ${nextStatus},
          context_json = '{}'::jsonb
        WHERE id = ${row.id}
      `;
      talkSessionsProcessed += 1;
    } catch (err) {
      failures.push({
        scope: "battery_talk_session",
        id: row.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const anonymizeSessionIds = new Set(sessionsToAnonymize.map((s) => s.id));
  const messagesForAnonymize = messageTargets.filter((m) => anonymizeSessionIds.has(m.session_id));

  for (const row of messagesForAnonymize) {
    try {
      await sql`
        UPDATE battery_talk_messages
        SET message = ${RETENTION_ANONYMIZED_TALK_MESSAGE}
        WHERE id = ${row.id}
      `;
      talkMessagesProcessed += 1;
    } catch (err) {
      failures.push({
        scope: "battery_talk_message",
        id: row.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  for (const row of sessionsToDelete) {
    try {
      await sql`DELETE FROM battery_talk_sessions WHERE id = ${row.id}`;
      talkSessionsProcessed += 1;
    } catch (err) {
      failures.push({
        scope: "battery_talk_session_delete",
        id: row.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const elapsedMs = Date.now() - started;
  console.log("");
  console.log("=== 실행 결과 ===");
  console.log(`일반 상담문의 ${mode === "delete" ? "삭제" : "비식별"}: ${inquiryProcessed}건`);
  console.log(`배터리톡 세션 처리: ${talkSessionsProcessed}건`);
  console.log(`배터리톡 메시지 비식별: ${talkMessagesProcessed}건`);
  console.log(`실패: ${failures.length}건`);
  console.log(`처리 시간: ${elapsedMs}ms`);

  if (failures.length > 0) {
    console.log("");
    console.log("[부분 실패 상세]");
    for (const f of failures.slice(0, 20)) {
      console.log(`  ${f.scope} ${f.id}: ${f.error}`);
    }
    if (failures.length > 20) {
      console.log(`  ... 외 ${failures.length - 20}건`);
    }
  }

  try {
    mkdirSync(".data", { recursive: true });
    writeFileSync(
      LAST_RUN_PATH,
      JSON.stringify(
        {
          finishedAt: new Date().toISOString(),
          mode,
          inquiryProcessed,
          talkSessionsProcessed,
          talkMessagesProcessed,
          failures: failures.length,
          inquiryCutoff: report.inquiryCutoff,
          talkCutoff: report.talkCutoff,
          production: isProductionEnv(),
        },
        null,
        2,
      ),
      "utf8",
    );
  } catch {
    // 기록 실패는 정리 작업 성공과 분리
  }

  if (failures.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error("[retention:cleanup] 치명적 오류:", err);
  process.exit(1);
});
