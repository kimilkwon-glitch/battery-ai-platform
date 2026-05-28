#!/usr/bin/env node
/**
 * Deployment alignment report (GitHub main vs Vercel alias vs public HTML)
 * Usage: node scripts/report-deployment-alignment.mjs
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BASE = "https://battery-ai-platform.vercel.app";
const EXPECTED_STAMP = JSON.parse(
  readFileSync(join(ROOT, "build-stamp.json"), "utf8"),
).stamp;

const githubMain = execSync("git ls-remote origin refs/heads/main", {
  cwd: ROOT,
  encoding: "utf8",
}).trim().split(/\s+/)[0];

let vercelAlias = { id: null, url: null };
try {
  const out = execSync("npx vercel inspect battery-ai-platform.vercel.app --json", {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  const j = JSON.parse(out);
  vercelAlias = { id: j.id, url: j.url, createdAt: j.createdAt };
} catch (e) {
  vercelAlias = { error: String(e.message || e) };
}

const urls = [
  "/search?q=" + encodeURIComponent("포터2 배터리"),
  "/search?q=" + encodeURIComponent("스포티지 NQ5 하이브리드"),
  "/vehicle/sportage-nq5?fuel=" + encodeURIComponent("하이브리드"),
];

const htmlChecks = [];
for (const path of urls) {
  const res = await fetch(BASE + path, {
    headers: { "Cache-Control": "no-cache" },
    cache: "no-store",
  });
  const html = await res.text();
  const stamps = [...new Set(html.match(/BM-UX-REV-[A-Z0-9-]+/g) ?? [])];
  const heroStart = html.indexOf('id="fuel-batteries"');
  let firstHero = null;
  if (heroStart >= 0) {
    const m = html
      .slice(heroStart, heroStart + 8000)
      .match(/data-fuel-hero="([^"]+)"[^>]*data-battery-hero="([^"]+)"/i);
    if (m) firstHero = { fuel: m[1], code: m[2] };
  }
  htmlChecks.push({ path, status: res.status, stamps, firstHero });
}

const report = {
  at: new Date().toISOString(),
  expectedStamp: EXPECTED_STAMP,
  githubMainSha: githubMain,
  vercelProductionAlias: vercelAlias,
  publicHtmlChecks: htmlChecks,
  aligned:
    htmlChecks.every(
      (c) => c.stamps.length === 1 && c.stamps[0] === EXPECTED_STAMP,
    ) &&
    htmlChecks
      .filter((c) => c.path.includes("/vehicle/sportage"))
      .every((c) => c.firstHero?.fuel === "하이브리드" && c.firstHero?.code === "AGM60L"),
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.aligned ? 0 : 1);
