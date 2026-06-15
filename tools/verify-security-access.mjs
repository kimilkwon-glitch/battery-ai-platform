/**
 * Security access checks — unit-level (no live Toss/SOLAPI/Sweettracker)
 * Usage: node tools/verify-security-access.mjs
 */
import assert from "node:assert/strict";
import { createSignedAccessToken, verifySignedAccessToken } from "../src/lib/security/signed-access-token.server.ts";

const SECRET = "test-secret-for-security-verify-only";

async function run() {
  const token = await createSignedAccessToken("goa:co_test_order", SECRET, 3600);
  const ok = await verifySignedAccessToken(token, SECRET, "goa:co_test_order");
  assert.ok(ok, "signed token should verify");

  const wrong = await verifySignedAccessToken(token, SECRET, "goa:other");
  assert.equal(wrong, null, "wrong subject should fail");

  const { verifyGuestOrderPhoneProof } = await import(
    "../src/lib/security/guest-order-access.server.ts"
  );
  const order = {
    orderId: "co_1",
    orderNumber: "BM-20260101-0001",
    customerPhone: "010-1234-5678",
  };
  assert.equal(
    verifyGuestOrderPhoneProof(order, "01012345678", "BM-20260101-0001"),
    true,
    "phone+orderNumber proof",
  );
  assert.equal(
    verifyGuestOrderPhoneProof(order, "01099998888", "BM-20260101-0001"),
    false,
    "wrong phone should fail",
  );

  console.log("verify-security-access: all checks passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
