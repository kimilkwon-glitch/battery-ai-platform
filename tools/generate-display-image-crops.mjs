#!/usr/bin/env node
/**
 * Display용 tight-crop PNG 생성 (원본 보존)
 * node tools/generate-display-image-crops.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const PAD_RATIO = 0.08;
const ALPHA_THRESHOLD = 16;

async function alphaBBox(input) {
  const img = sharp(input);
  const meta = await img.metadata();
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      if (data[i + 3] > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  return { meta, minX, minY, cw, ch };
}

async function cropDisplay(input, output, padRatio = PAD_RATIO) {
  const { meta, minX, minY, cw, ch } = await alphaBBox(input);
  const padX = Math.max(1, Math.round(cw * padRatio));
  const padY = Math.max(1, Math.round(ch * padRatio));
  const left = Math.max(0, minX - padX);
  const top = Math.max(0, minY - padY);
  const width = Math.min(meta.width - left, cw + padX * 2);
  const height = Math.min(meta.height - top, ch + padY * 2);
  mkdirSync(dirname(output), { recursive: true });
  await sharp(input).extract({ left, top, width, height }).png().toFile(output);
  const outMeta = await sharp(output).metadata();
  return {
    input,
    output,
    from: `${meta.width}x${meta.height}`,
    bbox: `${cw}x${ch}`,
    to: `${outMeta.width}x${outMeta.height}`,
  };
}

const jobs = [
  {
    input: "public/assets/batteries/CMF60L/01-main.png",
    output: "public/assets/batteries/display/solite-CMF60L-main.png",
  },
  {
    input: "public/assets/brand/sebang-logo-stacked.png",
    output: "public/assets/brand/sebang-logo-stacked-display.png",
  },
  {
    input: "public/assets/brand/solite-high-performance-logo-stacked.png",
    output: "public/assets/brand/solite-high-performance-logo-stacked-display.png",
  },
];

for (const job of jobs) {
  const result = await cropDisplay(job.input, job.output);
  console.log(JSON.stringify(result));
}
