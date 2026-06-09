#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const STAMP = "BM-VEHICLE-DB-FINAL-20260530-V1";
const forbidden = /vehicle-battery-db|needsReview|차량표\s*미등록|needs_review/i;

async function html(path) {
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}cb=${Date.now()}`;
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  return { status: res.status, text: await res.text() };
}

const searches = [
  ["100R", /100R|\/batteries\/100R/i],
  ["쏘렌토 MQ4 하이브리드", /AGM60L/i],
  ["GV80", /GV80.*AGM95R|AGM95R.*GV80/is],
  ["K3", /\bK3\b/i],
  ["그랜드 스타렉스", /그랜드\s*스타렉스/i],
];

async function main() {
  const home = await html("/");
  const stamp = home.text.match(/data-build-version="([^"]+)"/)?.[1];
  console.log("stamp", stamp, stamp === STAMP ? "OK" : "WAIT");
  console.log("home forbidden", forbidden.test(home.text));

  for (const [q, re] of searches) {
    const { text, status } = await html(`/search?q=${encodeURIComponent(q)}`);
    console.log(
      q,
      status,
      "forbidden",
      forbidden.test(text),
      "content",
      re.test(text) ? "OK" : "FAIL",
    );
  }
}

main();
