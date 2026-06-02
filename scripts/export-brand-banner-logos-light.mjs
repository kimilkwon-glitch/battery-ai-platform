#!/usr/bin/env node
/**
 * 다크 배너용 밝은 로고 PNG 생성 (rocket-logo-light.png, solite-logo-light.png)
 * Run: node scripts/export-brand-banner-logos-light.mjs
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brandDir = path.join(__dirname, "..", "public", "assets", "brand");

/** 어두운 잉크 → 밝은 톤(색상 유지), 흰 배경 → 투명 */
function lightenPixel(r, g, b, a, brand) {
  if (a < 12) return [0, 0, 0, 0];
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (lum > 235 && Math.max(r, g, b) - Math.min(r, g, b) < 24) {
    return [0, 0, 0, 0];
  }

  let nr = r;
  let ng = g;
  let nb = b;

  const pull = brand === "rocket" ? 0.82 : 0.78;
  const floor = brand === "rocket" ? 200 : 195;

  if (lum < 200) {
    const t = pull;
    nr = Math.round(r + (255 - r) * t);
    ng = Math.round(g + (255 - g) * t);
    nb = Math.round(b + (255 - b) * t);
  }

  if (brand === "rocket" && b > r + 18 && b > g + 10) {
    nr = Math.min(255, Math.round(nr * 0.55 + 120));
    ng = Math.min(255, Math.round(ng * 0.6 + 170));
    nb = Math.min(255, Math.round(nb * 0.35 + 255));
  } else if (brand === "rocket" && r > b + 20) {
    nr = Math.min(255, Math.round(nr * 0.4 + 248));
    ng = Math.min(255, Math.round(ng * 0.55 + 220));
    nb = Math.min(255, Math.round(nb * 0.65 + 200));
  }

  if (brand === "solite" && b > r + 8) {
    nr = Math.min(255, Math.round(nr * 0.5 + 235));
    ng = Math.min(255, Math.round(ng * 0.55 + 245));
    nb = Math.min(255, Math.round(nb * 0.35 + 255));
  }

  const outLum = 0.299 * nr + 0.587 * ng + 0.114 * nb;
  if (outLum < floor) {
    const boost = floor / Math.max(outLum, 1);
    nr = Math.min(255, Math.round(nr * boost));
    ng = Math.min(255, Math.round(ng * boost));
    nb = Math.min(255, Math.round(nb * boost));
  }

  return [nr, ng, nb, a];
}

async function exportLight(brand) {
  const input = path.join(brandDir, `${brand}-logo.png`);
  const output = path.join(brandDir, `${brand}-logo-light.png`);

  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b, a] = lightenPixel(
      data[i],
      data[i + 1],
      data[i + 2],
      info.channels === 4 ? data[i + 3] : 255,
      brand,
    );
    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    if (info.channels === 4) out[i + 3] = a;
  }

  const png = await sharp(out, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .trim({ threshold: 12 })
    .png()
    .toBuffer();

  await writeFile(output, png);
  const meta = await sharp(png).metadata();
  console.log(`Wrote ${path.basename(output)} (${meta.width}x${meta.height})`);
}

for (const brand of ["rocket", "solite"]) {
  await exportLight(brand);
}
