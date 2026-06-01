#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const ts = Date.now();
const res = await fetch(`${BASE}/?v=${ts}`, {
  headers: { "Cache-Control": "no-cache" },
});
const html = await res.text();
console.log("status:", res.status);
console.log("rev:", html.match(/data-build-rev="([^"]+)"/)?.[1]);
console.log("aspect 1984/528:", html.includes("aspect-[1984/528]") ? "OK" : "MISS");
console.log("aspect 1376/768:", html.includes("aspect-[1376/768]") ? "OK" : "MISS");
console.log("old 48/13:", html.includes("aspect-[48/13]") ? "FOUND (bad)" : "none");
console.log("object-contain:", html.includes("object-contain") ? "OK" : "MISS");
console.log("object-cover hero:", /home-hero-slide__img[^>]*object-cover/.test(html) ? "FOUND" : "none");
