#!/usr/bin/env node
/**
 * Replicate 테스트 차량 이미지 생성 (5대)
 * 저장: public/assets/cars-generated-review/{modelFolder}/{brand}/{imageFile}
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Replicate from "replicate";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const GENERATED_ROOT = path.join(PUBLIC, "assets", "cars-generated-review");
const MASTER_LIST = path.join(ROOT, "data", "vehicle-registry-image-master-list.json");

const OUTPUT_W = 1600;
const OUTPUT_H = 900;

const TEST_SLUGS = [
  "tucson-jm",
  "ssangyong-tivoli-air-2016",
  "ssangyong-tivoli-armour-2017",
  "kia-k9-2012",
  "chevrolet-cruze-2011",
];

const MODEL_PRESETS = {
  "flux-dev": {
    replicate: "black-forest-labs/flux-dev",
    folder: "flux-dev",
    reportFile: "replicate-test-vehicle-images-report.json",
    promptVersion: "v1",
  },
  "flux-1.1-pro": {
    replicate: "black-forest-labs/flux-1.1-pro",
    folder: "flux-1-1-pro",
    reportFile: "replicate-test-vehicle-images-flux-1-1-pro-report.json",
    promptVersion: "front-left-three-quarter-v2",
  },
};

const SLUG_VEHICLE_HINTS = {
  "tucson-jm": "first generation Hyundai Tucson JM, 2004-2009",
  "ssangyong-tivoli-air-2016":
    "SsangYong Tivoli Air / Tivoli XLV compact SUV, 2016-2020 Korean market",
  "ssangyong-tivoli-armour-2017": "SsangYong Tivoli Armour SUV, 2017 Korean market",
  "kia-k9-2012": "first generation Kia K9 / K900 luxury sedan, 2012 Korean market",
  "chevrolet-cruze-2011":
    "Chevrolet Cruze first generation J300 sedan, Korean market, 2011",
};

const PROMPT_V1_COMMON =
  "Realistic automotive studio product photograph of a single vehicle on a clean solid white (#FFFFFF) studio background, not transparent, no background removal, no cutout. Front three-quarter view at approximately 45 degrees, full vehicle visible and centered in frame with generous padding (roughly 8–12% side margins, 8–12% top margin, 12–14% bottom margin for floor shadow). Vehicle occupies about 80–84% of the image width. Soft natural floor shadow under the tires, clear body outline and contact shadow so white, silver, and gray paint remains readable against the white background. 16:9 landscape composition (1600x900), ecommerce vehicle catalog style, sharp focus, even studio lighting, no text, no watermark, no logo, no license plate text, no people, no props, no dramatic environment.";

const PROMPT_V2_ANGLE_BLOCK =
  "The car is shown in a front-left three-quarter view, camera positioned around 45 degrees from the front-left corner. Clearly show the front bumper, grille, left headlight, left side doors, side windows, and side body line. The vehicle must show both the front and one full side, not a straight front view, not a symmetrical front view, not a head-on front view. Do not center the vehicle as a flat front-facing portrait. Avoid perfectly symmetrical front composition. Wheels visible, especially both left-side wheels if possible. Full vehicle visible inside frame with generous padding. Clean solid white (#FFFFFF) studio background, opaque PNG style, soft natural floor shadow, clear body outline, ecommerce vehicle catalog image, 16:9 landscape composition, 1600x900. No text, no watermark, no logo, no license plate text, no people, no props, no transparent background, no background removal, no cutout.";

function parseModelArg() {
  const arg = process.argv.find((a) => a.startsWith("--model="));
  const raw = arg ? arg.split("=")[1]?.trim() : "flux-1.1-pro";
  const key = raw === "flux-1.1-pro" || raw === "flux-1-1-pro" ? "flux-1.1-pro" : raw;
  if (!MODEL_PRESETS[key]) {
    console.error(`Unknown --model=${raw}. Use flux-dev or flux-1.1-pro`);
    process.exit(1);
  }
  return { key, preset: MODEL_PRESETS[key] };
}

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

function bodyTypeLabel(bodyType) {
  const map = {
    sedan: "sedan",
    suv: "SUV",
    compactSuv: "compact SUV",
    ev: "electric vehicle",
    van: "van",
    truck: "commercial truck",
  };
  return map[bodyType] ?? bodyType ?? "vehicle";
}

function buildVehiclePrompt(row, promptVersion) {
  const year = row.representativeYear ?? row.yearFrom ?? "";
  const hint = SLUG_VEHICLE_HINTS[row.slug] ?? "";
  const ko = row.vehicleNameKo ? ` (${row.vehicleNameKo})` : "";

  if (promptVersion === "front-left-three-quarter-v2") {
    const lead = [
      `Realistic automotive studio product photograph of a ${year} ${row.vehicleNameEn}`,
      `generation ${row.generationCode}`,
      bodyTypeLabel(row.bodyType),
      hint,
      "Korean market model",
      ko.trim(),
    ]
      .filter(Boolean)
      .join(", ");
    return `${lead}. ${PROMPT_V2_ANGLE_BLOCK}`;
  }

  const specific = [
    `Realistic automotive studio product photograph of a ${year} ${row.vehicleNameEn}`,
    `(${row.vehicleNameKo}, Korean domestic market model)`,
    `generation ${row.generationCode}`,
    `${bodyTypeLabel(row.bodyType)}`,
    hint,
    "accurate generation-specific body shape and proportions",
    "blank license plate with no readable text or numbers",
    "no vehicle name text painted on the body",
  ]
    .filter(Boolean)
    .join(", ");
  return `${specific}. ${PROMPT_V1_COMMON}`;
}

function resolveOutputPath(row, modelFolder) {
  if (!row.imageFile?.trim()) return null;
  const dir = path.join(GENERATED_ROOT, modelFolder, row.brand);
  const abs = path.join(dir, row.imageFile);
  const publicPath = `/assets/cars-generated-review/${modelFolder}/${row.brand}/${row.imageFile}`;
  return { dir, abs, publicPath };
}

/** legacy flux-dev 결과를 flux-dev/ 서브폴더로 복사 보관 */
function migrateLegacyFluxDevFiles(rowsBySlug) {
  let copied = 0;
  for (const slug of TEST_SLUGS) {
    const row = rowsBySlug.get(slug);
    if (!row?.imageFile?.trim()) continue;
    const legacy = path.join(GENERATED_ROOT, row.brand, row.imageFile);
    const target = path.join(GENERATED_ROOT, "flux-dev", row.brand, row.imageFile);
    if (!existsSync(legacy)) continue;
    if (existsSync(target)) continue;
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(legacy, target);
    copied++;
    console.log(`[migrate] ${legacy} -> flux-dev/${row.brand}/${row.imageFile}`);
  }
  return copied;
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
    if (first && typeof first === "object" && typeof first.href === "string") return first.href;
  }
  if (output && typeof output === "object" && typeof output.url === "function") return output.url();
  return null;
}

