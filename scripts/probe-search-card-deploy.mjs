#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const STAMP = "BM-SEARCH-CARD-CLICK-20260530-V2";
const FORBIDDEN = /상담 확인 필요|연료·옵션별 상담|대표 규격 AGM|bm-search-vehicle-card__spec|bm-search-autocomplete__hint/gi;

async function check(q) {
  const url = `${BASE}/search?q=${encodeURIComponent(q)}&cb=${Date.now()}`;
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  const html = await res.text();
  const eqImg = html.includes("genesis_eq900") || html.includes("cars-normalized/genesis");
  return {
    q,
    status: res.status,
    stamp: html.includes(STAMP),
    forbidden: FORBIDDEN.test(html),
    eq900img: eqImg,
    cardClass: html.includes("bm-search-vehicle-card__identity"),
  };
}

const main = async () => {
  for (const q of ["EQ900", "q", "K3", "QM5", "GV80"]) {
    console.log(JSON.stringify(await check(q)));
  }
};
main();
