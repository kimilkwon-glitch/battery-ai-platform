#!/usr/bin/env node
/**
 * UX Audit 결과 파일만 정리합니다.
 * tools/ux-audit/ 소스·시나리오·spec 파일은 건드리지 않습니다.
 */
const fs = require("fs");
const path = require("path");

const UX_AUDIT_DIR = __dirname;
const REPORTS_DIR = path.join(UX_AUDIT_DIR, "reports");
const PLAYWRIGHT_REPORT_DIR = path.join(UX_AUDIT_DIR, "playwright-report");
const TEST_RESULTS_DIR = path.join(UX_AUDIT_DIR, "test-results");

let deletedFiles = 0;
let deletedDirs = 0;

function removePath(targetPath) {
  if (!fs.existsSync(targetPath)) return;

  const stats = fs.statSync(targetPath);
  if (stats.isDirectory()) {
    const entries = fs.readdirSync(targetPath, { withFileTypes: true });
    for (const entry of entries) {
      removePath(path.join(targetPath, entry.name));
    }
    fs.rmdirSync(targetPath);
    deletedDirs++;
    return;
  }

  fs.unlinkSync(targetPath);
  deletedFiles++;
}

function emptyReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    return;
  }

  const entries = fs.readdirSync(REPORTS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    removePath(path.join(REPORTS_DIR, entry.name));
  }
}

function main() {
  console.log("[UX Audit Clean] 결과 파일 정리 시작…");
  console.log(`  대상: ${UX_AUDIT_DIR}`);

  emptyReportsDir();
  removePath(PLAYWRIGHT_REPORT_DIR);
  removePath(TEST_RESULTS_DIR);

  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  console.log("[UX Audit Clean] 정리 완료");
  console.log(`  삭제한 파일: ${deletedFiles}개`);
  console.log(`  삭제한 폴더: ${deletedDirs}개`);
  console.log(`  reports 폴더 재생성: ${REPORTS_DIR}`);
}

main();
