#!/usr/bin/env node
/** Production curl verification for BATTERY-DETAIL-ALL */
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const STAMP = "BM-UX-REV-20260528-BATTERY-DETAIL-ALL";

const paths = [
  "/batteries/AGM60L",
  "/batteries/AGM70L",
  "/batteries/AGM80L",
  "/batteries/DIN74L",
  "/batteries/100R",
  "/batteries/CMF80L",
  "/batteries/AGM95L",
  "/batteries/EV%2012V",
  "/batteries/90R",
  "/batteries/CMF100R",
  "/batteries/DIN62L",
  "/batteries/80L",
  "/search?q=" + encodeURIComponent("포터2 배터리"),
  "/search?q=" + encodeURIComponent("레이 블랙박스 방전"),
  "/search?q=" + encodeURIComponent("100R vs AGM95L"),
  "/vehicle/sportage-nq5?fuel=" + encodeURIComponent("하이브리드"),
  "/vehicle/k8-gl3?fuel=" + encodeURIComponent("하이브리드"),
];

let fail = 0;
const rows = [];

for (const p of paths) {
  const url = BASE + p + (p.includes("?") ? "&" : "?") + "_cb=" + Date.now();
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" }, redirect: "follow", cache: "no-store" });
  const html = await res.text();
  const stamps = [...new Set(html.match(/BM-UX-REV-[A-Z0-9-]+/g) ?? [])];
  const hub =
    !p.startsWith("/batteries/") ||
    (html.includes("data-battery-detail-hub") &&
      html.includes(`data-battery-detail-build-stamp="${STAMP}"`) &&
      !html.includes("BATTERY-DETAIL-HUB"));
  const pass = res.status === 200 && stamps.length === 1 && stamps[0] === STAMP && hub;
  if (!pass) fail++;
  rows.push({ path: p, status: res.status, stamp: stamps[0] ?? null, hub, pass });
  console.log(`${pass ? "PASS" : "FAIL"} ${p} stamp=${stamps[0] ?? "none"}`);
}

console.log(fail ? `\n${fail} FAILED` : "\nALL PASS");
if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ base: BASE, stamp: STAMP, rows, fail }, null, 2));
}
process.exit(fail ? 1 : 0);
