#!/usr/bin/env node
const BUST = Date.now();
const base = "https://battery-ai-platform.vercel.app";

async function main() {
  const html = await fetch(`${base}/vehicle/genesis-eq900?v=${BUST}`, {
    headers: { "cache-control": "no-cache" },
  }).then((r) => r.text());

  const spec = [...html.matchAll(/href="(\/batteries\/[^"#]+[^"]*)"/g)]
    .map((m) => m[1])
    .filter((h) => h.includes("AGM105L") && !h.includes("checkout"));
  const order = [...html.matchAll(/href="(\/checkout[^"]*)"/g)].map((m) => m[1]);

  const sc = await fetch(`${base}/service-center?v=${BUST}`, {
    headers: { "cache-control": "no-cache" },
  }).then((r) => r.text());

  console.log(
    JSON.stringify(
      {
        eq900: {
          specHrefs: [...new Set(spec)].slice(0, 4),
          orderHrefs: [...new Set(order)].slice(0, 4),
          hasSpecLabel: html.includes("배터리 규격 보기"),
          hasOldLabel: html.includes("상품 상세 보기"),
        },
        serviceCenter: {
          hakjang: sc.includes("bm-store-card--hakjang"),
          deokcheon: sc.includes("bm-store-card--deokcheon"),
          phone: sc.includes("bm-store-phone-link"),
          callBtn: sc.includes("bm-store-btn--call"),
        },
        orderRequestRedirect: (
          await fetch(`${base}/order-request?v=${BUST}`, { redirect: "manual" })
        ).headers.get("location"),
      },
      null,
      2,
    ),
  );
}

main();
