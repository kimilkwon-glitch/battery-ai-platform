#!/usr/bin/env node
/**
 * Full customer UX audit — read-only production/preview probe + screenshots.
 * Usage: node tools/full-customer-ux-audit.mjs [baseUrl]
 *        npm run audit:full-ux
 * No source/UI/DB changes — reports only.
 */
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const REPORTS = join(ROOT, "reports");
const SHOTS = join(ROOT, "screenshots", "full-ux-audit");
const CACHE_BUST = process.env.UX_AUDIT_CB ?? "full-ux-audit-20260603";

const args = process.argv.slice(2);
const skipCart = args.includes("--skip-cart");
const BASE = (args.find((a) => a.startsWith("http")) ?? "https://battery-ai-platform.vercel.app").replace(
  /\/$/,
  "",
);

const RUNTIME_RE = /Runtime Error|Application error|Attempted to call|Hydration failed/i;
const DEV_STAMP_RE = /BM-[A-Z0-9-]+-V\d|data-build-version|__ai-audit/i;

/** @type {Record<string, unknown>[]} */
const findings = [];
/** @type {Record<string, unknown>[]} */
const buttonAudits = [];

let buildStamp = "";
let auditedAt = new Date().toISOString();

function addFinding(f) {
  findings.push({
    id: f.id ?? `F-${findings.length + 1}`,
    priority: f.priority,
    page: f.page,
    category: f.category,
    title: f.title,
    description: f.description,
    expected: f.expected,
    actual: f.actual,
    suggestedFix: f.suggestedFix ?? "",
    relatedFiles: f.relatedFiles ?? [],
    screenshotPath: f.screenshotPath ?? "",
    canAutoFix: f.canAutoFix ?? false,
    needsUserDecision: f.needsUserDecision ?? false,
  });
}

function addButton(row) {
  buttonAudits.push({
    page: row.page,
    buttonLabel: row.buttonLabel,
    selector: row.selector ?? row.buttonLabel,
    expectedAction: row.expectedAction,
    actualAction: row.actualAction ?? "",
    requiresAuth: row.requiresAuth ?? false,
    nonLoggedInBehavior: row.nonLoggedInBehavior ?? "",
    loggedInBehavior: row.loggedInBehavior ?? "not tested",
    result: row.result,
    priority: row.priority ?? (row.result === "FAIL" ? "P0" : row.result === "NEEDS_REVIEW" ? "P1" : "P2"),
    issueDetail: row.issueDetail ?? "",
    screenshotPath: row.screenshotPath ?? "",
  });
}

/** Visible footer text only — sr-only / aria-hidden / display:none do not count. */
async function isCustomerVisibleBuildStamp(page) {
  return page.locator("footer").evaluate((footer) => {
    const isVisibleEl = (el) => {
      if (!(el instanceof HTMLElement)) return false;
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
      if (el.classList.contains("sr-only")) return false;
      if (el.getAttribute("aria-hidden") === "true") return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const nodes = footer.querySelectorAll("*");
    for (const el of nodes) {
      if (!isVisibleEl(el)) continue;
      const text = (el.textContent ?? "").trim();
      if (/v\s*BM-[A-Z0-9-]+/i.test(text)) return text.slice(0, 80);
    }
    return isVisibleEl(footer) && /v\s*BM-[A-Z0-9-]+/i.test(footer.textContent ?? "")
      ? (footer.textContent ?? "").trim().slice(0, 80)
      : null;
  });
}

function cbUrl(path) {
  const u = new URL(path.startsWith("http") ? path : `${BASE}${path}`);
  u.searchParams.set("_cb", CACHE_BUST);
  return u.toString();
}

async function probePage(page, path, label) {
  const url = cbUrl(path);
  const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  const status = res?.status() ?? 0;
  const html = await page.content();
  const runtime = RUNTIME_RE.test(html);
  const devLeak = DEV_STAMP_RE.test(html) && /data-build-version/i.test(html);
  if (status >= 400) {
    addFinding({
      priority: "P0",
      page: label,
      category: "navigation",
      title: `HTTP ${status}`,
      description: `Page returned ${status}`,
      expected: "200 OK",
      actual: String(status),
      suggestedFix: "Fix route or deployment",
    });
  }
  if (runtime) {
    addFinding({
      priority: "P0",
      page: label,
      category: "runtime",
      title: "Runtime error on page",
      description: path,
      expected: "No runtime error",
      actual: "Runtime error detected in HTML",
      suggestedFix: "Fix client/server error",
    });
  }
  if (devLeak) {
    const m = html.match(/data-build-version="([^"]+)"/);
    if (m && !buildStamp) buildStamp = m[1];
    const stampVisible = await isCustomerVisibleBuildStamp(page);
    if (stampVisible) {
      addFinding({
        priority: "P1",
        page: label,
        category: "trust",
        title: "Build stamp visible to customer",
        description: "Footer shows v BM-* text to sighted users",
        expected: "sr-only or hidden stamp only",
        actual: stampVisible,
        suggestedFix: "Hide build stamp in customer layout",
        canAutoFix: true,
      });
    }
  }
  return { status, runtime, html };
}

