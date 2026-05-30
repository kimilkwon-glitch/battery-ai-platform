#!/usr/bin/env node
/**
 * 로고 PNG 투명 여백 제거 → battery-manager-logo-tight.png
 * 원본 1024×1024, opaque 영역 약 615×627 (좌우 ~200px 패딩)
 */
import sharp from "sharp";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "public/assets/brand/battery-manager-logo.png");
const dest = path.join(root, "public/assets/brand/battery-manager-logo-tight.png");

const buf = await sharp(src).trim({ threshold: 24 }).png().toBuffer();
await sharp(buf).toFile(dest);
const meta = await sharp(dest).metadata();
console.log(`Wrote ${dest} (${meta.width}×${meta.height})`);
