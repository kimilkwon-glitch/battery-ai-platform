/**
 * Precision Garage V1 — stamp, fonts, Q&A, key routes (no-cache)
 */
const BASE = process.argv[2] || "http://localhost:3000";
const STAMP = "BM-UX-REV-20260528-DESIGN-MOBILE-V1";

const routes = [
  ["/", ["precision-garage-v1", "home-popular-qna", STAMP]],
  ["/community", ["community-qna-hub", STAMP]],
  ["/batteries/100R", ["related-qna", STAMP, "data-spec-code"]],
  ["/batteries/AGM60L", ["related-qna", STAMP]],
  ["/batteries/CMF80L", ["related-qna", STAMP]],
  ["/vehicle/sportage-nq5?fuel=" + encodeURIComponent("하이브리드"), ["related-qna", STAMP]],
  ["/search?q=" + encodeURIComponent("레이 블랙박스 방전"), ["related-qna", STAMP]],
  ["/search?q=100R%20vs%20AGM95L", ["related-qna", "fitment", STAMP]],
  ["/search?q=" + encodeURIComponent("포터2 배터리"), ["related-qna", STAMP]],
  ["/service-center", [STAMP]],
];

async function get(path, need) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  const html = await res.text();
  const checks = Object.fromEntries(need.map((n) => [n, html.includes(n)]));
  return { path, status: res.status, stamp: html.includes(STAMP), checks };
}

async function main() {
  console.log({ base: BASE, stamp: STAMP, at: new Date().toISOString() });
  let ok = 0;
  for (const [path, need] of routes) {
    const r = await get(path, need);
    const pass = r.stamp && need.every((n) => r.checks[n] !== false);
    if (pass) ok++;
    console.log(pass ? "OK" : "FAIL", r.status, path, r.checks);
  }
  console.log(`\n${ok}/${routes.length} routes pass`);
  process.exit(ok === routes.length ? 0 : 1);
}

main();
