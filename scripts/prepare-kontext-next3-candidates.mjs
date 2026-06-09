#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "reports", "vehicle-reference-candidates-test5.json");
const OUT = path.join(ROOT, "reports", "vehicle-reference-candidates-next3-kontext.json");

const TARGET_SLUGS = [
  "ssangyong-tivoli-armour-2017",
  "kia-k9-2012",
  "chevrolet-cruze-2011",
];

const REPLICATE_ACCESSIBLE = (url) =>
  /netcarshow\.com|edmunds-media\.com|media\.ed\.|cdcssl\.ibsrv\.net/i.test(url ?? "");

function pickAccessibleUrl(vehicle) {
  const candidates = (vehicle.candidateImages ?? []).filter((c) =>
    REPLICATE_ACCESSIBLE(c.imageUrl),
  );
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
}

function main() {
  const source = JSON.parse(readFileSync(SOURCE, "utf8"));
  const vehicles = [];

  for (const slug of TARGET_SLUGS) {
    const v = source.vehicles.find((x) => x.slug === slug);
    if (!v) {
      vehicles.push({ slug, error: "not found in test5" });
      continue;
    }

    let selectedReferenceUrl = v.selectedReferenceUrl;
    let selectedReferenceReason = v.selectedReferenceReason;
    let urlSwapped = false;
    let replicateAccessible = REPLICATE_ACCESSIBLE(selectedReferenceUrl);

    if (!replicateAccessible) {
      const alt = pickAccessibleUrl(v);
      if (alt) {
        selectedReferenceUrl = alt.imageUrl;
        selectedReferenceReason = `Swapped to Replicate-accessible URL; ${alt.reason}; title: ${alt.sourceTitle}`;
        urlSwapped = true;
        replicateAccessible = true;
      } else {
        selectedReferenceUrl = null;
        selectedReferenceReason = "Replicate 접근 가능한 후보 URL 없음";
      }
    }

    vehicles.push({
      slug: v.slug,
      brand: v.brand,
      imageFile: v.imageFile,
      vehicleNameKo: v.vehicleNameKo,
      vehicleNameEn: v.vehicleNameEn,
      generationCode: v.generationCode,
      representativeYear: v.representativeYear,
      bodyType: v.bodyType,
      candidateImages: v.candidateImages,
      selectedReferenceUrl,
      selectedReferenceReason,
      replicateAccessible,
      urlSwapped,
      generationAllowed: replicateAccessible,
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    sourceReport: "vehicle-reference-candidates-test5.json",
    testSlugs: TARGET_SLUGS,
    model: "black-forest-labs/flux-kontext-pro",
    vehicles,
  };

  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");

  for (const v of vehicles) {
    console.log(`${v.slug}: accessible=${v.replicateAccessible} selected=${v.selectedReferenceUrl ? "yes" : "NO"}`);
  }
  console.log(`\nSaved: ${OUT}`);
}

main();
