#!/usr/bin/env node
/**
 * 테스트 상담 데이터 cleanup — dry-run 기본
 * Usage:
 *   npx tsx tools/cleanup-test-inquiries.mjs           # dry-run
 *   npx tsx tools/cleanup-test-inquiries.mjs --apply   # 실제 삭제
 */
import "../scripts/register-server-only.mjs";
import { isUx2AdminReviewRecord } from "../src/lib/admin/ux2-admin-review-marker.ts";

const apply = process.argv.includes("--apply");

function isMeaninglessJamo(text) {
  const t = text.trim();
  return t.length > 0 && t.length <= 4 && /^[ㄱ-ㅎㅏ-ㅣ\s]+$/.test(t);
}

function isCleanupCandidate(record) {
  if (
    isUx2AdminReviewRecord({
      name: record.name,
      phone: record.contact,
      memo: record.message,
    })
  ) {
    return { ok: false, reason: "UX2/운영검수 데이터" };
  }

  const name = record.name.trim();
  const message = record.message.trim();

  if (name === "정보 숨김 고객") {
    return { ok: false, reason: "시스템/익명 고객 레코드" };
  }

  if (name === "남아님아" && (message === "남아" || isMeaninglessJamo(message))) {
    return { ok: true, reason: "명시적 테스트 (남아님아/남아)" };
  }

  if (name === "남아님아" && message.length <= 8) {
    return { ok: true, reason: "테스트명 + 짧은 무의미 내용" };
  }

  if (isMeaninglessJamo(message) && name.length <= 8 && message.length <= 4) {
    return { ok: true, reason: "자모/무의미 짧은 문의" };
  }

  return { ok: false, reason: "운영 후보 아님" };
}

async function main() {
  const { inquiryList } = await import("../src/lib/inquiry/inquiry-store.postgres.ts");
  const { inquiryDeleteByIds } = await import("../src/lib/inquiry/inquiry-store.postgres.ts");

  const all = await inquiryList({ limit: 2000, includeTestData: true });
  const candidates = [];

  for (const row of all) {
    const verdict = isCleanupCandidate({
      id: row.id,
      name: row.name,
      contact: row.contact,
      message: row.message,
      source: row.source,
      createdAt: row.createdAt,
    });
    if (verdict.ok) {
      candidates.push({ row, reason: verdict.reason });
    }
  }

  console.log(`cleanup-test-inquiries: ${apply ? "APPLY" : "DRY-RUN"}`);
  console.log(`전체 ${all.length}건 중 삭제 후보 ${candidates.length}건\n`);

  if (candidates.length === 0) {
    console.log("삭제 대상 없음.");
    return;
  }

  for (const { row, reason } of candidates) {
    console.log(`- ${row.id}`);
    console.log(`  name: ${row.name}`);
    console.log(`  message: ${row.message.slice(0, 80)}`);
    console.log(`  source: ${row.source ?? "—"} | created: ${row.createdAt}`);
    console.log(`  reason: ${reason}\n`);
  }

  if (!apply) {
    console.log("실제 삭제하려면 --apply 플래그를 사용하세요.");
    return;
  }

  const deleted = await inquiryDeleteByIds(candidates.map((c) => c.row.id));
  console.log(`삭제 완료: ${deleted}건`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
