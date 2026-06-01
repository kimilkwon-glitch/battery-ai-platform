#!/usr/bin/env node
const BASE = "https://battery-ai-platform.vercel.app";
const CB = "cache-proof-20260530";
const PATHS = [
  "/",
  "/batteries/100R",
  "/order-checklist",
  "/qa",
  "/service",
];

const GREP_PATTERNS = [
  "사진 준비중",
  "100R vs AGM95L",
  "헷리면",
  "760CCA CCA",
  "포터2 · 포터2",
];

function extractMeta(html) {
  return {
    buildVersion: html.match(/data-build-version="([^"]+)"/)?.[1] ?? null,
    buildRev: html.match(/data-build-rev="([^"]+)"/)?.[1] ?? null,
    title: html.match(/<title[^>]*>([^<]*)</)?.[1]?.trim() ?? null,
    hasError: /Application error|Internal Server Error|statusCode":500/i.test(html),
    hasNextError: /__NEXT_DATA__[^]*"err"/.test(html),
  };
}

console.log("=== Production cache-proof probe ===");
console.log("BASE:", BASE);
console.log("CB:", CB);
console.log("");

for (const path of PATHS) {
  const url = `${BASE}${path}?_cb=${CB}`;
  try {
    const res = await fetch(url, {
      headers: {
        "Cache-Control": "no-cache, no-store",
        Pragma: "no-cache",
        "User-Agent": "BM-CacheProof/1.0",
      },
      redirect: "follow",
    });
    const html = await res.text();
    const meta = extractMeta(html);
    const grep = Object.fromEntries(
      GREP_PATTERNS.map((p) => [p, html.includes(p)]),
    );
    console.log(`--- ${path} ---`);
    console.log("URL:", url);
    console.log("HTTP:", res.status, res.statusText);
    console.log("x-vercel-cache:", res.headers.get("x-vercel-cache") ?? "(none)");
    console.log("age:", res.headers.get("age") ?? "(none)");
    console.log("meta:", JSON.stringify(meta, null, 2));
    console.log("grep:", JSON.stringify(grep, null, 2));
    console.log("");
  } catch (e) {
    console.log(`--- ${path} --- ERROR:`, e.message);
    console.log("");
  }
}
