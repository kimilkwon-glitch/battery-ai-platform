#!/usr/bin/env node
const BASE = process.argv[2] ?? process.env.BASE_URL ?? "http://localhost:3000";
const STAMP = "BM-UX-REV-20260528-HOME-UPGRADE-V2";

const homeChecks = [
  "data-page=\"home-upgrade-v2\"",
  "data-home-section=\"hero\"",
  "data-home-section=\"popular-batteries\"",
  "data-home-section=\"popular-vehicles\"",
  "data-home-section=\"ev-hybrid\"",
  "data-home-section=\"trending\"",
  "data-home-section=\"delivery\"",
  "data-home-section=\"stores\"",
  "많이 찾는 배터리 규격",
  "인기 차량 빠른 검색",
  "전기차·하이브리드 보조배터리",
  "덕천점",
  "학장점",
  "택배 주문",
  "data-image-slot=",
];

const batteryPaths = [
  "/batteries/AGM60L",
  "/batteries/AGM70L",
  "/batteries/AGM80L",
  "/batteries/DIN74L",
  "/batteries/100R",
  "/batteries/CMF80L",
  "/batteries/AGM95L",
  "/batteries/EV%2012V",
  "/batteries/90R",
  "/batteries/CMF100R",
];

const searchPaths = [
  "/search?q=" + encodeURIComponent("포터2 배터리"),
  "/search?q=" + encodeURIComponent("레이 블랙박스 방전"),
  "/search?q=" + encodeURIComponent("봉고3 DIN74L"),
  "/search?q=" + encodeURIComponent("100R vs AGM95L"),
  "/search?q=" + encodeURIComponent("스포티지 NQ5 하이브리드"),
  "/search?q=" + encodeURIComponent("K8 하이브리드"),
  "/search?q=" + encodeURIComponent("CMF80L"),
  "/search?q=" + encodeURIComponent("EV6 보조배터리"),
  "/search?q=" + encodeURIComponent("아이오닉5 배터리"),
];

const regressionPaths = [
  "/vehicle/sportage-nq5?fuel=" + encodeURIComponent("하이브리드"),
  "/vehicle/k8-gl3?fuel=" + encodeURIComponent("하이브리드"),
  "/compare?items=100R,AGM95L",
];

function stampOk(html) {
  const stamps = [...new Set(html.match(/BM-UX-REV-[A-Z0-9-]+/g) ?? [])];
  return stamps.length === 1 && stamps[0] === STAMP;
}

let fail = 0;

const homeUrl = BASE + "/?_cb=" + Date.now();
const homeRes = await fetch(homeUrl, { headers: { "Cache-Control": "no-cache" }, cache: "no-store" });
const homeHtml = await homeRes.text();
const homePass =
  homeRes.status === 200 &&
  stampOk(homeHtml) &&
  homeChecks.every((c) => homeHtml.includes(c)) &&
  (homeHtml.match(/data-image-slot=/g) ?? []).length >= 8;
if (!homePass) fail++;
console.log(`${homePass ? "PASS" : "FAIL"} home ${homeUrl}`);
if (!homePass) {
  const stamps = [...new Set(homeHtml.match(/BM-UX-REV-[A-Z0-9-]+/g) ?? [])];
  console.log(`  stamps=${stamps.join(",")} slots=${(homeHtml.match(/data-image-slot=/g) ?? []).length}`);
  for (const c of homeChecks) {
    if (!homeHtml.includes(c)) console.log(`  missing: ${c}`);
  }
}

for (const p of [...searchPaths, ...batteryPaths, ...regressionPaths]) {
  const url = BASE + p + (p.includes("?") ? "&" : "?") + "_cb=" + Date.now();
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" }, cache: "no-store" });
  const html = await res.text();
  let extra = true;
  if (p.includes("포터2")) extra = html.includes("90R") && html.includes("100R");
  if (p.includes("레이")) extra = !html.includes("정확히 찾지 못했습니다");
  if (p.includes("CMF80L") && p.startsWith("/search")) extra = html.includes("CMF80L");
  if (p.includes("sportage-nq5"))
    extra = /data-fuel-hero="하이브리드"[^>]*data-battery-hero="AGM60L"/.test(html);
  if (p.includes("/batteries/")) extra = html.includes("data-battery-detail-hub") && html.includes("오주문 방지");
  const pass = res.status === 200 && stampOk(html) && extra;
  if (!pass) fail++;
  console.log(`${pass ? "PASS" : "FAIL"} ${p.slice(0, 52)}`);
}

console.log(fail ? `\n${fail} FAILED` : "\nALL PASS");
process.exit(fail ? 1 : 0);
