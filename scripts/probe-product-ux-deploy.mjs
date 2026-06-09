#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const STAMP = "BM-PRODUCT-UX-20260530-V1";
const paths = [
  "/",
  "/batteries/AGM60L",
  "/compare",
  "/service-center",
  "/reviews",
  "/battery-upgrade/grandeur-ig",
];

async function check(path) {
  const url = `${BASE}${path}?cb=${Date.now()}`;
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  const text = await res.text();
  const stampOk =
    text.includes(STAMP) ||
    text.includes(`data-build-version="${STAMP}"`) ||
    text.includes(`data-build-stamp="${STAMP}"`);
  return {
    path,
    status: res.status,
    stampOk,
    productInquiry: /제품 문의|이 규격 제품 문의/.test(text),
    upgradeLookup: text.includes("용량 업그레이드 조회"),
    noOldCta: !text.includes("규격 검색 및 사진확인"),
  };
}

async function main() {
  console.log("base", BASE, "expected", STAMP);
  for (const p of paths) {
    const r = await check(p);
    console.log(JSON.stringify(r));
  }
}

main();
