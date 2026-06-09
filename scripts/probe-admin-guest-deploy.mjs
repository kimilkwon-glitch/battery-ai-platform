const STAMP = "BM-ADMIN-GUEST-ORDER-CONSOLE-20260530-V1";
const BASE = "https://battery-ai-platform.vercel.app";
const paths = [
  "/",
  "/guest-order",
  "/guest-order/check",
  "/checkout",
  "/search",
  "/vehicle/santafe-mx5",
  "/batteries/AGM70L",
  "/admin/login",
];

let pass = 0;
for (const p of paths) {
  const url = `${BASE}${p}?cb=admin-guest-v1`;
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  const html = await res.text();
  const stamp =
    html.match(/data-build-version="([^"]+)"/)?.[1] ??
    html.match(/data-admin-console[^>]*data-build-version="([^"]+)"/)?.[1] ??
    "not-found";
  const stampOk = stamp.includes("BM-ADMIN-GUEST-ORDER-CONSOLE");
  const ok = res.status === 200;
  if (ok && stampOk) pass++;
  console.log(`${ok && stampOk ? "PASS" : "FAIL"} ${res.status} ${p} stamp=${stamp}`);
}

console.log(`\nSummary: ${pass}/${paths.length} passed (expected stamp: ${STAMP})`);
