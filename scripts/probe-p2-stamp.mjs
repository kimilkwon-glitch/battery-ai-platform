const STAMP = "BM-UX-REV-20260528-DESIGN-SYSTEM-P2-VISUAL-RHYTHM1";
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const routes = [
  "/",
  "/search?q=AGM60L",
  "/search?q=CMF80L",
  "/search?q=100R%20vs%20AGM95L",
  "/compare",
  "/community",
  "/guides",
  "/photo-check",
  "/order-checklist",
  "/symptoms",
  "/service",
  "/batteries/AGM60L",
  "/batteries/CMF80L",
];

const cb = "design-system-p2-visual-rhythm1-20260528";

for (const r of routes) {
  const url = `${BASE}${r}?_cb=${cb}&t=${Date.now()}`;
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } });
  const html = await res.text();
  const buildVersion = html.match(/data-build-version="([^"]+)"/)?.[1] ?? "—";
  console.log(
    JSON.stringify({
      route: r,
      status: res.status,
      stampOk: html.includes(STAMP),
      buildVersion,
      rhythm: /data-page="design-system-p2"|bm-section-rhythm|bm-hub-rhythm/.test(html),
    }),
  );
}
