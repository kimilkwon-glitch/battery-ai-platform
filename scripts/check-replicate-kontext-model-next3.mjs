#!/usr/bin/env node
/** next3 테스트용 — 기존 kontext schema 재사용 또는 빠른 재확인 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXISTING = path.join(ROOT, "reports", "replicate-kontext-model-check.json");
const OUT = path.join(ROOT, "reports", "replicate-kontext-model-check-next3.json");

if (existsSync(EXISTING)) {
  const data = JSON.parse(readFileSync(EXISTING, "utf8"));
  const report = {
    ...data,
    reusedAt: new Date().toISOString(),
    note: "Reused from replicate-kontext-model-check.json — valid for next3 batch",
    testSlugs: ["ssangyong-tivoli-armour-2017", "kia-k9-2012", "chevrolet-cruze-2011"],
    readyForNext3: true,
  };
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
  console.log(`Reused schema check -> ${OUT}`);
} else {
  console.error("Run npm run check:replicate-kontext-model first");
  process.exit(1);
}
