#!/usr/bin/env node
/**
 * Production deploy verification — cache-bust fetch
 */
const BASE = "https://battery-ai-platform.vercel.app";
const STAMP = "BM-VEHICLE-CTA-STORE-VISIBILITY-20260530-V1";
const BUST = `v=${Date.now()}`;

const paths = [
  "/",
  "/vehicle/genesis-eq900",
  "/batteries/AGM105L",
  "/service-center",
  "/checkout",
  "/brands",
];

async function fetchHtml(path) {
  const url = `${BASE}${path}?${BUST}`;
  const res = await fetch(url, {
    headers: { "cache-control": "no-cache", pragma: "no-cache" },
    redirect: "follow",
  });
  const html = await res.text();
  return { url, status: res.status, html };
}

function readStamp(html) {
  return (
    html.match(/data-build-stamp="([^"]+)"/)?.[1] ??
    html.match(/data-build-version="([^"]+)"/)?.[1] ??
    (html.includes(STAMP) ? STAMP : null)
  );
}

function checks(path, html) {
  const buildStamp = readStamp(html);
  const out = { path, stamp: buildStamp === STAMP, buildStamp };
  if (path.includes("genesis-eq900")) {
    out.specLink = /href="\/batteries\/AGM105L/.test(html) || /href="\/batteries\/AGM105L\?/.test(html);
    out.checkoutLink =
      /href="\/checkout\?[^"]*flow=buy_now[^"]*battery=AGM105L/.test(html) ||
      /href="\/checkout\?[^"]*battery=AGM105L[^"]*flow=buy_now/.test(html);
    out.noBatteryOrderAnchor = !html.includes("#battery-order");
    out.specLabel = html.includes("배터리 규격 보기");
    out.storeCard = html.includes("bm-store-card") && html.includes("bm-store-field-label");
    out.hakjang = html.includes("bm-store-card--hakjang");
    out.deokcheon = html.includes("bm-store-card--deokcheon");
  }
  if (path.includes("brands")) {
    out.noChecker = !/checkerboard|repeating-conic-gradient/i.test(html);
    out.rocketPanel = html.includes("brand-hub-logo-glass--rocket") || html.includes("darkHighContrast");
  }
  if (path.includes("service-center")) {
    out.storeStyles =
      html.includes("bm-store-phone-link") &&
      html.includes("bm-store-btn--call") &&
      html.includes("bm-store-badge--hakjang");
  }
  return out;
}

async function pollOnce() {
  const results = [];
  for (const path of paths) {
    const { url, status, html } = await fetchHtml(path);
    results.push({ url, status, ...checks(path, html) });
  }
  return results;
}

async function main() {
  console.log("STAMP_EXPECTED", STAMP);
  const maxAttempts = 30;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const results = await pollOnce();
    const vehicle = results.find((r) => r.path?.includes("genesis-eq900"));
    const service = results.find((r) => r.path?.includes("service-center"));
    const stamped = results.filter((r) => r.stamp).length;
    console.log(
      `attempt ${attempt}/${maxAttempts} stamped=${stamped}/${results.length} vehicleCheckout=${!!vehicle?.checkoutLink}`,
    );
    if (stamped >= 3 && vehicle?.specLink && vehicle?.checkoutLink && vehicle?.noBatteryOrderAnchor) {
      console.log(JSON.stringify(results, null, 2));
      process.exit(0);
    }
    if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, 20000));
  }
  const final = await pollOnce();
  console.log(JSON.stringify(final, null, 2));
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
