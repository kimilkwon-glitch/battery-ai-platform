#!/usr/bin/env node
/**
 * 전체 차량 이미지 노멀라이즈 (흰 배경 · 16:9 · 통일 스케일)
 *
 * 대상:
 *   public/assets/cars-normalized (recursive png)
 *   public/assets/vehicles/cars-normalized (recursive png)
 *
 * 백업:
 *   public/assets/vehicles-original-backup/{cars-normalized|vehicles-cars-normalized}/...
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  CANVAS_H,
  CANVAS_W,
  normalizeVehicleImageFile,
} from "./lib/normalize-vehicle-image.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const TARGET_ROOTS = [
  {
    label: "cars-normalized",
    src: path.join(ROOT, "public", "assets", "cars-normalized"),
    backupKey: "cars-normalized",
  },
  {
    label: "vehicles/cars-normalized",
    src: path.join(ROOT, "public", "assets", "vehicles", "cars-normalized"),
    backupKey: "vehicles-cars-normalized",
  },
];

const BACKUP_ROOT = path.join(ROOT, "public", "assets", "vehicles-original-backup");
const PNG_ONLY = /\.png$/i;

async function walkImages(dir) {
  const out = [];
  async function walk(current) {
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (ent.isDirectory()) {
        await walk(full);
      } else if (PNG_ONLY.test(ent.name)) {
        out.push(full);
      }
    }
  }
  await walk(dir);
  return out;
}

async function copyFile(src, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  let ok = 0;
  const failed = [];
  const processed = [];

  console.log(`Canvas: ${CANVAS_W}x${CANVAS_H} (16:9), background: #ffffff`);
  if (dryRun) console.log("DRY RUN — no files written\n");

  for (const { label, src, backupKey } of TARGET_ROOTS) {
    try {
      await fs.access(src);
    } catch {
      console.warn(`Skip missing: ${label}`);
      continue;
    }

    const files = await walkImages(src);
    console.log(`\n[${label}] ${files.length} images`);

    for (const filePath of files) {
      const rel = path.relative(src, filePath);
      const backupPath = path.join(BACKUP_ROOT, backupKey, rel);

      try {
        if (!dryRun) {
          await copyFile(filePath, backupPath);
          const tmp = `${filePath}.normalize.tmp.png`;
          await normalizeVehicleImageFile(filePath, tmp, path.basename(filePath));
          await fs.rename(tmp, filePath);
        }
        ok += 1;
        processed.push(`${backupKey}/${rel}`);
        if (ok % 25 === 0) console.log(`  … ${ok} done`);
      } catch (err) {
        failed.push(`${backupKey}/${rel}: ${err.message}`);
        console.error(`✗ ${rel}`, err.message);
      }
    }
  }

  console.log("\n--- normalize-all-vehicle-assets ---");
  console.log(`Processed: ${ok}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Backup root: public/assets/vehicles-original-backup/`);
  if (failed.length) {
    console.log("\nFailures:");
    for (const line of failed) console.log(`  - ${line}`);
  }

  const reportPath = path.join(ROOT, "docs", "vehicle-image-normalize-report.json");
  if (!dryRun) {
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(
      reportPath,
      JSON.stringify(
        {
          at: new Date().toISOString(),
          canvas: { w: CANVAS_W, h: CANVAS_H, ratio: "16:9" },
          background: "#ffffff",
          processedCount: ok,
          failed,
          sample: processed.slice(0, 20),
        },
        null,
        2,
      ),
      "utf8",
    );
    console.log(`Report: docs/vehicle-image-normalize-report.json`);
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
