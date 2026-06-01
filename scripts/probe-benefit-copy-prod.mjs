#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const ts = Date.now();

const paths = ["/", "/benefits", "/benefits/basic-service", "/benefits/store-visit-discount-5000"];
const checks = [
  "첫 주문 3% 혜택",
  "교체 고객 기본 서비스",
  "직영점 방문 5,000원 할인",
  "회원 가입",
  "기본 서비스",
  "내방 할인",
  "hero-benefit-render-fix",
  "HERO-BENEFIT-RENDER-FIX-V1",
  "object-cover",
  "benefit-3percent-card",
  "benefit-service-card",
  "benefit-store-discount-5000",
];

for (const path of paths) {
  const res = await fetch(`${BASE}${path}?v=${ts}`, {
    headers: { "Cache-Control": "no-cache", "User-Agent": "BM-Probe/1.0" },
  });
  const html = await res.text();
  const rev = html.match(/data-build-rev="([^"]+)"/)?.[1] ?? "MISSING";
  console.log(`\n=== ${path} (${res.status}) rev=${rev} ===`);
  for (const c of checks) {
    console.log(`  ${c}: ${html.includes(c) ? "OK" : "MISS"}`);
  }
}
