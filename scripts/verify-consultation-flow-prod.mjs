#!/usr/bin/env node
/**
 * 상담 주문 접수형 운영 흐름 production 스모크 (15차)
 * Usage: node scripts/verify-consultation-flow-prod.mjs [baseUrl]
 */
const base = (process.argv[2] ?? "https://battery-ai-platform.vercel.app").replace(/\/$/, "");
const cb = "_cb=consultation-order-v15";

const pages = [
  { name: "home", path: `/?${cb}` },
  { name: "support-hub", path: `/support?${cb}` },
  { name: "customer-redirect", path: `/customer?${cb}`, expectRedirect: "/support" },
  { name: "support-faq", path: `/support/faq?${cb}` },
  { name: "support-order-guide", path: `/support/order-guide?${cb}` },
  { name: "cart", path: `/cart?${cb}` },
  { name: "checkout", path: `/checkout?${cb}` },
  { name: "order-request", path: `/order-request?${cb}` },
  { name: "order-request-lookup", path: `/order-request/lookup?${cb}` },
  { name: "used-battery", path: `/support/used-battery-return?${cb}` },
  { name: "admin-login", path: `/admin/login?${cb}` },
];

async function checkPage({ name, path, expectRedirect }) {
  const res = await fetch(`${base}${path}`, {
    redirect: "manual",
    headers: { "User-Agent": "BM-Consultation-V15/1.0" },
  });
  const loc = res.headers.get("location") ?? "";
  if (expectRedirect) {
    const ok =
      res.status >= 300 &&
      res.status < 400 &&
      (loc.includes(expectRedirect) || loc.endsWith(expectRedirect));
    return { name, ok, status: res.status, detail: loc || "no location" };
  }
  const html = await res.text();
  const ok = res.status === 200 && html.length > 500 && !html.includes("Application error");
  return { name, ok, status: res.status, detail: ok ? "ok" : "short/error" };
}

async function checkAdminApi() {
  const res = await fetch(`${base}/api/admin/order-requests`);
  const json = await res.json().catch(() => ({}));
  return {
    name: "admin-api-unauth",
    ok: res.status === 401 && json.error === "UNAUTHORIZED",
    status: res.status,
    detail: json.error,
  };
}

async function checkLookupApi() {
  const res = await fetch(`${base}/api/order-requests/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestNumber: "BM-00000000-0000",
      phone: "010-0000-0000",
      website: "",
    }),
  });
  const ct = res.headers.get("content-type") ?? "";
  const json = ct.includes("application/json") ? await res.json().catch(() => ({})) : {};
  const ok =
    (res.status === 404 && json.ok === false) ||
    res.status === 422 ||
    (res.status === 400 && json.ok === false);
  return {
    name: "lookup-api-miss",
    ok,
    status: res.status,
    detail: json.message ?? ct.slice(0, 40),
  };
}

async function main() {
  console.log("Base:", base);
  const results = [];
  for (const p of pages) results.push(await checkPage(p));
  results.push(await checkAdminApi());
  results.push(await checkLookupApi());

  let failed = 0;
  for (const r of results) {
    console.log(r.ok ? "PASS" : "FAIL", r.name, r.status, r.detail);
    if (!r.ok) failed++;
  }
  if (failed > 0) process.exit(1);
  console.log("\nAll consultation flow production checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
