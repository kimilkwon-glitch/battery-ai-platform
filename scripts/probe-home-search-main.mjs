const STAMP = process.argv[3] || "BM-UX-REV-20260528-HOME-SEARCH-MAIN-V2";
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const cb = Date.now();
const url = `${BASE}/?_cb=${cb}`;
const res = await fetch(url, { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
const html = await res.text();
const checks = {
  route: "/",
  status: res.status,
  stampOk: html.includes(STAMP),
  buildVersion: html.match(/data-build-version="([^"]+)"/)?.[1] ?? "—",
  noHeaderLogoText: !html.match(/sticky[\s\S]{0,800}배터리매니저/),
  hasMainLogo: html.includes('class="home-main-logo'),
  noMoreMenu: !html.includes("더보기"),
  hasStoreNav: html.includes("매장방문"),
  hasLineupTitle: html.includes("배터리 라인업") && !html.includes("취급 배터리"),
  hasFitCheckSecondary: html.includes("내 차에 맞는지 확인"),
  hasStoreCtaFirst: html.includes("매장방문") && html.includes("home-spec-cta-pill"),
  hasSoliteBrandAttr: html.includes('data-home-spec-brand="solite"') || html.includes("data-prefer-brand=\"solite\""),
};
console.log(JSON.stringify(checks, null, 2));
