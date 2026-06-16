/**
 * 마이페이지 비밀번호 변경 검증 — 실제 API 호출 없음
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

console.log("verify:auth-password-change");

assert(
  existsSync(join(root, "src/app/api/auth/change-password/route.ts")),
  "change-password API exists",
);
assert(
  existsSync(join(root, "src/components/mypage/ProfilePasswordChangeForm.tsx")),
  "ProfilePasswordChangeForm exists",
);
assert(
  fileIncludes("src/components/mypage/ProfileEditForm.tsx", "ProfilePasswordChangeForm"),
  "profile edit embeds password change form",
);

assert(
  fileIncludes("src/app/api/auth/change-password/route.ts", "getVerifiedCustomerSessionFromRequest"),
  "change-password requires session",
);
assert(
  fileIncludes("src/app/api/auth/change-password/route.ts", "verifyMemberPassword"),
  "change-password verifies current password",
);
assert(
  fileIncludes("src/app/api/auth/change-password/route.ts", "clearCustomerSessionCookie"),
  "change-password clears session after success",
);
assert(
  fileIncludes("src/app/api/auth/change-password/route.ts", "oauthAccount"),
  "OAuth members blocked from password change",
);
assert(
  !fileIncludes("src/app/api/auth/change-password/route.ts", "body.userId"),
  "change-password does not trust body userId",
);

assert(
  fileIncludes("src/components/mypage/ProfilePasswordChangeForm.tsx", "autoComplete=\"current-password\""),
  "current password autocomplete",
);
assert(
  fileIncludes("src/components/mypage/ProfilePasswordChangeForm.tsx", "autoComplete=\"new-password\""),
  "new password autocomplete",
);

console.log(`\nauth-password-change: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
