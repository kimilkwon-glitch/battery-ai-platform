#!/usr/bin/env node
/**
 * public/fonts 재귀 스캔 — 인벤토리 JSON/MD 생성 (사이트 적용 없음)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const FONTS_ROOT = path.join(ROOT, "public", "fonts");
const OUT_JSON = path.join(ROOT, "docs", "font-inventory.json");
const OUT_MD = path.join(ROOT, "docs", "font-inventory.md");

const FONT_EXT = new Set([".ttf", ".otf", ".woff", ".woff2"]);
const LICENSE_RE =
  /^(LICENSE|LICENCE|OFL|COPYING|NOTICE|README|readme|license|licence|FONTLOG|Authors)(\.|$)/i;
const LICENSE_IN_NAME_RE = /license|licence|ofl|copyright|readme/i;

/** 상위 폴더명(1단계) 기준 추천 용도·우선순위 추정 */
function inferUsage(topFolder) {
  const key = topFolder.toLowerCase().replace(/[\s_()-]+/g, "");
  const rules = [
    { test: /pretendard/, usage: "본문/UI", priority: "1순위" },
    { test: /suit/, usage: "본문/UI", priority: "1순위" },
    { test: /wantedsans|wanted/, usage: "본문/UI", priority: "1순위" },
    { test: /nanumsquareneo|squareneo/, usage: "본문/UI", priority: "1순위" },
    { test: /nanumsquare(?!neo|round)/, usage: "본문/UI", priority: "1순위" },
    { test: /gmarket/, usage: "제목/카드 제목", priority: "2순위" },
    { test: /paperlogy/, usage: "제목/섹션 타이틀", priority: "2순위" },
    { test: /scoredream|s-core|score/, usage: "제목/강조", priority: "2순위" },
    { test: /cafe24.*danjung|danjunghae|dangdang/, usage: "포인트/배너", priority: "3순위" },
    { test: /cafe24.*ssurround|ssurround/, usage: "포인트/배너", priority: "3순위" },
    { test: /cafe24/, usage: "포인트/배너", priority: "3순위" },
    { test: /kbo.*dia|kbodia/, usage: "포인트/강조", priority: "3순위" },
    { test: /nanummyeongjo|myeongjo/, usage: "감성/긴 글 일부", priority: "3순위" },
    { test: /nanumgothic|gothic/, usage: "본문/UI (보조)", priority: "3순위" },
    { test: /nanumsquareround|squareround/, usage: "본문/UI (보조)", priority: "3순위" },
    { test: /freesentation/, usage: "본문/UI (보조)", priority: "보류" },
    { test: /sbwindow|sb_window/, usage: "사용 주의/특수 포인트", priority: "보류" },
    { test: /pyeongchang|평창|peace/, usage: "포인트/이벤트", priority: "보류" },
    { test: /이이투자|invest/, usage: "특수/보류", priority: "보류" },
  ];
  for (const r of rules) {
    if (r.test.test(key)) return { usage: r.usage, priority: r.priority };
  }
  return { usage: "보류 (폴더명 확인)", priority: "보류" };
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function walk(dir, relBase, acc) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const abs = path.join(dir, ent.name);
    const rel = path.join(relBase, ent.name);
    if (ent.isDirectory()) {
      walk(abs, rel, acc);
      continue;
    }
    if (!ent.isFile()) continue;
    const ext = path.extname(ent.name).toLowerCase();
    if (FONT_EXT.has(ext)) {
      const stat = fs.statSync(abs);
      const parts = rel.split(path.sep);
      const topFolder = parts[0] ?? ent.name;
      const { usage, priority } = inferUsage(topFolder);
      acc.fontFiles.push({
        topFolder,
        relativePath: rel.replace(/\\/g, "/"),
        fileName: ent.name,
        format: ext.slice(1),
        sizeBytes: stat.size,
        sizeHuman: formatBytes(stat.size),
        publicPath: `/fonts/${rel.replace(/\\/g, "/")}`,
        suggestedUsage: usage,
        applyPriority: priority,
      });
      continue;
    }
    if (LICENSE_RE.test(ent.name) || (LICENSE_IN_NAME_RE.test(ent.name) && /\.(txt|md|pdf|html?)$/i.test(ext))) {
      const stat = fs.statSync(abs);
      acc.licenseFiles.push({
        topFolder: rel.split(path.sep)[0] ?? "",
        relativePath: rel.replace(/\\/g, "/"),
        fileName: ent.name,
        sizeBytes: stat.size,
      });
    }
  }
}

