const STAMP = "BM-UX-REV-20260528-HOME-SEARCH-MAIN-V1";
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
  hasHomeSearchMain: html.includes('data-page="home-search-main"'),
  hasKoreanLogo: html.includes("배터리매니저"),
  hasCatalog: html.includes('data-home-section="catalog"'),
  noPopularRanking: !html.includes("home-popular-batteries") && !html.includes("많이 찾는 배터리 규격"),
  noPortalHeroSearchChip: !html.includes("검색 유형"),
  noUnifiedSearchMenu: !html.includes("통합검색"),
  hasRocketNav: html.includes("로케트"),
  hasSoliteNav: html.includes("쏠라이트"),
  hasFitCheckCta: html.includes("내 차에 맞는지 확인"),
};
console.log(JSON.stringify(checks, null, 2));
