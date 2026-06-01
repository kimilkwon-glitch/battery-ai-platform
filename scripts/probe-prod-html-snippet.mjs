const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const cb = Date.now();
const res = await fetch(`${BASE}/?_cb=${cb}`, {
  headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
});
const html = await res.text();
const rev = html.match(/data-build-rev="([^"]+)"/)?.[1];
const ver = html.match(/data-build-version="([^"]+)"/)?.[1];
console.log(
  JSON.stringify(
    {
      status: res.status,
      buildVersion: ver,
      buildRev: rev,
      portalNavLink: html.includes("portal-nav-link"),
      homeMainSearchInput: html.includes("home-main-search-input"),
      lineupBrandAttr: html.includes("data-home-lineup-brand"),
      soliteLineupInPayload: html.includes("CMF57412") || html.includes("57412"),
    },
    null,
    2,
  ),
);
