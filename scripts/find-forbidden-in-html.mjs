#!/usr/bin/env node
const forbidden = [
  "vehicle-battery-db",
  "needsReview",
  "needs_review",
  "미등록",
  "차량표 미등록",
  "DB",
  "debug",
  "slug",
  "내부",
  "사진·문의",
  "사진 문의",
  "연료별 확인",
  "규격 재확인",
  "등록된 규격 없음",
  "battery:needsReview",
  "battery:linked",
];

const q = process.argv[2] ?? "GV80";
const url = `https://battery-ai-platform.vercel.app/search?q=${encodeURIComponent(q)}&cb=${Date.now()}`;

const html = await fetch(url, { headers: { "Cache-Control": "no-cache" } }).then((r) => r.text());

for (const phrase of forbidden) {
  const idx = html.indexOf(phrase);
  if (idx === -1) continue;
  const start = Math.max(0, idx - 40);
  const end = Math.min(html.length, idx + phrase.length + 40);
  console.log("HIT", phrase, "→", html.slice(start, end).replace(/\s+/g, " "));
}
