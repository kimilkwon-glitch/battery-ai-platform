#!/usr/bin/env node
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const STAMP = "BM-UX-REV-20260528-SEARCH-UX-UPGRADE-FIX1";

const checks = [
  {
    path: "/search?q=" + encodeURIComponent("포터2 배터리"),
    name: "porter2",
    ok: (html) =>
      html.includes(STAMP) &&
      !html.includes("정확히 찾지 못했습니다") &&
      html.includes("90R") &&
      html.includes("100R"),
  },
  {
    path: "/search?q=" + encodeURIComponent("레이 블랙박스 방전"),
    name: "ray-symptom",
    ok: (html) => html.includes(STAMP) && !html.includes("정확히 찾지 못했습니다"),
  },
  {
    path: "/search?q=" + encodeURIComponent("레이 TAM 배터리"),
    name: "ray-tam",
    ok: (html) =>
      html.includes(STAMP) &&
      !/포터2는 연식에 따라|2020년 이전 90R · 2020년 이후 100R/.test(html),
  },
  {
    path: "/search?q=" + encodeURIComponent("100R vs AGM95L"),
    name: "compare-100r",
    ok: (html) =>
      html.includes(STAMP) &&
      /100R[\s\S]{0,400}R타입/.test(html) &&
      !/100R[\s\S]{0,200}L타입/.test(html),
  },
  {
    path: "/search?q=" + encodeURIComponent("스포티지 NQ5 하이브리드"),
    name: "sportage-search",
    ok: (html) => html.includes(STAMP) && html.includes("AGM60L"),
  },
  {
    path: "/vehicle/sportage-nq5?fuel=" + encodeURIComponent("하이브리드"),
    name: "sportage-vehicle",
    ok: (html) =>
      html.includes(STAMP) &&
      /data-fuel-hero="하이브리드"[^>]*data-battery-hero="AGM60L"/.test(html),
  },
  {
    path: "/vehicle/k8-gl3?fuel=" + encodeURIComponent("하이브리드"),
    name: "k8-vehicle",
    ok: (html) =>
      html.includes(STAMP) &&
      /data-fuel-hero="하이브리드"[^>]*data-battery-hero="AGM60L"/.test(html),
  },
];

let fail = 0;
for (const c of checks) {
  const url = BASE + c.path;
  const res = await fetch(url, {
    headers: { "Cache-Control": "no-cache" },
    cache: "no-store",
  });
  const html = await res.text();
  const stamps = [...new Set(html.match(/BM-UX-REV-[A-Z0-9-]+/g) ?? [])];
  const pass = res.status === 200 && c.ok(html) && stamps.length === 1 && stamps[0] === STAMP;
  if (!pass) fail++;
  console.log(`${pass ? "PASS" : "FAIL"} ${c.name} ${url}`);
  console.log(`  status=${res.status} stamps=${stamps.join(", ") || "(none)"}`);
}

process.exit(fail ? 1 : 0);
