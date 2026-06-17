/**
 * 로그인·회원가입·소셜·비회원 주문·계정 생명주기 mock 검증
 * 실제 OAuth/SMS/이메일/Production DB 쓰기 없음
 */
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ensureTsxVerify } from "../scripts/ensure-tsx-verify.mjs";

ensureTsxVerify(import.meta.url);

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

console.log("verify:auth-guest-flow\n");

// ── 1. 일반 로그인 ──
console.log("1) 일반 로그인");
assert(fileIncludes("src/app/api/auth/login/route.ts", "normalizeMemberLoginIdOrEmail"), "login email/id normalize");
assert(fileIncludes("src/app/api/auth/login/route.ts", "auth.login"), "login account-key rate limit");
assert(fileIncludes("src/lib/security/rate-limit-postgres.server.ts", "rate_limit_buckets"), "central postgres rate limit");
assert(fileIncludes("src/app/api/auth/login/route.ts", "resetRateLimitBucket"), "login success clears rate limit");
assert(fileIncludes("src/app/api/auth/login/route.ts", "rotate: true"), "login rotates session epoch");
assert(
  fileIncludes("src/app/api/auth/login/route.ts", "MEMBER_AUTH_MESSAGES.loginFailed"),
  "login uniform failure message",
);
assert(fileIncludes("src/lib/auth/customer-session.server.ts", "httpOnly: true"), "session cookie HttpOnly");
assert(fileIncludes("src/lib/auth/customer-session.server.ts", "sameSite: \"lax\""), "session cookie SameSite");

// ── 2. 일반 회원가입 ──
console.log("\n2) 일반 회원가입");
assert(fileIncludes("src/app/api/auth/signup/route.ts", "agreeTerms"), "signup server terms validation");
assert(fileIncludes("src/app/api/auth/signup/route.ts", "normalizeMemberEmailForStorage"), "signup email normalize");
assert(fileIncludes("src/app/api/auth/signup/route.ts", "normalizeMemberPhoneDigits"), "signup phone normalize");
assert(fileIncludes("src/app/api/auth/signup/route.ts", "signupConflict"), "signup generic conflict message");
assert(fileIncludes("src/app/api/auth/signup/route.ts", "isMemberUniqueViolation"), "signup UNIQUE race handling");
assert(fileIncludes("src/lib/auth/signup-validation.ts", "MAX_PASSWORD_LENGTH"), "password max length");
assert(fileIncludes("src/lib/auth/verification-token.server.ts", "invalidateVerificationTokens"), "OTP resend invalidates prior");

// ── 3. 소셜 로그인 ──
console.log("\n3) 소셜 로그인 (네이버·카카오·구글)");
for (const provider of ["naver", "kakao", "google"]) {
  assert(
    fileIncludes(`src/app/api/auth/${provider}/callback/route.ts`, "invalid_state"),
    `${provider} callback state validation`,
  );
}
assert(fileIncludes("src/lib/auth/oauth-start-route.ts", "crypto.randomUUID()"), "OAuth state entropy");
assert(
  fileIncludes("src/lib/auth/oauth-start-route.ts", "!redirect.startsWith(\"//\")"),
  "OAuth redirect open-redirect block",
);
assert(fileIncludes("src/lib/db/ensure-member-schema.ts", "idx_members_provider_pair"), "provider+providerId unique");
assert(
  fileIncludes("src/lib/auth/member-store.postgres.ts", "emailOwner.provider !== input.provider"),
  "social email collision policy",
);
assert(fileIncludes("src/lib/auth/oauth-callback.server.ts", "rotate: true"), "OAuth login session rotation");

// ── 4. 비밀번호 재설정 ──
console.log("\n4) 비밀번호 찾기·재설정");
assert(fileIncludes("src/lib/auth/verification-token.server.ts", "hashVerificationValue"), "reset token hashed");
assert(fileIncludes("src/app/api/auth/forgot-password/route.ts", "uniformRecoveryDelay"), "forgot-password uniform response");
assert(fileIncludes("src/lib/auth/member-store.postgres.ts", "session_epoch = session_epoch + 1"), "password change bumps epoch");

// ── 5. 로그아웃·세션 무효화 ──
console.log("\n5) 세션 무효화");
assert(fileIncludes("src/app/api/auth/logout/route.ts", "bumpMemberSessionEpoch"), "logout bumps session epoch");
assert(fileIncludes("src/lib/auth/customer-session-epoch.server.ts", "return null"), "epoch verify fail-closed");

// ── 6. 비회원 주문 생성 ──
console.log("\n6) 비회원 주문 생성");
assert(fileIncludes("src/app/api/orders/create/route.ts", "orders.create"), "order create rate limit");
assert(
  fileIncludes("src/app/api/orders/create/route.ts", "customerType: \"member\""),
  "logged-in forces member order",
);
assert(
  fileIncludes("src/app/api/orders/create/route.ts", "userId: undefined"),
  "guest strips injected userId",
);
assert(
  fileIncludes("src/lib/payment/commerce-order-create-idempotency.server.ts", "checkoutAttemptMemberMatches"),
  "checkout attempt member namespace",
);

