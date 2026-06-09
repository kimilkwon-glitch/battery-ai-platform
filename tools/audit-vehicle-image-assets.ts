#!/usr/bin/env npx tsx
/**
 * 차량 이미지 자산 전수 조사 + visual risk 분류
 * 산출: reports/vehicle-image-audit.json
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  analyzePixelBuffer,
  computeCurrentVsBackupDiff,
} from "../src/lib/vehicle-image-analysis";
import type { VehicleImageAnalysisRecord } from "../src/lib/vehicle-image-inventory";
import { buildVehicleImageInventoryWithDiskScan } from "../src/lib/vehicle-image-inventory-disk";
import { vehicleAssets } from "../src/lib/car-assets";

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "reports", "vehicle-image-audit.json");
const PUBLIC = path.join(ROOT, "public");

const ANALYZE_SIZE = 320;

async function loadNormalizedRaw(absPath: string) {
  const { data, info } = await sharp(absPath)
    .resize(ANALYZE_SIZE, ANALYZE_SIZE, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels };
}

async function analyzeImageFile(absPath: string): Promise<VehicleImageAnalysisRecord | null> {
  try {
    const { data, width, height, channels } = await loadNormalizedRaw(absPath);
    const metrics = analyzePixelBuffer(data, width, height, channels);
    return { ...metrics, raw: data, width, height, channels };
  } catch (err) {
    console.warn(`analyze skip: ${absPath}`, err instanceof Error ? err.message : err);
    return null;
  }
}

async function main() {
  const analysisByPath = new Map<string, VehicleImageAnalysisRecord>();
  const pairDiffBySlug = new Map<string, number>();

  const pathsToAnalyze = new Set<string>();
  const { entries: preEntries } = buildVehicleImageInventoryWithDiskScan();
  for (const e of preEntries) {
    if (e.primaryDiskPath) pathsToAnalyze.add(path.join(PUBLIC, e.primaryDiskPath.replace(/^\//, "")));
    if (e.backupDiskPath) pathsToAnalyze.add(path.join(PUBLIC, e.backupDiskPath.replace(/^\//, "")));
  }

  console.log(`Analyzing ${pathsToAnalyze.size} PNG files...`);
  let done = 0;
  for (const abs of pathsToAnalyze) {
    if (!fs.existsSync(abs)) continue;
    const metrics = await analyzeImageFile(abs);
    if (metrics) analysisByPath.set(abs, metrics);
    done++;
    if (done % 25 === 0) console.log(`  ${done}/${pathsToAnalyze.size}`);
  }

  for (const asset of vehicleAssets) {
    const imageUrl = asset.image.includes("/assets/vehicles/cars-normalized/")
      ? asset.image.replace("/assets/vehicles/cars-normalized/", "/assets/cars-normalized/")
      : asset.image;
    if (!imageUrl.startsWith("/assets/cars-normalized/")) continue;
    const primaryAbs = path.join(PUBLIC, imageUrl.replace(/^\//, "").replace(/\//g, path.sep));
    const rel = path.relative(path.join(PUBLIC, "assets", "cars-normalized"), primaryAbs).replace(/\\/g, "/");
    const backupAbs = path.join(PUBLIC, "assets", "vehicles-original-backup", "cars-normalized", rel);

    const cur = analysisByPath.get(primaryAbs);
    const bak = fs.existsSync(backupAbs) ? analysisByPath.get(backupAbs) : undefined;
    if (cur?.raw && bak?.raw && cur.width === bak.width && cur.height === bak.height) {
      const diff = computeCurrentVsBackupDiff(cur.raw, bak.raw, cur.width!, cur.height!, cur.channels!);
      pairDiffBySlug.set(asset.id, diff);
    }
  }

  const { entries, orphans, summary, restoreBuckets } = buildVehicleImageInventoryWithDiskScan(
    analysisByPath,
    pairDiffBySlug,
  );

  const damaged = entries.filter((e) => e.visualRiskStatus === "DAMAGED_FILE");
  const needsCheck = entries.filter((e) => e.visualRiskStatus === "NEEDS_CHECK");
  const brightReview = entries.filter((e) => e.visualRiskStatus === "BRIGHT_REVIEW");
  const restoreCandidateReview = entries.filter((e) => e.visualRiskStatus === "RESTORE_CANDIDATE_REVIEW");
  const missing = entries.filter((e) => e.visualRiskStatus === "MISSING_FILE");
  const manualBrightOk = entries.filter((e) => e.manualBrightOkReview);
  const tucsonJm = entries.find((e) => e.slug === "tucson-jm");

  const report = {
    summary,
    restoreBuckets,
    damaged,
    needsCheck,
    brightReview,
    restoreCandidateReview,
    missing,
    manualBrightOk,
    tucsonJm,
    legacyDamaged: entries.filter((e) => e.status === "DAMAGED_FILE"),
    entries,
    orphans,
    auditCriteria: {
      graySmearThresholdBright: 0.1,
      graySmearThresholdDefault: 0.13,
      whiteBodyErosionThresholdBright: 0.00008,
      currentVsBackupDiffLarge: 0.022,
      edgeFloodRiskThreshold: 0.00006,
      note: "OK는 정상 확정이 아니라 자동 기준 통과. BRIGHT_REVIEW/RESTORE_CANDIDATE_REVIEW는 육안 우선.",
    },
    normalizeCommit: "f9324ad",
    preNormalizeCommit: "8dbde4be047903fe70f8e730aa460393f9dd82c4",
    notes: [
      "f9324ad floodFillEdgeBackground — 밝은 차체 배경 오인",
      "Backup: public/assets/vehicles-original-backup/cars-normalized/",
      "이번 단계: 복구 미실행, 후보 산정만",
    ],
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

  console.log("\n=== VEHICLE IMAGE AUDIT (v2) ===");
  console.log(`registry: ${summary.registryAssetCount}`);
  console.log("legacy status:", summary.statusCounts);
  console.log("visual risk:", summary.visualRiskCounts);
  console.log(`restore candidates: ${summary.restoreCandidateCount}`);
  console.log(`bright review: ${summary.brightReviewCount}`);
  console.log(`manual bright+OK: ${summary.manualBrightOkCount}`);
  console.log(`A immediate restore: ${restoreBuckets.immediateRestore.length}`);
  console.log(`B manual restore: ${restoreBuckets.manualRestore.length}`);
  console.log(`C regeneration: ${restoreBuckets.regeneration.length}`);
  if (tucsonJm) {
    console.log(
      `tucson-jm: legacy=${tucsonJm.status} visual=${tucsonJm.visualRiskStatus} smear=${tucsonJm.graySmearScore.toFixed(4)} diff=${tucsonJm.currentVsBackupDiff?.toFixed(4) ?? "n/a"}`,
    );
  }
  console.log(`Wrote ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
