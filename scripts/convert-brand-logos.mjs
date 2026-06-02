/**
 * Converts PDF-compatible .ai brand files to PNG for web use.
 * Run: node scripts/convert-brand-logos.mjs
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pdf } from "pdf-to-img";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brandDir = path.join(__dirname, "..", "public", "assets", "brand");

const JOBS = [
  {
    input: "SEBANG_BI_ROCKET_190904.ai",
    output: "rocket-logo.png",
    scale: 4,
  },
  {
    input: "hyundaisungwoo-solite-battery.ai",
    output: "solite-logo.png",
    scale: 4,
  },
];

async function convertOne({ input, output, scale }) {
  const inputPath = path.join(brandDir, input);
  const outputPath = path.join(brandDir, output);
  const doc = await pdf(inputPath, { scale });
  let page = 0;
  for await (const image of doc) {
    page += 1;
    if (page === 1) {
      const trimmed = await sharp(image)
        .trim({ threshold: 14 })
        .resize({ height: 280, fit: "inside", withoutEnlargement: true })
        .png()
        .toBuffer();
      await writeFile(outputPath, trimmed);
      const meta = await sharp(trimmed).metadata();
      console.log(`Wrote ${outputPath} (${trimmed.length} bytes, ${meta.width}x${meta.height})`);
      break;
    }
  }
  if (page === 0) throw new Error(`No pages in ${input}`);
}

for (const job of JOBS) {
  await convertOne(job);
}
