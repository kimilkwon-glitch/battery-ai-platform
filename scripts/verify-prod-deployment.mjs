#!/usr/bin/env node
/**
 * Public production verification — https://battery-ai-platform.vercel.app only
 * Usage: node scripts/verify-prod-deployment.mjs
 */
const BASE = "https://battery-ai-platform.vercel.app";
const EXPECTED_STAMP = "BM-UX-REV-20260528-SEARCH-UX-UPGRADE";

const CHECKS = [
  { path: "/search?q=" + encodeURIComponent("포터2 배터리"), name: "porter2" },
  { path: "/search?q=" + encodeURIComponent("스포티지 NQ5 하이브리드"), name: "sportage-search" },
  {
    path: "/vehicle/sportage-nq5?fuel=" + encodeURIComponent("하이브리드"),
    name: "sportage-vehicle",
    expectHero: { fuel: "하이브리드", code: "AGM60L", first: true },
  },
  {
    path: "/vehicle/k8-gl3?fuel=" + encodeURIComponent("하이브리드"),
    name: "k8-vehicle",
    expectHero: { fuel: "하이브리드", code: "AGM60L", first: true },
  },
];

function stamps(html) {
  return [...new Set(html.match(/BM-UX-REV-[A-Z0-9-]+/g) ?? [])];
}

function fuelHeroCards(html) {
  const start = html.indexOf('id="fuel-batteries"');
  if (start < 0) return [];
  const section = html.slice(start, start + 12000);
  const cards = [];
  const re = /data-fuel-hero="([^"]+)"[^>]*data-battery-hero="([^"]+)"/gi;
  let m;
  while ((m = re.exec(section)) !== null) {
    cards.push({ fuel: m[1], code: m[2] });
  }
  return cards;
}

let failed = 0;
console.log("BASE:", BASE);
console.log("EXPECTED_STAMP:", EXPECTED_STAMP);
console.log("");

for (const c of CHECKS) {
  const url = BASE + c.path;
  const res = await fetch(url, {
    headers: {
      "Cache-Control": "no-cache, no-store",
      Pragma: "no-cache",
      "User-Agent": "BM-Prod-Verify/2.0",
    },
    cache: "no-store",
    redirect: "follow",
  });
  const html = await res.text();
  const found = stamps(html);
  const okStamp = found.length === 1 && found[0] === EXPECTED_STAMP;
  let heroLine = "";
  let okHero = true;
  if (c.expectHero) {
    const cards = fuelHeroCards(html);
    heroLine = cards.map((x) => `${x.fuel}=${x.code}`).join(" | ") || "(no hero cards)";
    const first = cards[0];
    okHero =
      Boolean(first) &&
      first.fuel === c.expectHero.fuel &&
      first.code === c.expectHero.code;
  }
  const ok = okStamp && okHero;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} ${c.name}`);
  console.log(`  url: ${url}`);
  console.log(`  status: ${res.status}`);
  console.log(`  stamps: ${found.join(", ") || "(none)"}`);
  if (c.expectHero) console.log(`  fuel-hero: ${heroLine}`);
  console.log("");
}

process.exit(failed > 0 ? 1 : 0);
