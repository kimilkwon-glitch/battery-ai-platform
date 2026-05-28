#!/usr/bin/env node
const BASE = process.argv[2] ?? "http://localhost:3000";
const codes = ["AGM60L", "90R", "80L", "115D31L"];
for (const code of codes) {
  const url = `${BASE}/batteries/${encodeURIComponent(code)}?_=${Date.now()}`;
  const html = await fetch(url, { headers: { "Cache-Control": "no-cache" }, cache: "no-store" }).then((r) =>
    r.text(),
  );
  const stamps = [...new Set(html.match(/BM-UX-REV-[A-Z0-9-]+/g) ?? [])];
  const routeStamp = html.match(/data-battery-route-build-stamp="([^"]*)"/)?.[1];
  const buildAttr = html.match(/data-battery-detail-build-stamp="([^"]*)"/)?.[1];
  const legacyHub = html.includes("BATTERY-DETAIL-HUB") || html.includes("data-battery-detail-hub-version=");
  console.log(code, {
    stamps,
    routeStamp,
    buildAttr,
    legacyHub,
    ok:
      stamps.length === 1 &&
      stamps[0] === "BM-UX-REV-20260528-BATTERY-DETAIL-ALL" &&
      routeStamp === buildAttr &&
      !legacyHub,
  });
}
