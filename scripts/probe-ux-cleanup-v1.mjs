const STAMP = process.argv[3] || "BM-UX-REV-20260528-UX-CLEANUP-V1";
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const cb = Date.now();

async function fetchText(path) {
  const res = await fetch(`${BASE}${path}?_cb=${cb}`, {
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  return { status: res.status, text: await res.text() };
}

const [home, detail, guideMaint, guideSym] = await Promise.all([
  fetchText("/"),
  fetchText("/batteries/AGM80L"),
  fetchText("/guide/maintenance"),
  fetchText("/guide/symptoms"),
]);

console.log(
  JSON.stringify(
    {
      stampOk: home.text.includes(STAMP),
      buildVersion: home.text.match(/data-build-version="([^"]+)"/)?.[1],
      nav: {
        noSymptomsTop: !home.text.includes('href="/symptoms"') || home.text.includes("/guide/symptoms"),
        hasGuideMega: home.text.includes("guide-mega") || home.text.includes("guide-mega-menu"),
      },
      homeCard: {
        hasStoreOutbound: home.text.includes("매장·출장 안내"),
        hasDelivery: home.text.includes("택배주문"),
        noPhotoCta: !home.text.includes("사진확인"),
        noSmallDuplicateDetailOnly:
          !home.text.match(/해당 규격 보기[\s\S]{0,80}해당 규격 보기/g),
      },
      detail: {
        status: detail.status,
        hasOrderAnchor: detail.text.includes("battery-order"),
        noSmartstore: !detail.text.includes("스마트스토어에서 보기"),
        hasDeliveryCta: detail.text.includes("택배주문"),
        hasStoreCta: detail.text.includes("매장·출장"),
        hasContentSlot: detail.text.includes("detail-content-slot"),
      },
      guide: {
        maintenance: guideMaint.status,
        symptoms: guideSym.status,
        hasFourCategories:
          guideMaint.text.includes("점검") && guideSym.text.includes("증상"),
      },
      cacheBustUrl: `${BASE}/batteries/AGM80L?_cb=${cb}`,
    },
    null,
    2,
  ),
);
