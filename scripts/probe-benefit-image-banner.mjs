#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const EXPECT_STAMP = "BM-BENEFIT-IMAGE-BANNER-20260604-V2";

async function html(path) {
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}cb=${Date.now()}`;
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  return { status: res.status, text: await res.text() };
}

const forbidden = [
  "혜택 자세히 보기",
  "home-benefit-card__body",
  "home-benefit-card__badge",
  "home-benefit-card__cta",
  "혜택을 한눈에 확인하세요",
];

async function main() {
  for (const path of ["/", "/benefits"]) {
    const { status, text } = await html(path);
    console.log("\n===", path, "status", status);
    console.log("stamp", text.includes(EXPECT_STAMP) ? "PASS" : "FAIL");
    for (const f of forbidden) {
      console.log(f, text.includes(f) ? "FAIL_PRESENT" : "PASS_ABSENT");
    }
    console.log(
      "image_only_class",
      text.includes("home-benefit-card--image-only") ? "PASS" : "FAIL",
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
