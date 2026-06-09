#!/usr/bin/env node
const BASE = "https://battery-ai-platform.vercel.app";
const BUST = Date.now();

const codes = ["AGM60L", "AGM70L", "AGM80L", "AGM95L", "GB90R", "GB57820"];

async function main() {
  const html = await fetch(`${BASE}/?v=${BUST}`, {
    headers: { "cache-control": "no-cache" },
  }).then((r) => r.text());

  const results = {};
  for (const code of codes) {
    const spec = html.includes(`/batteries/${code}`) || html.includes(`/batteries/${encodeURIComponent(code)}`);
    const product = html.includes(`/products/rocket-${code.toLowerCase()}`);
    const checkout = html.includes(`/checkout?`) && html.includes(code);
    results[code] = { specOnPage: spec, productOnPage: product, checkoutWithCode: checkout };
  }

  const productPage = await fetch(`${BASE}/products/rocket-agm60l?v=${BUST}`, {
    headers: { "cache-control": "no-cache" },
  });
  results.productRouteAgm60l = productPage.status;

  console.log(JSON.stringify(results, null, 2));
}

main();
