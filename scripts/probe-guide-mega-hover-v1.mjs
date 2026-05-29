const STAMP = "BM-UX-REV-20260528-GUIDE-MEGA-HOVER-V1";
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const cb = Date.now();
const url = `${BASE}/?_cb=${cb}`;
const text = await (await fetch(url, { headers: { "Cache-Control": "no-cache" } })).text();

console.log(
  JSON.stringify(
    {
      stampOk: text.includes(STAMP),
      buildVersion: text.match(/data-build-version="([^"]+)"/)?.[1],
      guideMenuWrapper: text.includes("guide-menu-wrapper"),
      guideMegaBridge: text.includes("guide-mega-bridge"),
      guideMegaDropdown: text.includes("guide-mega-dropdown"),
      guideRoutes: ["/guide/maintenance", "/guide/symptoms", "/guide/fault", "/guide/as"].every((p) =>
        text.includes(p),
      ),
      cacheBustUrl: url,
    },
    null,
    2,
  ),
);
