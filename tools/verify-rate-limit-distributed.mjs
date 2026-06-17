#!/usr/bin/env node
/**
 * 분산 rate limit mock 검증 — Production DB·외부 API 없음 (memory adapter 기본)
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ensureTsxVerify } from "../scripts/ensure-tsx-verify.mjs";

ensureTsxVerify(import.meta.url);

process.env.BM_RATE_LIMIT_ADAPTER = "memory";
process.env.CUSTOMER_SESSION_SECRET = process.env.CUSTOMER_SESSION_SECRET || "verify-rate-limit-secret";

await import("../scripts/register-server-only.mjs");

const {
  clearMemoryRateLimitBuckets,
  memoryRateLimitAdapter,
} = await import("../src/lib/security/rate-limit-memory.server.ts");
const {
  consumeRateLimit,
  resetRateLimitBucket,
  setRateLimitAdapterForTests,
} = await import("../src/lib/security/rate-limit.server.ts");
const { hashRateLimitIdentity, hashRateLimitIp } = await import(
  "../src/lib/security/rate-limit-hash.server.ts"
);

let passed = 0;
let failed = 0;
function ok(l) {
  passed++;
  console.log(`  ✓ ${l}`);
}
function fail(l, d) {
  failed++;
  console.error(`  ✗ ${l}${d ? `: ${d}` : ""}`);
}
function assert(c, l, d) {
  if (c) ok(l);
  else fail(l, d);
}
function fileIncludes(p, n) {
  const f = join(process.cwd(), p);
  return existsSync(f) && readFileSync(f, "utf8").includes(n);
}

console.log("verify:rate-limit-distributed\n");

setRateLimitAdapterForTests(memoryRateLimitAdapter);
clearMemoryRateLimitBuckets();

// 1 shared bucket via adapter
const ns = "auth.login";
const ipHash = hashRateLimitIp("203.0.113.10");
const r1 = await consumeRateLimit({ namespace: ns, parts: ["ip", ipHash], limit: 3, windowMs: 60_000 });
const r2 = await consumeRateLimit({ namespace: ns, parts: ["ip", ipHash], limit: 3, windowMs: 60_000 });
assert(r1.ok && r2.ok && r2.requestCount === 2, "동일 bucket 공유 (adapter)");

// 2 login IP limit
clearMemoryRateLimitBuckets();
let ipBlocked = false;
for (let i = 0; i < 12; i++) {
  const r = await consumeRateLimit({
    namespace: "auth.login",
    parts: ["ip", hashRateLimitIp("198.51.100.1")],
    limit: 10,
    windowMs: 60_000,
  });
  if (!r.ok) ipBlocked = true;
}
assert(ipBlocked, "동일 IP 로그인 반복 제한");

// 3 account + multi IP
clearMemoryRateLimitBuckets();
const acct = hashRateLimitIdentity("auth.login", "acct", "user@test.com");
let acctBlocked = false;
for (let i = 0; i < 12; i++) {
  const r = await consumeRateLimit({
    namespace: "auth.login",
    parts: ["acct", acct],
    limit: 10,
    windowMs: 60_000,
  });
  if (!r.ok) acctBlocked = true;
}
assert(acctBlocked, "동일 계정 + 여러 IP 제한");

// 4 many accounts same IP
clearMemoryRateLimitBuckets();
let multiAcctBlocked = false;
for (let i = 0; i < 12; i++) {
  const r = await consumeRateLimit({
    namespace: "auth.login",
    parts: ["acct", hashRateLimitIdentity("auth.login", "acct", `user${i}@test.com`)],
    limit: 10,
    windowMs: 60_000,
  });
  if (!r.ok) multiAcctBlocked = true;
}
assert(!multiAcctBlocked, "여러 계정 + 동일 IP는 계정별 limit");

// 5 reset after success
clearMemoryRateLimitBuckets();
const loginIp = hashRateLimitIp("203.0.113.55");
for (let i = 0; i < 10; i++) {
  await consumeRateLimit({
    namespace: "auth.login",
    parts: ["ip", loginIp],
    limit: 10,
    windowMs: 60_000,
  });
}
await resetRateLimitBucket({ namespace: "auth.login", parts: ["ip", loginIp] });
const afterReset = await consumeRateLimit({
  namespace: "auth.login",
  parts: ["ip", loginIp],
  limit: 10,
  windowMs: 60_000,
});
assert(afterReset.ok && afterReset.requestCount === 1, "성공 로그인 후 bucket reset");

// 6 signup burst
clearMemoryRateLimitBuckets();
let signupBlocked = false;
for (let i = 0; i < 25; i++) {
  const r = await consumeRateLimit({
    namespace: "auth.signup",
    parts: ["ip", hashRateLimitIp("198.51.100.99")],
    limit: 10,
    windowMs: 60_000,
  });
  if (!r.ok) signupBlocked = true;
}
assert(signupBlocked, "회원가입 burst 제한");

// 7 OTP cooldown
clearMemoryRateLimitBuckets();
const phoneH = hashRateLimitIdentity("auth.find_id_cooldown", "phone", "01012345678");
const c1 = await consumeRateLimit({
  namespace: "auth.find_id_cooldown",
  parts: ["phone", phoneH],
  limit: 1,
  windowMs: 60_000,
});
const c2 = await consumeRateLimit({
  namespace: "auth.find_id_cooldown",
  parts: ["phone", phoneH],
  limit: 1,
  windowMs: 60_000,
});
assert(c1.ok && !c2.ok, "OTP 재발급 cooldown");

// 8 forgot password uniform (static)
assert(fileIncludes("src/app/api/auth/forgot-password/route.ts", "forgotPasswordOk"), "비밀번호 찾기 uniform 응답");

// 9 orders lookup
clearMemoryRateLimitBuckets();
let lookupBlocked = false;
for (let i = 0; i < 25; i++) {
  const r = await consumeRateLimit({
    namespace: "orders.lookup",
    parts: ["ip", hashRateLimitIp("203.0.113.77")],
    limit: 20,
    windowMs: 60_000,
  });
  if (!r.ok) lookupBlocked = true;
}
assert(lookupBlocked, "비회원 주문 조회 반복 제한");

// 10 guest proof failures (namespace)
clearMemoryRateLimitBuckets();
let proofBlocked = false;
for (let i = 0; i < 15; i++) {
  const r = await consumeRateLimit({
    namespace: "orders.lookup",
    parts: ["identity", hashRateLimitIdentity("orders.lookup", "identity", "name", "1234")],
    limit: 10,
    windowMs: 60_000,
  });
  if (!r.ok) proofBlocked = true;
}
assert(proofBlocked, "guest proof 반복 실패 제한");

// 11 order create
assert(fileIncludes("src/app/api/orders/create/route.ts", "orders.create"), "주문 생성 rate limit");

// 12 payment confirm idempotency coexistence
assert(
  fileIncludes("src/lib/payment/commerce-payment-confirm.server.ts", "idempotent"),
  "결제 confirm idempotency 유지",
);
assert(fileIncludes("src/app/api/payments/confirm/route.ts", "payments.confirm"), "결제 confirm rate limit");

// 13 Q&A / inquiries / reviews
assert(fileIncludes("src/app/api/support/inquiries/route.ts", "support.inquiries"), "문의/Q&A rate limit");
assert(fileIncludes("src/app/api/reviews/submit/route.ts", "reviews.submit"), "리뷰 rate limit");

// 14 battery talk
assert(
  fileIncludes("src/app/api/battery-talk/sessions/route.ts", "battery_talk.session_create"),
  "배터리톡 세션 rate limit",
);
assert(
  fileIncludes("src/app/api/battery-talk/sessions/[sessionId]/messages/route.ts", "battery_talk.message_send"),
  "배터리톡 메시지 rate limit",
);

// 15 window expiry — short window
clearMemoryRateLimitBuckets();
setRateLimitAdapterForTests(memoryRateLimitAdapter);
const short = await consumeRateLimit({
  namespace: "test.expire",
  parts: ["k", "1"],
  limit: 1,
  windowMs: 50,
});
await new Promise((r) => setTimeout(r, 60));
const afterExpire = await consumeRateLimit({
  namespace: "test.expire",
  parts: ["k", "1"],
  limit: 1,
  windowMs: 50,
});
assert(short.ok && afterExpire.ok, "만료 window 이후 재허용");

// 16 no PII in hash module
assert(
  fileIncludes("src/lib/security/rate-limit-postgres.server.ts", "identity_hash") &&
    !fileIncludes("src/lib/security/rate-limit-postgres.server.ts", "loginId"),
  "원본 개인정보 DB 저장 없음",
);

// 17 sensitive fail-closed when store missing
setRateLimitAdapterForTests(null);
delete process.env.BM_RATE_LIMIT_ADAPTER;
const prevNodeEnv = process.env.NODE_ENV;
const prevVercel = process.env.VERCEL;
process.env.NODE_ENV = "production";
process.env.VERCEL = "1";
const sensitiveFail = await consumeRateLimit({
  namespace: "auth.login",
  parts: ["ip", "x"],
  limit: 1,
  windowMs: 1000,
  policy: "sensitive",
});
process.env.NODE_ENV = prevNodeEnv;
if (prevVercel === undefined) delete process.env.VERCEL;
else process.env.VERCEL = prevVercel;
process.env.BM_RATE_LIMIT_ADAPTER = "memory";
setRateLimitAdapterForTests(undefined);
assert(!sensitiveFail.ok && sensitiveFail.storeUnavailable, "민감 API store 장애 fail-closed");

// 18 public fail-open
setRateLimitAdapterForTests(null);
delete process.env.BM_RATE_LIMIT_ADAPTER;
const publicOk = await consumeRateLimit({
  namespace: "public.read",
  parts: ["ip", "x"],
  limit: 1,
  windowMs: 1000,
  policy: "public",
});
process.env.BM_RATE_LIMIT_ADAPTER = "memory";
setRateLimitAdapterForTests(undefined);
assert(publicOk.ok, "공개 읽기 fail-open");

// 19 Retry-After
clearMemoryRateLimitBuckets();
await consumeRateLimit({ namespace: "t", parts: ["a"], limit: 1, windowMs: 30_000 });
const blocked = await consumeRateLimit({ namespace: "t", parts: ["a"], limit: 1, windowMs: 30_000 });
assert(!blocked.ok && blocked.retryAfterSec >= 1 && blocked.retryAfterSec <= 30, "Retry-After 정확성");

// 20 concurrent race
clearMemoryRateLimitBuckets();
const concurrent = await Promise.all(
  Array.from({ length: 20 }, () =>
    consumeRateLimit({ namespace: "race", parts: ["k"], limit: 10, windowMs: 60_000 }),
  ),
);
const maxCount = Math.max(...concurrent.map((r) => r.requestCount));
assert(maxCount <= 10, "동시 consume race limit 초과 없음");

// Static postgres adapter
assert(fileIncludes("scripts/migrations/rate-limit-buckets.sql", "rate_limit_buckets"), "rate limit migration");
assert(fileIncludes("src/lib/security/rate-limit-postgres.server.ts", "ON CONFLICT"), "postgres atomic upsert");
assert(fileIncludes("src/lib/security/client-ip.server.ts", "x-vercel-forwarded-for"), "Vercel IP helper");

console.log(`\nrate-limit-distributed: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
