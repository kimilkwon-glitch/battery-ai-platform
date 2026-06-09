#!/usr/bin/env node
/**
 * flux-kontext-pro reference URL 기반 스튜디오 변환 (테스트 2대)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Replicate from "replicate";
import sharp from "sharp";
import { loadEnvLocal } from "./lib/load-env-local.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const OUTPUT_ROOT = path.join(PUBLIC, "assets", "cars-generated-review", "reference-based-kontext");
const CANDIDATES = path.join(ROOT, "reports", "vehicle-reference-candidates-test2-kontext.json");
const SCHEMA = path.join(ROOT, "reports", "replicate-kontext-model-check.json");
const MODEL = "black-forest-labs/flux-kontext-pro";
const OUTPUT_W = 1600;
const OUTPUT_H = 900;

const KONTEXT_BASE =
  "Edit the provided reference vehicle image into a clean studio catalog image. Preserve the vehicle generation, body shape, grille, headlights, wheelbase, and overall silhouette of the referenced car. Remove the outdoor background, remove any watermark, QR code, overlaid text, and license plate text. Convert the scene into a realistic automotive studio product photograph on a solid pure white (#FFFFFF) background with a soft natural floor shadow under the tires. Show the full vehicle in a front-left three-quarter view if possible, with both the front fascia and side profile visible. Keep the car centered with balanced padding. 16:9 landscape composition, 1600x900, ecommerce vehicle catalog style. No people, no props, no transparent background, no text, no logo, no watermark.";

const SLUG_HINTS = {
  "ssangyong-tivoli-air-2016":
    "SsangYong Tivoli Air 2016 / Tivoli XLV, Korean market compact SUV",
  "tucson-jm": "first generation Hyundai Tucson JM, Korean market model, 2004-2009",
};

function bodyTypeLabel(bodyType) {
  const map = { sedan: "sedan", suv: "SUV", compactSuv: "compact SUV" };
  return map[bodyType] ?? bodyType ?? "vehicle";
}

function buildPrompt(row) {
  const year = row.representativeYear ?? row.yearFrom ?? "";
  const hint = SLUG_HINTS[row.slug] ?? "";
  const ko = row.vehicleNameKo ? ` (${row.vehicleNameKo})` : "";
  return [
    KONTEXT_BASE,
    `Vehicle: ${year} ${row.vehicleNameEn}, generation ${row.generationCode}, ${bodyTypeLabel(row.bodyType)}.`,
    hint,
    "Korean market model",
    ko,
  ]
    .filter(Boolean)
    .join(" ");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function redact(msg) {
  return msg.replace(/r8_[A-Za-z0-9]+/g, "[REDACTED]");
}

async function downloadUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function ensureOutputSpec(buf) {
  const meta = await sharp(buf).metadata();
  if (meta.width === OUTPUT_W && meta.height === OUTPUT_H && meta.format === "png") {
    return sharp(buf).png({ compressionLevel: 9 }).toBuffer();
  }
  return sharp(buf)
    .resize(OUTPUT_W, OUTPUT_H, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function extractImageUrl(output) {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length > 0) {
    const first = output[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && typeof first.url === "function") return first.url();
  }
  if (output && typeof output === "object" && typeof output.url === "function") return output.url();
  return null;
}

async function generateWithRetry(replicate, vehicle, row, schemaSummary, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await generateOne(replicate, vehicle, row, schemaSummary);
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const m = msg.match(/retry_after":(\d+)/);
      const wait = m ? Number(m[1]) * 1000 + 2000 : 12000;
      if (/429|throttl/i.test(msg) && i < attempts - 1) {
        console.log(`[retry] ${row.slug} in ${Math.round(wait / 1000)}s...`);
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

async function generateOne(replicate, vehicle, row, schemaSummary) {
  const refUrl = vehicle.selectedReferenceUrl;
  if (!refUrl) throw new Error("no selectedReferenceUrl");

  const prompt = buildPrompt(row);
  const startedAt = new Date().toISOString();
  const outDir = path.join(OUTPUT_ROOT, row.brand);
  const outAbs = path.join(outDir, row.imageFile);
  const publicPath = `/assets/cars-generated-review/reference-based-kontext/${row.brand}/${row.imageFile}`;

  const rawOutput = await replicate.run(MODEL, {
    input: {
      prompt,
      input_image: refUrl,
      aspect_ratio: "16:9",
      output_format: "png",
      safety_tolerance: 2,
      prompt_upsampling: false,
    },
  });

  const imageUrl = extractImageUrl(rawOutput);
  if (!imageUrl) throw new Error("no output image URL");

  const buf = await ensureOutputSpec(await downloadUrl(imageUrl));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outAbs, buf);
  const meta = await sharp(outAbs).metadata();

  return {
    slug: row.slug,
    brand: row.brand,
    imageFile: row.imageFile,
    model: MODEL,
    selectedReferenceUrl: refUrl,
    selectedReferenceReason: vehicle.selectedReferenceReason,
    urlSwapped: vehicle.urlSwapped ?? false,
    prompt,
    outputPath: publicPath,
    width: meta.width,
    height: meta.height,
    bytes: buf.length,
    schemaSummary,
    startedAt,
    finishedAt: new Date().toISOString(),
    elapsedMs: Date.now() - new Date(startedAt).getTime(),
    status: "success",
  };
}

async function main() {
  loadEnvLocal(ROOT);
  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) {
    console.error("REPLICATE_API_TOKEN missing");
    process.exit(1);
  }

  if (!existsSync(CANDIDATES)) {
    console.error("Run prepare-kontext-test2-candidates first");
    process.exit(1);
  }

  const candidates = JSON.parse(readFileSync(CANDIDATES, "utf8"));
  const schemaSummary = existsSync(SCHEMA)
    ? JSON.parse(readFileSync(SCHEMA, "utf8"))
    : { modelId: MODEL, referenceInputParam: "input_image" };

  const master = JSON.parse(
    readFileSync(path.join(ROOT, "data", "vehicle-registry-image-master-list.json"), "utf8"),
  );
  const rowsBySlug = new Map((master.rows ?? []).map((r) => [r.slug, r]));

  const replicate = new Replicate({ auth: token });
  const results = [];

  for (const vehicle of candidates.vehicles) {
    const row = rowsBySlug.get(vehicle.slug);
    if (!row) {
      results.push({ slug: vehicle.slug, status: "failed", error: "slug not in master list" });
      continue;
    }
    if (!vehicle.generationAllowed || !vehicle.selectedReferenceUrl) {
      results.push({
        slug: vehicle.slug,
        status: "skipped",
        error: vehicle.selectedReferenceReason ?? "no Replicate-accessible reference URL",
        selectedReferenceUrl: null,
        selectedReferenceReason: vehicle.selectedReferenceReason,
      });
      console.log(`[skip] ${vehicle.slug}: ${vehicle.selectedReferenceReason}`);
      continue;
    }

    console.log(`[generate] ${vehicle.slug} kontext...`);
    try {
      const result = await generateWithRetry(replicate, vehicle, row, schemaSummary);
      results.push(result);
      console.log(`[ok] ${vehicle.slug} -> ${result.outputPath}`);
      await sleep(12000);
    } catch (err) {
      const message = redact(err instanceof Error ? err.message : String(err));
      results.push({
        slug: vehicle.slug,
        brand: row.brand,
        model: MODEL,
        selectedReferenceUrl: vehicle.selectedReferenceUrl,
        selectedReferenceReason: vehicle.selectedReferenceReason,
        status: "failed",
        error: message,
        finishedAt: new Date().toISOString(),
      });
      console.error(`[fail] ${vehicle.slug}: ${message}`);
    }
  }

  const success = results.filter((r) => r.status === "success");
  const failed = results.filter((r) => r.status === "failed");
  const skipped = results.filter((r) => r.status === "skipped");

  const report = {
    generatedAt: new Date().toISOString(),
    model: MODEL,
    referenceInputParam: "input_image",
    referenceInputMode: "Case C — single URL edit/transform",
    promptVersion: "kontext-studio-edit-v1",
    outputSpec: { width: OUTPUT_W, height: OUTPUT_H, ratio: "16:9", format: "png", background: "#FFFFFF" },
    schemaSummary,
    successCount: success.length,
    failureCount: failed.length,
    skippedCount: skipped.length,
    results,
    savedFiles: success.map((r) => r.outputPath),
  };

  const out = path.join(ROOT, "reports", "replicate-reference-based-kontext-test-report.json");
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(report, null, 2), "utf8");

  console.log("\n=== KONTEXT GENERATION ===");
  console.log(`success: ${success.length} failed: ${failed.length} skipped: ${skipped.length}`);
  console.log(`report: ${out}`);

  if (failed.length > 0) process.exit(1);
}

main().catch((e) => {
  console.error(redact(e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
