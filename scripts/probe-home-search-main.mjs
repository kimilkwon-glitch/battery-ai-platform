const STAMP = process.argv[3] || "BM-UX-REV-20260528-HOME-STRUCTURE-V1";
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
  emptyPlaceholder:
    html.includes('placeholder=""') ||
    html.includes("placeholder=''") ||
    !html.match(/placeholder="[^"]{3,}"/),
  noLongPlaceholder: !html.includes("K3 2018, 그랜저 IG AGM80L") && !html.includes("차량명·연식·규격 검색"),
  soliteCmfLabels: html.includes("CMF57412") && html.includes("CMF54459"),
  rocketGb80: html.includes("GB80L"),
  rocketNoCmf80OnHome:
    !html.match(/rocket[\s\S]{0,400}CMF80L/i) && !html.includes('data-home-spec-brand="rocket"'),
  simpleExamples:
    html.includes("쏘렌토MQ4") &&
    html.includes("포터2") &&
    !html.includes("90R/100R"),
  hasFitCheckSecondary: html.includes("내 차에 맞는지 확인"),
  hasStoreCtaFirst: html.includes("매장방문") && html.includes("home-spec-cta-pill"),
  hasSoliteBrandAttr: html.includes('data-home-spec-brand="solite"'),
  hasPortalNavMotion: html.includes("portal-nav-link"),
  hasSearchInputClass: html.includes("home-main-search-input"),
  hasLineupBrandAttr: html.includes("data-home-lineup-brand"),
  catalogCollapsedByDefault:
    html.includes('data-home-catalog-expanded="false"') ||
    html.includes("home-catalog-toggle"),
  hasCatalogToggle: html.includes("라인업 펼쳐보기") || html.includes("home-catalog-toggle"),
  navHasHome: html.includes(">홈<") || html.includes('href="/"'),
  navNoVehicleSearch: !html.includes("차량검색"),
  navNoSpecSearch: !html.includes("규격검색"),
  navNoPhotoNav: !html.match(/portal-nav[^>]*>[\s\S]{0,200}사진확인/),
  navHasUpgrade: html.includes("배터리 업그레이드"),
  navNoOrderCheck: !html.includes("주문 전 확인"),
  homeFooterSpacing: html.includes("home-main-footer-wrap"),
};
console.log(JSON.stringify(checks, null, 2));
