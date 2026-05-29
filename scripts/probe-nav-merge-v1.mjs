const STAMP = process.argv[3] || "BM-UX-REV-20260528-NAV-MERGE-V1";
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const cb = Date.now();

const res = await fetch(`${BASE}/?_cb=${cb}`, {
  headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
});
const html = await res.text();

const removed = ["로케트", "쏠라이트", "매장방문", "출장교체", "차량검색", "규격검색", "주문 전 확인", "더보기"];
const navRemoved = removed.filter((label) => html.includes(`>${label}<`) || html.includes(`>${label}</`));

console.log(
  JSON.stringify(
    {
      route: "/",
      status: res.status,
      stampOk: html.includes(STAMP),
      buildVersion: html.match(/data-build-version="([^"]+)"/)?.[1] ?? "—",
      footerBrandLink: html.includes("브랜드 안내") && html.includes('href="/brands"'),
      footerStoreLink: html.includes("매장·출장 안내") && html.includes('href="/service-center"'),
      footerNoOldStoreLabel: !html.includes('href="/service"') || html.includes("매장·출장 안내"),
      navLabelsInHtml: navRemoved,
      note: "Nav pills are client-rendered; label checks may be empty in static HTML.",
    },
    null,
    2,
  ),
);
