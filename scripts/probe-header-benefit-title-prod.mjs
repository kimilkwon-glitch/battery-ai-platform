#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const ts = Date.now();
const res = await fetch(`${BASE}/?v=${ts}`, {
  headers: { "Cache-Control": "no-cache" },
});
const html = await res.text();
const checks = [
  ["rev header-benefit-title", /data-build-rev="header-benefit-title-v1/],
  ["stamp", /HEADER-BENEFIT-TITLE-V1/],
  ["logo path", /battery-manager-logo\.png/],
  ["BENEFIT badge", />BENEFIT</],
  ["new subtitle", /첫 주문 혜택부터 기본 서비스까지/],
  ["portal-brand-lockup gap-2", /portal-brand-lockup[^"]*gap-2/],
  ["text-2xl brand", /portal-brand-lockup__title[^"]*lg:text-2xl/],
  ["hero contain", /object-contain/],
  ["hero aspect 48/13", /sm:aspect-\[48\/13\]/],
];
console.log("status:", res.status);
for (const [label, re] of checks) {
  console.log(`${label}:`, re.test(html) ? "OK" : "MISS");
}