function buildReplicateInput(preset, prompt) {
  if (preset.replicate.includes("flux-1.1-pro")) {
    return {
      prompt,
      aspect_ratio: "16:9",
      output_format: "png",
      output_quality: 100,
      safety_tolerance: 2,
      prompt_upsampling: false,
    };
  }
  return {
    prompt,
    aspect_ratio: "16:9",
    num_outputs: 1,
    num_inference_steps: 40,
    guidance: 3.5,
    output_format: "png",
    output_quality: 100,
    disable_safety_checker: false,
  };
}

async function generateOne(replicate, row, preset) {
  const out = resolveOutputPath(row, preset.folder);
  if (!out) throw new Error("imageFile missing in master list row");

  const prompt = buildVehiclePrompt(row, preset.promptVersion);
  const startedAt = new Date().toISOString();

  const rawOutput = await replicate.run(preset.replicate, {
    input: buildReplicateInput(preset, prompt),
  });

  const imageUrl = extractImageUrl(rawOutput);
  if (!imageUrl) throw new Error("Replicate returned no image URL");

  const downloaded = await downloadUrl(imageUrl);
  const pngBuf = await ensureOutputSpec(downloaded);

  mkdirSync(out.dir, { recursive: true });
  writeFileSync(out.abs, pngBuf);

  if (!existsSync(out.abs)) throw new Error("File not written after save");

  const savedMeta = await sharp(out.abs).metadata();

  return {
    slug: row.slug,
    brand: row.brand,
    imageFile: row.imageFile,
    prompt,
    model: preset.replicate,
    replicateImageUrl: imageUrl,
    outputPath: out.publicPath,
    savedPath: out.publicPath,
    absolutePath: out.abs,
    width: savedMeta.width,
    height: savedMeta.height,
    bytes: pngBuf.length,
    startedAt,
    finishedAt: new Date().toISOString(),
    status: "success",
  };
}

