#!/usr/bin/env node
/**
 * hyundai/kia — cars → cars-normalized (레거시 원본 폴더가 있을 때)
 * 전체 일괄: npm run normalize:vehicles
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeVehicleImageFile } from "./lib/normalize-vehicle-image.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BRANDS = ["hyundai", "kia"];

async function main() {
  let ok = 0;
  const failed = [];

  for (const brand of BRANDS) {
    const srcDir = path.join(ROOT, "public", "assets", "cars", brand);
    const outDir = path.join(ROOT, "public", "assets", "cars-normalized", brand);
    await fs.mkdir(outDir, { recursive: true });

    let files;
    try {
      files = (await fs.readdir(srcDir)).filter((f) => f.toLowerCase().endsWith(".png"));
    } catch (err) {
      failed.push(`${brand}/*: source dir missing (${err.message})`);
      continue;
    }

    for (const file of files) {
      const input = path.join(srcDir, file);
      const output = path.join(outDir, file);
      try {
        await normalizeVehicleImageFile(input, output, file);
        ok += 1;
        console.log(`✓ ${brand}/${file}`);
      } catch (err) {
        failed.push(`${brand}/${file}: ${err.message}`);
        console.error(`✗ ${brand}/${file}`, err.message);
      }
    }
  }

  console.log("\n--- normalize-car-assets summary ---");
  console.log(`Processed: ${ok}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length) {
    console.log("Failures:");
    for (const line of failed) console.log(`  - ${line}`);
  }
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
