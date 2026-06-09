#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const EXPECT_STAMP = "BM-MAIN-COMPACT-UI-20260604-V1";

async function html(path) {
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}cb=${Date.now()}`;
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  return { status: res.status, text: await res.text() };
}

const checks = [
  ["stamp_in_html", (t) => t.includes(EXPECT_STAMP)],
  ["no_search_examples_label", (t) => !t.includes("검색 예시")],
  ["no_benefit_subtitle", (t) => !t.includes("혜택을 한눈에 확인하세요")],
  ["no_card_summary_copy", (t) => !t.includes("차종·라벨과 함께 확인")],
  ["no_summary_class", (t) => !t.includes("home-spec-card-summary")],
  ["has_review_cta", (t) => t.includes("리뷰 보기")],
  ["has_spec_cta", (t) => t.includes("배터리 규격 보기")],
  ["has_order_cta", (t) => t.includes("주문하기")],
  ["benefit_title", (t) => t.includes("배터리매니저 혜택")],
];

async function main() {
  const home = await html("/");
  const stampAttr =
    home.text.match(/data-build-stamp="([^"]+)"/)?.[1] ??
    home.text.match(/data-build-version="([^"]+)"/)?.[1] ??
    "none";
  console.log("url", BASE);
  console.log("status", home.status);
  console.log("data-build-stamp", stampAttr);
  console.log("expected_stamp", EXPECT_STAMP);
  for (const [name, fn] of checks) {
    console.log(name, fn(home.text) ? "PASS" : "FAIL");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
