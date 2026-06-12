#!/usr/bin/env node
/**
 * SOLAPI 알림톡 dry-run/mock 검증 (실제 SOLAPI 호출 없음)
 * Usage: node tools/verify-alimtalk.mjs
 */
import "../scripts/register-server-only.mjs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

process.env.NODE_ENV = process.env.NODE_ENV ?? "development";

const DATA_DIR = path.join(process.cwd(), ".data");
const LOG_PATH = path.join(DATA_DIR, "notification-logs.json");

const {
  buildAlimtalkTemplateVariables,
  buildAlimtalkPayloadPreview,
  sendAlimtalkEvent,
} = await import("../src/lib/notifications/alimtalk-service.ts");
const { formatAlimtalkAmount, normalizeAlimtalkPhone } = await import(
  "../src/lib/notifications/solapi.server.ts"
);

let passed = 0;
let failed = 0;

function assert(name, cond, detail = "") {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function withEnv(patch, fn) {
  const prev = {};
  for (const [k, v] of Object.entries(patch)) {
    prev[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  const prevDb = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    return await fn();
  } finally {
    if (prevDb === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = prevDb;
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

async function resetLogs() {
  await mkdir(DATA_DIR, { recursive: true });
  await rm(LOG_PATH, { force: true });
}

const mockConfig = { apiKey: "test-key", apiSecret: "test-secret", pfId: "test-pf" };
const mockDeps = {
  isLive: () => true,
  getConfig: () => mockConfig,
  dispatch: async () => ({ ok: true, messageId: "mock-message-id" }),
};

console.log("verify-alimtalk: payload & skip rules\n");

assert(
  "signup variables empty",
  Object.keys(buildAlimtalkTemplateVariables("signup")).length === 0,
);
assert(
  "order_created variables",
  buildAlimtalkTemplateVariables("order_created", {
    orderNumber: "ORD-1",
    productName: "배터리",
    paymentAmount: 83420,
  })["#{결제금액}"] === "83,420원",
);
assert(
  "order_confirmed variables",
  buildAlimtalkTemplateVariables("order_confirmed", {
    orderNumber: "ORD-1",
    productName: "배터리",
  })["#{상품명}"] === "배터리",
);
assert(
  "order_shipped variables",
  buildAlimtalkTemplateVariables("order_shipped", {
    orderNumber: "ORD-1",
    carrier: "CJ대한통운",
    trackingNumber: "1234567890",
  })["#{운송장번호}"] === "1234567890",
);
assert(
  "cancel_refund variables",
  buildAlimtalkTemplateVariables("cancel_refund", {
    orderNumber: "ORD-1",
    processStatus: "접수됨",
  })["#{처리상태}"] === "접수됨",
);
assert("format amount", formatAlimtalkAmount(83420) === "83,420원");
assert("normalize phone", normalizeAlimtalkPhone("010-1234-5678") === "01012345678");
assert("invalid phone", normalizeAlimtalkPhone("123") === null);

await resetLogs();

console.log("\nverify-alimtalk: send rules (mock, no HTTP)\n");

const entityBase = `verify-${Date.now()}`;

await withEnv({}, async () => {
  const r = await sendAlimtalkEvent({
    eventType: "signup",
    entityType: "member",
    entityId: `${entityBase}-no-env`,
    phone: "01011112222",
  });
  assert("missing env skips", r.status === "skipped" && r.skipReason === "missing_env");
});

await withEnv(
  {
    SOLAPI_API_KEY: "k",
    SOLAPI_API_SECRET: "s",
    SOLAPI_KAKAO_PFID: "pf",
    SOLAPI_TEMPLATE_SIGNUP: "tpl-signup",
    SOLAPI_ALIMTALK_LIVE: "false",
  },
  async () => {
    await resetLogs();
    const r = await sendAlimtalkEvent({
      eventType: "signup",
      entityType: "member",
      entityId: `${entityBase}-dry`,
      phone: "01011112222",
    });
    assert(
      "dry_run skips",
      r.status === "skipped" && r.skipReason === "dry_run" && r.dryRun,
      `got status=${r.status} reason=${r.skipReason}`,
    );
  },
);

await withEnv(
  {
    SOLAPI_API_KEY: "k",
    SOLAPI_API_SECRET: "s",
    SOLAPI_KAKAO_PFID: "pf",
    SOLAPI_ALIMTALK_LIVE: "false",
  },
  async () => {
    await resetLogs();
    const r = await sendAlimtalkEvent({
      eventType: "order_created",
      entityType: "order",
      entityId: `${entityBase}-no-tpl`,
      phone: "01011112222",
      orderId: `${entityBase}-order`,
    });
    assert("missing template skips", r.status === "skipped" && r.skipReason === "missing_template");
  },
);

await withEnv(
  {
    SOLAPI_API_KEY: "k",
    SOLAPI_API_SECRET: "s",
    SOLAPI_KAKAO_PFID: "pf",
    SOLAPI_TEMPLATE_ORDER_CREATED: "tpl-order",
    SOLAPI_ALIMTALK_LIVE: "false",
  },
  async () => {
    await resetLogs();
    const r = await sendAlimtalkEvent({
      eventType: "order_created",
      entityType: "order",
      entityId: `${entityBase}-no-phone`,
      phone: "",
      orderId: `${entityBase}-order2`,
      variables: { orderNumber: "O-1", productName: "P", paymentAmount: 1000 },
    });
    assert("missing phone skips", r.status === "skipped" && r.skipReason === "missing_phone");
  },
);

await withEnv(
  {
    SOLAPI_API_KEY: "k",
    SOLAPI_API_SECRET: "s",
    SOLAPI_KAKAO_PFID: "pf",
    SOLAPI_TEMPLATE_SIGNUP: "tpl-signup",
    SOLAPI_ALIMTALK_LIVE: "true",
  },
  async () => {
    await resetLogs();
    const input = {
      eventType: "signup",
      entityType: "member",
      entityId: `${entityBase}-dup`,
      phone: "01099998888",
    };
    const first = await sendAlimtalkEvent(input, mockDeps);
    const second = await sendAlimtalkEvent(input, mockDeps);
    assert("mock send succeeds", first.status === "sent" && first.providerMessageId === "mock-message-id");
    assert("duplicate blocked", second.status === "skipped" && second.skipReason === "already_sent");
  },
);

await withEnv(
  {
    SOLAPI_API_KEY: "k",
    SOLAPI_API_SECRET: "s",
    SOLAPI_KAKAO_PFID: "pf",
    SOLAPI_TEMPLATE_SIGNUP: "tpl-signup",
    SOLAPI_ALIMTALK_LIVE: "true",
  },
  async () => {
    await resetLogs();
    const failDeps = {
      ...mockDeps,
      dispatch: async () => ({ ok: false, error: "mock solapi failure" }),
    };
    const r = await sendAlimtalkEvent(
      {
        eventType: "signup",
        entityType: "member",
        entityId: `${entityBase}-fail`,
        phone: "01077776666",
      },
      failDeps,
    );
    assert("failure logged", r.status === "failed" && r.skipReason === "solapi_error");
  },
);

const preview = buildAlimtalkPayloadPreview({
  eventType: "order_created",
  entityType: "order",
  entityId: "x",
  phone: "01012345678",
  templateId: "tpl",
  pfId: "pf",
  variables: { orderNumber: "N-1", productName: "상품", paymentAmount: 5000 },
});
assert(
  "payload preview keys",
  preview?.variables["#{주문번호}"] === "N-1" && preview.to === "01012345678",
);

console.log(`\nverify-alimtalk: ${passed} passed, ${failed} failed`);
console.log("실제 SOLAPI HTTP 호출 횟수: 0");

if (failed > 0) process.exit(1);
