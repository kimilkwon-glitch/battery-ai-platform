#!/usr/bin/env node
/**
 * 차량 PNG 일괄 정규화
 * 원본: public/assets/cars/{brand}/*.png
 * 결과: public/assets/cars-normalized/{brand}/*.png
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BRANDS = ["hyundai", "kia"];

const CANVAS_STANDARD = { w: 420, h: 260 };
const CANVAS_COMMERCIAL = { w: 460, h: 260 };

function isCommercial(filename) {
  return /porter|bongo/i.test(filename);
}

function rgbDistance(r1, g1, b1, r2, g2, b2) {
  return Math.hypot(r1 - r2, g1 - g2, b1 - b2);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

/** 가장자리 픽셀에서 배경색 추정 */
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

/** 가장자리와 연결된 밝은 배경을 #ffffff로 치환 */
function floodFillEdgeBackground(data, width, height, channels, bg, threshold) {
  const out = Buffer.from(data);
  const visited = new Uint8Array(width * height);
  const stack = [];

  const isBackgroundPixel = (r, g, b) => {
    const dist = rgbDistance(r, g, b, bg[0], bg[1], bg[2]);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const neutral = Math.max(r, g, b) - Math.min(r, g, b) < 28;
    return dist <= threshold || (lum >= 190 && neutral && dist <= threshold + 22);
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
    out[i] = 255;
    out[i + 1] = 255;
    out[i + 2] = 255;
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
  const cleaned = floodFillEdgeBackground(
    data,
    info.width,
    info.height,
    info.channels,
    bg,
    36,
  );

  await sharp(cleaned, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .trim({ threshold: 12, background: { r: 255, g: 255, b: 255 } })
    .resize(canvas.w, canvas.h, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);
}

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
        await normalizeFile(input, output, file);
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
