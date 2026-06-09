#!/usr/bin/env node
/**
 * Customer CTA button action audit (static source heuristics)
 * Usage: node tools/audit-button-actions.mjs
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const REPORTS = join(ROOT, "reports");

function readDirSources(relDir) {
  const abs = join(ROOT, relDir);
  if (!existsSync(abs)) return "";
  let buf = "";
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(tsx?|jsx?)$/.test(name)) buf += readFileSync(p, "utf8") + "\n";
    }
  };
  walk(abs);
  return buf;
}

function readProbe(relPath) {
  const abs = join(ROOT, relPath);
  if (!existsSync(abs)) return { path: relPath, exists: false, content: "" };
  if (statSync(abs).isDirectory()) return { path: relPath, exists: true, content: readDirSources(relPath) };
  return { path: relPath, exists: true, content: readFileSync(abs, "utf8") };
}

const BUTTONS = [
  {
    id: "save-vehicle-detail",
    label: "내 차량으로 정보등록",
    route: "/vehicle/[slug]",
    actionType: "modal",
    requiresAuth: false,
    nonLoggedIn: "회원가입 후 이용 가능합니다 모달 + 로그인/회원가입 redirect",
    loggedIn: "localStorage 저장 + 성공/실패 모달",
    priority: "P0",
    probeFiles: [
      "src/components/vehicle/SaveVehicleRegisterButton.tsx",
      "src/app/vehicle/[slug]/page.tsx",
    ],
    mustContain: [
      "SaveVehicleRegisterButton",
      "회원가입 후 이용 가능합니다",
      "saveVehicleFromDetail",
      "buildLoginRedirectUrl",
    ],
  },
  {
    id: "save-vehicle-search",
    label: "내 차량으로 등록 (검색 카드)",
    route: "/search",
    actionType: "modal",
    requiresAuth: false,
    nonLoggedIn: "SaveVehicleRegisterButton 게스트 모달",
    loggedIn: "localStorage 저장",
    priority: "P0",
    probeFiles: ["src/components/platform/SearchVehicleResultCard.tsx"],
    mustContain: ["SaveVehicleRegisterButton"],
  },
  {
    id: "add-to-cart",
    label: "장바구니 담기",
    route: "/batteries/[code]",
    actionType: "save",
    requiresAuth: false,
    nonLoggedIn: "장바구니 localStorage 추가 + 피드백",
    loggedIn: "동일",
    priority: "P0",
    probeFiles: ["src/components/battery"],
    mustContain: ["cart", "장바구니"],
  },
  {
    id: "login",
    label: "로그인",
    route: "/login",
    actionType: "save",
    requiresAuth: false,
    nonLoggedIn: "CustomerLoginForm 제출 → 세션 + redirect",
    loggedIn: "redirect 또는 마이페이지 이동",
    priority: "P0",
    probeFiles: ["src/components/auth/CustomerLoginForm.tsx", "src/app/login/page.tsx"],
    mustContain: ["setCustomerSession", "router.push"],
  },
  {
    id: "signup",
    label: "회원가입",
    route: "/signup",
    actionType: "save",
    requiresAuth: false,
    nonLoggedIn: "SignupForm 제출 → 세션 + redirect",
    loggedIn: "N/A",
    priority: "P0",
    probeFiles: ["src/components/auth/SignupForm.tsx"],
    mustContain: ["setCustomerSession"],
  },
  {
    id: "mypage",
    label: "마이페이지",
    route: "/mypage",
    actionType: "navigate",
    requiresAuth: false,
    nonLoggedIn: "페이지 표시 + 로그인 CTA",
    loggedIn: "등록 차량 목록 + 로그인 배너",
    priority: "P1",
    probeFiles: ["src/components/mypage/MyPageClient.tsx"],
    mustContain: ["isCustomerLoggedIn", "getCustomerVehicles"],
  },
  {
    id: "order",
    label: "주문하기 / 구매하기",
    route: "/cart, /order-request",
    actionType: "navigate",
    requiresAuth: false,
    nonLoggedIn: "주문·상담 폼 또는 장바구니 이동",
    loggedIn: "동일",
    priority: "P0",
    probeFiles: ["src/lib/customer-center-routes.ts"],
    mustContain: ["order-request", "cart"],
  },
  {
    id: "naver-place",
    label: "네이버 플레이스",
    route: "/service-center",
    actionType: "external",
    requiresAuth: false,
    nonLoggedIn: "외부 링크",
    loggedIn: "동일",
    priority: "P0",
    probeFiles: [
      "src/components/service",
      "src/lib/official-channels.ts",
      "src/lib/busan-service-hub-data.ts",
    ],
    mustContain: ["네이버 플레이스", "naver"],
  },
  {
    id: "phone",
    label: "전화하기",
    route: "/service-center",
    actionType: "external",
    requiresAuth: false,
    nonLoggedIn: "tel: 링크",
    loggedIn: "동일",
    priority: "P1",
    probeFiles: ["src/lib/busan-service-hub-data.ts", "src/components/service"],
    mustContain: ["tel:"],
  },
  {
    id: "product-inquiry",
    label: "제품문의 접수",
    route: "/batteries/[code]",
    actionType: "modal",
    requiresAuth: false,
    nonLoggedIn: "문의 패널 표시",
    loggedIn: "동일",
    priority: "P1",
    probeFiles: ["src/components/battery/BatteryProductQnaPanel.tsx"],
    mustContain: ["문의", "Inquiry"],
  },
];

function evaluateButton(btn) {
  let content = "";
  const missingFiles = [];
  for (const f of btn.probeFiles) {
    const probe = readProbe(f);
    if (!probe.exists) missingFiles.push(f);
    else content += probe.content + "\n";
  }
  const must = btn.mustContain ?? [];
  const mustNot = btn.mustNotContain ?? [];
  const failedTokens = must.filter((t) => !content.toLowerCase().includes(t.toLowerCase()));
  const forbiddenHit = mustNot.filter((t) => content.toLowerCase().includes(t.toLowerCase()));

  const status =
    missingFiles.length > 0 || failedTokens.length > 0 || forbiddenHit.length > 0 ? "fail" : "pass";

  return {
    id: btn.id,
    label: btn.label,
    route: btn.route,
    actionType: btn.actionType,
    requiresAuth: btn.requiresAuth,
    nonLoggedIn: btn.nonLoggedIn,
    loggedIn: btn.loggedIn,
    priority: btn.priority,
    status,
    missingFiles,
    failedTokens,
    notes:
      status === "pass"
        ? "Source probes satisfied"
        : [
            missingFiles.length ? `missing: ${missingFiles.join(", ")}` : "",
            failedTokens.length ? `missing tokens: ${failedTokens.join(", ")}` : "",
          ]
            .filter(Boolean)
            .join("; "),
  };
}

const evaluated = BUTTONS.map(evaluateButton);
const pass = evaluated.filter((e) => e.status === "pass").length;
const fail = evaluated.filter((e) => e.status === "fail").length;

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    pass,
    fail,
    total: evaluated.length,
    p0Fail: evaluated.filter((e) => e.priority === "P0" && e.status === "fail").length,
  },
  manualChecklist: [
    "로그인 후 QM5 상세 → 내 차량으로 정보등록 → 성공 모달 → 마이페이지 차량 표시",
    "비회원 로그인 redirect 복귀 ?action=saveVehicle 자동 저장",
    "GV80 / K3 / 100R 상세 CTA 무반응 없음 (브라우저 수동)",
  ],
  buttons: evaluated,
};

writeFileSync(join(REPORTS, "button-action-audit.json"), JSON.stringify(report, null, 2));

const md = [
  "# Button action audit",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  `**Summary:** ${pass} pass / ${fail} fail (${evaluated.length} total), P0 failures: ${report.summary.p0Fail}`,
  "",
  "## Results",
  "",
  "| Label | Route | Action | Auth | Status | Priority | Notes |",
  "|---|---|---|---|---|---|---|",
  ...evaluated.map(
    (b) =>
      `| ${b.label} | ${b.route} | ${b.actionType} | ${b.requiresAuth ? "yes" : "no"} | **${b.status}** | ${b.priority} | ${b.notes || "—"} |`,
  ),
  "",
  "## Manual checklist",
  "",
  ...report.manualChecklist.map((line) => `- ${line}`),
  "",
].join("\n");

writeFileSync(join(REPORTS, "button-action-audit.md"), md);
console.log(`Wrote reports/button-action-audit.json — ${pass}/${evaluated.length} pass`);
if (report.summary.p0Fail > 0) process.exit(1);
