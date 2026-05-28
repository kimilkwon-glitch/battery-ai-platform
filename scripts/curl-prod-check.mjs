#!/usr/bin/env node
const BASE = "https://battery-ai-platform.vercel.app";
const STAMP = "BM-UX-REV-20260528-SEARCH-UX-UPGRADE";

const paths = [
  "/search?q=" + encodeURIComponent("포터2 배터리"),
  "/search?q=" + encodeURIComponent("레이 블랙박스 방전"),
  "/search?q=" + encodeURIComponent("봉고3 DIN74L"),
  "/search?q=" + encodeURIComponent("100R vs AGM95L"),
  "/search?q=" + encodeURIComponent("스포티지 NQ5 하이브리드"),
  "/search?q=" + encodeURIComponent("K8 하이브리드"),
  "/vehicle/sportage-nq5?fuel=" + encodeURIComponent("하이브리드"),
  "/vehicle/k8-gl3?fuel=" + encodeURIComponent("하이브리드"),
  "/compare?items=100R,AGM95L",
];

let fail = 0;
for (const p of paths) {
  const url = BASE + p;
  const res = await fetch(url, {
    headers: { "Cache-Control": "no-cache, no-store", Pragma: "no-cache" },
    cache: "no-store",
    redirect: "follow",
  });
  const html = await res.text();
  const stamps = [...new Set(html.match(/BM-UX-REV-[A-Z0-9-]+/g) ?? [])];
  const okStamp = stamps.length === 1 && stamps[0] === STAMP;
  let extraOk = true;
  if (p.includes("sportage-nq5") || p.includes("k8-gl3")) {
    extraOk = /data-fuel-hero="하이브리드"[^>]*data-battery-hero="AGM60L"/.test(html);
  }
  if (p.includes("compare")) {
    extraOk = html.includes("100R") && html.includes("AGM95L");
  }
  if (p.includes("레이")) {
    extraOk = html.includes("data-search-ux-mode=\"symptom\"") || /방전|증상/.test(html);
  }
  if (p.includes("포터2")) {
    extraOk = html.includes("90R") && html.includes("100R");
  }
  const pass = res.status === 200 && okStamp && extraOk;
  if (!pass) fail++;
  console.log(`${pass ? "PASS" : "FAIL"} ${url}`);
  console.log(`  status=${res.status} stamps=${stamps.join(",") || "none"}`);
}

process.exit(fail ? 1 : 0);
