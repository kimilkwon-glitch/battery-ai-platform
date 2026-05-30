#!/usr/bin/env node
const BASE = "https://battery-ai-platform.vercel.app";
const CB = "qa-fix-v2-20260530";
const EXPECT_STAMP = "BM-UX-REV-20260530-QA-FIX-V2";
const PATHS = ["/", "/batteries/100R", "/order-checklist", "/qa", "/service"];

const GREP_PATTERNS = [
  "혜택 이미지 준비중",
  "상세 콘텐츠 준비중",
  "CMS 연동",
  "운영 이미지 등록",
  "100R vs AGM95L",
  "헷리면",
  "포터2 · 포터2",
  "준비중",
];

function extractMeta(html) {
  return {
    buildVersion: html.match(/data-build-version="([^"]+)"/)?.[1] ?? null,
    buildRev: html.match(/data-build-rev="([^"]+)"/)?.[1] ?? null,
  };
}

console.log("=== QA-FIX-V2 production verify ===");
console.log("EXPECT_STAMP:", EXPECT_STAMP);
console.log("");

const results = [];

for (const path of PATHS) {
  const url = `${BASE}${path}?_cb=${CB}`;
  const res = await fetch(url, {
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache", "User-Agent": "BM-QA-FIX-V2/1.0" },
    redirect: "follow",
  });
  const html = await res.text();
  const meta = extractMeta(html);
  const grep = Object.fromEntries(GREP_PATTERNS.map((p) => [p, html.includes(p)]));
  results.push({ path, url, status: res.status, meta, grep, cache: res.headers.get("x-vercel-cache") });
  console.log(JSON.stringify({ path, status: res.status, meta, grep, cache: res.headers.get("x-vercel-cache") }, null, 2));
}

const allOk =
  results.every((r) => r.status === 200) &&
  results.every((r) => r.meta.buildVersion === EXPECT_STAMP) &&
  results.every((r) => !Object.values(r.grep).some(Boolean));

console.log("");
console.log("ALL_OK:", allOk);
