#!/usr/bin/env node
/** 빠른 시드 URL만 다운로드 (미수집 차량 보완) */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const REF_ROOT = path.join(PUBLIC, "assets", "vehicle-reference-candidates");

const JOBS = [
  {
    slug: "ssangyong-tivoli-armour-2017",
    brand: "ssangyong",
    files: [
      {
        name: "ref-01.jpg",
        url: "https://www.netcarshow.com/SsangYong-Tivoli-2016-Front_Three-Quarter.64c86b50.jpg",
      },
      {
        name: "ref-02.jpg",
        url: "https://www.netcarshow.com/SsangYong-Tivoli-2016-1280-5e0960ca32fbf1c197ccb6bf20664c6dfd.jpg",
      },
    ],
  },
  {
    slug: "kia-k9-2012",
    brand: "kia",
    files: [
      {
        name: "ref-01.jpg",
        url: "https://www.netcarshow.com/Kia-K900-2015-Front_Three-Quarter.e72bcd50.jpg",
      },
      {
        name: "ref-02.jpg",
        url: "https://www.netcarshow.com/Kia-K900-2015-1280-91fbbaeb59fe37bd0b3a6920901437d61a.jpg",
      },
    ],
  },
  {
    slug: "chevrolet-cruze-2011",
    brand: "chevrolet-gmdaewoo",
    files: [
      {
        name: "ref-01.jpg",
        url: "https://www.netcarshow.com/Chevrolet-Cruze-2011-Front_Three-Quarter.966192d2.jpg",
      },
      {
        name: "ref-02.jpg",
        url: "https://www.netcarshow.com/Chevrolet-Cruze-2011-1280-ec504a8b98019a06887a906dc1b02bf39f.jpg",
      },
    ],
  },
];

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": "battery-ai-platform/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf).jpeg({ quality: 92 }).toFile(dest);
  const m = await sharp(dest).metadata();
  return { width: m.width, height: m.height };
}

async function main() {
  for (const job of JOBS) {
    const dir = path.join(REF_ROOT, job.brand, job.slug);
    mkdirSync(dir, { recursive: true });
    for (const f of job.files) {
      const dest = path.join(dir, f.name);
      if (existsSync(dest)) {
        console.log(`[skip] ${job.slug}/${f.name} exists`);
        continue;
      }
      try {
        const m = await download(f.url, dest);
        console.log(`[ok] ${job.slug}/${f.name} ${m.width}x${m.height}`);
      } catch (e) {
        console.error(`[fail] ${job.slug}/${f.name}: ${e.message}`);
      }
    }
  }
}

main();
