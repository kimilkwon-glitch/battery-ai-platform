#!/usr/bin/env npx tsx
/**
 * 세대·추천 후보 감사 — reports/vehicle-recommendation-candidate-audit.* + vehicle-generation-match-audit.*
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  classifyRecommendationCandidate,
  conflictingGenerationTokens,
  extractGenerationTokensFromText,
  GENERATION_CODE_TOKENS,
} from "../src/lib/vehicle-generation-match";
import {
  getRecordsForSlug,
  getVehicleBatteryPageData,
  getVehicleDbProfile,
} from "../src/lib/vehicleBattery";
import { findBatteryProductByCode, hasStrictBrandProductImage } from "../src/lib/battery-alias-map";
import { getVehicleAsset } from "../src/lib/car-assets";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const REPORTS = path.join(ROOT, "reports");

const FOCUS_SLUG = "avante-md";

const GENERATION_AUDIT_SLUGS = [
  "avante-hd",
  "avante-md",
  "avante-ad",
  "avante-cn7",
  "sonata-nf",
  "sonata-yf",
  "sonata-lf",
  "sonata-dn8",
  "santafe-cm",
  "santafe-dm",
  "santafe-tm",
  "tucson-jm",
  "tucson-lm",
  "tucson-tl",
  "tucson-nx4",
  "k3-yd",
  "k3-bd",
  "k3-bd-fl",
  "sportage-sl",
  "sportage-nq5",
  "sorento-mq4",
  "carnival-ka4",
  "ray-tam",
  "morning-ja",
  "renault-samsung-qm5-2007",
  "k8-gl3",
];

type CandidateRow = {
  displayName: string;
  detail: string;
  fuel: string;
  primaryBattery: string;
  years: string;
  class: string;
  renderable: boolean;
  reason: string;
  recordTokens: string[];
};

function auditSlugCandidates(slug: string) {
  const profile = getVehicleDbProfile(slug);
  const asset = getVehicleAsset(slug);
  const allMatched = getRecordsForSlug(slug);
  const page = getVehicleBatteryPageData(slug);
  const rows: CandidateRow[] = allMatched.map((r) => {
    const c = profile
      ? classifyRecommendationCandidate(r, profile)
      : { class: "reviewOnlyCandidate", renderable: false, reason: "no profile" };
    return {
      displayName: r.displayName,
      detail: r.detail,
      fuel: r.fuel ?? "",
      primaryBattery: r.primaryBattery,
      years: r.years ?? "",
      class: c.class,
      renderable: c.renderable,
      reason: c.reason,
      recordTokens: extractGenerationTokensFromText(
        `${r.displayName} ${r.detail} ${r.aliases.join(" ")}`,
      ),
    };
  });

  const leaking = rows.filter((r) => !r.renderable);
  const facingFuels = page.fuelGroups.map((g) => ({
    fuelLabel: g.fuelLabel,
    primaryBattery: g.primaryBattery,
  }));
  const hybridOnPage = facingFuels.some((f) => f.fuelLabel === "하이브리드");
  const wrongGenOnPage = rows.some(
    (r) =>
      r.renderable === false &&
      (r.class === "otherGenerationCandidate" || r.class === "hybridWithoutGenerationCandidate") &&
      facingFuels.some((f) => f.primaryBattery === r.primaryBattery),
  );

  const brandChecks = facingFuels.flatMap((f) => {
    const code = f.primaryBattery;
    if (!code) return [];
    return (["rocket", "solite"] as const).map((brand) => ({
      fuelLabel: f.fuelLabel,
      spec: code,
      brand,
      catalogCode: findBatteryProductByCode(code, brand, { strictBrand: true }) ?? null,
      hasImage: hasStrictBrandProductImage(code, brand),
    }));
  });

  return {
    slug,
    displayName: asset?.displayName ?? profile?.title ?? slug,
    yearRange: asset?.yearRange ?? profile?.yearRange ?? "",
    generationTokens: profile?.generationTokens ?? [],
    dbModels: profile?.dbModels ?? [],
    matchedCount: allMatched.length,
    renderableCount: rows.filter((r) => r.renderable).length,
    customerFuelGroups: facingFuels,
    hybridSectionOnPage: hybridOnPage,
    wrongGenerationLeakingToPage: wrongGenOnPage,
    brandProductChecks: brandChecks,
    nonRenderableSamples: leaking.slice(0, 12),
    renderableSamples: rows.filter((r) => r.renderable).slice(0, 8),
  };
}

function main() {
  const avanteMd = auditSlugCandidates(FOCUS_SLUG);
  const generationAudits = GENERATION_AUDIT_SLUGS.map(auditSlugCandidates);

  const issues = generationAudits.flatMap((a) => {
    const problems: string[] = [];
    if (a.hybridSectionOnPage && !a.generationTokens.length && a.slug !== "sorento-mq4") {
      /* hybrid ok when asset tagged */
    }
    if (a.hybridSectionOnPage && a.slug === "avante-md") {
      problems.push("avante-md: hybrid section must not show");
    }
    const profileGen = [
      ...new Set([
        ...a.generationTokens,
        ...extractGenerationTokensFromText(a.displayName),
      ]),
    ].filter((t) =>
      GENERATION_CODE_TOKENS.some((k) => k.toUpperCase() === t.toUpperCase()),
    );
    const otherGenRendered = a.renderableSamples.some((s) => {
      const conflicts = conflictingGenerationTokens(profileGen, s.recordTokens);
      return conflicts.length > 0;
    });
    if (otherGenRendered && profileGen.length > 0) {
      problems.push(`${a.slug}: renderable record with foreign generation tokens`);
    }
    const broadOnlyFacing =
      a.customerFuelGroups.length > 0 &&
      a.renderableCount === 0 &&
      a.matchedCount > 0;
    if (broadOnlyFacing) {
      problems.push(`${a.slug}: DB matches exist but none customer-renderable`);
    }
    const phantomBrand = a.brandProductChecks.some(
      (b) =>
        b.brand === "solite" &&
        /\b60AL\b/i.test(b.spec) &&
        b.hasImage &&
        a.customerFuelGroups.some((f) => f.primaryBattery === b.spec),
    );
    if (phantomBrand) {
      problems.push(`${a.slug}: solite 60AL card would be invalid (no catalog)`);
    }
    return problems.map((p) => ({ slug: a.slug, issue: p }));
  });

  const candidateAudit = {
    generatedAt: new Date().toISOString(),
    focusSlug: FOCUS_SLUG,
    avanteMd,
    summary: {
      avanteMdHybridOnPage: avanteMd.hybridSectionOnPage,
      avanteMdFuelGroups: avanteMd.customerFuelGroups,
      avanteMdNonRenderableWithHybrid: avanteMd.nonRenderableSamples.filter((r) =>
        /하이브리드|hybrid/i.test(`${r.fuel} ${r.displayName}`),
      ),
    },
  };

  const generationAudit = {
    generatedAt: new Date().toISOString(),
    slugs: GENERATION_AUDIT_SLUGS,
    vehicles: generationAudits,
    issues,
    pass: issues.length === 0,
  };

  fs.mkdirSync(REPORTS, { recursive: true });
  fs.writeFileSync(
    path.join(REPORTS, "vehicle-recommendation-candidate-audit.json"),
    JSON.stringify(candidateAudit, null, 2),
  );
  fs.writeFileSync(
    path.join(REPORTS, "vehicle-generation-match-audit.json"),
    JSON.stringify(generationAudit, null, 2),
  );

  const mdCandidate = [
    "# Vehicle recommendation candidate audit",
    "",
    `Generated: ${candidateAudit.generatedAt}`,
    "",
    "## Focus: avante-md",
    "",
    `- Display: ${avanteMd.displayName} (${avanteMd.yearRange})`,
    `- Generation tokens: ${avanteMd.generationTokens.join(", ") || "(none)"}`,
    `- DB model query: ${avanteMd.dbModels.join(", ")}`,
    `- Matched records: ${avanteMd.matchedCount} (renderable: ${avanteMd.renderableCount})`,
    `- Customer fuel groups: ${JSON.stringify(avanteMd.customerFuelGroups)}`,
    `- Hybrid section on page: **${avanteMd.hybridSectionOnPage ? "YES (fail)" : "no"}**`,
    "",
    "### Blocked hybrid / other-generation samples",
    "",
    ...avanteMd.nonRenderableSamples
      .filter((r) => /하이브리드|HD|XD/i.test(`${r.displayName} ${r.detail}`))
      .map(
        (r) =>
          `- ${r.displayName} → ${r.primaryBattery} (${r.class}: ${r.reason})`,
      ),
    "",
    "### Renderable (customer-facing)",
    "",
    ...(avanteMd.renderableSamples.length
      ? avanteMd.renderableSamples.map(
          (r) => `- ${r.displayName} → ${r.primaryBattery} (${r.class})`,
        )
      : ["- (none)"]),
    "",
    "### Brand catalog (facing fuels)",
    "",
    ...avanteMd.brandProductChecks.map(
      (b) =>
        `- ${b.fuelLabel} ${b.spec} / ${b.brand}: catalog=${b.catalogCode ?? "MISSING"} image=${b.hasImage}`,
    ),
  ].join("\n");

  const mdGeneration = [
    "# Vehicle generation match audit",
    "",
    `Generated: ${generationAudit.generatedAt}`,
    "",
    `Pass: **${generationAudit.pass ? "YES" : "NO"}** (${issues.length} issue(s))`,
    "",
    "## Issues",
    "",
    ...(issues.length
      ? issues.map((i) => `- ${i.slug}: ${i.issue}`)
      : ["- None"]),
    "",
    "## Per-vehicle summary",
    "",
    ...generationAudits.map(
      (v) =>
        `- **${v.slug}** (${v.displayName}): matched=${v.matchedCount} renderable=${v.renderableCount} fuels=${v.customerFuelGroups.map((f) => f.fuelLabel).join(",") || "—"} hybrid=${v.hybridSectionOnPage}`,
    ),
  ].join("\n");

  fs.writeFileSync(path.join(REPORTS, "vehicle-recommendation-candidate-audit.md"), mdCandidate);
  fs.writeFileSync(path.join(REPORTS, "vehicle-generation-match-audit.md"), mdGeneration);

  console.log("Wrote reports/vehicle-recommendation-candidate-audit.{json,md}");
  console.log("Wrote reports/vehicle-generation-match-audit.{json,md}");
  if (!generationAudit.pass) {
    console.error("Generation audit issues:", issues.length);
    process.exitCode = 1;
  }
}

main();
