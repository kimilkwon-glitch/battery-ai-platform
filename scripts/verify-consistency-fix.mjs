#!/usr/bin/env node
/**
 * P0 2차 — 단일 기준 체인 검증
 * Usage: node scripts/verify-consistency-fix.mjs [baseUrl]
 */
import { spawnSync } from "child_process";

const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";

async function fetchHtml(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "BM-Chain-Verify/2.0", "Cache-Control": "no-cache" },
  });
  return res.text();
}

function extractSearchFocusCode(html) {
  return (
    html.match(/<h3[^>]*>\s*([A-Z0-9]+)\s*<span[^>]*>배터리<\/span>/i)?.[1] ??
    html.match(/text-2xl font-black[^>]*>\s*([A-Z0-9]+)\s*<span/i)?.[1] ??
    null
  );
}

function extractFooterBattery(html) {
  return html.match(/data-primary-battery="([^"]+)"/)?.[1] ?? null;
}

function extractFuelHeroCode(html, fuelLabel) {
  const re = new RegExp(
    `>${fuelLabel}</[^>]+>[\\s\\S]{0,500}?text-lg font-black[^>]*>([A-Z0-9]+)<`,
    "i",
  );
  return html.match(re)?.[1] ?? null;
}

function extractAllTableRecommendations(html, fuelLabel) {
  const codes = [];
  for (const row of html.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/gi)) {
    if (!row[0].includes(fuelLabel)) continue;
    const cell = row[0].match(/font-black text-\[var\(--bm-primary\)\][^>]*>([^<]+)</)?.[1]?.trim();
    if (cell && /AGM|DIN|CMF|EV|80L|70L|100R|90R/.test(cell)) codes.push(cell);
  }
  return codes;
}

function extractBatteryPageTitle(html) {
  const h1 = html.match(/<h1[^>]*>\s*([^<]+?)\s*<\/h1>/i)?.[1]?.trim();
  return h1 ?? null;
}

function extractHrefCodes(html, pattern) {
  return [...html.matchAll(pattern)].map((m) => m[1]);
}

function assertUnified(codes, expected, label) {
  const uniq = [...new Set(codes.filter(Boolean))];
  const ok = uniq.length === 1 && uniq[0] === expected;
  return { ok, label, expected, actual: uniq, codes };
}

async function verifyGrandeurChain() {
  const searchPath = "/search?q=" + encodeURIComponent("그랜저 IG 가솔린");
  const vehiclePath = "/vehicle/grandeur-ig?fuel=" + encodeURIComponent("가솔린");
  const expected = "AGM70L";

  const searchHtml = await fetchHtml(searchPath);
  const vehicleHtml = await fetchHtml(vehiclePath);
  const searchCode = extractSearchFocusCode(searchHtml);
  const footer = extractFooterBattery(vehicleHtml);
  const hero = extractFuelHeroCode(vehicleHtml, "가솔린");
  const tableCodes = extractAllTableRecommendations(vehicleHtml, "가솔린");
  const batteryHtml = await fetchHtml("/batteries/" + encodeURIComponent(expected));

  const chain = {
    searchCard: searchCode,
    vehicleHero: hero,
    footer,
    table: tableCodes,
    batteryTitle: extractBatteryPageTitle(batteryHtml),
  };

  const points = [
    assertUnified([searchCode], expected, "search-card"),
    assertUnified([hero], expected, "vehicle-hero"),
    assertUnified([footer], expected, "data-primary-battery"),
    assertUnified(tableCodes.length ? tableCodes : [hero], expected, "detail-table"),
    assertUnified([chain.batteryTitle], expected, "battery-detail-h1"),
  ];

  const bad =
    vehicleHtml.includes('data-primary-battery="AGM80L"') ||
    vehicleHtml.includes("AGM80L 규격 상세") ||
    searchHtml.includes('data-primary-battery="AGM80L"');

  return {
    name: "grandeur-ig-gasoline-chain",
    ok: !bad && points.every((p) => p.ok),
    expected,
    chain,
    points,
    bad,
  };
}

async function verifyCmf80lChain() {
  const expected = "CMF80L";
  const paths = [
    "/search?q=CMF80L",
    "/search?q=" + encodeURIComponent("단자 방향 CMF80L"),
    "/search?q=" + encodeURIComponent("스타리아 디젤 CMF80L"),
    "/batteries/CMF80L",
  ];
  const results = {};
  for (const p of paths) {
    const html = await fetchHtml(p);
    results[p] = {
      focus: extractSearchFocusCode(html),
      h1: extractBatteryPageTitle(html),
      badHref80L: html.includes('href="/batteries/80L"') || html.includes(">/batteries/80L<"),
      badTitle80L: /<h1[^>]*>\s*80L\s*<\/h1>/i.test(html),
      hasCMF80L: html.includes("CMF80L"),
    };
  }

  const searchFocus = results["/search?q=CMF80L"]?.focus;
  const detailH1 = results["/batteries/CMF80L"]?.h1;
  const hrefs = extractHrefCodes(
    await fetchHtml("/search?q=CMF80L"),
    /href="\/batteries\/([^"]+)"/g,
  );
  const batteryHrefs = hrefs.filter((h) => /CMF|80L/i.test(h));

  const ok =
    searchFocus === expected &&
    detailH1 === expected &&
    !results["/batteries/CMF80L"]?.badTitle80L &&
    !results["/batteries/CMF80L"]?.badHref80L &&
    results["/search?q=CMF80L"]?.hasCMF80L &&
    results["/search?q=" + encodeURIComponent("단자 방향 CMF80L")]?.hasCMF80L &&
    !batteryHrefs.includes("80L");

  return {
    name: "cmf80l-chain",
    ok,
    expected,
    searchFocus,
    detailH1,
    batteryHrefs: [...new Set(batteryHrefs)].slice(0, 8),
    results,
  };
}

const chainChecks = [verifyGrandeurChain, verifyCmf80lChain];
let pass = 0;
for (const run of chainChecks) {
  const r = await run();
  if (r.ok) {
    pass++;
    console.log("PASS", r.name);
  } else {
    console.log("FAIL", r.name);
    console.log(JSON.stringify(r, null, 2));
  }
}

console.log(`\nChain checks: ${pass}/${chainChecks.length}`);
const sub = spawnSync(process.execPath, ["scripts/verify-search-p0-fix.mjs", BASE], { stdio: "inherit" });
process.exit(sub.status === 0 && pass === chainChecks.length ? 0 : 1);
