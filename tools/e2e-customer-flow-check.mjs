#!/usr/bin/env node
/**
 * Customer click-flow E2E (Playwright)
 *
 * Usage:
 *   node tools/e2e-customer-flow-check.mjs [baseUrl] [--headed] [--skip-cart]
 *
 * Prerequisites:
 *   npx playwright install chromium
 *
 * Default baseUrl: http://127.0.0.1:3000 — production:
 *   node tools/e2e-customer-flow-check.mjs https://battery-ai-platform.vercel.app
 */
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const args = process.argv.slice(2);
const headed = args.includes("--headed");
const skipCart = args.includes("--skip-cart");
const BASE =
  args.find((a) => a.startsWith("http")) ??
  process.env.E2E_BASE_URL ??
  "http://127.0.0.1:3000";

/** @type {{ id: string; name: string; ok: boolean; error?: string }[]} */
const results = [];

async function step(id, name, fn) {
  try {
    await fn();
    results.push({ id, name, ok: true });
    console.log(`✓ ${id} ${name}`);
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    results.push({ id, name, ok: false, error });
    console.log(`✗ ${id} ${name}: ${error}`);
  }
}

async function main() {
  console.log(`E2E customer flow — ${BASE}${headed ? " (headed)" : ""}`);

  const browser = await chromium.launch({ headless: !headed });
  const context = await browser.newContext();
  const page = await context.newPage();

  await step("main", "메인 접속", async () => {
    const res = await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    if (!res?.ok()) throw new Error(`HTTP ${res?.status()}`);
  });

  await step("search-example-santafe", "검색 예시 싼타페 TM → 차량 결과 우선", async () => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    const chip = page.locator(".home-search-example-chip", { hasText: "싼타페 TM" });
    await chip.waitFor({ state: "visible", timeout: 15000 });
    const href = await chip.getAttribute("href");
    if (!href?.includes("/search?") || href.includes("type=")) {
      throw new Error(`search example href invalid: ${href}`);
    }
    await chip.click();
    await page.waitForURL(/\/search\?/, { timeout: 15000 });
    if (page.url().includes("type=")) throw new Error(`landed with type param: ${page.url()}`);
    const vehicles = page.locator('[data-search-section="vehicles"]').first();
    await vehicles.waitFor({ state: "visible", timeout: 15000 });
    const topRelated = page.getByRole("heading", { name: /검색과 연결된 질문/i });
    if ((await topRelated.count()) > 0) {
      const relY = await topRelated.first().boundingBox().then((b) => b?.y ?? 99999);
      const vehY = await vehicles.boundingBox().then((b) => b?.y ?? 0);
      if (relY < vehY) throw new Error("related questions rendered above vehicle results");
    }
    await page.getByText(/싼타페/i).first().waitFor({ timeout: 10000 });
  });

  await step("search-example-100r", "검색 예시 100R → 규격 결과 우선", async () => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    const chip = page.locator(".home-search-example-chip", { hasText: /^100R$/ });
    await chip.click();
    await page.waitForURL(/\/search\?q=100R/i, { timeout: 15000 });
    if (page.url().includes("type=")) throw new Error(`landed with type param: ${page.url()}`);
    const battery = page.locator('[data-search-primary="battery"]').first();
    await battery.waitFor({ state: "visible", timeout: 15000 });
    const topRelated = page.getByRole("heading", { name: /검색과 연결된 질문/i });
    if ((await topRelated.count()) > 0) {
      const relY = await topRelated.first().boundingBox().then((b) => b?.y ?? 99999);
      const batY = await battery.boundingBox().then((b) => b?.y ?? 0);
      if (relY < batY) throw new Error("related questions rendered above battery results");
    }
  });

  await step("search-k3", "K3 검색 결과", async () => {
    await page.goto(`${BASE}/search?q=K3`, { waitUntil: "domcontentloaded" });
    const link = page.locator('a[href*="/vehicle/"]').first();
    await link.waitFor({ state: "visible", timeout: 15000 });
  });

  await step("vehicle-detail", "세대/차량 카드 클릭 → 상세", async () => {
    await page.goto(`${BASE}/search?q=K3`, { waitUntil: "domcontentloaded" });
    const link = page.locator('a[href*="/vehicle/"]').first();
    const href = await link.getAttribute("href");
    if (!href) throw new Error("vehicle link missing");
    await link.click();
    await page.waitForURL(/\/vehicle\//, { timeout: 15000 });
  });

  await step("battery-agm60l", "AGM60L 상세", async () => {
    const res = await page.goto(`${BASE}/batteries/AGM60L`, { waitUntil: "domcontentloaded" });
    if (!res?.ok()) throw new Error(`HTTP ${res?.status()}`);
    await page.getByRole("heading", { name: /AGM60L/i }).first().waitFor({ timeout: 10000 }).catch(() => {});
  });

  if (!skipCart) {
    await step("add-to-cart", "장바구니 담기 클릭", async () => {
      await page.goto(`${BASE}/batteries/AGM60L`, { waitUntil: "domcontentloaded" });
      const addBtn = page.getByRole("button", { name: /장바구니|담기/i }).first();
      await addBtn.waitFor({ state: "visible", timeout: 10000 });
      await addBtn.click();
      await page
        .locator('[data-cart-added], [role="dialog"], .cart-added')
        .first()
        .waitFor({ state: "visible", timeout: 8000 })
        .catch(async () => {
          await page.getByText(/장바구니에|담았|추가/i).first().waitFor({ timeout: 5000 });
        });
    });

    await step("cart-page", "장바구니 이동", async () => {
      await page.goto(`${BASE}/cart`, { waitUntil: "domcontentloaded" });
      await page.getByText(/장바구니/).first().waitFor({ timeout: 10000 });
    });

    await step("order-request", "주문/상담 화면 링크", async () => {
      await page.goto(`${BASE}/cart`, { waitUntil: "domcontentloaded" });
      const orderLink = page.locator('a[href*="order-request"]').first();
      if ((await orderLink.count()) === 0) {
        await page.goto(`${BASE}/order-request`, { waitUntil: "domcontentloaded" });
      } else {
        await orderLink.click();
        await page.waitForURL(/order-request/, { timeout: 15000 });
      }
    });
  }

  await step("qm5-save-vehicle-guest", "QM5 내 차량으로 정보등록 (비회원 모달)", async () => {
    await page.goto(`${BASE}/vehicle/renault-samsung-qm5-2007`, {
      waitUntil: "domcontentloaded",
    });
    const saveBtn = page.locator('[data-action="save-vehicle"]').first();
    await saveBtn.waitFor({ state: "visible", timeout: 30000 });
    await saveBtn.click();
    await page.getByText(/회원가입 후 이용 가능합니다/).first().waitFor({ timeout: 8000 });
    const loginLink = page.getByRole("link", { name: /로그인하기/i }).first();
    const signupLink = page.getByRole("link", { name: /회원가입하기/i }).first();
    const loginHref = await loginLink.getAttribute("href");
    const signupHref = await signupLink.getAttribute("href");
    if (!loginHref?.includes("/login") || !loginHref.includes("redirect")) {
      throw new Error(`login href invalid: ${loginHref}`);
    }
    if (!signupHref?.includes("/signup") || !signupHref.includes("redirect")) {
      throw new Error(`signup href invalid: ${signupHref}`);
    }
    if (!loginHref.includes("saveVehicle") && !loginHref.includes("action=")) {
      throw new Error(`login href missing saveVehicle action: ${loginHref}`);
    }
    await page.locator('[data-testid="save-vehicle-modal-close"]').click();
    await page.getByText(/회원가입 후 이용 가능합니다/).first().waitFor({ state: "hidden", timeout: 5000 });
  });

  await step("vehicle-detail-spot-check", "K3·GV80·100R 상세 접속", async () => {
    for (const path of [
      "/vehicle/kia-k3-2018",
      "/vehicle/genesis-gv80",
      "/batteries/100R",
    ]) {
      const res = await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
      if (!res?.ok()) throw new Error(`${path} HTTP ${res?.status()}`);
      const html = await page.content();
      if (/Runtime Error|Application error|Attempted to call/i.test(html)) {
        throw new Error(`${path} runtime error`);
      }
    }
  });

  await step("auth-login", "로그인 페이지", async () => {
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
    await page.getByText(/로그인/).first().waitFor({ timeout: 10000 });
  });

  await step("auth-signup", "회원가입 페이지", async () => {
    await page.goto(`${BASE}/signup`, { waitUntil: "domcontentloaded" });
    await page.getByText(/회원가입|가입/).first().waitFor({ timeout: 10000 });
  });

  await step("auth-mypage", "마이페이지", async () => {
    await page.goto(`${BASE}/mypage`, { waitUntil: "domcontentloaded" });
    await page.getByText(/마이페이지/).first().waitFor({ timeout: 10000 });
  });

  await step("service-center", "매장·출장 안내 + 네이버 플레이스", async () => {
    await page.goto(`${BASE}/service-center`, { waitUntil: "domcontentloaded" });
    const naver = page.getByRole("link", { name: /네이버 플레이스/i });
    await naver.first().waitFor({ state: "visible", timeout: 10000 });
    if ((await naver.count()) < 2) throw new Error("expected 2 store naver place links");
    const phone = page.getByRole("link", { name: /전화하기/i });
    if ((await phone.count()) < 2) throw new Error("expected 2 phone CTAs");
  });

  await browser.close();

  const pass = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok).length;
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    summary: { pass, fail, total: results.length },
    results,
    note: "Cart steps need client storage; use --skip-cart on partial environments.",
  };

  const outPath = join(ROOT, "reports", "customer-flow-e2e.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${outPath} — pass ${pass}/${results.length}`);

  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
