#!/usr/bin/env node
const BASE = process.argv[2] ?? process.env.BASE_URL ?? "http://localhost:3000";
const STAMP = "BM-UX-REV-20260528-BATTERY-DETAIL-ALL";

const coreBatteryPaths = [
  ["/batteries/AGM60L", "AGM60L"],
  ["/batteries/AGM70L", "AGM70L"],
  ["/batteries/AGM80L", "AGM80L"],
  ["/batteries/DIN74L", "DIN74L"],
  ["/batteries/100R", "100R"],
  ["/batteries/CMF80L", "CMF80L"],
  ["/batteries/AGM95L", "AGM95L"],
  ["/batteries/EV%2012V", "EV 12V"],
];

/** fallback 허브 — data-battery-detail-hub는 표시 규격(전용은 canonical) */
const fallbackBatteryPaths = [
  ["/batteries/90R", "90R"],
  ["/batteries/CMF100R", "100R"],
  ["/batteries/DIN62L", "DIN62L"],
  ["/batteries/DIN50L", "DIN50L"],
  ["/batteries/80L", "80L"],
  ["/batteries/57412", ["57412", "DIN74L"]],
  ["/batteries/57820", ["57820", "DIN74L"]],
  ["/batteries/115D31L", "115D31L"],
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

function hubOk(html, hubCode) {
  const slots = (html.match(/data-image-slot=/g) ?? []).length;
  const codes = Array.isArray(hubCode) ? hubCode : [hubCode];
  const hasHub = codes.some((c) => html.includes(`data-battery-detail-hub="${c}"`));
  return (
    hasHub &&
    html.includes(`data-battery-detail-build-stamp="${STAMP}"`) &&
    html.includes(`data-battery-route-build-stamp="${STAMP}"`) &&
    !html.includes("data-battery-detail-hub-version=") &&
    !html.includes("BATTERY-DETAIL-HUB") &&
    html.includes("배터리 규격 허브") &&
    html.includes("오주문 방지") &&
    html.includes("택배 주문하기") &&
    html.includes("사진으로 최종 확인") &&
    html.includes("부산 매장/출장 문의") &&
    html.includes("내 차량 다시 검색") &&
    html.includes("사진 슬롯") &&
    slots >= 3 &&
    !html.includes('label":"배터리 규격"') &&
    !(html.includes("로케트") && html.includes("쏠라이트") && !html.includes("사진 슬롯"))
  );
}

function stampOk(html) {
  const stamps = [...new Set(html.match(/BM-UX-REV-[A-Z0-9-]+/g) ?? [])];
  return stamps.length === 1 && stamps[0] === STAMP;
}

let fail = 0;

for (const [p, hubCode] of [...coreBatteryPaths, ...fallbackBatteryPaths]) {
  const url = BASE + p;
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" }, cache: "no-store" });
  const html = await res.text();
  const pass = res.status === 200 && stampOk(html) && hubOk(html, hubCode);
  if (!pass) fail++;
  console.log(`${pass ? "PASS" : "FAIL"} battery ${hubCode} ${url}`);
  if (!pass) {
    const stamps = [...new Set(html.match(/BM-UX-REV-[A-Z0-9-]+/g) ?? [])];
    console.log(`  stamps=${stamps.join(",")} hubAttr=${html.match(/data-battery-detail-hub="[^"]+"/)?.[0]}`);
    console.log(`  routeStamp=${html.includes(`data-battery-route-build-stamp="${STAMP}"`)} slots=${(html.match(/data-image-slot=/g) ?? []).length}`);
  }
}

for (const p of [...searchPaths, ...regressionPaths]) {
  const url = BASE + p;
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" }, cache: "no-store" });
  const html = await res.text();
  let extra = true;
  if (p.includes("포터2")) extra = html.includes("90R") && html.includes("100R");
  if (p.includes("레이")) extra = !html.includes("정확히 찾지 못했습니다");
  if (p.includes("CMF80L")) extra = html.includes("CMF80L");
  if (p.includes("sportage-nq5"))
    extra = /data-fuel-hero="하이브리드"[^>]*data-battery-hero="AGM60L"/.test(html);
  const pass = res.status === 200 && stampOk(html) && extra;
  if (!pass) fail++;
  console.log(`${pass ? "PASS" : "FAIL"} ${p.slice(0, 48)}`);
}

console.log(fail ? `\n${fail} FAILED` : "\nALL PASS");
process.exit(fail ? 1 : 0);