// ── 7. 비회원 주문 조회 ──
console.log("\n7) 비회원 주문 조회");
assert(fileIncludes("src/app/api/orders/lookup/route.ts", "orders.lookup"), "lookup IP rate limit");
assert(fileIncludes("src/lib/security/guest-order-access.server.ts", "computeGuestLookupAccessKey"), "guest access proof HMAC");
assert(
  !fileIncludes("src/lib/security/guest-order-access.server.ts", "console.log"),
  "guest access no debug log",
);
assert(fileIncludes("src/lib/payment/order-payment-access.server.ts", "assertGuestOrderAccess"), "order access gate");

// ── Runtime unit scenarios ──
console.log("\n8) 런타임 시나리오");

await import("../scripts/register-server-only.mjs");

const { normalizeMemberLoginIdOrEmail, hashMemberLoginAccountKey, normalizeMemberEmailForStorage } =
  await import("../src/lib/auth/member-login-identity.server.ts");
const { normalizeMemberPhoneDigits } = await import("../src/lib/auth/member-normalize.ts");
const { isValidPassword, MAX_PASSWORD_LENGTH } = await import("../src/lib/auth/signup-validation.ts");
const { consumeRateLimit } = await import("../src/lib/security/rate-limit.server.ts");
const { clearMemoryRateLimitBuckets } = await import(
  "../src/lib/security/rate-limit-memory.server.ts"
);
process.env.BM_RATE_LIMIT_ADAPTER = "memory";
clearMemoryRateLimitBuckets();
const { isMemberUniqueViolation } = await import("../src/lib/auth/member-db-errors.server.ts");
const { checkoutAttemptMemberMatches } = await import(
  "../src/lib/payment/commerce-order-create-idempotency.server.ts"
);
const { computeGuestLookupAccessKey, orderMatchesGuestAccessKey } = await import(
  "../src/lib/security/guest-order-access.server.ts"
);

process.env.CUSTOMER_SESSION_SECRET =
  process.env.CUSTOMER_SESSION_SECRET || "verify-auth-guest-flow-secret";

assert(
  normalizeMemberLoginIdOrEmail("  User@Example.COM ") === "user@example.com",
  "대소문자·공백 다른 동일 이메일 정규화",
);
assert(
  normalizeMemberEmailForStorage("A@B.COM") === normalizeMemberEmailForStorage("a@b.com"),
  "동일 이메일 대소문자 중복 방지",
);
assert(
  normalizeMemberPhoneDigits("010-1234-5678") === normalizeMemberPhoneDigits("01012345678"),
  "공백·하이픈 다른 동일 전화번호",
);

const acctKey = hashMemberLoginAccountKey("user@test.com");
assert(acctKey.length === 16, "account rate-limit key hashed");

let blocked = false;
for (let i = 0; i < 12; i++) {
  const r = await consumeRateLimit({
    namespace: "auth.login",
    parts: ["ip", acctKey],
    limit: 10,
    windowMs: 60_000,
  });
  if (!r.ok) blocked = true;
}
assert(blocked, "로그인 실패 반복 rate limit");
clearMemoryRateLimitBuckets();

assert(!isValidPassword("a".repeat(MAX_PASSWORD_LENGTH + 1)), "과도하게 긴 비밀번호 거부");
assert(isMemberUniqueViolation(new Error('duplicate key "idx_members_email_lower"')), "UNIQUE violation detect");

const guestOrder = {
  orderId: "co_g1",
  orderNumber: "BM-1",
  customerName: "홍길동",
  customerPhone: "010-1111-2222",
  customerType: "guest",
};
const memberOrder = { ...guestOrder, userId: "bm-user-a", customerType: "member" };
assert(!checkoutAttemptMemberMatches(memberOrder, "bm-user-b"), "다른 회원 checkout attempt 격리");
assert(checkoutAttemptMemberMatches(memberOrder, "bm-user-a"), "동일 회원 checkout attempt 허용");
assert(checkoutAttemptMemberMatches(guestOrder, undefined), "비회원 checkout attempt namespace");

const keyA = await computeGuestLookupAccessKey("홍길동", "01011112222");
const keyB = await computeGuestLookupAccessKey("김철수", "01099998888");
assert(keyA !== keyB, "다른 비회원 주문 proof 분리");
assert(await orderMatchesGuestAccessKey(guestOrder, keyA), "올바른 guest proof 매칭");
assert(!(await orderMatchesGuestAccessKey(guestOrder, keyB)), "다른 비회원 주문 proof 사용 차단");

for (let i = 0; i < 6; i++) {
  await consumeRateLimit({
    namespace: "orders.lookup",
    parts: ["ip", "enum-test"],
    limit: 5,
    windowMs: 60_000,
  });
}
const enumBlocked = !(await consumeRateLimit({
  namespace: "orders.lookup",
  parts: ["ip", "enum-test"],
  limit: 5,
  windowMs: 60_000,
})).ok;
assert(enumBlocked, "주문번호 반복 대입 rate limit");

console.log(`\nauth-guest-flow: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
