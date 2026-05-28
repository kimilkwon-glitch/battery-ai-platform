/**
 * Asset inventory — batteries / cars / content
 */
import fs from "fs";
import path from "path";

const root = process.cwd();

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(png|jpg|jpeg|webp|svg)$/i.test(e.name)) out.push(p);
  }
  return out;
}

function listBatteryFolders() {
  const base = path.join(root, "public/assets/batteries");
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base).filter((d) => fs.statSync(path.join(base, d)).isDirectory());
}

const CORE = [
  "AGM60L",
  "AGM70L",
  "AGM80L",
  "DIN74L",
  "100R",
  "CMF80L",
  "AGM95L",
  "EV 12V",
  "90R",
  "CMF100R",
];

const batteries = listBatteryFolders();
const cars = walk(path.join(root, "public/assets/cars"));
const content = walk(path.join(root, "public/assets/content"));

console.log(
  JSON.stringify(
    {
      scannedAt: new Date().toISOString(),
      folders: {
        batteries: "public/assets/batteries",
        cars: "public/assets/cars",
        content: "public/assets/content",
        guides: "public/assets/guides (empty)",
        qna: "public/assets/qna (empty)",
      },
      counts: {
        batteryFolders: batteries.length,
        batteryFiles: walk(path.join(root, "public/assets/batteries")).length,
        carFiles: cars.length,
        contentFiles: content.length,
      },
      coreBatteryFolders: CORE.map((code) => {
        const folder =
          batteries.find((f) => f.toUpperCase() === code.replace(/\s/g, "").toUpperCase()) ??
          (code === "100R" ? "CMF100R" : code === "90R" ? "CMF90R" : code === "DIN74L" ? null : null);
        const alt =
          code === "DIN74L"
            ? ["GB57820", "CMF57412"].find((f) => batteries.includes(f))
            : code === "EV 12V"
              ? "AGM70L"
              : folder;
        return { code, resolvedFolder: alt ?? "MISSING", hasMain: Boolean(alt) };
      }),
      sampleCarFiles: cars.slice(0, 12).map((p) => p.replace(root + path.sep, "").replace(/\\/g, "/")),
      contentThumbnails: content.map((p) => path.basename(p)).sort(),
    },
    null,
    2,
  ),
);
