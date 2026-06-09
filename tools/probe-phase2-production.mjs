#!/usr/bin/env node
/** Production Phase2 verification — read-only */
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const STAMP = "BM-OPS-STABILIZE-PHASE2-20260603-V1";
const CB = process.argv[3] ?? "";

const q = CB ? `?_cb=${CB}` : "";
const pages = [
  { path: `/${q}`, name: "home" },
  { path: `/search?q=K3${CB ? "&_cb=" + CB : ""}`, name: "search-k3" },
  { path: `/batteries/100R${CB ? "?_cb=" + CB : ""}`, name: "batteries-100r" },
  { path: `/service-center${CB ? "?_cb=" + CB : ""}`, name: "service-center" },
  { path: `/cart${CB ? "?_cb=" + CB : ""}`, name: "cart" },
];

const out = { base: BASE, stamp: STAMP, checkedAt: new Date().toISOString(), pages: {} };

for (const { path, name } of pages) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Cache-Control": "no-cache", "User-Agent": "BM-Phase2-Verify/1.0" },
    redirect: "follow",
  });
  const html = await res.text();
  const visibleVStamp = />\s*v\s+BM-[\w-]+/i.test(html) || /\bv\s+BM-OPS/i.test(html);
  out.pages[name] = {
    status: res.status,
    xVercelId: res.headers.get("x-vercel-id"),
    stampInDom: html.includes(STAMP),
    dataBuildVersion: html.match(/data-build-version="([^"]+)"/)?.[1] ?? null,
    visibleVStamp,
    naverPlaceCount: (html.match(/네이버 플레이스/g) ?? []).length,
    deokcheonPlace: html.includes("2028214247"),
    hakjangPlace: html.includes("2094827192"),
  };
}

const home = out.pages.home;
out.summary = {
  stampLive: home?.stampInDom === true,
  footerVisibleStampHidden: !Object.values(out.pages).some((p) => p.visibleVStamp),
  serviceCenterNaverLinks: out.pages["service-center"]?.naverPlaceCount ?? 0,
  bothPlaceIds:
    out.pages["service-center"]?.deokcheonPlace && out.pages["service-center"]?.hakjangPlace,
};
console.log(JSON.stringify(out, null, 2));
