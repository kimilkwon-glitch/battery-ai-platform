/**
 * Production stamp + design markers — normal vs no-cache
 */
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const routes = [
  "/",
  "/search?q=100R%20vs%20AGM95L",
  "/batteries/CMF80L",
  "/batteries/AGM60L",
  "/compare",
  "/community",
];

const STAMP_PATTERNS = [
  "BM-UX-REV-20260528-QNA-FONT-V1",
  "BM-UX-REV-20260528-QNA-FONT-V1-FIX1",
  "BM-UX-REV-20260528-PRECISION-GARAGE-V1",
  "BM-UX-REV-20260528-PRECISION-GARAGE-V2",
  "BM-UX-REV-20260528-DESIGN-MOBILE-V1",
  "BM-UX-REV-20260528-DESIGN-MOBILE-V2",
  "BM-UX-REV-20260528-ASSET-VISUAL-V2",
];

const DESIGN_MARKERS = [
  "bm-page-mesh",
  "precision-garage-v1",
  "AGM80L처럼 규격명",
  "비교 리포트",
  "불안 제거",
  "related-qna",
];

async function fetchPage(path, noCache) {
  const headers = noCache ? { "Cache-Control": "no-cache", Pragma: "no-cache" } : {};
  const res = await fetch(`${BASE}${path}`, { headers, redirect: "follow" });
  const html = await res.text();
  const stamps = STAMP_PATTERNS.filter((s) => html.includes(s));
  const markers = Object.fromEntries(DESIGN_MARKERS.map((m) => [m, html.includes(m)]));
  const buildVersion = html.match(/data-build-version="([^"]+)"/)?.[1] ?? null;
  return {
    path,
    mode: noCache ? "no-cache" : "normal",
    status: res.status,
    age: res.headers.get("age"),
    vercelId: res.headers.get("x-vercel-id"),
    buildVersion,
    stamps,
    markers,
  };
}

async function main() {
  console.log(JSON.stringify({ base: BASE, at: new Date().toISOString() }, null, 2));
  for (const path of routes) {
    const normal = await fetchPage(path, false);
    const fresh = await fetchPage(path, true);
    console.log("\n---", path, "---");
    console.log("normal", normal);
    console.log("no-cache", fresh);
    const sameStamp =
      JSON.stringify(normal.stamps) === JSON.stringify(fresh.stamps) &&
      normal.buildVersion === fresh.buildVersion;
    console.log("cache_delta", sameStamp ? "none (stamp match)" : "DIFFERS — possible CDN cache");
  }
}

main();
