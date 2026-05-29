const STAMP = process.argv[3] || "BM-UX-REV-20260528-BUSAN-GEO-MAP-V1";
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const cb = Date.now();

async function fetchText(path) {
  const res = await fetch(`${BASE}${path}?_cb=${cb}`, {
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  return { status: res.status, text: await res.text() };
}

const [home, service, geo] = await Promise.all([
  fetchText("/"),
  fetchText("/service-center"),
  fetchText("/assets/maps/busan-hangjeongdong.geojson"),
]);

const hasOldPolygon =
  service.text.includes("BUSAN_COASTLINE_PATH") ||
  service.text.includes("M 8 52 C 28 28") ||
  service.text.includes("busan-map-districts");

console.log(
  JSON.stringify(
    {
      stampOk: home.text.includes(STAMP),
      buildVersion: home.text.match(/data-build-version="([^"]+)"/)?.[1],
      service: {
        status: service.status,
        hasGeoMapComponent: service.text.includes("busan-region-map"),
        hasHangjeongDisclaimer:
          service.text.includes("행정동 경계") || service.text.includes("행정동 경계 기준"),
        oldFakePolygonRemoved: !hasOldPolygon,
      },
      geoAsset: {
        status: geo.status,
        isFeatureCollection: geo.text.includes('"FeatureCollection"'),
        featureCount: (geo.text.match(/"adm_nm"/g) || []).length,
        hasDaejeo1: geo.text.includes("대저1동"),
        hasDaejeo2: geo.text.includes("대저2동"),
        hasMyeongji: geo.text.includes("명지"),
      },
    },
    null,
    2,
  ),
);
