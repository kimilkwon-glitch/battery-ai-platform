/**
 * Guest name+phone lookup security verification
 * Usage: npm run verify:guest-name-phone-lookup
 */
import { ensureTsxVerify } from "../scripts/ensure-tsx-verify.mjs";

ensureTsxVerify(import.meta.url);

process.env.CUSTOMER_SESSION_SECRET ??=
  "test-secret-for-guest-name-phone-lookup-verify-only";

await import("../scripts/register-server-only.mjs");

const assert = (await import("node:assert/strict")).default;

const {
  computeGuestLookupAccessKey,
  orderMatchesGuestAccessKey,
  mintGuestCustomerAccessToken,
  verifyGuestOrderPhoneProof,
  verifyGuestOrderNamePhoneProof,
} = await import("../src/lib/security/guest-order-access.server.ts");

const {
  normalizeCustomerLookupName,
  normalizeCustomerLookupPhone,
  isValidCustomerLookupInput,
} = await import("../src/lib/orders/customer-lookup-identity.ts");

assert.equal(normalizeCustomerLookupName("  홍길동  "), "홍길동");
assert.equal(normalizeCustomerLookupPhone("010-1234-5678"), "01012345678");
assert.equal(isValidCustomerLookupInput("홍길동", "01012345678"), true);
assert.equal(isValidCustomerLookupInput("홍길동", "123"), false);

const orderA = {
  orderId: "co_a",
  orderNumber: "BM-001",
  customerName: "홍길동",
  customerPhone: "010-1234-5678",
};
const orderB = {
  orderId: "co_b",
  orderNumber: "BM-002",
  customerName: "홍길동",
  customerPhone: "010-9999-8888",
};

const keyA = await computeGuestLookupAccessKey("홍길동", "01012345678");
const keyB = await computeGuestLookupAccessKey("홍길동", "01099998888");
assert.notEqual(keyA, keyB, "different phones must produce different access keys");
assert.equal(await orderMatchesGuestAccessKey(orderA, keyA), true);
assert.equal(await orderMatchesGuestAccessKey(orderB, keyA), false, "same name different phone blocked");

assert.equal(verifyGuestOrderNamePhoneProof(orderA, "홍길동", "01012345678"), true);
assert.equal(verifyGuestOrderNamePhoneProof(orderA, "김철수", "01012345678"), false);
assert.equal(verifyGuestOrderPhoneProof(orderA, "01012345678", "BM-001"), true);

const token = await mintGuestCustomerAccessToken("홍길동", "01012345678");
assert.ok(token.includes("."), "signed token format");

console.log("verify-guest-name-phone-lookup: all checks passed");
