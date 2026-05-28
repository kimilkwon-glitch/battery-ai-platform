#!/usr/bin/env node
/**
 * P0 follow-up: grandeur IG fuel consistency + CMF80L battery title
 * Usage: node scripts/verify-consistency-fix.mjs [baseUrl]
 */
import { spawnSync } from "child_process";

const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";

async function fetchHtml(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { "User-Agent": "BM-Consistency/1.0" } });
  return res.text();
}

function extractPrimaryCardCode(html) {
  const m = html.match(/<h3[^>]*>\s*([A-Z0-9]+)\s*<span[^>]*>배터리<\/span>/i);
  return m?.[1] ?? null;
}

function extractFooterBattery(html) {
  return html.match(/data-primary-battery="([^"]+)"/)?.[1] ?? null;
}

function extractFuelCardCode(html, fuelLabel) {
  const re = new RegExp(
    `>${fuelLabel}</[^>]+>[\\s\\S]{0,400}?text-lg font-black[^>]*>([A-Z0-9]+)<`,
    "i",
  );
  return html.match(re)?.[1] ?? null;
}

function extractTableGasoline(html) {
  const rows = [...html.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/gi)];
  for (const row of rows) {
    if (/가솔린/.test(row)) {
      const cell = row.match(
        /font-black text-\[var\(--bm-primary\)\][^>]*>([^<]+)</,
      )?.[1]?.trim();
      if (cell && /AGM|DIN|CMF|80L|70L/.test(cell)) return cell;
    }
  }
  return null;
}

const checks = [
  {
    name: "grandeur-search-agm80l",
    run: async () => {
      const h = await fetchHtml("/search?q=" + encodeURIComponent("그랜저 IG 가솔린"));
      const card = extractPrimaryCardCode(h);
      return { ok: card === "AGM80L" && !h.includes("AGM70L 규격"), card };
    },
  },
  {
    name: "grandeur-vehicle-unified",
    run: async () => {
      const h = await fetchHtml("/vehicle/grandeur-ig?fuel=" + encodeURIComponent("가솔린"));
      const footer = extractFooterBattery(h);
      const fuelCard = extractFuelCardCode(h, "가솔린");
      const table = extractTableGasoline(h);
      const bad = h.includes("AGM70L 규격 상세") || h.includes('data-primary-battery="AGM70L"');
      const ok = !bad && footer === "AGM80L" && fuelCard === "AGM80L" && !h.includes("AGM70L 규격 상세");
      return { ok, footer, fuelCard, table, bad };
    },
  },
  {
    name: "battery-cmf80l-title",
    run: async () => {
      const h = await fetchHtml("/batteries/CMF80L");
      const badTitle = /<h1[^>]*>\s*80L\s*<\/h1>/i.test(h);
      const good = /<h1[^>]*>\s*CMF80L/i.test(h) || h.includes(">CMF80L<");
      return { ok: good && !badTitle && !h.includes('href="/batteries/80L"'), good, badTitle };
    },
  },
  {
    name: "search-cmf80l",
    run: async () => {
      const h = await fetchHtml("/search?q=CMF80L");
      return { ok: extractPrimaryCardCode(h) === "CMF80L" && !h.includes("/batteries/80L") };
    },
  },
  {
    name: "search-terminal-cmf80l",
    run: async () => {
      const h = await fetchHtml("/search?q=" + encodeURIComponent("단자 방향 CMF80L"));
      return { ok: h.includes("CMF80L") && !h.includes("/batteries/80L") };
    },
  },
];

let pass = 0;
for (const c of checks) {
  const r = await c.run();
  if (r.ok) {
    pass++;
    console.log("PASS", c.name);
  } else {
    console.log("FAIL", c.name, JSON.stringify(r));
  }
}

console.log(`\nConsistency: ${pass}/${checks.length}`);
const sub = spawnSync(process.execPath, ["scripts/verify-search-p0-fix.mjs", BASE], { stdio: "inherit" });
process.exit(sub.status === 0 && pass === checks.length ? 0 : 1);
