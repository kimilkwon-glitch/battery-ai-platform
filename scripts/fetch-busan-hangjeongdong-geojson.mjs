/**
 * Downloads Busan hangjeongdong GeoJSON from Local_HangJeongDong (master branch).
 * Strips properties to adm_nm, adm_cd, sggnm to reduce bundle size.
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_URL =
  "https://raw.githubusercontent.com/raqoon886/Local_HangJeongDong/master/hangjeongdong_%EB%B6%80%EC%82%B0%EA%B4%91%EC%97%AD%EC%8B%9C.geojson";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "assets", "maps");
const outFile = path.join(outDir, "busan-hangjeongdong.geojson");

const res = await fetch(SOURCE_URL);
if (!res.ok) throw new Error(`Download failed: ${res.status} ${SOURCE_URL}`);

const raw = await res.json();
const slim = {
  type: "FeatureCollection",
  features: raw.features.map((f) => ({
    type: "Feature",
    properties: {
      adm_nm: f.properties.adm_nm,
      adm_cd: f.properties.adm_cd,
      sggnm: f.properties.sggnm,
    },
    geometry: f.geometry,
  })),
};

await mkdir(outDir, { recursive: true });
await writeFile(outFile, JSON.stringify(slim));

console.log(
  JSON.stringify({
    ok: true,
    features: slim.features.length,
    bytes: JSON.stringify(slim).length,
    outFile: "public/assets/maps/busan-hangjeongdong.geojson",
  }),
);
