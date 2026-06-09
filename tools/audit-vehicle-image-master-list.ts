#!/usr/bin/env npx tsx
/**
 * 레지스트리 174대 기준 차량 이미지 master list 생성 + 검증
 */
import fs from "fs";
import path from "path";
import { vehicleAssets } from "../src/lib/car-assets";
import {
  buildVehicleRegistryImageMasterList,
  MASTER_LIST_CSV_COLUMNS,
  rowsToCsv,
  type VehicleImageOrphanRow,
  type VehicleRegistryImageMasterRow,
} from "../src/lib/vehicle-registry-image-master";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const DOCS_DIR = path.join(ROOT, "docs");

const OUT_JSON = path.join(DATA_DIR, "vehicle-registry-image-master-list.json");
const OUT_CSV = path.join(DATA_DIR, "vehicle-registry-image-master-list.csv");
const ORPHAN_JSON = path.join(DATA_DIR, "vehicle-image-orphans.json");
const ORPHAN_CSV = path.join(DATA_DIR, "vehicle-image-orphans.csv");
const REPORT_MD = path.join(DOCS_DIR, "vehicle-image-master-list-report.md");

function orphansToCsv(orphans: VehicleImageOrphanRow[]): string {
  const cols = ["brand", "imageFile", "filePath", "guessedSlug", "reason"];
  const header = cols.join(",");
  const lines = orphans.map((o) =>
    cols
      .map((c) => {
        const v = String(o[c as keyof VehicleImageOrphanRow] ?? "");
        return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
      })
      .join(","),
  );
  return [header, ...lines].join("\n");
}

function countByPriority(rows: VehicleRegistryImageMasterRow[]) {
  return {
    P0: rows.filter((r) => r.imageReviewPriority === "P0").length,
    P1: rows.filter((r) => r.imageReviewPriority === "P1").length,
    P2: rows.filter((r) => r.imageReviewPriority === "P2").length,
    P3: rows.filter((r) => r.imageReviewPriority === "P3").length,
  };
}

function findDuplicateImageFiles(rows: VehicleRegistryImageMasterRow[]) {
  const map = new Map<string, string[]>();
  for (const r of rows) {
    if (!r.imageFile.trim()) continue;
    const k = `${r.brand}:${r.imageFile.toLowerCase()}`;
    map.set(k, [...(map.get(k) ?? []), r.slug]);
  }
  return [...map.entries()].filter(([, slugs]) => slugs.length > 1);
}

function findSlugImageMismatches(rows: VehicleRegistryImageMasterRow[]) {
  return rows.filter((r) => r.notes.includes("slug↔imageFile 명명 불일치 의심"));
}

function buildReportMd(
  rows: VehicleRegistryImageMasterRow[],
  orphans: VehicleImageOrphanRow[],
  errors: string[],
): string {
  const pri = countByPriority(rows);
  const missing = rows.filter((r) => r.isMissingImage);
  const dupes = findDuplicateImageFiles(rows);
  const mismatches = findSlugImageMismatches(rows);
  const p0Targets = rows.filter((r) => r.imageReviewPriority === "P0");
  const p1Targets = rows.filter((r) => r.imageReviewPriority === "P1");

  return `# 차량 이미지 Master List 보고서

생성 시각: ${new Date().toISOString()}

## 1. 레지스트리 차량 총수

- **${rows.length}** (vehicleAssets 기준, 목표 174)

## 2. 실제 current 이미지 연결 수

- **${rows.filter((r) => r.hasCurrentImage).length}** / ${rows.length}

## 3. 누락 이미지

- **${missing.length}**건

${missing.map((r) => `- \`${r.slug}\` — imageFile=\`${r.imageFile || "(empty)"}\``).join("\n")}

## 4. v04Source 이미지 존재 수

- **${rows.filter((r) => r.hasV04SourceImage).length}** / ${rows.length}

## 5. backup 이미지 존재 수

- **${rows.filter((r) => r.hasBackupImage).length}** / ${rows.length}

## 6. orphan 이미지

- **${orphans.length}**건 (master list 제외, \`data/vehicle-image-orphans.json\`)

## 7. 중복 imageFile

- **${dupes.length}**그룹

${dupes.map(([k, slugs]) => `- \`${k}\` → ${slugs.map((s) => `\`${s}\``).join(", ")}`).join("\n") || "- 없음"}

## 8. slug ↔ imageFile 불일치 의심

- **${mismatches.length}**건

${mismatches.slice(0, 25).map((r) => `- \`${r.slug}\` / \`${r.imageFile}\``).join("\n") || "- 없음"}
${mismatches.length > 25 ? `\n- … 외 ${mismatches.length - 25}건` : ""}

## 9. imageReviewPriority 분포

| 우선순위 | 건수 |
|----------|------|
| P0 | ${pri.P0} |
| P1 | ${pri.P1} |
| P2 | ${pri.P2} |
| P3 | ${pri.P3} |

### 사용자 제보 (P0 고정)

- \`tucson-jm\` — priority: ${rows.find((r) => r.slug === "tucson-jm")?.imageReviewPriority}
- \`ssangyong-tivoli-air-2016\` — priority: ${rows.find((r) => r.slug === "ssangyong-tivoli-air-2016")?.imageReviewPriority}
- \`ssangyong-tivoli-armour-2017\` — priority: ${rows.find((r) => r.slug === "ssangyong-tivoli-armour-2017")?.imageReviewPriority}

## 10. 다음 단계 이미지 수집/재생성 대상 장수

| 구분 | 건수 | 설명 |
|------|------|------|
| P0 즉시 | ${pri.P0} | 누락·DAMAGED·사용자 제보 |
| P1 검수 | ${pri.P1} | NEEDS_CHECK·밝은차체·diff 큼 |
| P2 후순위 | ${pri.P2} | 사용 가능·통일감 재제작 후보 |
| P3 정상 | ${pri.P3} | 우선순위 낮음 |
| orphan | ${orphans.length} | 레지스트리 미연결 디스크 PNG |

### P0 slug 목록

${p0Targets.map((r) => `- \`${r.slug}\` (${r.imageAuditStatus})`).join("\n")}

