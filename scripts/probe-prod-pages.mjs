#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";

const paths = [
  "/vehicle/grandeur-ig?fuel=" + encodeURIComponent("가솔린"),
  "/batteries/CMF80L",
];

for (const path of paths) {
  const res = await fetch(BASE + path, {
    headers: { "Cache-Control": "no-cache", "User-Agent": "BM-Probe/1.0" },
  });
  const html = await res.text();
  const stamp = html.match(/data-build-version="([^"]+)"/)?.[1] ?? "MISSING";
  const h1 = html.match(/<h1[^>]*>([^<]+)</)?.[1] ?? "MISSING";
  const cards = [...html.matchAll(
    /text-xs font-black text-slate-800">([^<]+)<\/span>\s*<span class="text-lg font-black[^>]*>([^<]+)</g,
  )].map((m) => `${m[1]} → ${m[2]}`);
  console.log("\n===", path, "===");
  console.log("stamp:", stamp);
  console.log("h1:", h1);
  if (cards.length) console.log("fuel cards:", cards.join(" | "));
}
