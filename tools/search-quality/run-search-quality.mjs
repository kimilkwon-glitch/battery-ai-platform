/**
 * Production 검색 품질 QA — 메인 검색창 입력+Enter (Playwright) + QA API 교차 검증
 * 실행: node tools/search-quality/run-search-quality.mjs
 */
import { chromium, devices } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PERSONA_DEFINITIONS, ALIAS_QUERIES } from "./persona-definitions.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = path.join(__dirname, "reports");

const BASE = process.env.SEARCH_QA_BASE_URL ?? "https://battery-ai-platform.vercel.app";
const CACHE_BUST = process.env.SEARCH_QA_CB ?? "search-qa-persona-v1-20260530";

const FORBIDDEN_RE = [
  /준비\s*중/i,
  /샘플/i,
  /검증용/i,
  /UI\s*검증/i,
  /\bTODO\b/i,
  /\bmock\b/i,
  /\bdemo\b/i,
  /\bfixture\b/i,
];

const SUCCESS_TYPE_MAP = {
  immediate_confirmed: "즉시 확정형",
  year_branch: "연식 분기형",
  generation_select: "세대 선택형",
  fuel_trim_branch: "연료·트림 분기형",
  battery_code: "규격명 검색형",
  symptom_qa: "증상/Q&A 검색형",
  service_purchase: "구매/서비스 의도형",
  unknown: "별칭/파생명 검색형",
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function fetchQaApi(query) {
  const url = `${BASE}/api/qa/search-quality?q=${encodeURIComponent(query)}&_cb=${CACHE_BUST}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`QA API ${res.status}`);
  return res.json();
}

function extractCodes(text) {
  const set = new Set();
  const re = /\b(AGM|DIN|CMF|GB|EFB)\s*(\d+[A-Z]*R?L?)\b|\b(\d{2,3}R)\b/gi;
  let m;
  while ((m = re.exec(text))) {
    const c = (m[1] && m[2] ? `${m[1]}${m[2]}` : m[3])?.toUpperCase().replace(/\s/g, "");
    if (c) set.add(c);
  }
  return [...set];
}

function findForbidden(text) {
  return FORBIDDEN_RE.filter((re) => re.test(text)).map((re) => re.source);
}

function verdictFromScore(total) {
  if (total >= 9) return "성공";
  if (total >= 7) return "보완 필요";
  if (total >= 5) return "위험";
  return "실패";
}

function scorePersona(def, browser, api) {
  const issues = [];
  let queryRecognition = 0;
  let recommendationAccuracy = 0;
  let noConfusion = 0;
  let ctaQuality = 0;
  let conversionPotential = 0;

  if (browser.is404) {
    issues.push("검색 결과 404");
    return { issues, queryRecognition: 0, recommendationAccuracy: 0, noConfusion: 0, ctaQuality: 0, conversionPotential: 0, totalScore: 0, verdict: "실패" };
  }

  if (browser.queryInTitle || api.recognized) queryRecognition += 1;
  if (browser.hasResultsRoot && (api.vehicleResults.length > 0 || api.batteryResults.length > 0 || api.primaryResult.title)) {
    queryRecognition += 1;
  } else if (api.recognized) {
    queryRecognition += 1;
  } else {
    issues.push("검색어 인식·결과 블록 약함");
  }

  const apiErrors = api.warnings.filter((w) => w.level === "error");
  const apiCautions = api.warnings.filter((w) => w.level === "caution");
  recommendationAccuracy = 3;
  recommendationAccuracy -= apiErrors.length;
  recommendationAccuracy -= Math.min(2, apiCautions.length);
  if (browser.noSpecWhileVehicles) {
    recommendationAccuracy -= 1;
    issues.push("차량 카드 있는데 '등록된 규격 없음' 문구 노출");
  }
  if (def.query === "K3" && !browser.k3GenerationHint && api.generationCards.length > 1) {
    recommendationAccuracy -= 1;
    issues.push("K3 세대 선택 안내 문구 미노출");
  }
  recommendationAccuracy = Math.max(0, Math.min(3, recommendationAccuracy));

  noConfusion = 2;
  if (browser.forbidden.length) {
    noConfusion = 0;
    issues.push(`금지 문구: ${browser.forbidden.join(", ")}`);
  }
  if (browser.duplicateCtaCount > 3) {
    noConfusion -= 1;
    issues.push(`CTA/버튼 중복 가능 (${browser.duplicateCtaCount})`);
  }
  if (apiErrors.some((e) => e.reason?.includes("agm95l") || e.reason?.includes("100r"))) {
    noConfusion = 0;
  }
  noConfusion = Math.max(0, Math.min(2, noConfusion));

  const ctaCount = browser.ctaLabels.length || api.ctas.length;
  if (def.group === "G" || def.group === "F") {
    if (ctaCount >= 1 || api.relatedQa.length >= 1) ctaQuality = 2;
    else if (ctaCount > 0) ctaQuality = 1;
    else issues.push("서비스/증상 CTA·Q&A 부족");
  } else {
    if (ctaCount >= 2) ctaQuality = 2;
    else if (ctaCount >= 1) ctaQuality = 1;
    else issues.push("다음 행동 CTA 부족");
  }

  if (browser.detailUrl || api.primaryResult.url || api.vehicleResults[0]?.url || api.batteryResults[0]?.url) {
    conversionPotential = 1;
  }

  const totalScore =
    queryRecognition + recommendationAccuracy + noConfusion + ctaQuality + conversionPotential;

  return {
    issues,
    queryRecognition,
    recommendationAccuracy,
    noConfusion,
    ctaQuality,
    conversionPotential,
    totalScore,
    verdict: verdictFromScore(totalScore),
  };
}

async function runBrowserSearch(page, query) {
  const homeUrl = `${BASE}/?_cb=${CACHE_BUST}`;
  await page.goto(homeUrl, { waitUntil: "domcontentloaded", timeout: 45000 });

  const input = page
    .locator(
      '[data-home-section="search-hero"] input[name="q"], .home-hero-search input[name="q"], input[name="q"]',
    )
    .first();

  await input.waitFor({ state: "visible", timeout: 15000 });
  await input.fill(query);
  await input.press("Enter");

  try {
    await page.waitForURL(/\/search(\?|$)/, { timeout: 25000 });
  } catch {
    /* may stay on home with suggestions */
  }
  await page.waitForLoadState("domcontentloaded").catch(() => undefined);
  await page.waitForTimeout(800);

  const finalUrl = page.url();
  const is404 = (await page.locator("text=404").count()) > 0 && (await page.locator("h1").textContent())?.includes("404");

  const snapshot = await page.evaluate(() => {
    const root = document.querySelector("[data-search-results-root]") || document.body;
    const text = root.innerText || "";
    const summary = document.querySelector("#search-summary");
    const h1 = summary?.querySelector("h1")?.textContent ?? "";
    const vehicleHeading = [...root.querySelectorAll("h2")].map((h) => h.textContent?.trim() ?? "");
    const links = [...root.querySelectorAll("a")]
      .filter((a) => a.href && !a.href.startsWith("javascript"))
      .map((a) => ({ href: a.href, label: (a.textContent || "").trim().slice(0, 60) }))
      .slice(0, 40);
    const buttons = [...root.querySelectorAll("button")]
      .map((b) => (b.textContent || "").trim())
      .filter(Boolean)
      .slice(0, 20);
    return { text, h1, vehicleHeading, links, buttons };
  });

  const forbidden = findForbidden(snapshot.text + snapshot.h1);
  const codes = extractCodes(snapshot.text);
  const ctaLabels = [
    ...snapshot.links.filter((l) => /사진|체크|택배|매장|출장|상세|검색|문의|확인|주문/i.test(l.label)).map((l) => l.label),
    ...snapshot.buttons.filter((b) => /사진|체크|택배|매장|출장|상세|문의|확인|주문/i.test(b)),
  ];
  const labelCounts = {};
  for (const l of ctaLabels) labelCounts[l] = (labelCounts[l] || 0) + 1;
  const duplicateCtaCount = Object.values(labelCounts).filter((n) => n > 2).length;

  const noSpecWhileVehicles =
    /등록된 차량 규격 정보가 없습니다|아직 등록된 차량 규격/i.test(snapshot.text) &&
    /관련 차량|K3|세대/i.test(snapshot.text);

  const k3GenerationHint = /세대별로.*규격이 다를 수 있|세대를 선택/i.test(snapshot.text);

  const vehicleCards = snapshot.vehicleHeading.filter((h) => h.includes("차량") || h.includes("관련"));
  const generationCards = snapshot.links.filter(
    (l) => l.href.includes("/vehicle/") || l.href.includes("/search?q="),
  );

  const detailUrl =
    snapshot.links.find((l) => l.href.includes("/batteries/") || l.href.includes("/vehicle/"))?.href ?? "";

  return {
    method: "home_search_enter",
    finalUrl,
    is404,
    queryInTitle: snapshot.h1.includes(query) || snapshot.h1.includes("검색 결과"),
    hasResultsRoot: snapshot.text.length > 200,
    forbidden,
    codes,
    ctaLabels: [...new Set(ctaLabels)].slice(0, 12),
    duplicateCtaCount,
    noSpecWhileVehicles,
    k3GenerationHint,
    vehicleCardsShown: vehicleCards,
    generationCardsShown: generationCards.slice(0, 8).map((l) => l.label),
    relatedQaShown: snapshot.links.filter((l) => l.href.includes("/qa")).map((l) => l.label).slice(0, 5),
    detailUrlChecked: detailUrl,
    bodySnippet: snapshot.text.slice(0, 1200),
    h1: snapshot.h1,
  };
}

async function runMobileComplexityCheck(browser, query) {
  const iphone = devices["iPhone 13"];
  const ctx = await browser.newContext({ ...iphone });
  const page = await ctx.newPage();
  try {
    await runBrowserSearch(page, query);
    const complexity = await page.evaluate(() => {
      const root = document.querySelector("[data-search-results-root]") || document.body;
      const buttons = root.querySelectorAll("a, button").length;
      const sections = root.querySelectorAll("section, h2").length;
      return { buttons, sections, textLen: (root.innerText || "").length };
    });
    return complexity.buttons > 18 || complexity.sections > 8;
  } finally {
    await ctx.close();
  }
}

async function evaluatePersona(browserInstance, def, { mobileCheck = false }) {
  const context = await browserInstance.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: "BatteryManager-SearchQA/1.0",
  });
  const page = await context.newPage();
  let browser;
  let api;
  try {
    [browser, api] = await Promise.all([
      runBrowserSearch(page, def.query),
      fetchQaApi(def.query).catch((e) => ({ error: String(e) })),
    ]);
  } finally {
    await context.close();
  }

  if (api.error) {
    return {
      ...def,
      testMethod: "playwright_home_enter + qa_api_failed",
      openedUrl: browser.finalUrl,
      actualResult: "QA API 실패",
      recognized: false,
      issues: ["QA API unreachable"],
      totalScore: 0,
      verdict: "실패",
      scoreBreakdown: { queryRecognition: 0, recommendationAccuracy: 0, noConfusion: 0, ctaQuality: 0, conversionPotential: 0 },
      browser,
      api: null,
    };
  }

  const scores = scorePersona(def, browser, api);
  const actualType = SUCCESS_TYPE_MAP[api.successType] ?? api.successType;

  let mobileComplex = false;
  if (mobileCheck) {
    mobileComplex = await runMobileComplexityCheck(browserInstance, def.query);
    if (mobileComplex) scores.issues.push("모바일 뷰포트에서 UI 요소 과다 가능");
  }

  const batteryCodesShown = [
    ...new Set([
      ...browser.codes,
      ...api.primaryResult.batteryCodes,
      ...api.batteryResults.map((b) => b.code),
      ...api.generationCards.flatMap((g) => g.batteryCodes),
    ]),
  ];

  return {
    id: def.id,
    persona: def.persona,
    customerType: def.customerType,
    query: def.query,
    intent: def.intent,
    desiredAction: def.desiredAction,
    expectedSuccessType: def.expectedSuccessType,
    actualResult: api.summary,
    actualSuccessType: actualType,
    openedUrl: browser.finalUrl,
    detailUrlChecked: browser.detailUrlChecked || api.primaryResult.url || "",
    recognized: api.recognized,
    batteryCodesShown,
    vehicleCardsShown: api.vehicleResults.map((v) => v.title).slice(0, 6),
    generationCardsShown: api.generationCards.map((g) => g.title).slice(0, 6),
    relatedQaShown: api.relatedQa.map((q) => q.title).slice(0, 5),
    ctaShown: [...new Set([...browser.ctaLabels, ...api.ctas.map((c) => c.label)])].slice(0, 10),
    issues: scores.issues,
    apiWarnings: api.warnings,
    scoreBreakdown: {
      queryRecognition: scores.queryRecognition,
      recommendationAccuracy: scores.recommendationAccuracy,
      noConfusion: scores.noConfusion,
      ctaQuality: scores.ctaQuality,
      conversionPotential: scores.conversionPotential,
    },
    totalScore: scores.totalScore,
    verdict: scores.verdict,
    fixSuggestion: scores.issues[0] ?? "",
    testMethod: "playwright_home_enter + qa_api",
    mobileComplex,
    browser,
    api,
  };
}

async function evaluateAlias(browserInstance, query) {
  const context = await browserInstance.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  let browser;
  let api;
  try {
    [browser, api] = await Promise.all([
      runBrowserSearch(page, query),
      fetchQaApi(query).catch((e) => ({ error: String(e) })),
    ]);
  } finally {
    await context.close();
  }

  return {
    query,
    openedUrl: browser.finalUrl,
    recognized: api.recognized ?? false,
    successType: api.successType ?? "unknown",
    summary: api.summary ?? api.error,
    vehicleCount: api.vehicleResults?.length ?? 0,
    generationCount: api.generationCards?.length ?? 0,
    primaryTitle: api.primaryResult?.title ?? "",
    batteryCodes: extractCodes(JSON.stringify(api)),
    warnings: api.warnings ?? [],
    issues: [
      ...(browser.forbidden.length ? [`금지문구:${browser.forbidden.join(",")}`] : []),
      ...(api.warnings?.map((w) => w.message) ?? []),
    ],
    browserMethod: browser.method,
  };
}

function aggregateStats(results) {
  const avg = results.reduce((s, r) => s + r.totalScore, 0) / results.length;
  const counts = { 성공: 0, "보완 필요": 0, 위험: 0, 실패: 0 };
  for (const r of results) counts[r.verdict] = (counts[r.verdict] || 0) + 1;
  return { avg: Math.round(avg * 10) / 10, counts };
}

function buildTopIssues(results) {
  const issueMap = new Map();
  for (const r of results) {
    for (const issue of [...r.issues, ...(r.apiWarnings || []).map((w) => w.message)]) {
      if (!issue) continue;
      const key = issue.slice(0, 80);
      if (!issueMap.has(key)) issueMap.set(key, { issue: key, queries: [], count: 0 });
      const entry = issueMap.get(key);
      entry.count += 1;
      if (entry.queries.length < 5) entry.queries.push(r.query);
    }
  }
  return [...issueMap.values()].sort((a, b) => b.count - a.count).slice(0, 10);
}

function generateReports(personaResults, aliasResults) {
  const { avg, counts } = aggregateStats(personaResults);
  const topIssues = buildTopIssues(personaResults);
  const failed = personaResults.filter((r) => r.verdict === "실패" || r.verdict === "위험");

  const personaListJson = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    cacheBust: CACHE_BUST,
    testMethod: "Playwright: home search input + Enter; QA API cross-check",
    personas: PERSONA_DEFINITIONS,
    aliasCount: ALIAS_QUERIES.length,
  };

  const rawJson = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    cacheBust: CACHE_BUST,
    stats: { averageScore: avg, verdictCounts: counts },
    personas: personaResults.map(({ browser, api, ...rest }) => ({
      ...rest,
      apiSummary: api ? { successType: api.successType, warnings: api.warnings } : null,
      browserFinalUrl: browser?.finalUrl,
    })),
    aliases: aliasResults,
  };

  const personaMd = `# 검색 품질 페르소나 50명

생성: ${rawJson.generatedAt}
대상: ${BASE}
방식: 메인 검색창 입력 + Enter (Playwright)

| # | 페르소나 | 검색어 | 예상 유형 |
|---|----------|--------|-----------|
${PERSONA_DEFINITIONS.map((p) => `| ${p.id} | ${p.persona} | ${p.query} | ${p.expectedSuccessType} |`).join("\n")}
`;

  const reportMd = `# Battery Manager 검색 품질 QA 보고서

생성: ${rawJson.generatedAt}
Production: ${BASE}
테스트: Playwright 메인 검색창 Enter + \`/api/qa/search-quality\` 교차 검증

## 1. 총괄 점수

- 평균 점수: **${avg} / 10**
- 성공: ${counts["성공"] ?? 0}명
- 보완 필요: ${counts["보완 필요"] ?? 0}명
- 위험: ${counts["위험"] ?? 0}명
- 실패: ${counts["실패"] ?? 0}명

## 2. 상위 문제 TOP 10

${topIssues
  .map(
    (t, i) => `### ${i + 1}. ${t.issue}
- 발생 검색어: ${t.queries.join(", ")} (외 ${t.count - 1}건)
- 고객 혼란: 검색 의도와 다른 규격/문구/CTA가 노출되거나 다음 행동이 불명확함
- 수정 방향: 검색 엔진·상단 안내·CTA 우선순위·Q&A 필터 정합성 점검
`,
  )
  .join("\n")}

## 3. 페르소나 50명 테스트 표

| 번호 | 페르소나 | 검색어 | 의도 | 예상 성공 유형 | 실제 결과 | 점수 | 판정 | 수정 |
|------|----------|--------|------|----------------|-----------|------|------|------|
${personaResults
  .map(
    (r) =>
      `| ${r.id} | ${r.persona} | ${r.query} | ${r.intent} | ${r.expectedSuccessType} | ${(r.actualSuccessType || r.actualResult).slice(0, 40)} | ${r.totalScore} | ${r.verdict} | ${r.issues.length ? "Y" : ""} |`,
  )
  .join("\n")}

## 4. 검색 유형별 분석

${["A", "B", "C", "D", "E", "F", "G"]
  .map((g) => {
    const rows = personaResults.filter((r) => PERSONA_DEFINITIONS.find((p) => p.id === r.id)?.group === g);
    const gavg = rows.length ? (rows.reduce((s, r) => s + r.totalScore, 0) / rows.length).toFixed(1) : "-";
    const labels = {
      A: "차종명 검색",
      B: "세대/연식 검색",
      C: "연료/트림 검색",
      D: "규격명 검색",
      E: "상용차 검색",
      F: "증상 검색",
      G: "구매 의도 검색",
    };
    return `### ${labels[g] || g}
- 평균 점수: ${gavg}
- 실패/위험: ${rows.filter((r) => r.verdict === "실패" || r.verdict === "위험").map((r) => r.query).join(", ") || "없음"}`;
  })
  .join("\n\n")}

### 별칭/파생명 검색 (별도, 50명 점수 미포함)

| 검색어 | 인식 | 유형 | 차량수 | 경고 |
|--------|------|------|--------|------|
${aliasResults
  .map(
    (a) =>
      `| ${a.query} | ${a.recognized ? "Y" : "N"} | ${a.successType} | ${a.vehicleCount} | ${a.issues[0] ?? "-"} |`,
  )
  .join("\n")}

## 5. DB 보강 필요 차종

다음은 결과가 비었거나 인식이 약한 케이스 (세대 선택형으로 정상인 K3류 제외):

${personaResults
  .filter((r) => r.totalScore <= 6 && !/^(K3|k3)$/i.test(r.query))
  .map((r) => `- ${r.query}: ${r.issues.join("; ") || r.actualResult}`)
  .join("\n") || "- 특이 케이스 없음"}

## 6. 검색 UI/UX 개선 제안

- K3 등 다세대 차종: 상단 '등록된 규격 없음' 문구와 세대 카드 동시 노출 금지 (부분 개선됨, 재검증 필요)
- 쏘렌토 MQ4: 하이브리드 AGM60L vs 일반 AGM80L 분기 시각적 분리 강화
- 스타리아: AGM80R 중심, CMF80L Q&A 혼입 차단
- 포터2: 90R/100R 연식 분기 CTA 중복 완화
- 100R: AGM95L 비교 CTA 재발 방지
- 증상 검색: 상품 카드보다 증상·Q&A·사진 CTA 우선
- 출장/택배: 서비스·주문 CTA 상단 배치

## 7. Cursor 수정 프롬프트

\`\`\`text
Battery Manager 검색 품질 개선 (production 기준).

참고 보고서: tools/search-quality/reports/search-quality-report.md
QA API: GET /api/qa/search-quality?q=

수정 우선순위:
1. K3·다세대: vehicles>0 이면 NO_REGISTERED_SPEC 상단 문구 숨김, 세대 안내 항상 표시, maxVehicles>=3
2. 쏘렌토 MQ4 하이브리드: primary AGM60L, 일반 MQ4는 fuel_trim_branch
3. 스타리아: AGM80R 우선, CMF80L Q&A 필터
4. 포터2: year_branch 90R/100R, 2020년식→100R
5. 100R: AGM95L compare CTA 금지
6. 증상: symptom_qa hero, 배터리 단독 상단 금지
7. 출장/택배: service_purchase CTA 우선

공통: runBatterySearch / buildSearchPageResults 단일 엔진 유지.
고객 화면 금지어: 준비중, 샘플, 검증용, mock, demo, fixture.
\`\`\`
`;

  const actionMd = `# 검색 품질 액션 아이템

${topIssues
  .map(
    (t, i) => `## P${i + 1}. ${t.issue}
- 검색어: ${t.queries.join(", ")}
- 조치: search-page-results / SearchResultsView / search-quality-rules 점검
`,
  )
  .join("\n")}

## 실패·위험 목록

${failed.map((r) => `- [${r.verdict}] ${r.query}: ${r.issues.join("; ")}`).join("\n") || "- 없음"}

`;

  const summaryTxt = `Battery Manager 검색 품질 QA
생성: ${rawJson.generatedAt}
URL: ${BASE}
방식: Playwright home Enter + QA API

평균: ${avg}/10
성공 ${counts["성공"]} / 보완 ${counts["보완 필요"]} / 위험 ${counts["위험"]} / 실패 ${counts["실패"]}

실패·위험: ${failed.map((r) => r.query).join(", ") || "없음"}

상위 문제: ${topIssues.slice(0, 3).map((t) => t.issue).join(" | ")}

보고서: tools/search-quality/reports/search-quality-report.md
`;

  ensureDir(REPORT_DIR);
  fs.writeFileSync(path.join(REPORT_DIR, "search-quality-persona-list.json"), JSON.stringify(personaListJson, null, 2));
  fs.writeFileSync(path.join(REPORT_DIR, "search-quality-persona-list.md"), personaMd);
  fs.writeFileSync(path.join(REPORT_DIR, "search-quality-raw.json"), JSON.stringify(rawJson, null, 2));
  fs.writeFileSync(path.join(REPORT_DIR, "search-quality-report.md"), reportMd);
  fs.writeFileSync(path.join(REPORT_DIR, "search-quality-action-items.md"), actionMd);
  fs.writeFileSync(path.join(REPORT_DIR, "search-quality-summary.txt"), summaryTxt);

  return { avg, counts, topIssues, failed };
}

async function main() {
  ensureDir(REPORT_DIR);
  console.log(`Search QA → ${BASE} (${CACHE_BUST})`);

  const browser = await chromium.launch({ headless: true });
  const personaResults = [];

  try {
    for (const def of PERSONA_DEFINITIONS) {
      process.stdout.write(`[${def.id}/50] ${def.query} ... `);
      const mobileCheck = def.id <= 5;
      const result = await evaluatePersona(browser, def, { mobileCheck });
      personaResults.push(result);
      console.log(`${result.verdict} (${result.totalScore})`);
    }

    console.log(`\n별칭 테스트 ${ALIAS_QUERIES.length}건 ...`);
    const aliasResults = [];
    for (const q of ALIAS_QUERIES) {
      process.stdout.write(`  alias: ${q} ... `);
      const a = await evaluateAlias(browser, q);
      aliasResults.push(a);
      console.log(a.recognized ? "ok" : "weak");
    }

    const stats = generateReports(personaResults, aliasResults);
    console.log("\n완료 — reports/search-quality-*");
    console.log(`평균 ${stats.avg}/10 | 실패·위험 ${stats.failed.length}건`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
