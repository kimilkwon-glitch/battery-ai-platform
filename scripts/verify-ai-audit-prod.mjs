#!/usr/bin/env node
const BASE = "https://battery-ai-platform.vercel.app";
const CB = "ai-audit-v2-20260530";
const EXPECT_STAMP = "BM-UX-REV-20260530-AI-AUDIT-V2";
const PATHS = ["/", "/batteries/100R", "/order-checklist", "/qa", "/service"];

const FORBIDDEN = [
  "혜택 이미지 준비중",
  "상세 콘텐츠 준비중",
  "100R vs AGM95L",
  "헷리면",
  "포터2 · 포터2",
  "760CCA CCA",
];

const url = `${BASE}/__ai-audit?_cb=${CB}`;
const res = await fetch(url, {
  headers: { "Cache-Control": "no-cache", "User-Agent": "BM-AI-Audit-Verify/2.0" },
  signal: AbortSignal.timeout(120_000),
});
const html = await res.text();
const buildRev = html.match(/data-build-version="([^"]+)"/)?.[1];
const i = html.indexOf("AI_AUDIT_SUMMARY_START");
const summary = i >= 0 ? html.slice(i, html.indexOf("AI_AUDIT_SUMMARY_END") + 24) : "";

console.log("audit URL:", url);
console.log("HTTP:", res.status);
console.log("build_rev:", buildRev);
console.log("summary block:\n", summary);

for (const path of PATHS) {
  const u = `${BASE}${path}?_cb=${CB}`;
  const r = await fetch(u, { headers: { "Cache-Control": "no-cache" } });
  const h = await r.text();
  console.log(path, r.status, h.match(/data-build-version="([^"]+)"/)?.[1]);
  const grep = Object.fromEntries(FORBIDDEN.map((p) => [p, h.includes(p)]));
  if (Object.values(grep).some(Boolean)) console.log("  grep hits:", grep);
}

const ok =
  res.status === 200 &&
  buildRev === EXPECT_STAMP &&
  summary.includes("forbidden_keywords_found: none (customer-facing)");
console.log("\nALL_OK:", ok);
