const STAMP = "BM-MOBILE-REVIEW-CAROUSEL-20260530-V1";
const BASE = "https://battery-ai-platform.vercel.app";

const res = await fetch(`${BASE}/?cb=review-carousel-v1`, {
  headers: { "Cache-Control": "no-cache" },
});
const html = await res.text();
const stamp = html.match(/data-build-version="([^"]+)"/)?.[1] ?? "not-found";

const checks = {
  status: res.status === 200,
  stamp: stamp.includes("BM-MOBILE-REVIEW-CAROUSEL"),
  mobileCarousel: html.includes("home-replacement-stories__mobile-carousel"),
  fullWidthSlide: html.includes("home-replacement-stories__mobile-carousel-slide"),
  dots: html.includes("home-replacement-stories__mobile-carousel-dots"),
  noPeek88vw: !html.includes("88vw"),
};

const ok = Object.values(checks).every(Boolean);
console.log(`stamp=${stamp}`);
console.log(checks);
console.log(`\n${ok ? "PASS" : "FAIL"} (expected ${STAMP})`);
process.exit(ok ? 0 : 1);
