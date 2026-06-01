#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const ts = Date.now();
const res = await fetch(`${BASE}/?v=${ts}`, {
  headers: { "Cache-Control": "no-cache" },
});
const html = await res.text();
const pictures = (html.match(/home-hero-slide__picture/g) ?? []).length;
const desktopImgs = (html.match(/home-hero-slide__img--desktop/g) ?? []).length;
const mobileImgs = (html.match(/home-hero-slide__img--mobile/g) ?? []).length;
const sources = (html.match(/<source media="\(min-width: 640px\)"/g) ?? []).length;

console.log("status:", res.status);
console.log("rev:", html.match(/data-build-rev="([^"]+)"/)?.[1]);
console.log("<picture> layers:", pictures, pictures <= 3 ? "OK" : "CHECK");
console.log("dual desktop img class:", desktopImgs, desktopImgs === 0 ? "OK" : "BAD");
console.log("dual mobile img class:", mobileImgs, mobileImgs === 0 ? "OK" : "BAD");
console.log("desktop <source> tags:", sources, sources >= 1 ? "OK" : "MISS");
