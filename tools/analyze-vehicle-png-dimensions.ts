#!/usr/bin/env npx tsx
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public", "assets", "cars-normalized");

type FileMeta = { w: number; h: number; ratio: number; brand: string; file: string };

async function walk(dir: string, brand: string, out: FileMeta[]) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) await walk(p, f, out);
    else if (f.toLowerCase().endsWith(".png")) {
      const m = await sharp(p).metadata();
      const w = m.width ?? 0;
      const h = m.height ?? 0;
      out.push({ w, h, ratio: w / h, brand, file: f });
    }
  }
}

function bucket(r: number) {
  const tol = 0.03;
  if (Math.abs(r - 16 / 9) < tol) return "16:9";
  if (Math.abs(r - 4 / 3) < tol) return "4:3";
  if (Math.abs(r - 3 / 2) < tol) return "3:2";
  return "other";
}

async function sampleCarWidthRatio(files: FileMeta[], n = 20) {
  let sum = 0;
  let count = 0;
  const pick = files.filter((_, i) => i % Math.ceil(files.length / n) === 0).slice(0, n);
  for (const f of pick) {
    const p = path.join(ROOT, f.brand, f.file);
    const resized = await sharp(p).resize(320, 180, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
    const { data, info } = resized;
    const { width, height, channels } = info;
    let minX = width;
    let maxX = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * channels;
        if (data[i] < 245 || data[i + 1] < 245 || data[i + 2] < 245) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
        }
      }
    }
    if (maxX > minX) {
      sum += (maxX - minX + 1) / width;
      count++;
    }
  }
  return count ? sum / count : 0;
}

async function main() {
  const files: FileMeta[] = [];
  await walk(ROOT, "", files);
  const dimCount = new Map<string, number>();
  for (const f of files) {
    const k = `${f.w}x${f.h}`;
    dimCount.set(k, (dimCount.get(k) ?? 0) + 1);
  }
  const ratios = files.map((f) => f.ratio);
  const avg = ratios.reduce((a, b) => a + b, 0) / Math.max(ratios.length, 1);
  const buckets: Record<string, number> = { "16:9": 0, "4:3": 0, "3:2": 0, other: 0 };
  for (const f of files) buckets[bucket(f.ratio)]++;

  const carWidth = await sampleCarWidthRatio(files, 24);

  console.log(JSON.stringify({
    total: files.length,
    topDimensions: [...dimCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
    averageRatio: Number(avg.toFixed(4)),
    averageRatioLabel: `${(avg * 9).toFixed(2)}:9`,
    ratioBuckets: buckets,
    normalizeCanvas: "640x360 (16:9)",
    sampledCarWidthRatio: Number(carWidth.toFixed(3)),
  }, null, 2));
}

main();
