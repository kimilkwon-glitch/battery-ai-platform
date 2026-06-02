/**
 * AI(PDF 호환) 브랜드 원본 → 개별 로고 PNG export (한 캔버스에 여러 로고가 있으면 영역 분리)
 * Run: npm run brand-logos
 *
 * Sources:
 * - public/assets/brand/SEBANG_BI_ROCKET_190904.ai
 * - public/assets/brand/hyundaisungwoo-solite.ai
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pdf } from "pdf-to-img";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brandDir = path.join(__dirname, "..", "public", "assets", "brand");

const MIN_BOX_AREA = 12_000;
const MIN_BOX_SIDE = 48;

function isInkAt(data, idx, channels) {
  const r = data[idx];
  const g = data[idx + 1];
  const b = data[idx + 2];
  const a = channels === 4 ? data[idx + 3] : 255;
  if (a < 16) return false;
  return r + g + b < 720;
}

/** Downscaled mask에서 연결 요소 bbox 목록 (좌표는 downscale 기준) */
function findInkBoxes(data, width, height, channels) {
  const visited = new Uint8Array(width * height);
  const boxes = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (visited[p]) continue;
      const idx = p * channels;
      if (!isInkAt(data, idx, channels)) continue;

      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let count = 0;
      const stack = [[x, y]];

      while (stack.length) {
        const [cx, cy] = stack.pop();
        const cp = cy * width + cx;
        if (cx < 0 || cy < 0 || cx >= width || cy >= height || visited[cp]) continue;
        const cidx = cp * channels;
        if (!isInkAt(data, cidx, channels)) continue;
        visited[cp] = 1;
        count += 1;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }

      const w = maxX - minX + 1;
      const h = maxY - minY + 1;
      if (count < 80 || w * h < MIN_BOX_AREA || w < MIN_BOX_SIDE || h < MIN_BOX_SIDE) continue;
      boxes.push({ minX, minY, w, h, area: w * h });
    }
  }

  return boxes.sort((a, b) => b.area - a.area);
}

function scaleBoxesToFull(boxes, info, meta) {
  const scaleX = (meta.width ?? info.width) / info.width;
  const scaleY = (meta.height ?? info.height) / info.height;
  return boxes.map((b) => {
    const pad = Math.round(Math.max(b.w, b.h) * 0.06);
    const left = Math.max(0, Math.floor((b.minX - pad) * scaleX));
    const top = Math.max(0, Math.floor((b.minY - pad) * scaleY));
    const width = Math.min(
      (meta.width ?? info.width) - left,
      Math.ceil((b.w + pad * 2) * scaleX),
    );
    const height = Math.min(
      (meta.height ?? info.height) - top,
      Math.ceil((b.h + pad * 2) * scaleY),
    );
    return { left, top, width, height, area: b.area };
  });
}

/** 가로로 이어진 여러 로고 — 열 단위 잉크 비율로 분할 */
function splitWideBoxByColumns(data, width, height, channels, box) {
  const colInk = new Float32Array(box.w);
  for (let x = box.minX; x <= box.minX + box.w - 1; x++) {
    let ink = 0;
    for (let y = box.minY; y <= box.minY + box.h - 1; y++) {
      const idx = (y * width + x) * channels;
      if (isInkAt(data, idx, channels)) ink += 1;
    }
    colInk[x - box.minX] = ink / box.h;
  }

  const MIN_COLS = Math.max(MIN_BOX_SIDE, Math.floor(box.w * 0.06));
  const segments = [];
  let start = null;

  const maxInk = Math.max(...colInk);
  const gapThreshold = Math.min(0.1, maxInk * 0.35);

  for (let x = 0; x < box.w; x++) {
    const empty = colInk[x] <= gapThreshold;
    if (!empty && start == null) start = x;
    if ((empty || x === box.w - 1) && start != null) {
      const end = empty ? x - 1 : x;
      const w = end - start + 1;
      if (w >= MIN_COLS) {
        segments.push({
          minX: box.minX + start,
          minY: box.minY,
          w,
          h: box.h,
          area: w * box.h,
        });
      }
      start = null;
    }
  }

  if (segments.length > 1) return segments;

  /** 잉크가 끊기지 않으면 열 밀도 local minimum으로 분할 시도 */
  const cuts = [0];
  for (let x = 2; x < box.w - 2; x++) {
    const v = colInk[x];
    if (
      v <= gapThreshold &&
      v <= colInk[x - 1] &&
      v <= colInk[x + 1] &&
      v <= colInk[x - 2] &&
      v <= colInk[x + 2]
    ) {
      cuts.push(x);
    }
  }
  cuts.push(box.w - 1);
  const uniq = [...new Set(cuts)].sort((a, b) => a - b);

  if (uniq.length >= 3) {
    const byValley = [];
    for (let i = 0; i < uniq.length - 1; i++) {
      const a = uniq[i];
      const b = uniq[i + 1];
      const w = b - a;
      if (w < MIN_COLS) continue;
      byValley.push({
        minX: box.minX + a,
        minY: box.minY,
        w,
        h: box.h,
        area: w * box.h,
      });
    }
    if (byValley.length > 1) return byValley;
  }

  /** 로고 사이 여백이 없으면 가로 균등 분할(아트보드에 나란히 배치된 경우) */
  if (box.w > box.h * 4) {
    const parts = Math.min(8, Math.max(2, Math.round(box.w / box.h / 2.2)));
    const slice = Math.floor(box.w / parts);
    const equal = [];
    for (let i = 0; i < parts; i++) {
      const w = i === parts - 1 ? box.w - slice * i : slice;
      if (w >= MIN_COLS) {
        equal.push({
          minX: box.minX + slice * i,
          minY: box.minY,
          w,
          h: box.h,
          area: w * box.h,
        });
      }
    }
    if (equal.length > 1) return equal;
  }

  return [box];
}

