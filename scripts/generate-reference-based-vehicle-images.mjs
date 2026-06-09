#!/usr/bin/env node
/**
 * reference URL 기반 Replicate 생성 (테스트 5대)
 * 기본: black-forest-labs/flux-1.1-pro + image_prompt (단일 URL, Case C)
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
const OUTPUT_ROOT = path.join(PUBLIC, "assets", "cars-generated-review", "reference-based");
const CANDIDATES_REPORT = path.join(ROOT, "reports", "vehicle-reference-candidates-test5.json");
const SCHEMA_REPORT = path.join(ROOT, "reports", "replicate-reference-model-candidates.json");
const OUTPUT_W = 1600;
const OUTPUT_H = 900;

const TEST_SLUGS = [
  "tucson-jm",
  "ssangyong-tivoli-air-2016",
  "ssangyong-tivoli-armour-2017",
  "kia-k9-2012",
  "chevrolet-cruze-2011",
];

const SLUG_HINTS = {
  "tucson-jm": "first generation Hyundai Tucson JM, 2004-2009 Korean market SUV",
  "ssangyong-tivoli-air-2016":
    "SsangYong Tivoli Air / Tivoli XLV compact SUV, 2016-2020 Korean market",
  "ssangyong-tivoli-armour-2017": "SsangYong Tivoli Armour SUV, 2017 Korean market",
  "kia-k9-2012": "first generation Kia K9 / K900 luxury sedan, 2012 Korean market",
  "chevrolet-cruze-2011": "Chevrolet Cruze first generation J300 sedan, Korean market, 2011",
};

const STUDIO_PROMPT =
  "Realistic automotive studio product photograph of a single vehicle on a clean solid white (#FFFFFF) studio background, front-left three-quarter view, full vehicle visible, clear side profile and front fascia visible, soft natural floor shadow, 16:9 composition, 1600x900, ecommerce vehicle catalog style, no text, no watermark, no license plate text, no people, no props, no transparent background, no background removal, no cutout.";

function bodyTypeLabel(bodyType) {
  const map = { sedan: "sedan", suv: "SUV", compactSuv: "compact SUV", ev: "EV", van: "van", truck: "truck" };
  return map[bodyType] ?? bodyType ?? "vehicle";
}

function buildPrompt(row) {
  const year = row.representativeYear ?? row.yearFrom ?? "";
  const hint = SLUG_HINTS[row.slug] ?? "";
  const ko = row.vehicleNameKo ? ` (${row.vehicleNameKo})` : "";
  return [
    STUDIO_PROMPT,
    `Vehicle: ${year} ${row.vehicleNameEn}, generation ${row.generationCode}, ${bodyTypeLabel(row.bodyType)}`,
    hint,
    "Korean market model",
    ko,
    "Preserve exact generation-specific body shape, grille, headlights, proportions and model identity from the reference image.",
  ]
    .filter(Boolean)
    .join(" ");
}

function resolveOutput(row) {
  const dir = path.join(OUTPUT_ROOT, row.brand);
  const abs = path.join(dir, row.imageFile);
  return {
    dir,
    abs,
    publicPath: `/assets/cars-generated-review/reference-based/${row.brand}/${row.imageFile}`,
  };
}

function loadModelConfig() {
  if (!existsSync(SCHEMA_REPORT)) {
    return {
      model: "black-forest-labs/flux-1.1-pro",
      referenceParam: "image_prompt",
      maxRefs: 1,
      strategyCase: "C",
      promptParallel: true,
    };
  }
  const schema = JSON.parse(readFileSync(SCHEMA_REPORT, "utf8"));
  const modelId = schema.summary?.recommendedModel ?? "black-forest-labs/flux-1.1-pro";
  const m = schema.models?.find((x) => x.modelId === modelId);
  return {
    model: modelId,
    referenceParam: m?.referenceParamNames?.[0] ?? "image_prompt",
    maxRefs: m?.maxReferenceUrlsPerRequest ?? 1,
    strategyCase: m?.generationStrategyCase ?? "C",
    promptParallel: m?.promptCanBeUsedTogether ?? true,
  };
}

function pickReferenceUrls(vehicleReport, maxRefs) {
  const selected = vehicleReport.selectedReferenceUrl;
  if (!selected) return [];
  if (maxRefs <= 1) return [selected];
  const ranked = [...(vehicleReport.candidateImages ?? [])]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .map((c) => c.imageUrl)
    .filter(Boolean);
  const uniq = [...new Set([selected, ...ranked])];
  return uniq.slice(0, maxRefs);
}

function buildModelInput(modelConfig, prompt, referenceUrls) {
  const ref = referenceUrls[0];
  if (!ref) throw new Error("no reference URL");

  if (modelConfig.model.includes("flux-1.1-pro")) {
    return {
      prompt,
      image_prompt: ref,
      aspect_ratio: "16:9",
      output_format: "png",
      output_quality: 100,
      safety_tolerance: 2,
      prompt_upsampling: false,
    };
  }

  if (modelConfig.model.includes("kontext")) {
    return {
      prompt,
      input_image: ref,
      aspect_ratio: "16:9",
      output_format: "png",
      safety_tolerance: 2,
      prompt_upsampling: false,
    };
  }

  if (modelConfig.model.includes("redux")) {
    return {
      redux_image: ref,
      aspect_ratio: "16:9",
      output_format: "png",
      output_quality: 100,
      guidance: 3,
      num_inference_steps: 28,
    };
  }

  throw new Error(`unsupported model ${modelConfig.model}`);
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateWithRetry(replicate, modelConfig, vehicleReport, row, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await generateOne(replicate, modelConfig, vehicleReport, row);
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const m = msg.match(/retry_after":(\d+)/);
      const wait = m ? Number(m[1]) * 1000 + 1500 : 12000;
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

async function generateOne(replicate, modelConfig, vehicleReport, row) {
  const refUrls = pickReferenceUrls(vehicleReport, modelConfig.maxRefs);
  if (!refUrls.length) throw new Error("selectedReferenceUrl missing");

  const out = resolveOutput(row);
  const prompt = buildPrompt(row);
  const startedAt = new Date().toISOString();
  const input = buildModelInput(modelConfig, prompt, refUrls);

  const rawOutput = await replicate.run(modelConfig.model, { input });
  const imageUrl = extractImageUrl(rawOutput);
  if (!imageUrl) throw new Error("Replicate returned no image URL");

  const downloaded = await downloadUrl(imageUrl);
  const pngBuf = await ensureOutputSpec(downloaded);

  mkdirSync(out.dir, { recursive: true });
  writeFileSync(out.abs, pngBuf);

  const savedMeta = await sharp(out.abs).metadata();

  return {
    slug: row.slug,
    brand: row.brand,
    imageFile: row.imageFile,
    model: modelConfig.model,
    referenceInputMode: `Case ${modelConfig.strategyCase}`,
    referenceParam: modelConfig.referenceParam,
    referenceUrlsUsed: refUrls,
    referenceUrlCount: refUrls.length,
    selectedReferenceUrl: vehicleReport.selectedReferenceUrl,
    candidateImages: vehicleReport.candidateImages,
    prompt,
    outputPath: out.publicPath,
    width: savedMeta.width,
    height: savedMeta.height,
    bytes: pngBuf.length,
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

  if (!existsSync(CANDIDATES_REPORT)) {
    console.error(`Missing ${CANDIDATES_REPORT} — run collect first`);
    process.exit(1);
  }

  const modelConfig = loadModelConfig();
  if (modelConfig.strategyCase === "D" || !modelConfig.maxRefs) {
    console.error("Reference URL input not supported by available models (Case D). Stop.");
    process.exit(1);
  }

  const candidates = JSON.parse(readFileSync(CANDIDATES_REPORT, "utf8"));
  const bySlug = new Map(candidates.vehicles.map((v) => [v.slug, v]));

  const master = JSON.parse(readFileSync(path.join(ROOT, "data", "vehicle-registry-image-master-list.json"), "utf8"));
  const rowsBySlug = new Map((master.rows ?? []).map((r) => [r.slug, r]));

  const replicate = new Replicate({ auth: token });
  const results = [];

  for (const slug of TEST_SLUGS) {
    const vehicleReport = bySlug.get(slug);
    const row = rowsBySlug.get(slug);
    if (!row) {
      results.push({ slug, status: "failed", error: "slug not in master list" });
      continue;
    }
    if (!vehicleReport?.selectedReferenceUrl) {
      results.push({ slug, status: "failed", error: "no selectedReferenceUrl" });
      continue;
    }

    console.log(`[generate] ${slug} refs=${pickReferenceUrls(vehicleReport, modelConfig.maxRefs).length}...`);
    try {
      const result = await generateWithRetry(replicate, modelConfig, vehicleReport, row);
      results.push(result);
      console.log(`[ok] ${slug} -> ${result.outputPath}`);
      await sleep(12000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const safeMsg = message.replace(/r8_[A-Za-z0-9]+/g, "[REDACTED]");
      results.push({
        slug,
        brand: row.brand,
        model: modelConfig.model,
        selectedReferenceUrl: vehicleReport.selectedReferenceUrl,
        status: "failed",
        error: safeMsg,
        finishedAt: new Date().toISOString(),
      });
      console.error(`[fail] ${slug}: ${safeMsg}`);
    }
  }

  const success = results.filter((r) => r.status === "success");
  const failed = results.filter((r) => r.status === "failed");

  const report = {
    generatedAt: new Date().toISOString(),
    model: modelConfig.model,
    referenceInputMode: `Case ${modelConfig.strategyCase}`,
    referenceParam: modelConfig.referenceParam,
    maxReferenceUrlsPerRequest: modelConfig.maxRefs,
    promptVersion: "reference-url-studio-v1",
    outputSpec: { width: OUTPUT_W, height: OUTPUT_H, ratio: "16:9", format: "png", background: "#FFFFFF" },
    testSlugs: TEST_SLUGS,
    successCount: success.length,
    failureCount: failed.length,
    results,
    savedFiles: success.map((r) => r.outputPath),
  };

  const reportPath = path.join(ROOT, "reports", "replicate-reference-based-test-report.json");
  mkdirSync(path.dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("\n=== REFERENCE-BASED GENERATION ===");
  console.log(`model: ${modelConfig.model} (Case ${modelConfig.strategyCase})`);
  console.log(`refs/request: ${modelConfig.maxRefs}`);
  console.log(`success: ${success.length}/${TEST_SLUGS.length}`);
  console.log(`report: ${reportPath}`);

  if (failed.length > 0) process.exit(1);
}

main().catch((e) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(msg.replace(/r8_[A-Za-z0-9]+/g, "[REDACTED]"));
  process.exit(1);
});