function collectTopFolders(fontFiles, licenseFiles) {
  const set = new Set();
  for (const f of fontFiles) set.add(f.topFolder);
  for (const l of licenseFiles) set.add(l.topFolder);
  return [...set].sort((a, b) => a.localeCompare(b, "ko"));
}

function licenseHintForFolder(topFolder, licenseFiles) {
  const hits = licenseFiles.filter((l) => l.topFolder === topFolder);
  if (hits.length === 0) return "—";
  return hits.map((h) => h.fileName).slice(0, 3).join(", ") + (hits.length > 3 ? " …" : "");
}

function buildMarkdown(data) {
  const { summary, folders, fontFiles, licenseFiles } = data;
  const lines = [
    "# Battery Manager Font Inventory",
    "",
    "> 자동 생성 (`npm run scan:fonts`). 사이트 CSS 적용 전 인벤토리 단계입니다.",
    "",
    "## 요약",
    "",
    `- 전체 폰트 폴더 수: **${summary.folderCount}**`,
    `- 감지된 폰트 파일 수: **${summary.fontFileCount}**`,
    `- ttf: **${summary.ttf}**`,
    `- otf: **${summary.otf}**`,
    `- woff: **${summary.woff}**`,
    `- woff2: **${summary.woff2}**`,
    `- 라이선스/README 감지: **${summary.licenseFileCount}**개 파일 (${summary.foldersWithLicense}개 폴더)`,
    "",
    "## 폴더 목록",
    "",
    folders.map((f) => `- \`${f}\``).join("\n"),
    "",
    "## 폰트 목록",
    "",
    "| 폴더 | 파일명 | 형식 | 용량 | 라이선스/README 감지 | 추천 용도 | 적용 우선순위 |",
    "|---|---|---|---|---|---|---|",
  ];

  const sorted = [...fontFiles].sort((a, b) => {
    const fc = a.topFolder.localeCompare(b.topFolder, "ko");
    if (fc !== 0) return fc;
    return a.fileName.localeCompare(b.fileName, "ko");
  });

  for (const f of sorted) {
    lines.push(
      `| ${f.topFolder} | ${f.fileName} | ${f.format} | ${f.sizeHuman} | ${licenseHintForFolder(f.topFolder, licenseFiles)} | ${f.suggestedUsage} | ${f.applyPriority} |`,
    );
  }

  lines.push(
    "",
    "## 적용 우선순위 (참고)",
    "",
    "- **1순위:** Pretendard, SUIT, WantedSans, NanumSquareNeo",
    "- **2순위:** GmarketSans, Paperlogy, S-Core Dream",
    "- **3순위:** Cafe24, KBO Dia Gothic, NanumMyeongjo",
    "- **보류:** 폴더명·라이선스·가독성 확인 필요",
    "",
    "다음 단계: [font-usage-plan.md](./font-usage-plan.md)",
    "",
  );
  return lines.join("\n");
}

function main() {
  if (!fs.existsSync(FONTS_ROOT)) {
    console.error(`폰트 루트 없음: ${FONTS_ROOT}`);
    process.exit(1);
  }

  const acc = { fontFiles: [], licenseFiles: [] };
  walk(FONTS_ROOT, "", acc);

  const folders = collectTopFolders(acc.fontFiles, acc.licenseFiles);
  const foldersWithLicense = folders.filter((f) =>
    acc.licenseFiles.some((l) => l.topFolder === f),
  ).length;

  const summary = {
    scannedAt: new Date().toISOString(),
    fontsRoot: "public/fonts",
    folderCount: folders.length,
    fontFileCount: acc.fontFiles.length,
    ttf: acc.fontFiles.filter((f) => f.format === "ttf").length,
    otf: acc.fontFiles.filter((f) => f.format === "otf").length,
    woff: acc.fontFiles.filter((f) => f.format === "woff").length,
    woff2: acc.fontFiles.filter((f) => f.format === "woff2").length,
    licenseFileCount: acc.licenseFiles.length,
    foldersWithLicense,
  };

  const payload = {
    summary,
    folders,
    fontFiles: acc.fontFiles,
    licenseFiles: acc.licenseFiles,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), "utf8");
  fs.writeFileSync(OUT_MD, buildMarkdown(payload), "utf8");

  console.log("Font scan complete");
  console.log(`  folders: ${summary.folderCount}`);
  console.log(`  font files: ${summary.fontFileCount} (ttf ${summary.ttf}, otf ${summary.otf}, woff ${summary.woff}, woff2 ${summary.woff2})`);
  console.log(`  license/readme: ${summary.licenseFileCount}`);
  console.log(`  wrote: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`  wrote: ${path.relative(ROOT, OUT_MD)}`);
}

main();