async function detectLogoBoxes(pngBuffer) {
  const meta = await sharp(pngBuffer).metadata();
  const targetW = Math.min(1600, meta.width ?? 1600);
  const { data, info } = await sharp(pngBuffer)
    .ensureAlpha()
    .resize({ width: targetW, withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let boxes = findInkBoxes(data, info.width, info.height, info.channels);
  const expanded = [];
  for (const b of boxes) {
    if (b.w > b.h * 2.2) {
      expanded.push(...splitWideBoxByColumns(data, info.width, info.height, info.channels, b));
    } else {
      expanded.push(b);
    }
  }
  boxes = expanded.sort((a, b) => b.area - a.area);

  return scaleBoxesToFull(boxes, info, meta);
}

async function renderFirstPage(inputPath, scale) {
  const doc = await pdf(inputPath, { scale });
  for await (const image of doc) {
    return sharp(image).ensureAlpha().png().toBuffer();
  }
  throw new Error(`No pages in ${inputPath}`);
}

async function exportPng(buffer, outputPath, maxHeight) {
  const trimmed = await sharp(buffer)
    .trim({ threshold: 18 })
    .resize({ height: maxHeight, fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
  await writeFile(outputPath, trimmed);
  const meta = await sharp(trimmed).metadata();
  return { path: outputPath, width: meta.width ?? 0, height: meta.height ?? 0, bytes: trimmed.length };
}

/** 밝기 평균 — 어두운 배경용(밝은 로고) vs 밝은 배경용(진한 로고) 분류 */
async function meanLuminance(buffer) {
  const { data, info } = await sharp(buffer)
    .resize({ width: 120, withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let sum = 0;
  let n = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r + g + b > 740) continue;
    sum += (r + g + b) / 3;
    n += 1;
  }
  return n ? sum / n : 128;
}

const JOBS = [
  {
    input: "SEBANG_BI_ROCKET_190904.ai",
    prefix: "rocket",
    scale: 4,
    maxHeight: 280,
  },
  {
    input: "hyundaisungwoo-solite.ai",
    prefix: "solite",
    scale: 4,
    maxHeight: 280,
  },
];

async function convertBrand({ input, prefix, scale, maxHeight }) {
  const inputPath = path.join(brandDir, input);
  const page = await renderFirstPage(inputPath, scale);
  const boxes = await detectLogoBoxes(page);

  const extracts =
    boxes.length > 0
      ? await Promise.all(
          boxes.map((b) =>
            sharp(page)
              .extract({
                left: b.left,
                top: b.top,
                width: b.width,
                height: b.height,
              })
              .png()
              .toBuffer(),
          ),
        )
      : [page];

  const variantDir = path.join(brandDir, "_variants", prefix);
  await import("node:fs/promises").then((fs) => fs.mkdir(variantDir, { recursive: true }));

  const scored = [];
  for (let i = 0; i < extracts.length; i++) {
    const out = path.join(variantDir, `${prefix}-variant-${i + 1}.png`);
    const meta = await exportPng(extracts[i], out, maxHeight);
    const lum = await meanLuminance(extracts[i]);
    scored.push({ ...meta, lum, index: i });
  }

  /** 배너용: 극단적 와이드 스트립보다 가로형 단일 로고(종횡비 1.5~8) 우선 */
  const bannerScore = (s) => {
    const ar = s.width / Math.max(s.height, 1);
    const arPenalty = ar > 10 ? -1e6 : ar < 1.2 ? -5e5 : 0;
    return s.width * s.height + arPenalty;
  };
  scored.sort((a, b) => bannerScore(b) - bannerScore(a));
  const primary = scored[0];
  if (!primary) throw new Error(`No logo extracted from ${input}`);

  const lightCandidates = scored.filter((s) => s.lum > 150).sort((a, b) => b.lum - a.lum);
  const darkCandidates = scored.filter((s) => s.lum <= 150).sort((a, b) => a.lum - b.lum);

  const light = lightCandidates[0] ?? primary;
  const dark = darkCandidates[0] ?? primary;

  const outputs = [
    { src: path.join(brandDir, `${prefix}-logo.png`), from: primary.path },
    { src: path.join(brandDir, `${prefix}-logo-light.png`), from: light.path },
    { src: path.join(brandDir, `${prefix}-logo-dark.png`), from: dark.path },
  ];

  const fs = await import("node:fs/promises");
  for (const { src, from } of outputs) {
    await fs.copyFile(from, src);
    console.log(`Wrote ${path.basename(src)} ← ${path.basename(from)}`);
  }

  console.log(
    `${prefix}: ${scored.length} variant(s), primary ${primary.width}x${primary.height}, light lum=${light.lum.toFixed(0)}, dark lum=${dark.lum.toFixed(0)}`,
  );

  return {
    primary: `${prefix}-logo.png`,
    light: `${prefix}-logo-light.png`,
    dark: `${prefix}-logo-dark.png`,
    width: primary.width,
    height: primary.height,
  };
}

for (const job of JOBS) {
  await convertBrand(job);
}
