#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";

const ROUTES = [
  "/search?q=" + encodeURIComponent("포터2 배터리"),
  "/search?q=" + encodeURIComponent("스포티지 NQ5 하이브리드"),
  "/vehicle/sportage-nq5?fuel=" + encodeURIComponent("하이브리드"),
  "/vehicle/k8-gl3?fuel=" + encodeURIComponent("하이브리드"),
];

function heroCards(html) {
  const start = html.indexOf('id="fuel-batteries"');
  if (start < 0) return [];
  const section = html.slice(start, start + 10000);
  const cards = [];
  const re = /data-fuel-hero="([^"]+)"[^>]*data-battery-hero="([^"]+)"/gi;
  let m;
  while ((m = re.exec(section)) !== null) {
    cards.push({ fuel: m[1], code: m[2] });
  }
  return cards;
}

for (const path of ROUTES) {
  const url = BASE + path;
  const html = await fetch(url, { cache: "no-store" }).then((r) => r.text());
  const stamps = [...new Set(html.match(/BM-UX-REV-[A-Z0-9-]+/g) ?? [])];
  console.log(path);
  console.log("  stamps:", stamps.join(", ") || "(none)");
  const cards = heroCards(html);
  if (cards.length) console.log("  fuel-hero:", cards.map((c) => `${c.fuel}=${c.code}`).join(" | "));
  console.log("");
}
