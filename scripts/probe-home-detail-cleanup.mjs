const STAMP = "BM-UX-REV-20260528-HOME-DETAIL-CTA-RELATION-CLEANUP1";
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const routes = ["/", "/batteries/AGM95L", "/batteries/100R", "/compare"];
const cb = Date.now();

for (const r of routes) {
  const url = `${BASE}${r}?_cb=${cb}`;
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
  const html = await res.text();
  const buildVersion = html.match(/data-build-version="([^"]+)"/)?.[1] ?? "—";
  const detailStamp = html.match(/data-battery-detail-build-stamp="([^"]+)"/)?.[1] ?? "—";
  const photoCtaCount = (html.match(/사진으로 확인/g) || []).length;
  console.log(
    JSON.stringify({
      route: r,
      status: res.status,
      stampOk: html.includes(STAMP),
      buildVersion,
      detailStamp: r.startsWith("/batteries") ? detailStamp : undefined,
      hasEvGrid: /HomeEvHybridSection|EV6 보조배터리/.test(html),
      hasHint: /HomeEvHybridHint|하이브리드·EV 보조 12V는 차종별/.test(html),
      photoCtaCount: r.startsWith("/batteries") ? photoCtaCount : undefined,
      agm95Compare100R:
        r === "/batteries/AGM95L" && /100R/.test(html) && html.includes("비슷한 규격"),
    }),
  );
}
