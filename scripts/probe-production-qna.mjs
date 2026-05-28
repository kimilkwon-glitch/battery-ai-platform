/**
 * Production probe — stamp, fonts, Q&A sections
 */
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const STAMP = "BM-UX-REV-20260528-QNA-FONT-V1-FIX1";

const routes = [
  ["/", ["home-popular-qna", STAMP]],
  ["/community", ["배터리 매칭 질문 허브", STAMP, "community-qna-hub"]],
  ["/batteries/AGM60L", ["related-qna", STAMP, "q-sportage-nq5-agm60l"]],
  ["/batteries/100R", ["related-qna", STAMP, "q-porter2-year"]],
  ["/batteries/CMF80L", ["related-qna", STAMP, "q-cmf80l"]],
  ["/vehicle/sportage-nq5?fuel=" + encodeURIComponent("하이브리드"), ["related-qna", STAMP, "q-sportage-nq5-agm60l"]],
  ["/search?q=" + encodeURIComponent("레이 블랙박스 방전"), ["related-qna", STAMP, "q-blackbox"]],
  ["/search?q=100R%20vs%20AGM95L", ["related-qna", STAMP]],
  ["/search?q=" + encodeURIComponent("포터2 배터리"), ["related-qna", STAMP]],
];

const fonts = [
  "/fonts/Pretendard-1.3.9/web/variable/woff2/PretendardVariable.woff2",
  "/fonts/GmarketSansTTF/GmarketSansTTFBold.ttf",
  "/fonts/S-Core_Dream_OTF/SCDream5.otf",
];

async function head(path) {
  const res = await fetch(`${BASE}${path}`, {
    method: "HEAD",
    redirect: "follow",
    headers: { "Cache-Control": "no-cache" },
  });
  return { path, status: res.status, ok: res.ok, vercelId: res.headers.get("x-vercel-id") };
}

async function get(path, need) {
  const res = await fetch(`${BASE}${path}`, {
    redirect: "follow",
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  const html = await res.text();
  const stamp = html.includes(STAMP);
  const checks = Object.fromEntries(need.map((n) => [n, html.includes(n)]));
  return {
    path,
    status: res.status,
    stamp,
    checks,
    vercelId: res.headers.get("x-vercel-id"),
    age: res.headers.get("age"),
  };
}

async function main() {
  console.log(JSON.stringify({ base: BASE, stamp: STAMP, at: new Date().toISOString() }, null, 2));
  console.log("\n--- fonts ---");
  for (const f of fonts) {
    const r = await head(f);
    console.log(r.ok ? "OK" : "FAIL", r.status, f, r.vercelId || "");
  }
  console.log("\n--- routes ---");
  let ok = 0;
  for (const [path, need] of routes) {
    const r = await get(path, need);
    const pass = r.stamp && need.every((n) => r.checks[n] !== false);
    if (pass) ok++;
    console.log(pass ? "OK" : "FAIL", r.status, path, "stamp", r.stamp, r.checks, r.vercelId || "");
  }
  console.log(`\n${ok}/${routes.length} routes pass`);
  process.exit(ok === routes.length ? 0 : 1);
}

main();