async function main() {
  loadEnvLocal();
  const { key: modelKey, preset } = parseModelArg();

  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) {
    console.error("REPLICATE_API_TOKEN missing — add to .env.local");
    process.exit(1);
  }
  if (!token.startsWith("r8_")) {
    console.warn("REPLICATE_API_TOKEN format looks invalid (expected r8_ prefix). Check .env.local.");
  }

  if (!existsSync(MASTER_LIST)) {
    console.error(`Master list not found: ${MASTER_LIST}`);
    process.exit(1);
  }

  const master = JSON.parse(readFileSync(MASTER_LIST, "utf8"));
  const rowsBySlug = new Map((master.rows ?? []).map((r) => [r.slug, r]));

  const migrated = migrateLegacyFluxDevFiles(rowsBySlug);
  if (migrated > 0) console.log(`[migrate] copied ${migrated} legacy file(s) to flux-dev/`);

  const replicate = new Replicate({ auth: token });
  const reportPath = path.join(ROOT, "reports", preset.reportFile);

  const results = [];
  for (const slug of TEST_SLUGS) {
    const row = rowsBySlug.get(slug);
    if (!row) {
      results.push({ slug, status: "failed", error: "slug not found in master list" });
      console.error(`[skip] ${slug}: not in master list`);
      continue;
    }

    console.log(`[generate] ${slug} (${row.vehicleNameKo}) [${modelKey}]...`);
    try {
      const result = await generateOne(replicate, row, preset);
      results.push(result);
      console.log(`[ok] ${slug} -> ${result.savedPath} (${result.width}x${result.height})`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({
        slug,
        brand: row.brand,
        imageFile: row.imageFile,
        model: preset.replicate,
        status: "failed",
        error: message,
        finishedAt: new Date().toISOString(),
      });
      console.error(`[fail] ${slug}: ${message}`);
    }
  }

  const success = results.filter((r) => r.status === "success");
  const failed = results.filter((r) => r.status === "failed");

  const report = {
    generatedAt: new Date().toISOString(),
    model: preset.replicate,
    modelKey,
    promptVersion: preset.promptVersion,
    outputSpec: {
      width: OUTPUT_W,
      height: OUTPUT_H,
      ratio: "16:9",
      format: "png",
      background: "#FFFFFF",
    },
    testSlugs: TEST_SLUGS,
    successCount: success.length,
    failureCount: failed.length,
    legacyFluxDevMigrated: migrated,
    results,
    savedFiles: success.map((r) => r.savedPath),
  };

  mkdirSync(path.dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("\n=== REPLICATE TEST GENERATION ===");
  console.log(`model: ${preset.replicate}`);
  console.log(`folder: cars-generated-review/${preset.folder}/`);
  console.log(`success: ${success.length}/${TEST_SLUGS.length}`);
  console.log(`report: ${reportPath}`);
  for (const r of success) console.log(`  ✓ ${r.savedPath}`);
  for (const r of failed) console.log(`  ✗ ${r.slug}: ${r.error}`);

  if (failed.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
