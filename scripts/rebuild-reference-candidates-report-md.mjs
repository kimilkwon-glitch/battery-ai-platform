#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = path.join(ROOT, "reports", "vehicle-reference-candidates-test5.json");
const report = JSON.parse(readFileSync(jsonPath, "utf8"));

const lines = [
  "# Vehicle Reference Candidates — Test 5",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  "## Summary",
  "",
  "| Slug | Candidates | Downloaded | Selected | Manual review |",
  "|------|------------|------------|----------|---------------|",
];

for (const v of report.vehicles) {
  const dl = v.candidateImages.filter((c) => c.downloaded).length;
  lines.push(
    `| ${v.slug} | ${v.candidateImages.length} | ${dl} | ${v.selectedReferenceImage ?? "—"} | ${v.needsManualReview ? "YES" : "no"} |`,
  );
}

lines.push("", "## Replicate reference models", "", "See `reports/replicate-reference-model-candidates.json`.", "");
lines.push("## Per vehicle", "");

for (const v of report.vehicles) {
  lines.push(`### ${v.slug} (${v.vehicleNameKo})`, "");
  lines.push(`- **Selected:** ${v.selectedReferenceImage ?? "none"}`);
  lines.push(`- **Manual review:** ${v.needsManualReview ? "YES" : "no"}`, "");
  lines.push("**Candidates:**", "");
  for (const c of v.candidateImages) {
    const size = c.width && c.height ? `${c.width}x${c.height}` : "—";
    lines.push(`- [${c.confidence}] ${c.downloaded ? "downloaded" : "url only"} ${size} — ${c.reason}`);
    if (!c.downloaded) lines.push(`  - sourceUrl: ${c.sourceUrl}`);
  }
  lines.push("");
}

writeFileSync(path.join(ROOT, "reports", "vehicle-reference-candidates-test5.md"), lines.join("\n"), "utf8");
console.log("MD report rebuilt");
