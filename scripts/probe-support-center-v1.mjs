const STAMP = process.argv[3] || "BM-UX-REV-20260528-SUPPORT-CENTER-V1";
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const cb = Date.now();

async function fetchText(path) {
  const res = await fetch(`${BASE}${path}?_cb=${cb}`, {
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  return { status: res.status, text: await res.text() };
}

const [home, support, notice, faqPath] = await Promise.all([
  fetchText("/"),
  fetchText("/support"),
  fetchText("/support/notices/card-installment-202605"),
  fetchText("/support"),
]);

console.log(
  JSON.stringify(
    {
      stampOk: home.text.includes(STAMP),
      buildVersion: home.text.match(/data-build-version="([^"]+)"/)?.[1],
      buildRev: home.text.match(/data-build-rev="([^"]+)"/)?.[1],
      nav: {
        hasSupport: home.text.includes("고객센터"),
        noShopMenu: !home.text.includes('href="/shop"') && !home.text.includes("택배주문"),
        hasReviews: home.text.includes("리뷰"),
      },
      home: {
        benefitsCarousel:
          home.text.includes("benefits-carousel") || home.text.includes("home-benefits-carousel"),
        has3pct: home.text.includes("3%") || home.text.includes("3% 혜택"),
      },
      support: {
        status: support.status,
        hasTabs:
          support.text.includes("공지사항") &&
          support.text.includes("FAQ") &&
          support.text.includes("문의하기"),
        hasSearch: support.text.includes("검색어를 입력해주세요"),
        pageMarker: support.text.includes("support-center"),
      },
      notice: {
        status: notice.status,
        hasTitle: notice.text.includes("신용카드 무이자"),
        hasBack: notice.text.includes("공지 목록"),
      },
      floating: {
        dock: home.text.includes("bm-floating-dock") || home.text.includes("floating-dock"),
      },
      cacheBustUrl: `${BASE}/support?_cb=${cb}`,
    },
    null,
    2,
  ),
);
