#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Replicate from "replicate";
import { loadEnvLocal } from "./lib/load-env-local.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODEL = "black-forest-labs/flux-kontext-pro";
loadEnvLocal(ROOT);

async function main() {
  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) {
    console.error("REPLICATE_API_TOKEN missing");
    process.exit(1);
  }

  const replicate = new Replicate({ auth: token });
  const [owner, name] = MODEL.split("/");
  const model = await replicate.models.get(owner, name);
  const ver = await replicate.models.versions.get(owner, name, model.latest_version.id);
  const props = ver?.openapi_schema?.components?.schemas?.Input?.properties ?? {};
  const outputSchema = ver?.openapi_schema?.components?.schemas?.Output ?? null;

  const inputImage = props.input_image ?? null;
  const report = {
    checkedAt: new Date().toISOString(),
    modelId: MODEL,
    versionId: model.latest_version?.id,
    description: model.description,
    referenceInputParam: "input_image",
    urlDirectInput: inputImage?.format === "uri" || inputImage?.type === "string",
    promptParallel: Boolean(props.prompt),
    outputFormats: props.output_format?.enum ?? ["png", "jpg", "webp"],
    aspectRatioOptions: props.aspect_ratio?.enum ?? null,
    allInputParams: Object.keys(props),
    inputImageSchema: inputImage,
    outputSchema,
    suitableForStudioEdit: true,
    editUseCase:
      "Text-based image editing — transform reference photo into studio catalog image while preserving vehicle identity",
    estimatedCostNote: "~$0.05-0.10 per image (approx)",
    generationStrategy: "Case C — single input_image URL + edit prompt",
    maxReferenceUrlsPerRequest: 1,
  };

  const out = path.join(ROOT, "reports", "replicate-kontext-model-check.json");
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(report, null, 2), "utf8");

  console.log(`model: ${MODEL}`);
  console.log(`input_image URL: ${report.urlDirectInput}`);
  console.log(`prompt parallel: ${report.promptParallel}`);
  console.log(`output formats: ${report.outputFormats.join(", ")}`);
  console.log(`Saved: ${out}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
