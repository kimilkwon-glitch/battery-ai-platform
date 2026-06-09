#!/usr/bin/env node
const BASE = "https://battery-ai-platform.vercel.app";
const STAMP = "BM-TOSS-REVIEW-20260530-V1";

const paths = [
  "/",
  "/terms",
  "/privacy",
  "/shipping",
  "/refund",
  "/support",
  "/company",
  "/checkout",
  "/payment/ready",
  "/payment/success",
  "/payment/fail",
];

function readStamp(html) {
  return (
    html.match(/data-build-version="([^"]+)"/)?.[1] ??
    html.match(/data-build-stamp="([^"]+)"/)?.[1] ??
    null
  );
}

async function probe(path) {
  const res = await fetch(`${BASE}${path}?t=${Date.now()}`, {
    headers: { "cache-control": "no-cache" },
    redirect: "follow",
  });
  const html = await res.text();
  const stamp = readStamp(html);
  return {
    path,
    status: res.status,
    stampOk: stamp === STAMP,
    stamp,
    hasFooter: html.includes("data-site-footer"),
    noDevJargon: !/TODO|mock|PG 미연동|API 없음|개발 중/i.test(html),
    hasCardInput: /card.?number|cvc|유효기간/i.test(html) && path.startsWith("/payment"),
  };
}

async function main() {
  console.log("BASE", BASE);
  console.log("STAMP_EXPECTED", STAMP);
  for (const path of paths) {
    const r = await probe(path);
    console.log(JSON.stringify(r));
  }
  const robots = await fetch(`${BASE}/robots.txt`);
  const robotsText = await robots.text();
  console.log(
    JSON.stringify({
      path: "/robots.txt",
      status: robots.status,
      blocksAdmin: robotsText.includes("Disallow: /admin"),
    }),
  );
  const adminApi = await fetch(`${BASE}/api/admin/commerce-orders`);
  console.log(
    JSON.stringify({
      path: "/api/admin/commerce-orders",
      status: adminApi.status,
      auth401: adminApi.status === 401,
    }),
  );
  const home = await (await fetch(`${BASE}/?t=${Date.now()}`)).text();
  const footerLinks = [
    "/terms",
    "/privacy",
    "/shipping",
    "/refund",
    "/support",
    "/company",
  ].map((href) => ({ href, present: home.includes(`href="${href}"`) }));
  console.log(JSON.stringify({ footerLinks }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