async function shot(page, name) {
  const file = join(SHOTS, name);
  try {
    await page.screenshot({ path: file, fullPage: false });
    return `screenshots/full-ux-audit/${name}`;
  } catch {
    return "";
  }
}

async function testButton(page, ctx) {
  const { pageLabel, locator, expectedAction, requiresAuth } = ctx;
  try {
    const el = typeof locator === "string" ? page.locator(locator).first() : locator;
    const count = await el.count();
    if (count === 0) {
      addButton({
        page: pageLabel,
        buttonLabel: ctx.label,
        selector: String(locator),
        expectedAction,
        actualAction: "element not found",
        requiresAuth,
        result: "FAIL",
        priority: "P0",
        issueDetail: "Button/link not found",
      });
      return;
    }
    const visible = await el.isVisible().catch(() => false);
    if (!visible) {
      addButton({
        page: pageLabel,
        buttonLabel: ctx.label,
        selector: String(locator),
        expectedAction,
        actualAction: "not visible",
        requiresAuth,
        result: "NEEDS_REVIEW",
        issueDetail: "Element exists but not visible",
      });
      return;
    }
    const before = page.url();
    await el.click({ timeout: 8000 });
    await page.waitForTimeout(600);
    const after = page.url();
    const modal = await page
      .locator('[role="dialog"], [data-action="save-vehicle"], .bm-search-autocomplete')
      .first()
      .isVisible()
      .catch(() => false);
    let actual = after !== before ? `navigate ${after}` : modal ? "modal/panel opened" : "click registered";
    let result = "PASS";
    if (after === before && !modal && expectedAction.includes("navigate")) {
      result = "FAIL";
      actual = "no navigation or modal";
    }
    if (expectedAction.includes("modal") && !modal && after === before) {
      result = "FAIL";
    }
    addButton({
      page: pageLabel,
      buttonLabel: ctx.label,
      selector: String(locator),
      expectedAction,
      actualAction: actual,
      requiresAuth,
      nonLoggedInBehavior: requiresAuth ? "should show login modal or redirect" : "n/a",
      result,
      issueDetail: result !== "PASS" ? actual : "",
    });
    if (result === "FAIL") {
      addFinding({
        priority: requiresAuth ? "P0" : "P1",
        page: pageLabel,
        category: "button",
        title: `Button no response: ${ctx.label}`,
        description: String(locator),
        expected: expectedAction,
        actual,
        suggestedFix: "Wire onClick/href or show modal",
        canAutoFix: true,
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    addButton({
      page: pageLabel,
      buttonLabel: ctx.label,
      selector: String(locator),
      expectedAction,
      actualAction: msg,
      requiresAuth,
      result: "FAIL",
      priority: "P0",
      issueDetail: msg,
    });
  }
}

async function auditSearchUx(page) {
  const section = "Search UX";
  await page.goto(cbUrl("/"), { waitUntil: "domcontentloaded" });
  await page.setViewportSize({ width: 1440, height: 900 });
  const input = page.locator('input[name="q"]').first();
  await input.fill("쏘나타");
  const list = page.locator(".bm-search-autocomplete__list");
  const listVisible = await list.waitFor({ state: "visible", timeout: 12000 }).then(() => true).catch(() => false);
  if (!listVisible) {
    addFinding({
      priority: "P0",
      page: section,
      category: "search",
      title: "Autocomplete not shown for 쏘나타",
      description: "Main search autocomplete",
      expected: "Suggestion list visible",
      actual: "List not visible",
      suggestedFix: "Check searchCustomerSuggestions",
      canAutoFix: true,
    });
  } else {
    await shot(page, "04-search-sonata-autocomplete.png");
    const active = () => page.locator(".bm-search-autocomplete__row.is-active").first();
    const t0 = (await active().innerText().catch(() => "")).replace(/\s+/g, " ").trim();
    await input.press("ArrowDown");
    await page.waitForTimeout(100);
    const t1 = (await active().innerText().catch(() => "")).replace(/\s+/g, " ").trim();
    if (!t1 || t0 === t1) {
      addFinding({
        priority: "P0",
        page: section,
        category: "search",
        title: "ArrowDown does not change selection",
        description: "쏘나타 autocomplete keyboard",
        expected: "Highlight moves to next item",
        actual: `stuck on: ${t0}`,
        suggestedFix: "Fix activeIndex keyboard handler",
        canAutoFix: true,
        screenshotPath: "screenshots/full-ux-audit/04-search-sonata-autocomplete.png",
      });
    } else {
      addFinding({
        priority: "P2",
        page: section,
        category: "search",
        title: "ArrowDown changes selection",
        description: `${t0} → ${t1}`,
        expected: "Keyboard navigation works",
        actual: "OK",
        suggestedFix: "",
        canAutoFix: false,
      });
    }
    for (let i = 0; i < 3; i++) await input.press("ArrowDown");
    const listBox = await list.boundingBox();
    const rowBox = await active().boundingBox();
    if (listBox && rowBox && rowBox.y + rowBox.height > listBox.y + listBox.height + 4) {
      addFinding({
        priority: "P1",
        page: section,
        category: "search",
        title: "Active option outside list viewport",
        description: "After ArrowDown x4",
        expected: "scrollIntoView keeps item visible",
        actual: "Active row clipped",
        suggestedFix: "scrollIntoView nearest in list",
        canAutoFix: true,
      });
    }
  }

  const queries = [
    { q: "K3", check: "vehicle-first" },
    { q: "100R", check: "spec-first" },
    { q: "싼타페 TM", check: "vehicle-first" },
    { q: "AGM80R", check: "spec-first" },
  ];
  for (const { q, check } of queries) {
    await page.goto(cbUrl(`/search?q=${encodeURIComponent(q)}`), { waitUntil: "domcontentloaded" });
    const relatedTop = await page.getByRole("heading", { name: /검색과 연결된 질문/i }).count();
    const vehicles = await page.locator('[data-search-section="vehicles"]').count();
    const battery = await page.locator('[data-search-primary="battery"]').count();
    if (check === "vehicle-first" && relatedTop > 0 && vehicles > 0) {
      const relY = await page
        .getByRole("heading", { name: /검색과 연결된 질문/i })
        .first()
        .boundingBox()
        .then((b) => b?.y ?? 9999);
      const vehY = await page
        .locator('[data-search-section="vehicles"]')
        .first()
        .boundingBox()
        .then((b) => b?.y ?? 0);
      if (relY < vehY) {
        addFinding({
          priority: "P1",
          page: section,
          category: "search",
          title: "Related questions above vehicle results",
          description: q,
          expected: "Vehicle results first",
          actual: "Q&A section on top",
          suggestedFix: "catalogPrimaryIntent ordering",
          canAutoFix: true,
        });
      }
    }
    if (check === "spec-first" && relatedTop > 0 && battery > 0) {
      const relY = await page
        .getByRole("heading", { name: /검색과 연결된 질문/i })
        .first()
        .boundingBox()
        .then((b) => b?.y ?? 9999);
      const batY = await page
        .locator('[data-search-primary="battery"]')
        .first()
        .boundingBox()
        .then((b) => b?.y ?? 9999);
      if (relY < batY) {
        addFinding({
          priority: "P1",
          page: section,
          category: "search",
          title: "Related questions above battery results",
          description: q,
          expected: "Battery results first",
          actual: "Q&A on top",
          suggestedFix: "Reorder search results",
          canAutoFix: true,
        });
      }
    }
  }

  await page.goto(cbUrl("/"), { waitUntil: "domcontentloaded" });
  const chip = page.locator(".home-search-example-chip", { hasText: "싼타페 TM" });
  const chipHref = await chip.getAttribute("href").catch(() => "");
  if (chipHref?.includes("type=")) {
    addFinding({
      priority: "P1",
      page: section,
      category: "search",
      title: "Search example uses type= param",
      description: chipHref,
      expected: "/search?q= only",
      actual: chipHref,
      suggestedFix: "Remove type from example chips",
      canAutoFix: true,
    });
  }
}

async function firstVehicleSlugFromSearch(page, q) {
  await page.goto(cbUrl(`/search?q=${encodeURIComponent(q)}`), { waitUntil: "domcontentloaded" });
  const link = page.locator('a[href*="/vehicle/"]').first();
  if ((await link.count()) === 0) return null;
  const href = await link.getAttribute("href");
  const m = href?.match(/\/vehicle\/([^/?#]+)/);
  return m?.[1] ?? null;
}

async function checkHorizontalScroll(page, label) {
  const overflow = await page.evaluate(() => {
    const w = document.documentElement.scrollWidth;
    const c = document.documentElement.clientWidth;
    return w > c + 2;
  });
  if (overflow) {
    addFinding({
      priority: "P1",
      page: label,
      category: "responsive",
      title: "Horizontal scroll on viewport",
      description: label,
      expected: "No horizontal overflow",
      actual: "scrollWidth > clientWidth",
      suggestedFix: "Fix card/grid min-width",
      canAutoFix: true,
    });
  }
}

async function auditVehicleDetail(page, slug, label) {
  const path = `/vehicle/${slug}`;
  const res = await probePage(page, path, `vehicle/${label}`);
  if (res.runtime) return;
  const html = await page.content();
  if (res.status === 404) return;

  if (label === "QM5") {
    const confirm80 = (html.match(/80L|AGM80L/gi) ?? []).length;
    const fallbackHints = (html.match(/확인 필요|fallback|대체 추천/gi) ?? []).length;
    if (confirm80 >= 4 && fallbackHints >= 2) {
      addFinding({
        priority: "P1",
        page: "vehicle/QM5",
        category: "vehicle-recommendation",
        title: "QM5: possible duplicate 80L / fallback warnings",
        description: slug,
        expected: "Fuel-specific recs without redundant fallback",
        actual: `80L refs≈${confirm80}, caution refs≈${fallbackHints}`,
        suggestedFix: "Dedupe post-fuel fallback block",
        needsUserDecision: true,
      });
    }
  }
  if (label === "아반떼 MD") {
    if (/60AL|쏠라이트 60AL|솔라이트 60AL/i.test(html)) {
      addFinding({
        priority: "P0",
        page: "vehicle/아반떼 MD",
        category: "vehicle-recommendation",
        title: "Avante MD: suspicious 60AL / Solite card",
        description: slug,
        expected: "Hybrid-appropriate SKUs only",
        actual: "60AL or non-catalog label in HTML",
        suggestedFix: "Filter hybrid recommendation candidates",
        needsUserDecision: true,
      });
    }
  }
  if (label === "그랜저 IG") {
    if (!/가솔린|디젤|AGM80L|용량 업그레이드/i.test(html)) {
      addFinding({
        priority: "P1",
        page: "vehicle/그랜저 IG",
        category: "vehicle-recommendation",
        title: "Grandeur IG: upgrade/fuel copy may be missing",
        description: slug,
        expected: "Clear gasoline/diesel upgrade guidance",
        actual: "Expected keywords not found",
        suggestedFix: "Verify upgrade copy for IG gasoline",
        needsUserDecision: true,
      });
    }
  }

  const yellowCount = (html.match(/확인 필요|상담 필요|amber-50|bg-amber/gi) ?? []).length;
  if (yellowCount > 12) {
    addFinding({
      priority: "P1",
      page: `vehicle/${label}`,
      category: "vehicle-recommendation",
      title: "Many caution/warning blocks",
      description: slug,
      expected: "Focused recommendations",
      actual: `${yellowCount} caution-related matches in HTML`,
      suggestedFix: "Dedupe fallback recommendations",
      needsUserDecision: true,
    });
  }
  const saveBtn = page.locator('[data-action="save-vehicle"]');
  if ((await saveBtn.count()) > 0) {
    await saveBtn.first().click();
    const guestModal = await page.getByText(/회원가입 후 이용 가능합니다/).isVisible().catch(() => false);
    addButton({
      page: `vehicle/${label}`,
      buttonLabel: "내 차량으로 정보등록",
      selector: '[data-action="save-vehicle"]',
      expectedAction: "guest modal or save",
      actualAction: guestModal ? "guest modal shown" : "unknown",
      requiresAuth: true,
      nonLoggedInBehavior: guestModal ? "modal OK" : "no modal",
      result: guestModal ? "PASS" : "NEEDS_REVIEW",
    });
    await page.keyboard.press("Escape").catch(() => {});
  }
}

async function main() {
  mkdirSync(SHOTS, { recursive: true });
  console.log(`Full customer UX audit — ${BASE} (cb=${CACHE_BUST})`);

  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const pageD = await desktop.newPage();
  const pageM = await mobile.newPage();

  const pages = [
    { path: "/", label: "home", shotD: "01-home-desktop.png", shotM: "02-home-mobile.png" },
    { path: "/search?q=K3", label: "search-k3", shotD: "03-search-k3.png" },
    { path: "/batteries/AGM60L", label: "battery-agm60l", shotD: "06-battery-detail.png" },
    { path: "/cart", label: "cart", shotD: "07-cart.png" },
    { path: "/order-request", label: "order-request", shotD: "08-order-request.png" },
    { path: "/signup", label: "signup", shotD: "09-signup.png" },
    { path: "/mypage", label: "mypage", shotD: "10-mypage.png" },
    { path: "/guides", label: "battery-guide", shotD: "11-battery-guide.png" },
    { path: "/support", label: "customer-center", shotD: "12-customer-center.png" },
    { path: "/brands", label: "brand-guide", shotD: "13-brand-guide.png" },
    { path: "/service-center", label: "service-center", shotD: "14-service-center.png" },
    { path: "/reviews", label: "reviews", shotD: "15-reviews.png" },
    { path: "/benefits", label: "benefits", shotD: "16-benefits.png" },
    { path: "/battery-upgrade/grandeur-ig", label: "upgrade", shotD: "17-upgrade.png" },
    { path: "/login", label: "login" },
    { path: "/batteries/AGM80L", label: "battery-agm80l" },
    { path: "/batteries/AGM80R", label: "battery-agm80r" },
    { path: "/batteries/100R", label: "battery-100r" },
    { path: "/batteries/DIN74L", label: "battery-din74l" },
  ];

  await probePage(pageD, "/", "home");
  const stampMatch = (await pageD.content()).match(/data-build-version="([^"]+)"/);
  if (stampMatch) buildStamp = stampMatch[1];

  for (const p of pages) {
    await probePage(pageD, p.path, p.label);
    if (p.shotD) await shot(pageD, p.shotD);
  }

  await probePage(pageM, "/", "home-mobile");
  await shot(pageM, "02-home-mobile.png");

  await auditSearchUx(pageD);

  let vehicleHref = "";
  await pageD.goto(cbUrl("/search?q=QM5"), { waitUntil: "domcontentloaded" });
  const qm5Link = pageD.locator('a[href*="/vehicle/"]').first();
  if ((await qm5Link.count()) > 0) vehicleHref = (await qm5Link.getAttribute("href")) ?? "";

  let vehicles = [
    { slug: "kia-k3-2018", label: "K3" },
    { slug: "renault-samsung-qm5-2007", label: "QM5" },
    { slug: "genesis-gv80", label: "GV80" },
    { slug: "grandeur-ig", label: "그랜저 IG" },
    { slug: "staria-us4", label: "스타리아" },
    { slug: "porter2-new", label: "포터2" },
    { slug: "avante-md", label: "아반떼 MD" },
  ];
  const santafeSlug = await firstVehicleSlugFromSearch(pageD, "싼타페 TM");
  if (santafeSlug) {
    vehicles.push({ slug: santafeSlug, label: "싼타페 TM" });
  }
  const sonataSlug = await firstVehicleSlugFromSearch(pageD, "쏘나타");
  if (sonataSlug) {
    vehicles.push({ slug: sonataSlug, label: "쏘나타" });
  }

  for (const v of vehicles) {
    await auditVehicleDetail(pageD, v.slug, v.label);
  }
  await pageD.goto(cbUrl("/vehicle/renault-samsung-qm5-2007"), { waitUntil: "domcontentloaded" });
  await shot(pageD, "05-vehicle-detail.png");

  await pageD.goto(cbUrl("/"), { waitUntil: "domcontentloaded" });
  const homeLinks = [
    { label: "혜택", pattern: /혜택|benefits/i, href: /benefits/ },
    { label: "리뷰", pattern: /리뷰|후기/i, href: /reviews/ },
    { label: "브랜드", pattern: /브랜드/i, href: /brands/ },
    { label: "매장", pattern: /매장|출장|service-center/i, href: /service-center/ },
  ];
  for (const l of homeLinks) {
    const link = pageD.getByRole("link", { name: l.pattern }).first();
    if ((await link.count()) === 0) continue;
    await testButton(pageD, {
      pageLabel: "home",
      label: l.label,
      locator: link,
      expectedAction: `navigate ${l.href}`,
    });
  }

  await pageD.goto(cbUrl("/batteries/AGM60L"), { waitUntil: "domcontentloaded" });
  await testButton(pageD, {
    pageLabel: "battery/AGM60L",
    label: "장바구니 담기",
    locator: pageD.getByRole("button", { name: /장바구니|담기/i }),
    expectedAction: "modal or cart feedback",
  });

  await pageD.goto(cbUrl("/service-center"), { waitUntil: "domcontentloaded" });
  const naver = pageD.getByRole("link", { name: /네이버 플레이스/i });
  addButton({
    page: "service-center",
    buttonLabel: "네이버 플레이스",
    selector: "link 네이버 플레이스",
    expectedAction: "external navigate",
    actualAction: (await naver.count()) >= 2 ? `${await naver.count()} links` : "missing",
    result: (await naver.count()) >= 2 ? "PASS" : "FAIL",
    priority: (await naver.count()) >= 2 ? "P2" : "P0",
  });

  if (!skipCart) {
    await pageD.goto(cbUrl("/batteries/AGM60L"), { waitUntil: "domcontentloaded" });
    const addBtn = pageD.getByRole("button", { name: /장바구니|담기/i }).first();
    if ((await addBtn.count()) > 0) {
      await addBtn.click();
      const popup = await pageD
        .locator('[role="dialog"], [data-cart-added]')
        .first()
        .isVisible()
        .catch(() => false);
      addButton({
        page: "battery/AGM60L",
        buttonLabel: "장바구니 담기 (popup)",
        selector: "button cart",
        expectedAction: "cart popup or toast",
        actualAction: popup ? "dialog/feedback visible" : "no visible feedback",
        result: popup ? "PASS" : "NEEDS_REVIEW",
      });
      if (!popup) {
        addFinding({
          priority: "P1",
          page: "cart-flow",
          category: "cart",
          title: "Add to cart feedback unclear",
          description: "AGM60L",
          expected: "Cart modal or toast",
          actual: "No dialog detected",
          suggestedFix: "Show cart-added modal",
          canAutoFix: true,
        });
      }
    }
    await pageD.goto(cbUrl("/cart"), { waitUntil: "domcontentloaded" });
    const orderLink = pageD.locator('a[href*="order-request"]').first();
    addButton({
      page: "cart",
      buttonLabel: "주문하기",
      selector: 'a[href*="order-request"]',
      expectedAction: "navigate order-request",
      actualAction:
        (await orderLink.count()) > 0 ? "link present" : "direct /order-request only",
      result: (await orderLink.count()) > 0 ? "PASS" : "NEEDS_REVIEW",
    });
    await probePage(pageD, "/order-request", "order-request");
    await probePage(pageD, "/checkout", "checkout-order");
    const guidance = await pageD
      .locator("[data-order-request-vehicle-guidance]")
      .first()
      .isVisible()
      .catch(() => false);
    if (!guidance) {
      addFinding({
        priority: "P2",
        page: "checkout",
        category: "cart",
        title: "Vehicle/tooling guidance not on checkout",
        description: "/checkout",
        expected: "차량정보·공구 안내 카드",
        actual: "data-order-request-vehicle-guidance not visible",
        suggestedFix: "OrderRequestVehicleGuidance on checkout",
      });
    }
  }

  await pageD.goto(cbUrl("/login"), { waitUntil: "domcontentloaded" });
  await testButton(pageD, {
    pageLabel: "login",
    label: "회원가입",
    locator: pageD.getByRole("link", { name: /회원가입/i }).first(),
    expectedAction: "navigate /signup",
  });

  await pageD.goto(cbUrl("/mypage"), { waitUntil: "domcontentloaded" });
  const myLogin = pageD.getByRole("link", { name: /로그인/i });
  addButton({
    page: "mypage",
    buttonLabel: "마이페이지 (guest)",
    selector: "mypage guest CTA",
    expectedAction: "login prompt or redirect",
    actualAction: (await myLogin.count()) > 0 ? "login link shown" : "page loads without clear CTA",
    requiresAuth: true,
    result: (await myLogin.count()) > 0 ? "PASS" : "NEEDS_REVIEW",
  });

  await pageD.goto(cbUrl("/"), { waitUntil: "domcontentloaded" });
  // Home phone CTA intentionally omitted — store/service-center only (not a defect).
  await pageD.goto(cbUrl("/support"), { waitUntil: "domcontentloaded" });
  const supportCards = await pageD.locator("a, button").count();
  if (supportCards > 80) {
    addFinding({
      priority: "P2",
      page: "customer-center",
      category: "information-architecture",
      title: "Customer center has many interactive elements",
      description: "/support",
      expected: "Grouped navigation",
      actual: `${supportCards} links/buttons in DOM`,
      suggestedFix: "Consider collapsing secondary cards",
    });
  }

  for (const [path, label] of [
    ["/cart", "cart-mobile"],
    ["/reviews", "reviews-mobile"],
    ["/support", "support-mobile"],
  ]) {
    await pageM.goto(cbUrl(path), { waitUntil: "domcontentloaded" });
    await checkHorizontalScroll(pageM, label);
  }
  await pageM.goto(cbUrl("/"), { waitUntil: "domcontentloaded" });
  await checkHorizontalScroll(pageM, "home-mobile");

  await pageM.goto(cbUrl("/guides"), { waitUntil: "domcontentloaded" });
  const catBtn = pageM.locator(".battery-guide-hub button").first();
  if ((await catBtn.count()) > 0) {
    await catBtn.click();
    const active = await pageM.locator(".battery-guide-hub button[aria-pressed='true']").count();
    addFinding({
      priority: active > 0 ? "P2" : "P1",
      page: "battery-guide",
      category: "information-architecture",
      title: active > 0 ? "Guide category selection visible" : "Guide selection state unclear",
      description: "/guides mobile",
      expected: "Selected category styled",
      actual: active > 0 ? "aria-pressed true" : "no pressed state",
      canAutoFix: !active,
    });
  }

  const p0 = findings.filter((f) => f.priority === "P0").length;
  const p1 = findings.filter((f) => f.priority === "P1").length;
  const p2 = findings.filter((f) => f.priority === "P2").length;
  const btnFail = buttonAudits.filter((b) => b.result === "FAIL").length;

  const report = {
    generatedAt: auditedAt,
    baseUrl: BASE,
    cacheBust: CACHE_BUST,
    buildStamp,
    summary: {
      findingsTotal: findings.length,
      p0: p0,
      p1: p1,
      p2: p2,
      buttonAuditsTotal: buttonAudits.length,
      buttonFail: btnFail,
      buttonPass: buttonAudits.filter((b) => b.result === "PASS").length,
      searchUxIssues: findings.filter((f) => f.category === "search").length,
      vehicleRecommendationIssues: findings.filter((f) => f.category === "vehicle-recommendation").length,
      informationArchitectureIssues: findings.filter((f) => f.category === "information-architecture").length,
      responsiveIssues: findings.filter((f) => f.category === "responsive").length,
      trustIssues: findings.filter((f) => f.category === "trust").length,
      deadButtons: btnFail,
    },
    pagesAudited: pages.map((p) => p.path),
    vehicleSlugs: vehicles.map((v) => v.slug),
    findings,
    buttonAudits,
    sections: {
      searchUx: findings.filter((f) => f.category === "search"),
      vehicleDetailRecommendation: findings.filter((f) => f.category === "vehicle-recommendation"),
      cartOrder: findings.filter((f) => f.category === "cart"),
      authMyPage: findings.filter((f) => f.category === "auth"),
      informationArchitecture: findings.filter((f) => f.category === "information-architecture"),
      responsive: findings.filter((f) => f.category === "responsive"),
      trust: findings.filter((f) => f.category === "trust"),
    },
    note: "Read-only audit. No code/deploy changes. Re-run after fixes: npm run audit:full-ux",
  };

  writeFileSync(join(REPORTS, "full-customer-ux-audit.json"), JSON.stringify(report, null, 2));
  writeFileSync(join(REPORTS, "full-customer-ux-audit.md"), renderMd(report));

  await browser.close();

  console.log(`Wrote reports/full-customer-ux-audit.{json,md}`);
  console.log(`Screenshots: screenshots/full-ux-audit/ (${existsSync(SHOTS) ? "ok" : "missing"})`);
  console.log(`Summary: P0=${p0} P1=${p1} P2=${p2} buttonFail=${btnFail} stamp=${buildStamp}`);
}

function renderMd(report) {
  const top10 = [...report.findings]
    .sort((a, b) => (a.priority === "P0" ? 0 : a.priority === "P1" ? 1 : 2) - (b.priority === "P0" ? 0 : b.priority === "P1" ? 1 : 2))
    .slice(0, 10);

  const table = (rows, cols) => {
    const head = `| ${cols.join(" | ")} |\n| ${cols.map(() => "---").join(" | ")} |`;
    const body = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
    return `${head}\n${body}`;
  };

  const p0rows = report.findings
    .filter((f) => f.priority === "P0")
    .map((f) => [f.page, f.title, f.actual, f.suggestedFix, f.screenshotPath || "—"]);
  const p1rows = report.findings
    .filter((f) => f.priority === "P1")
    .map((f) => [f.page, f.title, f.actual, f.suggestedFix, f.screenshotPath || "—"]);

  return `# Full Customer UX Audit

Generated: ${report.generatedAt}  
Base URL: ${report.baseUrl}  
Cache bust: \`${report.cacheBust}\`  
Production build stamp (DOM): \`${report.buildStamp || "not detected"}\`

## 1. Executive Summary

| Metric | Count |
|--------|------:|
| Total findings | ${report.summary.findingsTotal} |
| P0 | ${report.summary.p0} |
| P1 | ${report.summary.p1} |
| P2 | ${report.summary.p2} |
| Button audits | ${report.summary.buttonAuditsTotal} |
| Button FAIL | ${report.summary.buttonFail} |
| Search UX issues | ${report.summary.searchUxIssues} |
| Vehicle recommendation issues | ${report.summary.vehicleRecommendationIssues} |
| Information architecture issues | ${report.summary.informationArchitectureIssues} |

### Top 10 risks

${top10.map((f, i) => `${i + 1}. **${f.priority}** [${f.page}] ${f.title} — ${f.description}`).join("\n")}

### Suggested next fix batches

- **Batch 1:** P0 buttons / dead flows / runtime errors
- **Batch 2:** Search autocomplete + result ordering
- **Batch 3:** Vehicle detail recommendation contradictions (QM5, MD, IG)
- **Batch 4:** Information page structure (guides, support, reviews)
- **Batch 5:** Mobile layout + trust copy (footer stamp, caution density)

## 2. P0 Issues

${p0rows.length ? table(p0rows, ["Page", "Issue", "Actual", "Suggested fix", "Screenshot"]) : "_None detected in this run._"}

## 3. P1 Issues

${p1rows.length ? table(p1rows, ["Page", "Issue", "Actual", "Suggested fix", "Screenshot"]) : "_None detected in this run._"}

## 4. P2 Improvements

${report.findings.filter((f) => f.priority === "P2").map((f) => `- **${f.page}:** ${f.title}`).join("\n") || "_None._"}

## 5. Button Action Audit

${table(
  report.buttonAudits.slice(0, 40).map((b) => [
    b.page,
    b.buttonLabel,
    b.result,
    b.priority,
    b.actualAction.slice(0, 80),
  ]),
  ["Page", "Label", "Result", "Priority", "Actual"],
)}

${report.buttonAudits.length > 40 ? `\n_…and ${report.buttonAudits.length - 40} more in JSON._\n` : ""}

## 6. Search UX Findings

${sectionList(report.sections.searchUx)}

## 7. Vehicle Detail Recommendation Findings

${sectionList(report.sections.vehicleDetailRecommendation)}

## 8. Cart & Order Flow Findings

${sectionList(report.sections.cartOrder)}

## 9. Auth & MyPage Findings

${sectionList(report.sections.authMyPage)}

## 10. Information Architecture Findings

${sectionList(report.sections.informationArchitecture)}

## 11. Responsive Findings

${sectionList(report.sections.responsive)}

## 12. Trust & Reliability Findings

${sectionList(report.sections.trust)}

## 13. Audit scope

Pages: ${report.pagesAudited.join(", ")}

Vehicles: ${report.vehicleSlugs.join(", ")}

Screenshots: \`screenshots/full-ux-audit/\`

---

_Audit only — no UI/DB/deploy changes were made in this run._
`;
}

function sectionList(items) {
  if (!items?.length) return "_No issues in this category for this run._\n";
  return items.map((f) => `- **${f.priority}** [${f.page}] ${f.title}: ${f.actual}`).join("\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
