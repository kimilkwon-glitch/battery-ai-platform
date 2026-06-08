/**
 * Production alias v0.1 검수 — QA API + 선택적 Playwright
 * node tools/verify-alias-v01-production.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.ALIAS_VERIFY_BASE ?? "https://www.batterymanager.co.kr";
const CB = process.env.ALIAS_VERIFY_CB ?? "alias-v01-20260530";

const QUERIES = [
  "K3",
  "케이쓰리",
  "K3쿱",
  "K3 쿠페",
  "K3 유로",
  "올뉴 K3",
  "더뉴 K3",
  "21년식 싼타페",
  "더 뉴 싼타페 21년식",
  "싼타페 더프라임",
  "산타페 더프라임",
  "쏘나타 뉴라이즈",
  "소나타 뉴라이즈",
  "DN8 소나타",
  "그랜져 IG",
  "그랜저 IG",
  "쏘렌토 MQ4",
  "쏘렌토 하브",
  "쏘렌토 HEV",
  "스타리아",
  "스타리아 LPG",
  "스타리아 디젤",
  "포터2",
  "포터2 2020년식",
  "포터 전기",
  "봉고 전기",
  "렉스턴칸",
  "렉스턴 스포츠칸",
  "코란도C",
  "뷰티풀 코란도",
  "XM3",
  "아르카나",
  "QM6 LPG",
  "GV60",
  "GV70",
  "GV80",
];

async function fetchQa(q) {
  const url = `${BASE}/api/qa/search-quality?q=${encodeURIComponent(q)}&_cb=${CB}`;
  const res = await fetch(url, { cache: "no-store" });
  return res.json();
}

async function browserCheck(page, q) {
  await page.goto(`${BASE}/?_cb=${CB}`, { waitUntil: "domcontentloaded", timeout: 45000 });
  const input = page.locator('input[name="q"]').first();
  await input.fill(q);
  await input.press("Enter");
  try {
    await page.waitForURL(/\/search/, { timeout: 20000 });
  } catch {
    /* */
  }
  await page.waitForTimeout(600);
  const snap = await page.evaluate(() => {
    const root = document.querySelector("[data-search-results-root]") || document.body;
    const stamp = document.documentElement.getAttribute("data-build-version");
    const links = [...root.querySelectorAll('a[href*="/vehicle/"]')].map((a) => ({
      href: a.href,
      text: (a.textContent || "").trim().slice(0, 60),
    }));
    const img = root.querySelector('img[src*="cars/"], img[src*="vehicle"]');
    return {
      stamp,
      h1: document.querySelector("#search-summary h1, h1")?.textContent?.slice(0, 80) ?? "",
      recognition: root.innerText.match(/검색 결과:.*안내/)?.[0] ?? "",
      vehicleLinks: links.slice(0, 5),
      hasImage: Boolean(img),
      forbidden: /준비중|샘플|mock|fixture|alias\s*DB/i.test(root.innerText),
    };
  });
  return snap;
}

async function main() {
  const results = [];
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  for (const q of QUERIES) {
    process.stdout.write(`${q} ... `);
    const api = await fetchQa(q);
    const ui = await browserCheck(page, q);
    const ok =
      api.recognized &&
      (api.vehicleResults.length > 0 || api.generationCards.length > 0 || api.primaryResult?.title) &&
      !ui.forbidden;
    results.push({
      query: q,
      ok,
      recognized: api.recognized,
      successType: api.successType,
      summary: api.summary?.slice(0, 100),
      vehicles: api.vehicleResults?.length ?? 0,
      primaryCode: api.primaryResult?.batteryCodes?.[0] ?? "",
      buildStamp: ui.stamp,
      recognitionNote: ui.recognition,
      firstVehicle: ui.vehicleLinks[0],
      hasImage: ui.hasImage,
    });
    console.log(ok ? "ok" : "weak");
  }

  await browser.close();

  const outDir = path.join(__dirname, "search-quality", "reports");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "alias-v01-production-verify.json");
  fs.writeFileSync(
    outPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, cb: CB, results }, null, 2),
  );

  const weak = results.filter((r) => !r.ok);
  console.log(`\n${results.length}건 | weak ${weak.length}건`);
  console.log(`보고서: ${outPath}`);
  if (weak.length) {
    console.log("weak:", weak.map((r) => r.query).join(", "));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
