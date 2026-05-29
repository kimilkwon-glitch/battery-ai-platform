const STAMP = process.argv[3] || "BM-UX-REV-20260528-BENEFITS-CAROUSEL-V2";
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const cb = Date.now();

async function fetchText(path) {
  const res = await fetch(`${BASE}${path}?_cb=${cb}`, {
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  return { status: res.status, text: await res.text() };
}

const home = await fetchText("/");

console.log(
  JSON.stringify(
    {
      stampOk: home.text.includes(STAMP),
      buildVersion: home.text.match(/data-build-version="([^"]+)"/)?.[1],
      benefits: {
        hasCarousel: home.text.includes("benefits-carousel"),
        hasCardMedia: home.text.includes("home-benefit-card-media"),
        has3pct: home.text.includes("3% 혜택"),
        hasLabelPill: home.text.includes("확인 가능"),
        noOfficialChannelsHome:
          !home.text.includes('data-section="official-channels"') ||
          !home.text.includes("official-channels-strip"),
        assetsPath: home.text.includes("/assets/benefits/"),
      },
      cacheBustUrl: `${BASE}/?_cb=${cb}`,
    },
    null,
    2,
  ),
);
