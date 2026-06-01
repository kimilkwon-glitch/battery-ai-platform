#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const ts = Date.now();
const res = await fetch(`${BASE}/?v=${ts}`, {
  headers: { "Cache-Control": "no-cache" },
});
const html = await res.text();
const rev = html.match(/data-build-rev="([^"]+)"/)?.[1] ?? "MISSING";
const stamp = html.match(/data-build-version="([^"]+)"/)?.[1] ?? "MISSING";

console.log("status:", res.status);
console.log("rev:", rev);
console.log("stamp:", stamp);
console.log("aspect-[25/14]:", html.includes("aspect-[25/14]") ? "OK" : "MISS");
console.log("sm:aspect-[48/13]:", html.includes("sm:aspect-[48/13]") ? "OK" : "MISS");
console.log("object-contain:", html.includes("object-contain") ? "OK" : "MISS");
const heroCover = html.includes("home-hero-slide__img") && html.match(/home-hero[^>]*object-cover/);
console.log("hero object-cover in markup:", heroCover ? "FOUND (bad)" : "none (good)");
