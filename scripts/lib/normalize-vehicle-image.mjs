/**
 * 차량 PNG 노멀라이즈 — 흰 배경 · 16:9 캔버스 · 통일 스케일/위치
 */
import sharp from "sharp";

/** 카드 UI와 동일 16:9 */
export const CANVAS_W = 640;
export const CANVAS_H = 360;
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

const COMMERCIAL_RE =
  /porter|bongo|labo|damas|musso|staria|torres|mighty|truck|van|cargo|commercial/i;

export function isCommercialVehicleFile(filename) {
  return COMMERCIAL_RE.test(filename);
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

/** 가장자리와 연결된 배경을 흰색으로 치환 */
export function floodFillEdgeBackground(data, width, height, channels, bg, threshold) {
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

/**
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {string} filename
 */
export async function normalizeVehicleImageFile(inputPath, outputPath, filename) {
  const commercial = isCommercialVehicleFile(filename);
  const widthRatio = commercial ? 0.88 : 0.82;
  const verticalAnchor = 0.52;

  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const bg = sampleEdgeBackground(data, info.width, info.height, info.channels);
  const cleaned = floodFillEdgeBackground(data, info.width, info.height, info.channels, bg, 38);

  const trimmedBuf = await sharp(cleaned, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .trim({ threshold: 12, background: WHITE })
    .png()
    .toBuffer();

  const targetCarW = Math.round(CANVAS_W * widthRatio);
  const maxCarH = Math.round(CANVAS_H * 0.9);

  const resizedBuf = await sharp(trimmedBuf)
    .resize({
      width: targetCarW,
      height: maxCarH,
      fit: "inside",
      withoutEnlargement: false,
      background: WHITE,
    })
    .png()
    .toBuffer();

  const carMeta = await sharp(resizedBuf).metadata();
  const carW = carMeta.width ?? targetCarW;
  const carH = carMeta.height ?? maxCarH;
  const left = Math.max(0, Math.floor((CANVAS_W - carW) / 2));
  const top = Math.max(0, Math.floor((CANVAS_H - carH) * verticalAnchor));

  await sharp({
    create: {
      width: CANVAS_W,
      height: CANVAS_H,
      channels: 3,
      background: WHITE,
    },
  })
    .composite([{ input: resizedBuf, left, top }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);
}
