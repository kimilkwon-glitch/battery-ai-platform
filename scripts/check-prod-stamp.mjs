#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const PATHS = [
  "/",
  "/search?q=" + encodeURIComponent("그랜저 IG 가솔린"),
  "/vehicle/grandeur-ig?fuel=" + encodeURIComponent("가솔린"),
  "/search?q=CMF80L",
  "/batteries/CMF80L",
];

for (const path of PATHS) {
  const res = await fetch(BASE + path, {
    headers: { "Cache-Control": "no-cache", "User-Agent": "BM-StampCheck/1.0" },
  });
  const html = await res.text();
  const stamp = html.match(/data-build-version="([^"]+)"/)?.[1] ?? "MISSING";
  console.log(stamp, path);
}
