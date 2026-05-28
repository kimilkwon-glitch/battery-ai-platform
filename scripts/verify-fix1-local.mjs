#!/usr/bin/env node
import { buildSearchPageResults } from "../src/lib/search-page-results.ts";

const cases = [
  "포터2 배터리",
  "레이 블랙박스 방전",
  "100R vs AGM95L",
];

for (const q of cases) {
  const r = buildSearchPageResults(q);
  console.log("\n===", q, "===");
  console.log("missingSpecMessage:", r.missingSpecMessage ?? "(none)");
  console.log("terminalTypeLabel:", r.terminalTypeLabel ?? "(none)");
  console.log("summary.batterySpecs:", r.summary.batterySpecs);
}