### P1 slug 목록 (일부)

${p1Targets.slice(0, 40).map((r) => `- \`${r.slug}\` (${r.imageAuditStatus})`).join("\n")}
${p1Targets.length > 40 ? `\n- … 외 ${p1Targets.length - 40}건 (CSV 참조)` : ""}

## 산출 파일

- \`data/vehicle-registry-image-master-list.json\`
- \`data/vehicle-registry-image-master-list.csv\`
- \`data/vehicle-image-orphans.json\`
- \`data/vehicle-image-orphans.csv\`

## 검증

${errors.length ? errors.map((e) => `- ❌ ${e}`).join("\n") : "- ✅ 모든 검증 통과"}

## 기준 소스

- \`src/lib/car-assets.ts\` (+ genesis / v04 / chevrolet registries)
- \`reports/vehicle-image-audit.json\` (imageAuditStatus)
- 배터리 코드: \`OPERATOR_SLUG_PRIMARY_BATTERY\` (참고용, DB 미수정)
`;
}

function validate(
  rows: VehicleRegistryImageMasterRow[],
  orphans: VehicleImageOrphanRow[],
): string[] {
  const errors: string[] = [];
  const PUBLIC = path.join(ROOT, "public");

  if (rows.length !== vehicleAssets.length) {
    errors.push(`slug 수 불일치: master=${rows.length} registry=${vehicleAssets.length}`);
  }

  const slugSet = new Set(rows.map((r) => r.slug));
  if (slugSet.size !== rows.length) errors.push("master list에 slug 중복 존재");

  for (const r of rows) {
    if (r.isOrphan) errors.push(`${r.slug}: master row에 isOrphan=true 금지`);
    if (r.currentImagePath) {
      const abs = path.join(PUBLIC, r.currentImagePath.replace(/^\//, ""));
      if (r.hasCurrentImage !== fs.existsSync(abs)) {
        errors.push(`${r.slug}: hasCurrentImage(${r.hasCurrentImage}) ≠ disk ${r.currentImagePath}`);
      }
    } else if (r.hasCurrentImage) {
      errors.push(`${r.slug}: currentImagePath 없는데 hasCurrentImage=true`);
    }
    if (!r.imageFile.trim() && !r.isMissingImage) {
      errors.push(`${r.slug}: imageFile 없음인데 isMissingImage=false`);
    }
  }

  for (const o of orphans) {
    if (slugSet.has(o.guessedSlug ?? "__none__")) {
      /* guessed slug may overlap — ok */
    }
    const orphanInMaster = rows.some((r) => r.currentImagePath === o.filePath);
    if (orphanInMaster) errors.push(`orphan ${o.filePath}가 master list에 포함됨`);
  }

  const required = ["tucson-jm", "ray-tam-2fl", "ssangyong-tivoli-air-2016", "ssangyong-tivoli-armour-2017"];
  for (const s of required) {
    if (!slugSet.has(s)) errors.push(`필수 slug 누락: ${s}`);
  }

  if (!rows.find((r) => r.slug === "ray-tam-2fl")?.isMissingImage) {
    errors.push("ray-tam-2fl는 isMissingImage=true 여야 함");
  }

  return errors;
}

function main() {
  const { rows, orphans, meta } = buildVehicleRegistryImageMasterList();
  const errors = validate(rows, orphans);

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(DOCS_DIR, { recursive: true });

  const payload = {
    meta,
    summary: {
      registryCount: rows.length,
      hasCurrentImage: rows.filter((r) => r.hasCurrentImage).length,
      hasV04SourceImage: rows.filter((r) => r.hasV04SourceImage).length,
      hasBackupImage: rows.filter((r) => r.hasBackupImage).length,
      missingImage: rows.filter((r) => r.isMissingImage).length,
      orphanCount: orphans.length,
      priorityCounts: countByPriority(rows),
    },
    rows,
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), "utf8");
  fs.writeFileSync(OUT_CSV, rowsToCsv(rows), "utf8");
  fs.writeFileSync(
    ORPHAN_JSON,
    JSON.stringify({ generatedAt: meta.generatedAt, count: orphans.length, orphans }, null, 2),
    "utf8",
  );
  fs.writeFileSync(ORPHAN_CSV, orphansToCsv(orphans), "utf8");
  fs.writeFileSync(REPORT_MD, buildReportMd(rows, orphans, errors), "utf8");

  console.log("=== VEHICLE REGISTRY IMAGE MASTER LIST ===");
  console.log(`registry: ${rows.length}`);
  console.log(`current image: ${payload.summary.hasCurrentImage}`);
  console.log(`missing: ${payload.summary.missingImage}`);
  console.log(`v04 source: ${payload.summary.hasV04SourceImage}`);
  console.log(`backup: ${payload.summary.hasBackupImage}`);
  console.log(`orphans: ${orphans.length}`);
  console.log("priority:", payload.summary.priorityCounts);
  console.log(`Wrote ${OUT_JSON}`);
  console.log(`Wrote ${OUT_CSV}`);
  console.log(`Wrote ${ORPHAN_JSON}`);
  console.log(`Wrote ${REPORT_MD}`);

  if (errors.length) {
    console.error("\nValidation FAILED:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log("\nValidation OK");
}

main();
