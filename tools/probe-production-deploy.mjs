#!/usr/bin/env node
const base = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const url = `${base.replace(/\/$/, "")}/?_cb=${process.argv[3] ?? "probe-" + Date.now()}`;
const r = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
const h = await r.text();
const stamp = h.match(/data-build-version="([^"]+)"/)?.[1] ?? null;
const footerVisible = />v BM-[A-Z0-9-]+/.test(h) || /font-mono[^>]*>[\s\n]*v BM-/.test(h);
const santafeChips = [...h.matchAll(/home-search-example-chip[^>]*href="([^"]*)"[^>]*>싼타페 TM/g)];
const r100 = [...h.matchAll(/home-search-example-chip[^>]*href="([^"]*)"[^>]*>100R/g)];
console.log(JSON.stringify({ url, status: r.status, stamp, footerVisible, santafeChips: santafeChips.length, santafeHrefs: santafeChips.map((m) => m[1]), r100Chips: r100.length, r100Hrefs: r100.map((m) => m[1]), hasTypeVehicle: h.includes("type=vehicle"), hasTypeBattery: h.includes("type=battery") }, null, 2));
