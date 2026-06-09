#!/usr/bin/env node
/**
 * DAMAGED_FILE 확정 10건만 백업 복구 + safe normalize (flood-fill 없음)
 *
 * 1. 현재 손상 파일 → public/assets/vehicle-damaged-backup-before-restore/
 * 2. vehicles-original-backup → public/assets/cars-normalized/
 * 3. 복구 파일에만 safeNormalizeVehicleImageFile 적용
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { safeNormalizeVehicleImageFile } from "./lib/normalize-vehicle-image.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const RUNTIME_ROOT = path.join(ROOT, "public", "assets", "cars-normalized");
const ORIGINAL_BACKUP_ROOT = path.join(ROOT, "public", "assets", "vehicles-original-backup", "cars-normalized");
const DAMAGED_SNAPSHOT_ROOT = path.join(ROOT, "public", "assets", "vehicle-damaged-backup-before-restore", "cars-normalized");

/** slug → brand / imageFile (런타임 cars-normalized 기준) */
const RESTORE_TARGETS = [
  { slug: "ssangyong-tivoli-air-2016", brand: "ssangyong", imageFile: "ssangyong_tivoli_air_2016.png" },
  { slug: "ssangyong-tivoli-air-2021", brand: "ssangyong", imageFile: "ssangyong_tivoli_air_2021.png" },
  { slug: "ssangyong-tivoli-2015", brand: "ssangyong", imageFile: "ssangyong_tivoli_2015.png" },
  { slug: "ssangyong-tivoli-armour-2017", brand: "ssangyong", imageFile: "ssangyong_tivoli_armour_2017.png" },
  { slug: "ssangyong-very-new-tivoli-2019", brand: "ssangyong", imageFile: "ssangyong_very_new_tivoli_2019.png" },
  { slug: "ssangyong-new-style-korando-c-2017", brand: "ssangyong", imageFile: "ssangyong_new_style_korando_c_2017.png" },
  { slug: "hyundai-grand-starex-2007", brand: "hyundai", imageFile: "hyundai_grand_starex_2007.png" },
  { slug: "kia-k9-2012", brand: "kia", imageFile: "kia_k9_2012.png" },
  { slug: "kia-soul-booster-2019", brand: "kia", imageFile: "kia_soul_booster_2019.png" },
  { slug: "kia-all-new-carens-2013", brand: "kia", imageFile: "kia_all_new_carens_2013.png" },
];

async function copyFile(src, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const restored = [];
  const errors = [];

  console.log(`Restore targets: ${RESTORE_TARGETS.length}`);
  if (dryRun) console.log("DRY RUN\n");

  for (const target of RESTORE_TARGETS) {
    const rel = path.join(target.brand, target.imageFile);
    const runtimePath = path.join(RUNTIME_ROOT, rel);
    const backupPath = path.join(ORIGINAL_BACKUP_ROOT, rel);
    const snapshotPath = path.join(DAMAGED_SNAPSHOT_ROOT, rel);

    if (!(await fileExists(backupPath))) {
      errors.push(`${target.slug}: backup missing ${backupPath}`);
      continue;
    }

    try {
      if (!dryRun) {
        if (await fileExists(runtimePath)) {
          await copyFile(runtimePath, snapshotPath);
        }
        await copyFile(backupPath, runtimePath);
        const tmp = `${runtimePath}.safe-normalize.tmp.png`;
        await safeNormalizeVehicleImageFile(runtimePath, tmp, target.imageFile);
        await fs.rename(tmp, runtimePath);
      }

      restored.push({
        slug: target.slug,
        imageFile: target.imageFile,
        runtimePath: `public/assets/cars-normalized/${rel.replace(/\\/g, "/")}`,
        backupSource: `public/assets/vehicles-original-backup/cars-normalized/${rel.replace(/\\/g, "/")}`,
        damagedSnapshot: `public/assets/vehicle-damaged-backup-before-restore/cars-normalized/${rel.replace(/\\/g, "/")}`,
      });
      console.log(`✓ ${target.slug}`);
    } catch (err) {
      errors.push(`${target.slug}: ${err.message}`);
      console.error(`✗ ${target.slug}`, err.message);
    }
  }

  const reportPath = path.join(ROOT, "docs", "vehicle-image-restore-report.json");
  const report = {
    at: new Date().toISOString(),
    restoredCount: restored.length,
    restored,
    errors,
    damagedSnapshotRoot: "public/assets/vehicle-damaged-backup-before-restore/cars-normalized/",
    normalizeMode: "safeNormalizeVehicleImageFile (no flood-fill)",
  };

  if (!dryRun) {
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
  }

  console.log("\n--- restore-damaged-vehicle-images ---");
  console.log(`Restored: ${restored.length}/${RESTORE_TARGETS.length}`);
  console.log(`Errors: ${errors.length}`);
  if (!dryRun) console.log(`Report: docs/vehicle-image-restore-report.json`);

  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
