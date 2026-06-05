const STAMP = "BM-BATTERY-PRICE-SPLIT-20260530-V1";
const BASE = "https://battery-ai-platform.vercel.app";

const checks = [
  { path: "/", must: ["인터넷가", "출장가", "data-build-version"] },
  { path: "/batteries/AGM95L", must: ["택배발송가", "출장교체가", "157,000원", "180,000원"] },
  { path: "/batteries/CMF40L", must: ["44,500원"] },
];

let pass = 0;
for (const c of checks) {
  const res = await fetch(`${BASE}${c.path}?cb=price-v1`, {
    headers: { "Cache-Control": "no-cache" },
  });
  const html = await res.text();
  const stamp = html.match(/data-build-version="([^"]+)"/)?.[1] ?? "not-found";
  const stampOk = stamp.includes("BM-BATTERY-PRICE-SPLIT");
  const contentOk = c.must.every((m) => html.includes(m));
  const noDiscount =
    !html.includes("할인가") &&
    !html.includes("정가") &&
    !html.includes("쿠폰가") &&
    !html.includes("네이버 할인");
  const ok = res.status === 200 && stampOk && contentOk && noDiscount;
  if (ok) pass++;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${c.path} stamp=${stamp} content=${contentOk} noDiscount=${noDiscount}`,
  );
}
console.log(`\nSummary: ${pass}/${checks.length} (expected ${STAMP})`);
process.exit(pass === checks.length ? 0 : 1);
