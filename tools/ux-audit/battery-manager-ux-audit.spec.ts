import { test } from "@playwright/test";
import { getAuditLimit, getBaseUrl } from "./config";
import { writeReports } from "./report";
import { getAllPersonas, getScenariosForRun } from "./scenarios";
import { runAuditBatch } from "./runUxAudit";

const limit = getAuditLimit(100);
const allPersonas = getAllPersonas(500);
const personas = getScenariosForRun(limit);

test.describe.configure({ mode: "serial" });

test(`Battery Manager UX Audit (${personas.length} personas)`, async ({ page }) => {
  test.setTimeout(Math.max(180000, personas.length * 25000));

  const results = await runAuditBatch(page, personas);
  writeReports(allPersonas, results);

  const failed = results.filter((r) => r.status === "fail").length;
  const warned = results.filter((r) => r.status === "warn").length;

  console.log(`\n[UX Audit] Base: ${getBaseUrl()}`);
  console.log(`[UX Audit] Executed ${personas.length} / ${allPersonas.length} personas`);
  console.log(`[UX Audit] pass=${results.length - failed - warned} warn=${warned} fail=${failed}`);
  console.log(`[UX Audit] Reports → tools/ux-audit/reports/ux-audit-report.md\n`);

  // UX audit should not fail CI by default — findings are in the report
  test.info().annotations.push({ type: "ux-audit-failures", description: String(failed) });
});
