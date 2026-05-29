const STAMP = process.argv[3] || "BM-UX-REV-20260528-COMMERCE-FLOW-V1";
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const cb = Date.now();

async function fetchText(path) {
  const res = await fetch(`${BASE}${path}?_cb=${cb}`, {
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  return { status: res.status, text: await res.text() };
}

const [home, battery, reviews, login, admin] = await Promise.all([
  fetchText("/"),
  fetchText("/batteries/AGM80L"),
  fetchText("/reviews"),
  fetchText("/login"),
  fetchText("/admin/inquiries"),
]);

console.log(
  JSON.stringify(
    {
      stampOk: home.text.includes(STAMP),
      buildVersion: home.text.match(/data-build-version="([^"]+)"/)?.[1],
      nav: {
        noShopMenu: !home.text.includes("택배주문"),
        hasReviews: home.text.includes("리뷰"),
        hasLogin: home.text.includes("로그인"),
      },
      home: {
        hasBenefits: home.text.includes("배터리매니저 혜택") || home.text.includes("3% 혜택"),
        noCentralChannels: !home.text.includes("official-channels-strip") || home.text.includes("benefits"),
        catalogExpanded: home.text.includes('data-home-catalog-expanded="true"'),
      },
      battery: {
        status: battery.status,
        hasOrderPanel: battery.text.includes("주문 상담하기") || battery.text.includes("battery-product-detail"),
        hasReturnOption: battery.text.includes("폐배터리 반납"),
        noFakePrice: !battery.text.match(/89,000원|101,000원/),
      },
      reviews: { status: reviews.status, hasTitle: reviews.text.includes("배터리 교체 후기") },
      login: { status: login.status, preparing: login.text.includes("준비") },
      floating: home.text.includes("floating-dock") || home.text.includes("bm-floating-dock"),
      admin: { status: admin.status },
    },
    null,
    2,
  ),
);
