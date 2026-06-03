#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const q = process.argv[3] ?? "QM5";
const url = `${BASE}/search?q=${encodeURIComponent(q)}&cb=${Date.now()}`;
const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
const html = await res.text();
const vehicleLinks = [...html.matchAll(/href="(\/vehicle\/[^"#?]+[^"]*)"/g)].map((m) => m[1]);
const primaryLinks = [...html.matchAll(/bm-search-vehicle-card__primary[^>]*href="([^"]+)"/g)].map((m) => m[1]);
console.log({
  q,
  status: res.status,
  cardClass: html.includes("bm-search-vehicle-card__identity"),
  primaryLinks: [...new Set(primaryLinks)],
  vehicleLinkCount: new Set(vehicleLinks).size,
  sampleVehicleLinks: [...new Set(vehicleLinks)].slice(0, 12),
});
