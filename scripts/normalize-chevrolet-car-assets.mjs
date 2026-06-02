#!/usr/bin/env node
/**
 * 쉐보레/GM대우 PNG — 사이트용 정규화 (회색 배경·통일 캔버스)
 * 입력/출력: public/assets/cars-normalized/chevrolet-gmdaewoo/*.png
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BRAND = "chevrolet-gmdaewoo";

const CANVAS_STANDARD = { w: 420, h: 260 };
const CANVAS_COMMERCIAL = { w: 460, h: 260 };
const BG = { r: 241, g: 245, b: 249, alpha: 1 };

function isCommercial(filename) {
  return /labo|damas|colorado|traverse|winstorm|captiva|trailblazer|orlando|equinox/i.test(filename);
}

function rgbDistance(r1, g1, b1, r2, g2, b2) {
  return Math.hypot(r1 - r2, g1 - g2, b1 - b2);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function sampleEdgeBackground(data, width, height, channels) {
  const rs = [];
  const gs = [];
  const bs = [];
  const step = Math.max(1, Math.floor(Math.min(width, height) / 48));

  const sample = (x, y) => {
    const i = (y * width + x) * channels;
    rs.push(data[i]);
    gs.push(data[i + 1]);
    bs.push(data[i + 2]);
  };

  for (let x = 0; x < width; x += step) {
    sample(x, 0);
    sample(x, height - 1);
  }
  for (let y = 0; y < height; y += step) {
    sample(0, y);
    sample(width - 1, y);
  }

  return [median(rs), median(gs), median(bs)];
}

function floodFillEdgeBackground(data, width, height, channels, bg, threshold) {
  const out = Buffer.from(data);
  const visited = new Uint8Array(width * height);
  const stack = [];

  const isBackgroundPixel = (r, g, b) => {
    const dist = rgbDistance(r, g, b, bg[0], bg[1], bg[2]);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const neutral = Math.max(r, g, b) - Math.min(r, g, b) < 32;
    return dist <= threshold || (lum >= 175 && neutral && dist <= threshold + 28);
  };

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * channels;
    if (!isBackgroundPixel(out[i], out[i + 1], out[i + 2])) return;
    visited[idx] = 1;
    stack.push([x, y]);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const i = (y * width + x) * channels;
    out[i] = BG.r;
    out[i + 1] = BG.g;
    out[i + 2] = BG.b;
    if (channels === 4) out[i + 3] = 255;

    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  return out;
}

async function normalizeFile(inputPath, outputPath, filename) {
  const canvas = isCommercial(filename) ? CANVAS_COMMERCIAL : CANVAS_STANDARD;

  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const bg = sampleEdgeBackground(data, info.width, info.height, info.channels);
  const cleaned = floodFillEdgeBackground(data, info.width, info.height, info.channels, bg, 40);

  const tmp = `${outputPath}.tmp.png`;
  await sharp(cleaned, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .trim({ threshold: 14, background: BG })
    .resize(canvas.w, canvas.h, {
      fit: "contain",
      background: BG,
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(tmp);

  await fs.rename(tmp, outputPath);
}

async function main() {
  const dir = path.join(ROOT, "public", "assets", "cars-normalized", BRAND);
  const files = (await fs.readdir(dir)).filter((f) => f.toLowerCase().endsWith(".png"));
  let ok = 0;
  const failed = [];

  for (const file of files) {
    const full = path.join(dir, file);
    try {
      await normalizeFile(full, full, file);
      ok += 1;
      console.log(`✓ ${BRAND}/${file}`);
    } catch (err) {
      failed.push(`${file}: ${err.message}`);
      console.error(`✗ ${file}`, err.message);
    }
  }

  console.log("\n--- normalize-chevrolet-car-assets ---");
  console.log(`Processed: ${ok} / ${files.length}`);
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
