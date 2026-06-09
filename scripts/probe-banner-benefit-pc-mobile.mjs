#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const EXPECT_STAMP = "BM-MAIN-BANNER-BENEFIT-PC-MOBILE-20260605-V1";
const CB = `probe-${Date.now()}`;

async function main() {
  const res = await fetch(`${BASE}/?cb=${CB}`, {
    headers: { "Cache-Control": "no-cache" },
  });
  const html = await res.text();

  const stamp = html.match(/BM-[A-Z0-9-]+/)?.[0];
  const heroPaths = [...new Set([...html.matchAll(/main-banners\/[^"']+/g)].map((m) => m[0]))];
  const benefitPaths = [
    ...new Set([...html.matchAll(/benefits\/benefit-[^"']+/g)].map((m) => m[0])),
  ];
  const heroSlide = html.match(/data-hero-slide-id="([^"]+)"/)?.[1];
  const benefitIds = [...html.matchAll(/data-benefit-id="([^"]+)"/g)].map((m) => m[1]);

  const checks = {
    status: res.status,
    build_stamp: stamp,
    stamp_ok: stamp === EXPECT_STAMP,
    hero_slide_first: heroSlide === "nationwide-delivery",
    benefit_order: benefitIds.join(",") === "first-order-3,safe-driving-free-check,store-visit-discount-5000",
    delivery_pc: html.includes("main-banner-delivery-order-pc.png"),
    delivery_mobile: html.includes("main-banner-delivery-order-mobile.png"),
    store_pc: html.includes("main-banner-store-onsite-pc.png"),
    store_mobile: html.includes("main-banner-store-onsite-mobile.png"),
    night_pc: html.includes("main-banner-night-unmanned-pc.png"),
    night_mobile: html.includes("main-banner-night-unmanned-mobile.png"),
    benefit_first_pc: html.includes("benefit-first-order-3-percent-pc.png"),
    benefit_first_mobile: html.includes("benefit-first-order-3-percent-mobile.png"),
    benefit_safe_pc: html.includes("benefit-safe-driving-free-check-pc.png"),
    benefit_safe_mobile: html.includes("benefit-safe-driving-free-check-mobile.png"),
    benefit_visit_pc: html.includes("benefit-visit-5000-discount-pc.png"),
    benefit_visit_mobile: html.includes("benefit-visit-5000-discount-mobile.png"),
    cache_bust_hero: html.includes("v=20260605-hero-banners-v4"),
    cache_bust_benefit: html.includes("v=20260605-benefit-images-v2"),
    picture_767: html.includes("max-width: 767px"),
  };

  console.log(JSON.stringify({ checks, heroPaths, benefitPaths, benefitIds }, null, 2));

  const failed = Object.entries(checks).filter(([k, v]) => k.endsWith("_ok") || k.startsWith("hero_") || k.startsWith("benefit_") || k.startsWith("delivery_") || k.startsWith("store_") || k.startsWith("night_") || k.startsWith("cache_") || k === "picture_767").filter(([, v]) => v === false);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
