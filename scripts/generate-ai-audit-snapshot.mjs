#!/usr/bin/env node
/**
 * Build-time source scan for /__ai-audit (embedded in deploy bundle).
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "src/lib/ai-audit/audit-snapshot.json");

const SCAN_DIRS = ["src/app", "src/components", "src/lib", "src/data"];
const SKIP_DIR_NAMES = new Set(["node_modules", ".next", "ai-audit"]);
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md"]);

const FORBIDDEN_KEYWORDS = [
  "준비중",
  "준비 중",
  "등록 예정",
  "추가 예정",
  "상세 콘텐츠 준비중",
  "실사 연결 전까지",
  "CMS 연동",
  "운영 이미지 등록",
  "추후 교체",
  "사진 슬롯",
  "장착 예시 사진 준비중",
  "라벨 확인 사진 준비중",
  "혜택 이미지 준비중",
  "100R vs AGM95L",
  "헷리면",
  "포터2 · 포터2",
  "760CCA CCA",
];

function gitCommit() {
  try {
    return execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIR_NAMES.has(name)) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (EXT.has(path.extname(name))) files.push(full);
  }
  return files;
}

function scanForbidden() {
  const hits = [];
  for (const relDir of SCAN_DIRS) {
    const abs = path.join(ROOT, relDir);
    for (const file of walk(abs)) {
      const rel = path.relative(ROOT, file).replace(/\\/g, "/");
      const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const keyword of FORBIDDEN_KEYWORDS) {
          if (line.includes(keyword)) {
            hits.push({
              keyword,
              file: rel,
              line: i + 1,
              text: line.trim().slice(0, 200),
            });
          }
        }
      }
    }
  }
  const byKeyword = FORBIDDEN_KEYWORDS.map((keyword) => {
    const matches = hits.filter((h) => h.keyword === keyword);
    return {
      keyword,
      found: matches.length > 0,
      matches: matches.slice(0, 8),
      matchCount: matches.length,
    };
  });
  return { hits, byKeyword };
}

function readFileSnippet(relPath, patterns) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return { exists: false, matches: [] };
  const text = fs.readFileSync(full, "utf8");
  const matches = [];
  for (const p of patterns) {
    if (typeof p === "string" ? text.includes(p) : p.test(text)) {
      matches.push(String(p));
    }
  }
  return { exists: true, matches };
}

function scanCrossLinks() {
  const batteryFiles = walk(path.join(ROOT, "src/components/battery"));
  const battery100rLinks = [];
  for (const f of batteryFiles) {
    const rel = path.relative(ROOT, f).replace(/\\/g, "/");
    const t = fs.readFileSync(f, "utf8");
    if (/100R.*AGM95L|AGM95L.*100R|items=100R,AGM95L|compareHref\(\s*["']100R["']\s*,\s*["']AGM95L/i.test(t)) {
      battery100rLinks.push(rel);
    }
  }

  const orderChecklist = readFileSnippet("src/lib/platform-hub-content.ts", [
    "100R vs AGM95L",
    'compareHref("100R", "AGM95L")',
  ]);

  const comparePairs = [];
  for (const rel of ["src/data/battery/compareDeepNotes.ts", "src/data/battery/batterySpecRelations.ts"]) {
    const r = readFileSnippet(rel, [/100R.*AGM95L|AGM95L.*100R|pairKey\("100R", "AGM95L"\)/]);
    if (r.exists && r.matches.length) comparePairs.push({ file: rel, ...r });
  }

  const relatedQna = readFileSnippet("src/lib/qna/catalog-priority.ts", [
    "q-100r-vs-agm95l",
    'relatedBatteryCodes: ["100R", "AGM95L"]',
  ]);

  return {
    batteries100rDirectLinkFiles: battery100rLinks,
    batteries100rDirectLink: battery100rLinks.length > 0,
    orderChecklist100rVsAgm95lCta:
      fs.existsSync(path.join(ROOT, "src/lib/platform-hub-content.ts")) &&
      /cta:\s*["']100R vs AGM95L/.test(fs.readFileSync(path.join(ROOT, "src/lib/platform-hub-content.ts"), "utf8")),
    orderChecklistCompareHref:
      fs.existsSync(path.join(ROOT, "src/lib/platform-hub-content.ts")) &&
      /compareHref\(\s*["']100R["']\s*,\s*["']AGM95L/.test(
        fs.readFileSync(path.join(ROOT, "src/lib/platform-hub-content.ts"), "utf8"),
      ),
    comparePairDefinitions: comparePairs,
    relatedQnaCrossPair: relatedQna,
  };
}

function scanQaRoute() {
  const qaPage = fs.existsSync(path.join(ROOT, "src/app/qa/page.tsx"));
  const communityRedirect =
    fs.existsSync(path.join(ROOT, "src/app/community/page.tsx")) &&
    fs.readFileSync(path.join(ROOT, "src/app/community/page.tsx"), "utf8").includes('redirect');
  const hubQa =
    fs.existsSync(path.join(ROOT, "src/lib/customer-hub-routes.ts")) &&
    /HUB_QA\s*=\s*["']\/qa["']/.test(
      fs.readFileSync(path.join(ROOT, "src/lib/customer-hub-routes.ts"), "utf8"),
    );
  const linkFiles = [];
  for (const relDir of SCAN_DIRS) {
    for (const file of walk(path.join(ROOT, relDir))) {
      const t = fs.readFileSync(file, "utf8");
      if (t.includes('"/qa"') || t.includes("'/qa'") || t.includes("href={`/qa")) {
        linkFiles.push(path.relative(ROOT, file).replace(/\\/g, "/"));
      }
    }
  }
  return {
    qaPageExists: qaPage,
    communityFallbackRedirect: communityRedirect,
    hubQaRoute: hubQa,
    linkedFromFiles: [...new Set(linkFiles)].slice(0, 24),
  };
}

function scanServicePages() {
  const servicePage = fs.readFileSync(path.join(ROOT, "src/app/service/page.tsx"), "utf8");
  const centerPage = fs.readFileSync(path.join(ROOT, "src/app/service-center/page.tsx"), "utf8");
  const serviceClient = fs.readFileSync(path.join(ROOT, "src/components/platform/hub/ServiceHubClient.tsx"), "utf8");
  const centerClient = fs.readFileSync(path.join(ROOT, "src/components/platform/ServiceCenterClient.tsx"), "utf8");
  return {
    service: {
      route: "/service",
      pageFile: "src/app/service/page.tsx",
      component: "ServiceHubClient",
      sameAsServiceCenter: false,
      typoHetrimyeon: serviceClient.includes("헷리면"),
      phoneCta: /tel:|전화|Phone/i.test(serviceClient),
      naverCta: /naver|네이버/i.test(serviceClient),
      blogCta: /blog|블로그/i.test(serviceClient),
    },
    serviceCenter: {
      route: "/service-center",
      pageFile: "src/app/service-center/page.tsx",
      component: "ServiceCenterClient",
      sameAsServiceCenter: false,
      typoHetrimyeon: centerClient.includes("헷리면"),
      phoneCta: /tel:|전화|Phone/i.test(centerClient),
      naverCta: /naver|네이버/i.test(centerClient),
      blogCta: /blog|블로그/i.test(centerClient),
    },
    unifyRecommendation:
      "Separate routes: /service = delivery+outbound hub copy; /service-center = Busan map/store locator. No redirect required.",
  };
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  gitCommit: gitCommit(),
  forbidden: scanForbidden(),
  crossLinks: scanCrossLinks(),
  qa: scanQaRoute(),
  servicePages: scanServicePages(),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(snapshot, null, 2));
console.log("Wrote", OUT, "| forbidden hits:", snapshot.forbidden.hits.length);
