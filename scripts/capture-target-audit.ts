#!/usr/bin/env npx tsx
/**
 * Battery Manager — 부분 디자인 감사 (Playwright)
 * 대상 영역만 PC/모바일 캡처. 전체 journey audit 금지.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 npm run audit:target
 *   npm run audit:target -- --scope=checkout
 *   npm run audit:target -- --scope=mobile-overflow
 *   AUDIT_TARGET_SCOPE=checkout npm run audit:target
 */
import { chromium, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CART_DEMO_ITEMS } from "../src/data/cart-flow-guide";
import { CART_STORAGE_KEY } from "../src/types/cart";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const PC_VIEWPORT = { width: 1440, height: 1200, deviceScaleFactor: 1 };
const MOBILE_VIEWPORT = {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

type ViewportName = "pc" | "mobile";

type CaptureTarget = {
  id: string;
  label: string;
  path: string;
  selector: string;
  scrollTo?: string;
  waitMs?: number;
  /** 장바구니 localStorage 시드 (checkout/cart 캡처용) */
  seedCart?: boolean;
  /** checkout 수령방식 선택 (audit: checkout-logo) */
  fulfillmentMethod?: "delivery" | "visit_install" | "store_pickup_self" | "store_install";
  /** 뷰포트별 셀렉터 (PC aside / 모바일 인라인 등) */
  selectorPc?: string;
  selectorMobile?: string;
  /** true면 요소 클립 대신 뷰포트 전체 캡처 (mobile-overflow) */
  captureViewport?: boolean;
};

type OverflowMetrics = {
  innerWidth: number;
  documentElementScrollWidth: number;
  bodyScrollWidth: number;
  overflow: boolean;
};

const MOBILE_OVERFLOW_TARGETS: CaptureTarget[] = [
  {
    id: "mobile-overflow-home",
    label: "홈 모바일",
    path: "/",
    selector: "body",
    waitMs: 900,
    captureViewport: true,
  },
  {
    id: "mobile-overflow-vehicles",
    label: "차종검색 모바일",
    path: "/vehicles",
    selector: "body",
    waitMs: 800,
    captureViewport: true,
  },
  {
    id: "mobile-overflow-brands",
    label: "브랜드 안내 모바일",
    path: "/brands",
    selector: "body",
    waitMs: 900,
    captureViewport: true,
  },
  {
    id: "mobile-overflow-service",
    label: "매장·출장 안내 모바일",
    path: "/service-center",
    selector: "body",
    waitMs: 900,
    captureViewport: true,
  },
  {
    id: "mobile-overflow-support",
    label: "고객센터 모바일",
    path: "/support",
    selector: "body",
    waitMs: 900,
    captureViewport: true,
  },
  {
    id: "mobile-overflow-checkout",
    label: "checkout 모바일",
    path: "/checkout?flow=cart",
    selector: "body",
    waitMs: 1000,
    seedCart: true,
    captureViewport: true,
  },
];

const CHECKOUT_TARGETS: CaptureTarget[] = [
  {
    id: "cart-page",
    label: "장바구니",
    path: "/cart",
    selector: "[data-page='cart']",
    waitMs: 600,
    seedCart: true,
  },
  {
    id: "checkout-guest",
    label: "checkout 비회원 주문 화면",
    path: "/checkout?flow=cart",
    selector: "[data-page='checkout']",
    waitMs: 800,
    seedCart: true,
  },
  {
    id: "checkout-fulfillment",
    label: "수령방식 선택",
    path: "/checkout?flow=cart",
    selector: "[data-checkout-section='fulfillment']",
    scrollTo: "[data-checkout-section='fulfillment']",
    waitMs: 600,
    seedCart: true,
  },
  {
    id: "checkout-price-summary",
    label: "가격 요약",
    path: "/checkout?flow=cart",
    selector: "[data-checkout-panel='price-aside']",
    selectorPc: "[data-checkout-panel='price-aside']",
    selectorMobile: "[data-checkout-panel='price-inline']",
    scrollTo: "[data-checkout-panel='price-aside']",
    waitMs: 600,
    seedCart: true,
  },
];

const CHECKOUT_LOGO_TARGETS: CaptureTarget[] = [
  {
    id: "checkout-delivery-info",
    label: "checkout 택배 주문 — 배송지 정보",
    path: "/checkout?flow=cart",
    selector: "[data-checkout-info-section='delivery']",
    scrollTo: "[data-checkout-info-section='delivery']",
    waitMs: 700,
    seedCart: true,
    fulfillmentMethod: "delivery",
  },
  {
    id: "checkout-visit-info",
    label: "checkout 출장 교체 — 방문 정보",
    path: "/checkout?flow=cart",
    selector: "[data-checkout-info-section='visit_install']",
    scrollTo: "[data-checkout-info-section='visit_install']",
    waitMs: 700,
    seedCart: true,
    fulfillmentMethod: "visit_install",
  },
  {
    id: "checkout-store-pickup-info",
    label: "checkout 매장 수령 — 주문자 정보",
    path: "/checkout?flow=cart",
    selector: "[data-checkout-info-panel='store_pickup_self']",
    scrollTo: "[data-checkout-info-panel='store_pickup_self']",
    waitMs: 700,
    seedCart: true,
    fulfillmentMethod: "store_pickup_self",
  },
  {
    id: "checkout-store-install-info",
    label: "checkout 매장 교체 — 방문자 정보",
    path: "/checkout?flow=cart",
    selector: "[data-checkout-info-panel='store_install']",
    scrollTo: "[data-checkout-info-panel='store_install']",
    waitMs: 700,
    seedCart: true,
    fulfillmentMethod: "store_install",
  },
  {
    id: "brand-logo-solite",
    label: "쏠라이트 브랜드 로고",
    path: "/brands?brand=solite",
    selector: ".brand-hub-logo-badge",
    scrollTo: ".brand-hub-logo-badge",
    waitMs: 900,
  },
  {
    id: "brand-logo-rocket",
    label: "로케트 브랜드 로고",
    path: "/brands?brand=rocket",
    selector: ".brand-hub-logo-badge",
    scrollTo: ".brand-hub-logo-badge",
    waitMs: 900,
  },
  {
    id: "brand-reference-delco-atlas",
    label: "참고 브랜드(델코·아트라스BX) 섹션",
    path: "/brands?brand=rocket",
    selector: "[aria-labelledby='brand-hub-reference-title']",
    scrollTo: "[aria-labelledby='brand-hub-reference-title']",
    waitMs: 700,
  },
];

const ALL_TARGETS: CaptureTarget[] = [
  {
    id: "home-product-cards",
    label: "홈 상단~상품 카드 영역",
    path: "/",
    selector: "[data-home-section='brand-lineup-pair']",
    scrollTo: "#home-lineup-rocket",
    waitMs: 600,
  },
  {
    id: "home-reviews",
    label: "홈 리뷰 섹션",
    path: "/",
    selector: "[data-home-section='replacement-stories']",
    scrollTo: "[data-home-section='replacement-stories']",
    waitMs: 500,
  },
  {
    id: "vehicle-recommended-battery",
    label: "차량 상세 추천 배터리 카드",
    path: "/vehicle/grandeur-ig",
    selector: "[data-vehicle-recommended-card]",
    scrollTo: "[data-vehicle-recommended-card]",
    waitMs: 800,
  },
];

function resolveScope(): string {
  const arg = process.argv.find((a) => a.startsWith("--scope="));
  if (arg) return arg.split("=")[1]!.toLowerCase();
  return (process.env.AUDIT_TARGET_SCOPE ?? "vehicle").toLowerCase();
}

function resolveTargets(): CaptureTarget[] {
  const scope = resolveScope();
  if (scope === "all" || scope === "full") return [...ALL_TARGETS, ...CHECKOUT_TARGETS];
  if (scope === "checkout" || scope === "order") return CHECKOUT_TARGETS;
  if (scope === "checkout-logo") return CHECKOUT_LOGO_TARGETS;
  if (scope === "mobile-overflow" || scope === "mobile") return MOBILE_OVERFLOW_TARGETS;
  if (scope === "home") return ALL_TARGETS.filter((t) => t.id.startsWith("home-"));
  if (scope === "vehicle") return ALL_TARGETS.filter((t) => t.id === "vehicle-recommended-battery");
  return ALL_TARGETS.filter((t) => t.id === "vehicle-recommended-battery");
}

const AUDIT_CART_SEED = [CART_DEMO_ITEMS[0]!];

const CART_SEED_SCRIPT = {
  key: CART_STORAGE_KEY,
  items: AUDIT_CART_SEED,
};

function timestampFolder(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

async function waitForPageReady(page: Page) {
  await page.waitForLoadState("load", { timeout: 20_000 }).catch(() => undefined);
  await page
    .waitForFunction(() => document.readyState === "complete", undefined, { timeout: 8_000 })
    .catch(() => undefined);
  await page.waitForTimeout(500);
}

function isMobileOverflowScope(): boolean {
  const scope = resolveScope();
  return scope === "mobile-overflow" || scope === "mobile";
}

async function measureOverflow(page: Page, target: CaptureTarget): Promise<OverflowMetrics> {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentElementScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  const tolerance = 1;
  const overflow =
    metrics.documentElementScrollWidth > metrics.innerWidth + tolerance ||
    metrics.bodyScrollWidth > metrics.innerWidth + tolerance;
  return { ...metrics, overflow };
}

async function scrollToSelector(page: Page, scrollTo?: string) {
  if (!scrollTo) return;
  const el = page.locator(scrollTo).first();
  if ((await el.count()) > 0) {
    await el.scrollIntoViewIfNeeded({ timeout: 10_000 }).catch(() => undefined);
    await page.waitForTimeout(200);
  }
}

async function captureTarget(
  page: Page,
  target: CaptureTarget,
  viewport: ViewportName,
  outDir: string,
): Promise<{ ok: boolean; file: string; notes: string }> {
  const fileName = `${target.id}.png`;
  const filePath = join(outDir, "screenshots", viewport, fileName);
  const relFile = `screenshots/${viewport}/${fileName}`;

  try {
    await page.goto(`${BASE_URL}${target.path}`, { waitUntil: "commit", timeout: 60_000 });
    await waitForPageReady(page);
    const activeSelector =
      viewport === "pc" && target.selectorPc
        ? target.selectorPc
        : viewport === "mobile" && target.selectorMobile
          ? target.selectorMobile
          : target.selector;
    const scrollTarget =
      viewport === "mobile" && target.selectorMobile ? target.selectorMobile : target.scrollTo;
    if (target.seedCart) {
      await page.waitForSelector("[data-page='checkout']", { timeout: 25_000 }).catch(() => undefined);
      await page.waitForTimeout(800);
    }
    if (target.fulfillmentMethod) {
      const methodBtn = page.locator(`[data-checkout-fulfillment='${target.fulfillmentMethod}']`).first();
      if ((await methodBtn.count()) > 0) {
        await methodBtn.click({ timeout: 10_000 });
        await page.waitForTimeout(400);
      }
    }
    await scrollToSelector(page, scrollTarget);
    if (target.waitMs) await page.waitForTimeout(target.waitMs);

    if (target.captureViewport) {
      await page.screenshot({ path: filePath, fullPage: false });
      return { ok: true, file: relFile, notes: "" };
    }

    const locator = page.locator(activeSelector).first();
    const count = await locator.count();
    if (count === 0) {
      await page.screenshot({ path: filePath, fullPage: false });
      return { ok: false, file: relFile, notes: `selector not found: ${target.selector}` };
    }

    const box = await locator.boundingBox();
    if (box && box.width > 0 && box.height > 0) {
      await page.screenshot({
        path: filePath,
        clip: {
          x: Math.max(0, box.x),
          y: Math.max(0, box.y),
          width: box.width,
          height: box.height,
        },
        animations: "disabled",
        timeout: 20_000,
      });
      return { ok: true, file: relFile, notes: "" };
    }

    await locator.screenshot({ path: filePath, timeout: 20_000, animations: "disabled" });
    return { ok: true, file: relFile, notes: "" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    try {
      await page.screenshot({ path: filePath, fullPage: false });
    } catch {
      /* ignore */
    }
    return { ok: false, file: relFile, notes: msg };
  }
}

function buildIndexHtml(
  runId: string,
  results: { target: CaptureTarget; pc: { file: string; ok: boolean }; mobile: { file: string; ok: boolean } }[],
): string {
  const rows = results
    .map((r) => {
      const pcStatus = r.pc.ok ? "ok" : "warn";
      const mobStatus = r.mobile.ok ? "ok" : "warn";
      return `
      <section class="target-block" id="${r.target.id}">
        <h2>${r.target.label}</h2>
        <p class="meta">${r.target.path} · <code>${r.target.selector}</code></p>
        <div class="pair">
          <figure class="${pcStatus}">
            <figcaption>PC 1440px <span class="badge">${pcStatus}</span></figcaption>
            <a href="${r.pc.file}" target="_blank" rel="noopener">
              <img src="${r.pc.file}" alt="${r.target.label} PC" loading="lazy" />
            </a>
          </figure>
          <figure class="${mobStatus}">
            <figcaption>Mobile 390px <span class="badge">${mobStatus}</span></figcaption>
            <a href="${r.mobile.file}" target="_blank" rel="noopener">
              <img src="${r.mobile.file}" alt="${r.target.label} Mobile" loading="lazy" />
            </a>
          </figure>
        </div>
      </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Target Design Audit — ${runId}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "Pretendard", system-ui, sans-serif; background: #f1f5f9; color: #0f172a; }
    header { padding: 1.25rem 1.5rem; background: #0f172a; color: #f8fafc; }
    header h1 { margin: 0 0 0.25rem; font-size: 1.25rem; }
    header p { margin: 0; font-size: 0.8125rem; opacity: 0.85; }
    main { max-width: 1400px; margin: 0 auto; padding: 1.25rem 1rem 2.5rem; }
    .target-block { margin-bottom: 2rem; padding: 1rem; border-radius: 1rem; background: #fff; border: 1px solid #e2e8f0; }
    .target-block h2 { margin: 0 0 0.375rem; font-size: 1.0625rem; }
    .meta { margin: 0 0 0.875rem; font-size: 0.75rem; color: #64748b; }
    .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 900px) { .pair { grid-template-columns: 1fr; } }
    figure { margin: 0; border-radius: 0.75rem; overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc; }
    figure.warn { border-color: #fbbf24; }
    figcaption { padding: 0.5rem 0.75rem; font-size: 0.75rem; font-weight: 700; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    .badge { float: right; text-transform: uppercase; font-size: 0.625rem; letter-spacing: 0.04em; }
    figure.ok .badge { color: #15803d; }
    figure.warn .badge { color: #b45309; }
    a { display: block; line-height: 0; }
    img { width: 100%; height: auto; cursor: zoom-in; }
    code { font-size: 0.6875rem; background: #f1f5f9; padding: 0.125rem 0.375rem; border-radius: 0.25rem; }
  </style>
</head>
<body>
  <header>
    <h1>Target Design Audit</h1>
    <p>Run: ${runId} · Base: ${BASE_URL} · 이미지 클릭 시 원본 PNG 확대</p>
  </header>
  <main>
    ${rows}
  </main>
</body>
</html>`;
}

function buildReportMd(
  runId: string,
  results: {
    target: CaptureTarget;
    pc: { file: string; ok: boolean; notes: string };
    mobile: { file: string; ok: boolean; notes: string };
  }[],
): string {
  const lines = [
    `# Target Design Audit`,
    ``,
    `- Run: \`${runId}\``,
    `- Base URL: ${BASE_URL}`,
    `- Generated: ${new Date().toISOString()}`,
    ``,
    `## 캡처 대상`,
    ``,
    `| ID | Label | Path | Selector | PC | Mobile |`,
    `| --- | --- | --- | --- | --- | --- |`,
  ];

  for (const r of results) {
    lines.push(
      `| ${r.target.id} | ${r.target.label} | ${r.target.path} | \`${r.target.selector}\` | ${r.pc.ok ? "ok" : "fail"} | ${r.mobile.ok ? "ok" : "fail"} |`,
    );
    if (r.pc.notes) lines.push(`  - PC notes (${r.target.id}): ${r.pc.notes}`);
    if (r.mobile.notes) lines.push(`  - Mobile notes (${r.target.id}): ${r.mobile.notes}`);
  }

  lines.push("", "## 폴더 구조", "", "- `index.html` — PC/Mobile 나란히 비교", "- `report.md` — 이 파일", "- `screenshots/pc/`", "- `screenshots/mobile/`", "");
  return lines.join("\n");
}

function buildOverflowReportMd(
  runId: string,
  checks: { target: CaptureTarget; metrics: OverflowMetrics; mobile: { file: string; ok: boolean } }[],
): string {
  const lines = [
    `# Mobile Overflow Audit`,
    ``,
    `- Run: \`${runId}\``,
    `- Base URL: ${BASE_URL}`,
    `- Generated: ${new Date().toISOString()}`,
    ``,
    `## scrollWidth 검사`,
    ``,
    `| Page | innerWidth | html scrollWidth | body scrollWidth | overflow |`,
    `| --- | ---: | ---: | ---: | --- |`,
  ];

  for (const row of checks) {
    const status = row.metrics.overflow ? "FAIL" : "ok";
    lines.push(
      `| ${row.target.label} | ${row.metrics.innerWidth} | ${row.metrics.documentElementScrollWidth} | ${row.metrics.bodyScrollWidth} | ${status} |`,
    );
  }

  lines.push("", "## 캡처", "", ...checks.map((r) => `- ${r.target.label}: \`${r.mobile.file}\``), "");
  return lines.join("\n");
}

function buildOverflowIndexHtml(
  runId: string,
  checks: { target: CaptureTarget; metrics: OverflowMetrics; mobile: { file: string; ok: boolean } }[],
): string {
  const rows = checks
    .map((r) => {
      const status = r.metrics.overflow ? "fail" : "ok";
      return `
      <section class="target-block ${status}" id="${r.target.id}">
        <h2>${r.target.label} <span class="badge">${status}</span></h2>
        <p class="meta">${r.target.path}</p>
        <ul class="metrics">
          <li>innerWidth: <strong>${r.metrics.innerWidth}</strong></li>
          <li>documentElement.scrollWidth: <strong>${r.metrics.documentElementScrollWidth}</strong></li>
          <li>body.scrollWidth: <strong>${r.metrics.bodyScrollWidth}</strong></li>
        </ul>
        <figure>
          <a href="${r.mobile.file}" target="_blank" rel="noopener">
            <img src="${r.mobile.file}" alt="${r.target.label}" loading="lazy" />
          </a>
        </figure>
      </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mobile Overflow Audit — ${runId}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "Pretendard", system-ui, sans-serif; background: #f1f5f9; color: #0f172a; }
    header { padding: 1.25rem 1.5rem; background: #0f172a; color: #f8fafc; }
    header h1 { margin: 0 0 0.25rem; font-size: 1.25rem; }
    header p { margin: 0; font-size: 0.8125rem; opacity: 0.85; }
    main { max-width: 520px; margin: 0 auto; padding: 1.25rem 1rem 2.5rem; }
    .target-block { margin-bottom: 1.5rem; padding: 1rem; border-radius: 1rem; background: #fff; border: 1px solid #e2e8f0; }
    .target-block.fail { border-color: #f87171; }
    .target-block h2 { margin: 0 0 0.375rem; font-size: 1rem; }
    .badge { float: right; text-transform: uppercase; font-size: 0.625rem; letter-spacing: 0.04em; }
    .target-block.ok .badge { color: #15803d; }
    .target-block.fail .badge { color: #b91c1c; }
    .meta { margin: 0 0 0.5rem; font-size: 0.75rem; color: #64748b; }
    .metrics { margin: 0 0 0.75rem; padding-left: 1.125rem; font-size: 0.75rem; color: #475569; }
    figure { margin: 0; border-radius: 0.75rem; overflow: hidden; border: 1px solid #e2e8f0; }
    img { width: 100%; height: auto; cursor: zoom-in; display: block; }
  </style>
</head>
<body>
  <header>
    <h1>Mobile Overflow Audit (390px)</h1>
    <p>Run: ${runId} · Base: ${BASE_URL}</p>
  </header>
  <main>${rows}</main>
</body>
</html>`;
}

async function main() {
  const targets = resolveTargets();
  const runId = timestampFolder();
  const outDir = join(ROOT, "design-audit", "target-runs", runId);
  const mobileOnly = isMobileOverflowScope();
  mkdirSync(join(outDir, "screenshots", "pc"), { recursive: true });
  mkdirSync(join(outDir, "screenshots", "mobile"), { recursive: true });

  console.log(`[audit:target] BASE_URL=${BASE_URL}`);
  console.log(`[audit:target] scope=${resolveScope()} (${targets.length} targets)`);
  console.log(`[audit:target] output=${outDir}`);

  const browser = await chromium.launch({ headless: true });
  const results: {
    target: CaptureTarget;
    pc: { file: string; ok: boolean; notes: string };
    mobile: { file: string; ok: boolean; notes: string };
  }[] = [];
  const overflowChecks: {
    target: CaptureTarget;
    metrics: OverflowMetrics;
    mobile: { file: string; ok: boolean };
  }[] = [];

  const needsCartSeed = targets.some((t) => t.seedCart);
  const viewports = mobileOnly ? (["mobile"] as const) : (["pc", "mobile"] as const);

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: viewport === "pc" ? PC_VIEWPORT : MOBILE_VIEWPORT,
        ...(viewport === "mobile"
          ? { isMobile: true, hasTouch: true, userAgent: "BM-Target-Audit-Mobile" }
          : {}),
      });
      if (needsCartSeed) {
        await context.addInitScript(
          ({ key, items }) => {
            localStorage.setItem(key, JSON.stringify(items));
          },
          CART_SEED_SCRIPT,
        );
      }
      const page = await context.newPage();

      for (const target of targets) {
        const cap = await captureTarget(page, target, viewport, outDir);
        if (mobileOnly && viewport === "mobile") {
          const metrics = await measureOverflow(page, target);
          overflowChecks.push({
            target,
            metrics,
            mobile: { file: cap.file, ok: cap.ok },
          });
          console.log(
            `[overflow] ${target.id}: inner=${metrics.innerWidth} html=${metrics.documentElementScrollWidth} body=${metrics.bodyScrollWidth} ${metrics.overflow ? "FAIL" : "ok"}`,
          );
        }
        const existing = results.find((r) => r.target.id === target.id);
        if (existing) {
          if (viewport === "pc") {
            existing.pc = { file: cap.file, ok: cap.ok, notes: cap.notes };
          } else {
            existing.mobile = { file: cap.file, ok: cap.ok, notes: cap.notes };
          }
        } else {
          results.push({
            target,
            pc: viewport === "pc" ? { file: cap.file, ok: cap.ok, notes: cap.notes } : { file: "", ok: false, notes: "skipped" },
            mobile:
              viewport === "mobile"
                ? { file: cap.file, ok: cap.ok, notes: cap.notes }
                : { file: "", ok: false, notes: "skipped" },
          });
        }
        console.log(`[${viewport}] ${target.id}: ${cap.ok ? "ok" : "warn"} ${cap.notes || ""}`);
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  if (mobileOnly) {
    writeFileSync(join(outDir, "index.html"), buildOverflowIndexHtml(runId, overflowChecks), "utf8");
    writeFileSync(join(outDir, "report.md"), buildOverflowReportMd(runId, overflowChecks), "utf8");
    writeFileSync(
      join(outDir, "overflow-check.json"),
      JSON.stringify(
        {
          runId,
          baseUrl: BASE_URL,
          viewport: MOBILE_VIEWPORT,
          generatedAt: new Date().toISOString(),
          checks: overflowChecks.map((row) => ({
            id: row.target.id,
            label: row.target.label,
            path: row.target.path,
            screenshot: row.mobile.file,
            ...row.metrics,
          })),
          allPassed: overflowChecks.every((row) => !row.metrics.overflow),
        },
        null,
        2,
      ),
      "utf8",
    );
  } else {
    writeFileSync(join(outDir, "index.html"), buildIndexHtml(runId, results), "utf8");
    writeFileSync(join(outDir, "report.md"), buildReportMd(runId, results), "utf8");
  }

  const captureOk = mobileOnly
    ? results.every((r) => r.mobile.ok)
    : results.every((r) => r.pc.ok && r.mobile.ok);
  const overflowOk = mobileOnly ? overflowChecks.every((row) => !row.metrics.overflow) : true;
  const allOk = captureOk && overflowOk;
  console.log(
    `[audit:target] done — ${allOk ? "all ok" : mobileOnly ? "overflow or capture issues" : "some captures missing"}`,
  );
  console.log(`[audit:target] open ${join(outDir, "index.html")}`);

  if (!allOk) process.exitCode = 1;
}

main().catch((err) => {
  console.error("[audit:target] fatal:", err);
  process.exit(1);
});
