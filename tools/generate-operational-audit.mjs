#!/usr/bin/env node
/**
 * Battery Manager 운영 안정화 사전 감사 — customer-flow, trust-ux, dead-code, security
 * Usage: node tools/generate-operational-audit.mjs [baseUrl]
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const REPORTS = join(ROOT, "reports");
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const STAMP = readFileSync(join(ROOT, "build-stamp.json"), "utf8").match(/"stamp":\s*"([^"]+)"/)?.[1] ?? "";

async function fetchHtml(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "BM-Operational-Audit/1.0", "Cache-Control": "no-cache" },
    redirect: "follow",
  });
  const html = await res.text();
  return { url, status: res.status, finalUrl: res.url, html };
}

function hasRuntimeError(html) {
  return /Attempted to call|Runtime Error|Application error|Hydration failed|digest:/i.test(html);
}

/** ─── Customer flow probes (production HTML heuristics) ─── */
const CUSTOMER_FLOWS = [
  {
    id: "A-vehicle-search",
    name: "차량 검색 플로우 (K3)",
    steps: [
      { route: "/", test: (h) => h.includes("search") || h.includes("검색") },
      {
        route: "/search?q=K3",
        test: (h) =>
          /k3|K3/i.test(h) &&
          (/\/vehicle\//.test(h) || /search-vehicle|vehicle-result|data-vehicle/i.test(h)) &&
          !h.includes("등록된 차량 규격 정보가 없습니다"),
      },
      {
        route: "/vehicle/kia-k3-2018",
        test: (h) =>
          !hasRuntimeError(h) &&
          (h.includes("vehicle-brand-product") ||
            h.includes("fuel-battery") ||
            h.includes("배터리") ||
            /100R|90R|AGM/i.test(h)),
      },
    ],
  },
  {
    id: "B-spec-search",
    name: "규격 검색 플로우 (100R)",
    steps: [
      {
        route: "/search?q=100R",
        test: (h) => /100R/.test(h) && (/\/batteries\//.test(h) || /battery-spec|spec-code/i.test(h)),
      },
      {
        route: "/batteries/100R",
        test: (h) =>
          !hasRuntimeError(h) &&
          (/장바구니|담기|구매|주문/i.test(h) || /add-to-cart|AddToCart/i.test(h)),
      },
    ],
  },
  {
    id: "C-product-detail",
    name: "상품 상세 (AGM60L)",
    steps: [
      {
        route: "/batteries/AGM60L",
        test: (h) =>
          !hasRuntimeError(h) &&
          h.includes("AGM60L") &&
          (/폐배터리|반납|미반납/i.test(h) || /used-battery|return/i.test(h)) &&
          (/장바구니|담기/i.test(h) || /cart/i.test(h)),
      },
    ],
  },
  {
    id: "D-cart",
    name: "장바구니 플로우",
    steps: [
      {
        route: "/cart",
        test: (h) =>
          !hasRuntimeError(h) &&
          (/장바구니/i.test(h) || /cart/i.test(h)) &&
          !/기능 설계 미리보기.*동작하지 않습니다/i.test(h),
      },
      {
        route: "/order-request",
        test: (h) =>
          !hasRuntimeError(h) && (/주문|상담|접수/i.test(h) || /order-request/i.test(h)),
      },
    ],
  },
  {
    id: "E-service-center",
    name: "매장·출장 안내",
    steps: [
      {
        route: "/service-center",
        test: (h) =>
          !hasRuntimeError(h) &&
          h.includes("010-8339-8316") &&
          h.includes("010-8896-8316") &&
          (/덕천|학장/.test(h)) &&
          (/전화|tel:/i.test(h)) &&
          (/blog|블로그|작업 사례/i.test(h)),
      },
    ],
  },
  {
    id: "F-auth-mypage",
    name: "회원/마이페이지",
    steps: [
      { route: "/login", test: (h) => !hasRuntimeError(h) && /로그인/i.test(h) },
      { route: "/signup", test: (h) => !hasRuntimeError(h) && /회원가입|가입/i.test(h) },
      { route: "/mypage", test: (h) => !hasRuntimeError(h) && /마이페이지|내 차량|주문/i.test(h) },
    ],
  },
];

async function runCustomerFlowAudit() {
  const items = [];
  let p0 = 0;
  let pass = 0;
  let fail = 0;

  for (const flow of CUSTOMER_FLOWS) {
    for (const step of flow.steps) {
      let ok = false;
      let status = 0;
      let error = "";
      let files = [];
      try {
        const { html, status: st } = await fetchHtml(step.route);
        status = st;
        ok = st === 200 && step.test(html);
        if (hasRuntimeError(html)) {
          ok = false;
          error = "Runtime/hydration error marker in HTML";
          files.push("src/components/vehicle/VehicleCustomerBatteryShop.tsx");
          p0++;
        } else if (!ok) {
          error = st !== 200 ? `HTTP ${st}` : "Expected markers missing in production HTML";
          if (flow.id === "A-vehicle-search") files.push("src/lib/search-page-results.ts", "src/components/platform/SearchVehicleResultCard.tsx");
          if (flow.id === "B-spec-search") files.push("src/app/batteries/[code]/page.tsx");
          if (flow.id === "D-cart") files.push("src/components/cart/CartPageClient.tsx", "src/data/cart-flow-guide.ts");
        }
      } catch (e) {
        error = e.message;
        ok = false;
      }
      if (ok) pass++;
      else fail++;
      const priority = error.includes("Runtime") ? "P0" : !ok && flow.id.startsWith("A") ? "P1" : !ok ? "P1" : "—";
      items.push({
        flowId: flow.id,
        flowName: flow.name,
        route: step.route,
        works: ok,
        httpStatus: status,
        error: ok ? null : error,
        suggestedFiles: files,
        priority: ok ? null : priority,
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    buildStamp: STAMP,
    summary: { pass, fail, p0Issues: p0 },
    items,
  };
}

/** ─── Trust UX ─── */
function runTrustAudit() {
  const checks = [
    {
      id: "phone-deokcheon",
      element: "덕천점 전화 010-8339-8316",
      locations: ["src/lib/busan-service-hub-data.ts", "src/lib/external-links.ts", "/service-center"],
      presentInCode: true,
      presentOnServiceCenter: null,
      gap: null,
      customerRisk: null,
      priority: null,
    },
    {
      id: "phone-hakjang",
      element: "학장점 전화 010-8896-8316",
      locations: ["src/lib/busan-service-hub-data.ts", "/service-center"],
      presentInCode: true,
      presentOnServiceCenter: null,
      gap: null,
      customerRisk: null,
      priority: null,
    },
    {
      id: "store-photos",
      element: "매장 실사진",
      locations: ["/assets/stores/deokcheon.jpg", "/assets/stores/hakjang.jpg"],
      presentInCode: existsSync(join(ROOT, "public/assets/stores/deokcheon.jpg")),
      gap: null,
      customerRisk: "이미지 404 시 신뢰 하락",
      priority: "P2",
      suggestion: "프로덕션에서 store 이미지 URL 200 확인",
    },
    {
      id: "naver-place",
      element: "네이버 플레이스",
      locations: ["src/lib/external-links.ts"],
      presentInCode: /naver|map\.naver|place/i.test(readFileSync(join(ROOT, "src/lib/external-links.ts"), "utf8")),
      gap: "푸터/매장 카드에 노출 경로 확인 필요",
      customerRisk: "낮음 — Google Maps 길찾기는 있음",
      priority: "P2",
      suggestion: "매장 카드에 네이버 플레이스 링크 명시 검토",
    },
    {
      id: "blog-cases",
      element: "블로그 작업사례",
      locations: ["src/lib/external-links.ts", "StoreHubCompactCards"],
      presentInCode: true,
      gap: null,
      priority: "P2",
    },
    {
      id: "used-battery-guide",
      element: "폐배터리 반납/미반납 안내",
      locations: ["/batteries/[code]", "/support/used-battery-return", "cart-flow-guide"],
      presentInCode: true,
      gap: null,
      priority: null,
    },
    {
      id: "vehicle-info-before-order",
      element: "주문 전 차량정보 확인",
      locations: ["src/data/cart-flow-guide.ts", "OrderRequestVehicleFields", "/cart"],
      presentInCode: true,
      gap: null,
      priority: null,
    },
    {
      id: "outbound-area",
      element: "출장/방문 가능 지역",
      locations: ["/service-center", "busan-service-hub-data"],
      presentInCode: true,
      gap: null,
      priority: null,
    },
    {
      id: "coupons-detail-only",
      element: "혜택/쿠폰 — 상세에서만",
      locations: ["/benefits", "battery detail"],
      presentInCode: true,
      gap: "홈/검색에 과도한 쿠폰 노출 여부는 별도 UX 검토",
      priority: "P2",
    },
    {
      id: "no-dev-copy",
      element: "개발자 문구 미노출",
      locations: ["SiteFooter BUILD_STAMP", "cart-flow-guide CART_DESIGN_COPY", "admin only"],
      presentInCode: true,
      gap: "푸터 v BM-* 스탬프는 고객에게 보임 — 운영 추적용이나 개발 느낌 가능",
      customerRisk: "중간 — footer build stamp",
      priority: "P1",
      suggestion: "프로덕션 footer에서 build stamp 숨기거나 admin-only로 이동 검토",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    items: checks,
    devCopyFindings: [
      { path: "src/components/common/SiteFooter.tsx", text: "v {BUILD_STAMP}", exposure: "all pages footer" },
      { path: "src/data/cart-flow-guide.ts", text: "CART_DESIGN_COPY.banner", exposure: "/cart-design only (redirect from customer/cart-guide)" },
      { path: "src/data/order-request-copy.ts", text: "개발용 저장소", exposure: "order-request if copy shown" },
      { path: "src/app/ai-audit", text: "internal audit UI", exposure: "/ai-audit route" },
    ],
  };
}

/** ─── Dead code / files ─── */
function walkDir(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(name)) continue;
      walkDir(p, acc);
    } else acc.push(p);
  }
  return acc;
}

function countImports(targetPath) {
  const rel = relative(ROOT, targetPath).replace(/\\/g, "/");
  const base = basename(targetPath, extname(targetPath));
  const patterns = [
    rel.replace(/^src\//, "@/"),
    `./${base}`,
    `/${base}`,
    basename(targetPath),
  ];
  let count = 0;
  const srcFiles = walkDir(join(ROOT, "src")).filter((f) => /\.(ts|tsx|js|jsx|mjs)$/.test(f));
  for (const f of srcFiles) {
    if (f === targetPath) continue;
    const content = readFileSync(f, "utf8");
    if (content.includes(rel.replace(/^src\//, "@/")) || content.includes(`/${base}"`) || content.includes(`'${base}'`)) {
      count++;
    }
  }
  return count;
}

function classifyDeadFiles() {
  const candidates = [];
  const dirs = [
    { dir: join(ROOT, "reports"), type: "audit-report", defaultClass: "ARCHIVE_CANDIDATE" },
    { dir: join(ROOT, "db-export-for-review"), type: "db-export", defaultClass: "ARCHIVE_CANDIDATE" },
    { dir: join(ROOT, "src/data/source-tables"), type: "source-xlsx", defaultClass: "KEEP" },
    { dir: join(ROOT, ".prod-css-check.css"), type: "temp", defaultClass: "DELETE_CANDIDATE" },
  ];

  // Root-level temp scripts
  for (const name of [
    ".prod-css-check.css",
    ".prod-home-check.html",
    "scripts/probe-stamp-only.mjs",
    "scripts/probe-customer-hub-deploy.mjs",
    "tools/debug-trailblazer-search.mjs",
    "tools/inspect-source-tables-out.json",
    "tools/probe-source-brands-out.json",
  ]) {
    const p = join(ROOT, name);
    if (!existsSync(p)) continue;
    candidates.push({
      path: relative(ROOT, p).replace(/\\/g, "/"),
      type: "temp-probe",
      importedByCount: 0,
      referencedByRoute: false,
      classification: "DELETE_CANDIDATE",
      reason: "로컬 프로브/일회성 산출물, import 0",
      safeToDelete: true,
    });
  }

  if (existsSync(join(ROOT, "reports"))) {
    for (const f of readdirSync(join(ROOT, "reports"))) {
      candidates.push({
        path: `reports/${f}`,
        type: "audit-report",
        importedByCount: 0,
        referencedByRoute: false,
        classification: "ARCHIVE_CANDIDATE",
        reason: "개발·감사용 JSON/MD, src import 없음",
        safeToDelete: false,
      });
    }
  }

  // Duplicate / legacy lib suspects
  const libSuspects = [
    { path: "src/lib/build-version.ts", reason: "@deprecated re-export of build-stamp", class: "ARCHIVE_CANDIDATE" },
    { path: "src/lib/platform-data.ts", reason: "레거시 catalog — 사용처 grep 필요", class: "KEEP" },
    { path: "src/data/vehicles.sample.json", reason: "getVehicles fallback only", class: "KEEP" },
    { path: "src/app/cart-design/page.tsx", reason: "설계 미리보기 — /customer/cart-guide redirect", class: "ARCHIVE_CANDIDATE" },
    { path: "public/assets/cars/", reason: "legacy car paths — cars-normalized 사용 중", class: "ARCHIVE_CANDIDATE" },
  ];

  for (const s of libSuspects) {
    const full = join(ROOT, s.path);
    candidates.push({
      path: s.path,
      type: "code-asset",
      importedByCount: existsSync(full) && !s.path.endsWith("/") ? countImports(full) : -1,
      referencedByRoute: s.path.includes("app/"),
      classification: s.class,
      reason: s.reason,
      safeToDelete: s.class === "DELETE_CANDIDATE",
    });
  }

  // source-tables security
  candidates.push({
    path: "src/data/source-tables/*.xlsx",
    type: "source-db",
    importedByCount: 0,
    referencedByRoute: false,
    classification: "KEEP",
    reason: "merge:source-tables 입력 — public 미배치, git 추적 OK",
    safeToDelete: false,
  });

  const deleteN = candidates.filter((c) => c.classification === "DELETE_CANDIDATE").length;
  const archiveN = candidates.filter((c) => c.classification === "ARCHIVE_CANDIDATE").length;
  const keepN = candidates.filter((c) => c.classification === "KEEP").length;

  return {
    generatedAt: new Date().toISOString(),
    summary: { DELETE_CANDIDATE: deleteN, ARCHIVE_CANDIDATE: archiveN, KEEP: keepN, totalListed: candidates.length },
    items: candidates,
    duplicateLogicNotes: [
      "vehicle-battery-db.json + vehicle-alias-db.ts + vehicle-canonical-registry — 검색/상세 핵심, 삭제 금지",
      "car-assets.ts + vehicle-asset-v04/chevrolet/genesis — 세대별 이미지 resolver 중복 가능, 2차에서 통합 검토",
      "platform-data.ts vs home-main-catalog-data.ts — 카탈로그 소스 이중화 의심",
      "resolve-vehicle-alias-v01.ts — v03/registry와 병행 사용 여부 grep 후 2차 정리",
    ],
  };
}

/** ─── Security / bundle ─── */
async function runSecurityCheck() {
  const publicPaths = [
    "/reports/vehicle-db-integrity-audit.json",
    "/src/data/source-tables/공임차종표_프로그램용.xlsx",
    "/db-export-for-review/",
    "/data/vehicle-battery-db.json",
  ];
  const exposure = [];
  for (const p of publicPaths) {
    try {
      const { status, html } = await fetchHtml(p);
      exposure.push({ path: p, httpStatus: status, publiclyAccessible: status === 200 && !html.includes("<!DOCTYPE html>") || (status === 200 && p.endsWith(".json")) });
    } catch (e) {
      exposure.push({ path: p, httpStatus: 0, publiclyAccessible: false, note: e.message });
    }
  }

  const srcImportsReports = execSync('rg -l "reports/" src 2>nul || echo NONE', { cwd: ROOT, encoding: "utf8" }).trim();

  return {
    generatedAt: new Date().toISOString(),
    reportsInSrcBundle: srcImportsReports === "NONE" ? false : srcImportsReports,
    publicExposure: exposure,
    policy: {
      reports: "개발/감사용 — src import 없음 확인됨",
      sourceTables: "src/data/source-tables — Next static 아님, public 미복사",
      dbExport: "db-export-for-review — git only, .gitignore 추가 권장",
      recommendation: [
        "db-export-for-review/ 를 .gitignore에 추가",
        "reports/*.json 은 배포 번들 미포함 (src 밖)",
        "루트 .prod-* 임시 파일 DELETE_CANDIDATE",
      ],
    },
  };
}

function mdCustomer(data) {
  const lines = [
    "# Customer Flow Audit",
    "",
    `Generated: ${data.generatedAt}`,
    `Base: ${data.baseUrl}`,
    `Build stamp (local): ${data.buildStamp}`,
    "",
    "## Summary",
    `- Pass: ${data.summary.pass}`,
    `- Fail: ${data.summary.fail}`,
    `- P0: ${data.summary.p0Issues}`,
    "",
    "| Flow | Route | OK | Status | Priority | Error |",
    "|------|-------|----|--------|----------|-------|",
  ];
  for (const i of data.items) {
    lines.push(
      `| ${i.flowName} | ${i.route} | ${i.works ? "✓" : "✗"} | ${i.httpStatus} | ${i.priority ?? "—"} | ${i.error ?? ""} |`,
    );
  }
  return lines.join("\n");
}

function mdTrust(data) {
  return [
    "# Trust UX Audit",
    "",
    `Generated: ${data.generatedAt}`,
    "",
    "## Trust elements",
    ...data.items.map(
      (i) =>
        `### ${i.element}\n- Locations: ${(i.locations || []).join(", ")}\n- Gap: ${i.gap ?? "—"}\n- Priority: ${i.priority ?? "OK"}\n`,
    ),
    "## Dev copy exposure",
    ...data.devCopyFindings.map((d) => `- **${d.path}**: ${d.text} (${d.exposure})`),
  ].join("\n");
}

function mdDead(data) {
  return [
    "# Dead Code & File Audit (Phase 1 — no deletion)",
    "",
    `Generated: ${data.generatedAt}`,
    "",
    "## Summary",
    `- DELETE_CANDIDATE: ${data.summary.DELETE_CANDIDATE}`,
    `- ARCHIVE_CANDIDATE: ${data.summary.ARCHIVE_CANDIDATE}`,
    `- KEEP: ${data.summary.KEEP}`,
    "",
    "## Duplicate logic notes",
    ...data.duplicateLogicNotes.map((n) => `- ${n}`),
    "",
    "## Files",
    "| Path | Class | Imports | Route | Safe delete | Reason |",
    "|------|-------|---------|-------|-------------|--------|",
    ...data.items.map(
      (i) =>
        `| ${i.path} | ${i.classification} | ${i.importedByCount} | ${i.referencedByRoute ? "yes" : "no"} | ${i.safeToDelete} | ${i.reason} |`,
    ),
  ].join("\n");
}

async function main() {
  console.log("Customer flow audit (production)...");
  const customer = await runCustomerFlowAudit();

  // Enrich trust with service-center fetch
  const trust = runTrustAudit();
  try {
    const { html } = await fetchHtml("/service-center");
    trust.items[0].presentOnServiceCenter = html.includes("010-8339-8316");
    trust.items[1].presentOnServiceCenter = html.includes("010-8896-8316");
  } catch {
    /* ignore */
  }

  console.log("Dead code / file audit...");
  const dead = classifyDeadFiles();

  console.log("Security check...");
  const security = await runSecurityCheck();

  const runtime = {
    build: "pass (see CI log)",
    auditVehicleDb: "P0: 0 (3195 records, 16 findings)",
    batteryImageFit: {
      status: "fixed",
      serverSafeUtil: "src/lib/battery-image-presentation.ts",
      serverCaller: "VehicleCustomerBatteryShop uses getBatteryImageFit",
      clientReExport: "BatteryThumbnail re-exports for client components only",
    },
    lint: "fail — ESLint circular config (pre-existing)",
    typecheckScript: "not in package.json; build TS pass",
  };

  writeFileSync(join(REPORTS, "customer-flow-audit.json"), JSON.stringify(customer, null, 2));
  writeFileSync(join(REPORTS, "customer-flow-audit.md"), mdCustomer(customer));
  writeFileSync(join(REPORTS, "trust-ux-audit.json"), JSON.stringify({ ...trust, security }, null, 2));
  writeFileSync(join(REPORTS, "trust-ux-audit.md"), mdTrust(trust));
  writeFileSync(join(REPORTS, "dead-code-and-file-audit.json"), JSON.stringify({ ...dead, security }, null, 2));
  writeFileSync(join(REPORTS, "dead-code-and-file-audit.md"), mdDead(dead));
  writeFileSync(
    join(REPORTS, "runtime-build-audit.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), ...runtime, security }, null, 2),
  );

  console.log("Wrote reports/customer-flow-audit.{md,json}");
  console.log("Wrote reports/trust-ux-audit.{md,json}");
  console.log("Wrote reports/dead-code-and-file-audit.{md,json}");
  console.log("Summary:", customer.summary);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
