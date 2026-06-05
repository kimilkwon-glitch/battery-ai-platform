/**
 * Baked checkerboard 제거 — edge flood-fill + 작은 체크무늬 섬 제거
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ICON_DIR = path.join(process.cwd(), "public", "assets", "quick-icons");

const FILES = [
  "quick-icon-maintenance-tip.png",
  "quick-icon-symptom-diagnosis.png",
  "quick-icon-battery-fault.png",
  "quick-icon-as-warranty.png",
  "quick-icon-qna.png",
  "quick-icon-deokcheon-ray.png",
  "quick-icon-hakjang-starex.png",
  "quick-icon-night-unmanned.png",
];

const SMALL_ISLAND_MAX = 12000;

function isCheckerSquare(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const avg = (r + g + b) / 3;
  if (chroma > 22) return false;
  if (avg >= 242 && chroma <= 14) return true;
  if (avg >= 175 && avg <= 230 && chroma <= 18) return true;
  return false;
}

function isOpaqueChecker(data, idx, channels) {
  const i = idx * channels;
  return data[i + 3] >= 8 && isCheckerSquare(data[i], data[i + 1], data[i + 2]);
}

function floodRemoveFromEdges(data, width, height, channels) {
  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = [];

  const push = (x, y) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    if (!isOpaqueChecker(data, idx, channels)) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    const x = idx % width;
    const y = (idx - x) / width;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }

  let removed = 0;
  for (let idx = 0; idx < total; idx++) {
    if (!visited[idx]) continue;
    data[idx * channels + 3] = 0;
    removed++;
  }
  return removed;
}

function removeSmallCheckerIslands(data, width, height, channels) {
  const total = width * height;
  const seen = new Uint8Array(total);
  let removed = 0;

  for (let start = 0; start < total; start++) {
    if (seen[start] || !isOpaqueChecker(data, start, channels)) continue;

    const queue = [start];
    const component = [];
    seen[start] = 1;

    let head = 0;
    while (head < queue.length) {
      const idx = queue[head++];
      component.push(idx);
      const x = idx % width;
      const y = (idx - x) / width;
      const neighbors = [
        x > 0 ? idx - 1 : -1,
        x < width - 1 ? idx + 1 : -1,
        y > 0 ? idx - width : -1,
        y < height - 1 ? idx + width : -1,
      ];
      for (const n of neighbors) {
        if (n < 0 || seen[n] || !isOpaqueChecker(data, n, channels)) continue;
        seen[n] = 1;
        queue.push(n);
      }
    }

    if (component.length <= SMALL_ISLAND_MAX) {
      for (const idx of component) {
        data[idx * channels + 3] = 0;
        removed++;
      }
    }
  }
  return removed;
}

async function processFile(file) {
  const fp = path.join(ICON_DIR, file);
  const before = fs.statSync(fp).size;
  const { data, info } = await sharp(fp).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const buf = Buffer.from(data);

  const edgeRemoved = floodRemoveFromEdges(buf, width, height, channels);
  const islandRemoved = removeSmallCheckerIslands(buf, width, height, channels);

  const tmp = fp + ".tmp.png";
  await sharp(buf, { raw: { width, height, channels } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(tmp);
  fs.renameSync(tmp, fp);

  let transparent = 0;
  let opaque = 0;
  let residualChecker = 0;
  for (let i = 0; i < buf.length; i += channels) {
    const a = buf[i + 3];
    if (a < 8) transparent++;
    else {
      opaque++;
      if (isCheckerSquare(buf[i], buf[i + 1], buf[i + 2])) residualChecker++;
    }
  }

  return {
    file,
    edgeRemoved,
    islandRemoved,
    transparent,
    opaque,
    residualChecker,
    before,
    after: fs.statSync(fp).size,
  };
}

for (const f of FILES) {
  console.log(JSON.stringify(await processFile(f)));
}
