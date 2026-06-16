/**
 * 관리자 FAQ UI — 필터·정렬·삭제 정적 검증 (데이터 변경 없음)
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
let passed = 0;
let failed = 0;

function ok(label) {
  passed += 1;
  console.log(`  ✓ ${label}`);
}

function fail(label, detail) {
  failed += 1;
  console.error(`  ✗ ${label}${detail ? `: ${detail}` : ""}`);
}

function assert(cond, label, detail) {
  if (cond) ok(label);
  else fail(label, detail);
}

function fileIncludes(relPath, needle) {
  const full = join(root, relPath);
  if (!existsSync(full)) return false;
  return readFileSync(full, "utf8").includes(needle);
}

console.log("verify:admin-faq-ui");

assert(
  fileIncludes("src/components/admin/AdminSupportFaqClient.tsx", "categoryFilter"),
  "category filter state",
);
assert(
  fileIncludes("src/components/admin/AdminSupportFaqClient.tsx", "sortBy"),
  "sort state",
);
assert(
  fileIncludes("src/components/admin/AdminSupportFaqClient.tsx", "sortFaqItems"),
  "client-side sort helper",
);
assert(
  fileIncludes("src/components/admin/AdminSupportFaqClient.tsx", "deleteTarget"),
  "delete confirmation modal",
);
assert(
  fileIncludes("src/components/admin/AdminSupportFaqClient.tsx", "삭제한 FAQ는 복구할 수 없습니다"),
  "delete warning message",
);
assert(
  fileIncludes("src/components/admin/AdminSupportFaqClient.tsx", 'method: "DELETE"'),
  "delete API call",
);
assert(
  fileIncludes("src/app/api/admin/support-faq/[id]/route.ts", "verifyAdminApiRequest"),
  "delete API admin auth",
);
assert(
  fileIncludes("src/components/admin/AdminSupportFaqClient.tsx", "categoryCounts"),
  "category counts",
);
assert(
  fileIncludes("src/components/admin/AdminSupportFaqClient.tsx", "현재 표시"),
  "display count summary",
);
assert(
  !fileIncludes("src/components/support/CustomerFaqAccordion.tsx", "sortBy"),
  "customer FAQ unchanged sort UI",
);

console.log(`\nverify:admin-faq-ui — ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
