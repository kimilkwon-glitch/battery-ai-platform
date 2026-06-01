#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const url = BASE + "/?_cb=" + Date.now();
const res = await fetch(url, { headers: { "Cache-Control": "no-cache" }, redirect: "follow", cache: "no-store" });
const html = await res.text();
const stamps = [...new Set(html.match(/BM-UX-REV-[A-Z0-9-]+/g) ?? [])];
const checks = {
  status: res.status,
  cacheControl: res.headers.get("cache-control"),
  stamps,
  homeUpgradeV2: html.includes('data-page="home-upgrade-v2"'),
  hero: html.includes('data-home-section="hero"'),
  popularBatteries: html.includes("많이 찾는 배터리 규격"),
  popularVehicles: html.includes("인기 차량 빠른 검색"),
  evHybrid: html.includes("전기차·하이브리드 보조배터리"),
  stores: html.includes('data-home-section="stores"'),
  delivery: html.includes("규격 확인 후 택배 주문"),
  imageSlots: (html.match(/data-image-slot=/g) ?? []).length,
  fontsCss: html.includes("/fonts/Pretendard") || html.includes("Pretendard"),
  gmarket: html.includes("GmarketSans"),
  oldHero: html.includes("차종별로 바로 확인") && !html.includes("차종·규격·증상"),
};
const footer = html.match(/v (BM-UX-REV-[A-Z0-9-]+)/);
checks.footerStamp = footer?.[1] ?? null;
checks.htmlBuildVersion = html.match(/data-build-version="([^"]+)"/g)?.slice(0, 2);

const fontRes = await fetch(BASE + "/fonts/Pretendard-1.3.9/web/variable/woff2/PretendardVariable.woff2", {
  method: "HEAD",
});
checks.pretendardFontFile = fontRes.status;

console.log(JSON.stringify(checks, null, 2));
console.log(checks.stamps[0] === "BM-UX-REV-20260528-HOME-UPGRADE-V2" && checks.homeUpgradeV2 ? "\nPRODUCTION HOME V2 OK" : "\nMISMATCH");
