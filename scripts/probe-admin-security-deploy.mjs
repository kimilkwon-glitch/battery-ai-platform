const STAMP = "BM-ADMIN-SECURITY-HARDENING-20260530-V1";
const BASE = "https://battery-ai-platform.vercel.app";

const results = [];

async function check(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail });
    console.log(`PASS ${name}: ${detail}`);
  } catch (e) {
    results.push({ name, ok: false, detail: String(e.message ?? e) });
    console.log(`FAIL ${name}: ${e.message ?? e}`);
  }
}

await check("admin redirect when unauthenticated", async () => {
  const res = await fetch(`${BASE}/admin`, { redirect: "manual" });
  const loc = res.headers.get("location") ?? "";
  if (![302, 307].includes(res.status)) throw new Error(`status ${res.status}`);
  if (!loc.includes("/admin/login")) throw new Error(loc);
  return loc;
});

await check("admin API blocked without auth", async () => {
  const res = await fetch(`${BASE}/api/admin/order-requests`);
  if (res.status !== 401) throw new Error(`status ${res.status}`);
  return "401";
});

await check("wrong login rejected", async () => {
  const res = await fetch(`${BASE}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "invalid", password: "invalid" }),
  });
  if (res.status !== 401 && res.status !== 503) throw new Error(`status ${res.status}`);
  return String(res.status);
});

await check("customer home accessible", async () => {
  const res = await fetch(`${BASE}/?cb=sec-v1`);
  if (res.status !== 200) throw new Error(`status ${res.status}`);
  const html = await res.text();
  if (/TODO|mock|provider not configured|stack trace/i.test(html)) {
    throw new Error("dev wording on home");
  }
  return "200";
});

await check("guest-order page accessible", async () => {
  const res = await fetch(`${BASE}/guest-order?cb=sec-v1`);
  if (res.status !== 200) throw new Error(`status ${res.status}`);
  return "200";
});

await check("lookup requires phone", async () => {
  const res = await fetch(`${BASE}/api/order-requests/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestNumber: "BM-20260101-0001" }),
  });
  if (res.status !== 422) throw new Error(`status ${res.status}`);
  return "422";
});

await check("robots blocks admin", async () => {
  const res = await fetch(`${BASE}/robots.txt`);
  const text = await res.text();
  if (!text.includes("/admin")) throw new Error("no /admin disallow");
  return "disallow ok";
});

await check("build stamp", async () => {
  const res = await fetch(`${BASE}/admin/login?cb=sec-v1`);
  const html = await res.text();
  const stamp = html.match(/data-build-version="([^"]+)"/)?.[1] ?? "not-found";
  if (!stamp.includes(STAMP)) throw new Error(stamp);
  return stamp;
});

await check("security headers on home", async () => {
  const res = await fetch(`${BASE}/?cb=sec-v1`);
  const xfo = res.headers.get("x-frame-options");
  const nosniff = res.headers.get("x-content-type-options");
  if (!xfo || !nosniff) throw new Error(`xfo=${xfo} nosniff=${nosniff}`);
  return `${xfo}, ${nosniff}`;
});

const pass = results.filter((r) => r.ok).length;
console.log(`\nSummary: ${pass}/${results.length} (stamp ${STAMP})`);
process.exit(pass === results.length ? 0 : 1);
