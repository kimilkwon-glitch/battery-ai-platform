/**
 * Production read-only security smoke (no Toss/SOLAPI/Sweettracker, no data writes)
 * Usage: node tools/verify-production-security-smoke.mjs [baseUrl]
 */
const BASE = (process.argv[2] ?? "https://www.batterymanager.co.kr").replace(/\/$/, "");

let passed = 0;
let failed = 0;

async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed += 1;
    console.error(`  ✗ ${name} — ${e instanceof Error ? e.message : e}`);
  }
}

function assertStatus(res, allowed) {
  if (!allowed.includes(res.status)) {
    throw new Error(`expected ${allowed.join("|")}, got ${res.status}`);
  }
}

async function main() {
  console.log(`verify-production-security-smoke: ${BASE}\n`);

  await check("order detail unknown id → 404", async () => {
    const res = await fetch(`${BASE}/api/orders/co_regression_unknown`);
    assertStatus(res, [404]);
  });

  await check("prepare orderId-only → 403/404", async () => {
    const res = await fetch(`${BASE}/api/payments/prepare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: "co_regression_unknown" }),
    });
    assertStatus(res, [403, 404]);
  });

  await check("order-request [id] → 410 deprecated", async () => {
    const res = await fetch(`${BASE}/api/order-requests/test-id?token=x`);
    assertStatus(res, [410]);
    const data = await res.json();
    if (!data.deprecated) throw new Error("missing deprecated flag");
  });

  await check("review upload without proof → 403/404", async () => {
    const form = new FormData();
    form.append("orderId", "co_regression_unknown");
    const res = await fetch(`${BASE}/api/reviews/upload`, { method: "POST", body: form });
    assertStatus(res, [403, 404]);
  });

  await check("battery-talk stream unknown session → 403/404", async () => {
    const res = await fetch(`${BASE}/api/battery-talk/sessions/bt_regression_unknown/stream`);
    assertStatus(res, [403, 404]);
  });

  await check("display asset CMF60L → 200", async () => {
    const res = await fetch(`${BASE}/assets/batteries/display/solite-CMF60L-main.png`, { method: "HEAD" });
    assertStatus(res, [200]);
  });

  await check("display asset sebang logo → 200", async () => {
    const res = await fetch(`${BASE}/assets/brand/sebang-logo-stacked-display.png`, { method: "HEAD" });
    assertStatus(res, [200]);
  });

  console.log(`\nverify-production-security-smoke: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
