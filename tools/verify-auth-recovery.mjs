/**
 * 계정 복구(아이디 찾기·비밀번호 재설정) 정적·단위 검증
 * 실제 SMS/이메일 발송 없음
 */
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
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

console.log("verify:auth-recovery");

// Routes & pages exist
for (const p of [
  "src/app/find-id/page.tsx",
  "src/app/forgot-password/page.tsx",
  "src/app/reset-password/page.tsx",
  "src/app/api/auth/find-id/send-otp/route.ts",
  "src/app/api/auth/find-id/verify-otp/route.ts",
  "src/app/api/auth/forgot-password/route.ts",
  "src/app/api/auth/reset-password/route.ts",
]) {
  assert(existsSync(join(root, p)), `file exists: ${p}`);
}

// Login links
assert(
  fileIncludes("src/components/auth/CustomerLoginForm.tsx", "CUSTOMER_FIND_ID_PAGE"),
  "login page links to find-id",
);
assert(
  fileIncludes("src/components/auth/CustomerLoginForm.tsx", "CUSTOMER_FORGOT_PASSWORD_PAGE"),
  "login page links to forgot-password",
);

// Enumeration-safe messages
assert(
  fileIncludes(
    "src/lib/auth/account-recovery-messages.ts",
    "입력하신 정보와 일치하는 계정이 있다면",
  ),
  "forgot-password generic response message",
);
assert(
  fileIncludes("src/app/api/auth/find-id/send-otp/route.ts", "uniformRecoveryDelay"),
  "find-id send uses uniform delay",
);

// OTP stored as hash (not plaintext)
assert(
  fileIncludes("src/lib/auth/verification-token.server.ts", "hashVerificationValue"),
  "verification tokens hashed",
);
assert(
  fileIncludes("src/lib/auth/verification-token.server.ts", "hashVerificationValue(params.otpCode)"),
  "OTP hashed before storage",
);
assert(
  fileIncludes("src/lib/auth/verification-token.server.ts", "token_hash"),
  "token_hash column used",
);

// scrypt reuse
assert(
  fileIncludes("src/app/api/auth/reset-password/route.ts", "hashMemberPassword"),
  "reset password uses scrypt hashMemberPassword",
);

// Session epoch invalidation
assert(
  fileIncludes("src/lib/auth/member-store.postgres.ts", "session_epoch = session_epoch + 1"),
  "password update bumps session epoch",
);
assert(
  fileIncludes("src/lib/auth/customer-session-core.ts", "sessionEpoch"),
  "session token includes epoch",
);

// Fail-closed provider checks
assert(
  fileIncludes("src/app/api/auth/find-id/send-otp/route.ts", "isSmsConfigured"),
  "find-id checks SMS config",
);
assert(
  fileIncludes("src/app/api/auth/forgot-password/route.ts", "isEmailConfigured"),
  "forgot-password checks email config",
);

// Rate limit
assert(
  fileIncludes("src/app/api/auth/find-id/send-otp/route.ts", "enforceRateLimitOrNull"),
  "find-id rate limited",
);

// Normalize helpers
const { normalizeMemberName, normalizeMemberPhoneDigits, maskLoginId } = await import(
  "../src/lib/auth/member-normalize.ts"
);
assert(normalizeMemberName("  김  일권  ") === "김 일권", "name normalization");
assert(normalizeMemberPhoneDigits("010-1234-5678") === "01012345678", "phone normalization");
assert(maskLoginId("kimil123").includes("*"), "loginId masking");

console.log(`\nauth-recovery: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
