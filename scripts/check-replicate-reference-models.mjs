#!/usr/bin/env node
/**
 * Replicate reference 모델 schema 확인 + 다중 URL 입력 가능 여부 정리
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Replicate from "replicate";
import { loadEnvLocal } from "./lib/load-env-local.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
loadEnvLocal(ROOT);

const MODELS = [
  "black-forest-labs/flux-1.1-pro",
  "black-forest-labs/flux-kontext-pro",
  "black-forest-labs/flux-redux-dev",
];

function analyzeReferenceCapability(modelId, inputSchema) {
  const props = inputSchema ?? {};
  const refFields = Object.entries(props).filter(([k, v]) => {
    const blob = `${k} ${v?.description ?? ""}`.toLowerCase();
    return (
      /image_prompt|input_image|redux_image|control_image|reference/i.test(k) ||
      (v?.format === "uri" && /image|photo|reference|redux|control/i.test(blob))
    );
  });

  const details = refFields.map(([name, v]) => ({
    paramName: name,
    type: v?.type ?? null,
    format: v?.format ?? null,
    description: v?.description ?? null,
    isArray: v?.type === "array",
    maxItems: v?.maxItems ?? null,
  }));

  const primary = details[0] ?? null;
  let maxReferenceUrls = 1;
  let urlDirectInput = false;
  let promptParallel = false;

  if (primary) {
    urlDirectInput = primary.format === "uri" || primary.type === "string";
    if (primary.isArray) maxReferenceUrls = primary.maxItems ?? 2;
    else maxReferenceUrls = 1;
  }

  if (modelId.includes("flux-1.1-pro")) {
    promptParallel = Boolean(props.prompt);
    maxReferenceUrls = 1;
  } else if (modelId.includes("kontext")) {
    promptParallel = Boolean(props.prompt);
    maxReferenceUrls = 1;
  } else if (modelId.includes("redux")) {
    promptParallel = false;
    maxReferenceUrls = 1;
  }

  const generationCase =
    maxReferenceUrls >= 5 ? "A" : maxReferenceUrls >= 2 ? "B" : maxReferenceUrls === 1 ? "C" : "D";

  return {
    referenceParamNames: details.map((d) => d.paramName),
    referenceFields: details,
    urlDirectInputPossible: urlDirectInput,
    maxReferenceUrlsPerRequest: maxReferenceUrls,
    promptCanBeUsedTogether: promptParallel,
    generationStrategyCase: generationCase,
    suitableForThisTask: urlDirectInput && maxReferenceUrls >= 1,
  };
}

async function main() {
  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) {
    console.error("REPLICATE_API_TOKEN missing");
    process.exit(1);
  }

  const replicate = new Replicate({ auth: token });
  const models = [];

  for (const modelId of MODELS) {
    const [owner, name] = modelId.split("/");
    try {
      const model = await replicate.models.get(owner, name);
      const versionId = model.latest_version?.id;
      const ver = versionId ? await replicate.models.versions.get(owner, name, versionId) : null;
      const inputSchema = ver?.openapi_schema?.components?.schemas?.Input?.properties ?? {};
      const ref = analyzeReferenceCapability(modelId, inputSchema);

      const entry = {
        modelId,
        versionId,
        description: model.description?.slice(0, 300) ?? null,
        allInputParams: Object.keys(inputSchema),
        ...ref,
        estimatedCostNote:
          modelId.includes("flux-1.1-pro")
            ? "~$0.04/image (approx)"
            : modelId.includes("kontext-pro")
              ? "~$0.05-0.10/image (approx)"
              : "~$0.025/image (approx)",
      };
      models.push(entry);

      console.log(`\n=== ${modelId} ===`);
      console.log(`reference params: ${entry.referenceParamNames.join(", ") || "none"}`);
      console.log(`URL direct: ${entry.urlDirectInputPossible}`);
      console.log(`max refs/request: ${entry.maxReferenceUrlsPerRequest}`);
      console.log(`prompt parallel: ${entry.promptCanBeUsedTogether}`);
      console.log(`strategy case: ${entry.generationStrategyCase}`);
    } catch (err) {
      models.push({
        modelId,
        error: err instanceof Error ? err.message : String(err),
        suitableForThisTask: false,
      });
      console.log(`\n=== ${modelId} === ERROR`);
    }
  }

  const suitable = models.filter((m) => m.suitableForThisTask);
  const recommended =
    suitable.find((m) => m.modelId === "black-forest-labs/flux-1.1-pro") ??
    suitable.find((m) => m.promptCanBeUsedTogether) ??
    suitable[0] ??
    null;

  const out = {
    checkedAt: new Date().toISOString(),
    summary: {
      multiReferenceSupported: models.some((m) => (m.maxReferenceUrlsPerRequest ?? 0) >= 5),
      recommendedModel: recommended?.modelId ?? null,
      recommendedReason: recommended
        ? `${recommended.modelId}: Case ${recommended.generationStrategyCase}, param=${recommended.referenceParamNames?.[0]}, prompt+ref=${recommended.promptCanBeUsedTogether}`
        : "No suitable model",
      generationStrategyForThisRun: recommended?.generationStrategyCase ?? "D",
      useReferenceCountPerVehicle: recommended?.maxReferenceUrlsPerRequest ?? 0,
    },
    models,
  };

  const outPath = path.join(ROOT, "reports", "replicate-reference-model-candidates.json");
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log(`\nSaved: ${outPath}`);
  console.log(`Recommended: ${out.summary.recommendedModel} (Case ${out.summary.generationStrategyForThisRun})`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
