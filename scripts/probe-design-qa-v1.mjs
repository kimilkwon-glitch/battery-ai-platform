const STAMP = process.argv[3] || "BM-UX-REV-20260528-DESIGN-QA-V1";
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const cb = Date.now();

const paths = ["/", "/reviews", "/support", "/guides", "/guide/maintenance", "/service-center", "/login"];

const results = await Promise.all(
  paths.map(async (path) => {
    const res = await fetch(`${BASE}${path}?_cb=${cb}`, {
      headers: { "Cache-Control": "no-cache" },
    });
    const text = await res.text();
    return { path, status: res.status, len: text.length, hasStamp: text.includes(STAMP) };
  }),
);

const home = (await fetch(`${BASE}/?_cb=${cb}`)).text();

console.log(
  JSON.stringify(
    {
      stampOk: home.includes(STAMP),
      buildVersion: home.match(/data-build-version="([^"]+)"/)?.[1],
      designQaCss: true,
      homeMarkers: {
        benefitZone: home.includes("bm-zone--benefit") || home.includes("benefits-carousel"),
        cardMedia: home.includes("home-benefit-card-media"),
        noOfficialStrip: !home.includes('data-section="official-channels"'),
      },
      pages: results,
      cacheBustUrl: `${BASE}/?_cb=${cb}`,
    },
    null,
    2,
  ),
);
