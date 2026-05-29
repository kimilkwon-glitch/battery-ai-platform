const STAMP = process.argv[3] || "BM-UX-REV-20260528-VEHICLE-SHOP-GUIDE-V1";
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const cb = Date.now();

async function fetchHtml(path) {
  const res = await fetch(`${BASE}${path}?_cb=${cb}`, {
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  return { status: res.status, html: await res.text() };
}

const [home, shop, guides, vehicle] = await Promise.all([
  fetchHtml("/"),
  fetchHtml("/shop"),
  fetchHtml("/guides"),
  fetchHtml("/vehicle/grandeur-ig"),
]);

console.log(
  JSON.stringify(
    {
      stampOk: home.html.includes(STAMP),
      buildVersion: home.html.match(/data-build-version="([^"]+)"/)?.[1],
      shop: {
        status: shop.status,
        hasOrderPanel: shop.html.includes("shop-order-panel"),
        hasReturnOption: shop.html.includes("폐배터리 반납"),
        hasOrderCta: shop.html.includes("택배주문 문의하기"),
        noPriceWon: !shop.html.match(/89,000원|101,000원/),
      },
      guides: {
        status: guides.status,
        hasGuideTopics: guides.html.includes("주제별 바로가기") || guides.html.includes("배터리 가이드 주제"),
      },
      vehicle: {
        status: vehicle.status,
        noTurboCardTitle: !vehicle.html.match(/>터보</),
        hasExpandCandidates: vehicle.html.includes("전체 후보 보기"),
      },
      navNote: "Nav '가이드' is client-rendered; verify in browser if needed.",
    },
    null,
    2,
  ),
);
