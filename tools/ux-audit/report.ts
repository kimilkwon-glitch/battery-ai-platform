import fs from "fs";
import path from "path";
import { buildActionItems, pagePathLabel, renderActionItemsMarkdown } from "./actionItems";
import { getBaseUrl, getRunMode, REPORTS_DIR } from "./config";
import {
  aggregateFrustrationTags,
  pickRepresentativeComments,
  starsDisplay,
} from "./customerFeedback";
import { journeyLabel } from "./issueDetails";
import { countByJourney } from "./personas";
import type {
  AuditReport,
  DetailedIssue,
  JourneyType,
  Persona,
  ScenarioResult,
  Severity,
} from "./types";
import { JOURNEY_TYPE_LABELS } from "./types";

type IssueBreakdownItem = { label: string; count: number };

type AggregatedIssue = {
  rule: string;
  count: number;
  severity: Severity;
  message: string;
  suggestion?: string;
  breakdown: IssueBreakdownItem[];
  sampleIssue?: DetailedIssue;
};

const RULE_SUMMARY: Record<string, { title: string; message: string }> = {
  "core-result-visibility": {
    title: "검색 결과 상단에서 핵심 차량/규격이 보이지 않음",
    message: "상단 영역에 기대 키워드가 보이지 않음",
  },
  "missing-cta": {
    title: "다음 행동 CTA가 페이지에서 발견되지 않음",
    message: "상세 보기/규격 확인/답변 보기 등 CTA가 없음",
  },
  "battery-exact-match": {
    title: "검색 규격 exact match가 상단에 없음",
    message: "검색어 배터리 규격 exact match가 상단에 없음",
  },
  "vehicle-result-missing": {
    title: "검색 결과에 차량명 관련 결과 없음",
    message: "차량명 관련 결과가 검색 페이지에 없음",
  },
};

function ensureReportsDir() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function severityRank(s: Severity): number {
  return s === "HIGH" ? 3 : s === "MEDIUM" ? 2 : 1;
}

function aggregateTopIssues(results: ScenarioResult[], topN = 10): AggregatedIssue[] {
  const map = new Map<string, AggregatedIssue & { breakdownMap: Map<string, number> }>();

  for (const r of results) {
    for (const issue of r.issues) {
      const key = issue.issueType;
      const label = r.query || r.vehicleLabel || issue.personaName;
      const prev = map.get(key);
      if (prev) {
        prev.count++;
        prev.breakdownMap.set(label, (prev.breakdownMap.get(label) ?? 0) + 1);
        if (severityRank(issue.severity) > severityRank(prev.severity)) prev.severity = issue.severity;
      } else {
        const breakdownMap = new Map<string, number>();
        breakdownMap.set(label, 1);
        const meta = RULE_SUMMARY[key];
        map.set(key, {
          rule: key,
          count: 1,
          severity: issue.severity,
          message: meta?.message ?? issue.actual,
          suggestion: issue.suggestedFix,
          breakdown: [],
          breakdownMap,
          sampleIssue: issue,
        });
      }
    }
  }

  return [...map.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)
    .map(({ breakdownMap, sampleIssue, ...rest }) => ({
      ...rest,
      breakdown: [...breakdownMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => ({ label, count })),
      sampleIssue,
    }));
}

function journeysWithIssues(results: ScenarioResult[], rule: string): string {
  const set = new Set<string>();
  for (const r of results) {
    if (r.issues.some((i) => i.issueType === rule)) {
      set.add(JOURNEY_TYPE_LABELS[r.journeyType]);
    }
  }
  return [...set].join(", ") || "-";
}

function formatFailureCase(r: ScenarioResult, issue: DetailedIssue, caseNum: number): string[] {
  const lines: string[] = [];
  lines.push(`### CASE ${String(caseNum).padStart(3, "0")} — ${r.personaName}`);
  lines.push(`- **심각도:** ${issue.severity}`);
  lines.push(`- **여정:** ${JOURNEY_TYPE_LABELS[r.journeyType]}`);
  lines.push(`- **기기:** ${r.device} (${r.viewport.width}x${r.viewport.height})`);
  lines.push(`- **차량:** ${r.vehicleLabel}`);
  lines.push(`- **상황:** ${r.situation}`);
  lines.push(`- **목표:** ${r.goal}`);
  lines.push(`- **검색어/행동:** ${r.query || r.startBehavior}`);
  lines.push(`- **문제 발생 페이지:** ${issue.pageUrl}`);
  lines.push(`- **문제 발생 단계:** ${issue.actionBeforeIssue}`);
  lines.push(`- **기대한 것:** ${issue.expected}`);
  lines.push(`- **실제 본 것:** ${issue.actual}`);
  lines.push(`- **화면 근거:**`);
  lines.push(`  - evidence: ${issue.evidence}`);
  lines.push(`  - 상단 텍스트: ${issue.topVisibleTextSample.slice(0, 200).replace(/\n/g, " ")}…`);
  lines.push(`  - 보이는 버튼/CTA: ${issue.visibleCtas.slice(0, 8).join(", ") || "(없음)"}`);
  lines.push(`  - 보이는 카드(${issue.visibleCardsCount}): ${r.pageObservation.visibleCardsSummary.slice(0, 5).join(" | ") || "(없음)"}`);
  lines.push(`- **이동 경로:**`);
  for (const s of r.stepsLog) {
    lines.push(`  - ${s.step}. ${s.action} → ${s.success ? "OK" : "FAIL"} — ${s.notes}`);
  }
  lines.push(`- **고객 불만 예상:** ${issue.likelyUserFrustration}`);
  lines.push(`- **수정 제안:** ${issue.suggestedFix}`);
  lines.push(`### 고객 체감 평가`);
  lines.push(`- **별점:** ${starsDisplay(r.userRating)}`);
  lines.push(`- **감정:** ${r.userSentiment}`);
  lines.push(`- **신뢰도:** ${r.trustScore} / 5`);
  lines.push(`- **계속 사용할 가능성:** ${r.nextActionLikelihood}`);
  lines.push(`- **한줄 평가:** ${r.userComment}`);
  lines.push(`- **불만 태그:** ${r.frustrationTags.join(", ") || "(없음)"}`);
  if (issue.screenshotPath) lines.push(`- **스크린샷:** ${issue.screenshotPath}`);
  lines.push("");
  return lines;
}

function buildChatGptSummary(results: ScenarioResult[], topIssues: AggregatedIssue[]): string {
  const searchTypes: JourneyType[] = ["direct_search", "compare_battery"];
  const browseTypes: JourneyType[] = [
    "browse_vehicle",
    "browse_spec",
    "symptom_check",
    "photo_check",
    "faq_browse",
    "shop_order_check",
    "repair_shop_search",
    "trust_check",
  ];

  const byJourney = (types: JourneyType[]) =>
    results.filter((r) => types.includes(r.journeyType) && r.issues.length);

  const highCases = results
    .flatMap((r) => r.issues.filter((i) => i.severity === "HIGH").map((i) => ({ r, i })))
    .slice(0, 3);

  const lines: string[] = [];
  lines.push("현재 Battery Manager UX Audit 결과입니다.");
  lines.push("");
  lines.push(
    "이번 테스트는 단순 검색어 테스트가 아니라, 서로 다른 차량/성격/목적을 가진 가상 고객들이 사이트를 이용하는 방식으로 진행했습니다.",
  );
  lines.push("");
  lines.push("핵심 문제:");
  topIssues.slice(0, 5).forEach((t, i) => {
    lines.push(`${i + 1}. ${RULE_SUMMARY[t.rule]?.title ?? t.message} (${t.count}건)`);
  });
  lines.push("");
  lines.push("대표 실패 사례:");
  highCases.forEach(({ r, i }, idx) => {
    lines.push(
      `${idx + 1}. ${r.personaName} | ${JOURNEY_TYPE_LABELS[r.journeyType]} | ${r.query || r.startBehavior} | ${i.actionBeforeIssue} | ${i.likelyUserFrustration}`,
    );
  });
  lines.push("");
  lines.push("검색형 고객 문제:");
  byJourney(searchTypes).slice(0, 5).forEach((r) => {
    lines.push(`- ${r.personaName}: ${r.issues[0]?.actual ?? r.error}`);
  });
  lines.push("");
  lines.push("탐색형 고객 문제:");
  byJourney(browseTypes.filter((j) => !["photo_check", "repair_shop_search", "trust_check"].includes(j))).slice(0, 3).forEach((r) => {
    lines.push(`- ${r.personaName} (${JOURNEY_TYPE_LABELS[r.journeyType]}): ${r.issues[0]?.actual ?? ""}`);
  });
  lines.push("");
  lines.push("비교형 고객 문제:");
  results.filter((r) => r.journeyType === "compare_battery" && r.issues.length).slice(0, 3).forEach((r) => {
    lines.push(`- ${r.personaName}: ${r.issues[0]?.actual}`);
  });
  lines.push("");
  lines.push("정비소/매장 찾기 고객 문제:");
  results.filter((r) => r.journeyType === "repair_shop_search" && r.issues.length).slice(0, 2).forEach((r) => {
    lines.push(`- ${r.personaName}: ${r.issues[0]?.actual}`);
  });
  lines.push("");
  lines.push("사진 확인 고객 문제:");
  results.filter((r) => r.journeyType === "photo_check" && r.issues.length).slice(0, 2).forEach((r) => {
    lines.push(`- ${r.personaName}: ${r.issues[0]?.actual}`);
  });
  lines.push("");
  lines.push("신뢰 확인 고객 문제:");
  results.filter((r) => r.journeyType === "trust_check" && r.issues.length).slice(0, 2).forEach((r) => {
    lines.push(`- ${r.personaName}: ${r.issues[0]?.actual}`);
  });
  lines.push("");
  lines.push("우선 수정이 필요한 항목:");
  topIssues.slice(0, 5).forEach((t, i) => {
    lines.push(`${i + 1}. [${t.severity}] ${t.suggestion ?? t.message}`);
  });
  lines.push("");
  lines.push("이 결과를 기준으로 Cursor에 줄 개선 프롬프트를 만들어주세요.");
  return lines.join("\n");
}

function buildShortSummary(report: AuditReport, topIssues: AggregatedIssue[], chatgpt: string, results: ScenarioResult[]): string {
  const avgRating = results.reduce((s, r) => s + r.userRating, 0) / Math.max(1, results.length);
  const avgTrust = results.reduce((s, r) => s + r.trustScore, 0) / Math.max(1, results.length);
  const lowNext = results.filter((r) => r.nextActionLikelihood === "low").length;
  const lowPct = Math.round((lowNext / Math.max(1, results.length)) * 100);
  const topTags = aggregateFrustrationTags(results).slice(0, 5);
  const repComments = pickRepresentativeComments(results, 5);

  const lines: string[] = [];
  lines.push(`Battery Manager UX Audit (${report.executedAt})`);
  lines.push(`모드: ${report.runMode} | Base: ${report.baseUrl}`);
  lines.push(`페르소나: ${report.executedCount}/${report.totalPersonasGenerated}`);
  lines.push(
    `PASS ${report.summary.pass} / WARNING ${report.summary.warn} / FAIL ${report.summary.fail} | HIGH ${report.summary.high}`,
  );
  lines.push("");
  topIssues.slice(0, 5).forEach((t, i) => {
    const sample = t.sampleIssue;
    lines.push(`${i + 1}. ${RULE_SUMMARY[t.rule]?.title ?? t.rule} (${t.count}건)`);
    if (sample) {
      lines.push(`   대표: ${sample.personaName} | ${sample.actionBeforeIssue}`);
      lines.push(`   불편: ${sample.likelyUserFrustration.slice(0, 80)}`);
    }
  });
  lines.push("");
  lines.push("## 고객 체감 반응 요약");
  lines.push(`- 평균 별점: ${avgRating.toFixed(1)} / 5`);
  lines.push(`- 평균 신뢰도: ${avgTrust.toFixed(1)} / 5`);
  lines.push(`- 계속 사용할 가능성 low 비율: ${lowPct}% (${lowNext}명)`);
  lines.push("- 가장 많이 나온 불만 태그 TOP 5:");
  topTags.forEach((t) => lines.push(`  - ${t.label}: ${t.count}명`));
  lines.push("- 대표 고객 멘트:");
  repComments.forEach((c) => lines.push(`  - ${c}`));
  lines.push("");
  lines.push("— ChatGPT 전달용 —");
  lines.push(chatgpt.slice(0, 2200));
  return lines.join("\n").slice(0, 3000);
}

function journeySection(results: ScenarioResult[], journey: JourneyType): string[] {
  const subset = results.filter((r) => r.journeyType === journey);
  const failed = subset.filter((r) => r.finalStatus !== "PASS");
  const topRules = new Map<string, number>();
  for (const r of failed) {
    for (const i of r.issues) topRules.set(i.issueType, (topRules.get(i.issueType) ?? 0) + 1);
  }
  const mainIssue = [...topRules.entries()].sort((a, b) => b[1] - a[1])[0];
  const sample = failed.find((r) => r.issues.length);

  return [
    `### ${JOURNEY_TYPE_LABELS[journey]}`,
    `- 실행: ${subset.length}명 | 실패/경고: ${failed.length}명`,
    `- 주요 문제: ${mainIssue ? `${mainIssue[0]} (${mainIssue[1]}건)` : "없음"}`,
    `- 대표 페르소나: ${sample?.personaName ?? "-"}`,
    `- 수정 제안: ${sample?.issues[0]?.suggestedFix ?? "-"}`,
    "",
  ];
}

function personalitySection(results: ScenarioResult[], personality: string): string[] {
  const subset = results.filter((r) => r.personality === personality && r.issues.length);
  if (!subset.length) return [];
  const sample = subset[0];
  return [
    `### ${personality}`,
    `- 막힌 시나리오: ${subset.length}명`,
    `- 가장 많이 막힌 지점: ${sample.issues[0]?.actionBeforeIssue}`,
    `- 예상 이탈: ${sample.issues[0]?.likelyUserFrustration}`,
    `- 수정 제안: ${sample.issues[0]?.suggestedFix}`,
    "",
  ];
}

export function buildAuditReport(allPersonas: Persona[], results: ScenarioResult[]): AuditReport {
  const allIssues = results.flatMap((r) => r.issues);
  const sev = { HIGH: 0, MEDIUM: 0, LOW: 0 } as Record<Severity, number>;
  for (const i of allIssues) sev[i.severity]++;

  return {
    executedAt: new Date().toISOString(),
    baseUrl: getBaseUrl(),
    runMode: getRunMode(),
    totalPersonasGenerated: allPersonas.length,
    executedCount: results.length,
    executedPersonaIds: results.map((r) => r.scenarioId),
    results,
    summary: {
      pass: results.filter((r) => r.finalStatus === "PASS").length,
      warn: results.filter((r) => r.finalStatus === "WARNING").length,
      fail: results.filter((r) => r.finalStatus === "FAIL").length,
      high: sev.HIGH,
      medium: sev.MEDIUM,
      low: sev.LOW,
    },
  };
}

export function writeReports(allPersonas: Persona[], results: ScenarioResult[]): void {
  ensureReportsDir();
  const report = buildAuditReport(allPersonas, results);
  const topIssues = aggregateTopIssues(results);
  const chatgpt = buildChatGptSummary(results, topIssues);
  const actionItems = buildActionItems(results);
  const executedSet = new Set(report.executedPersonaIds);

  const md: string[] = [];
  md.push("# Battery Manager UX Audit Report");
  md.push("");
  md.push("## 1. 실행 요약");
  md.push(`- 실행 일시: ${report.executedAt}`);
  md.push(`- Base URL: ${report.baseUrl}`);
  md.push(`- 총 생성 페르소나: ${report.totalPersonasGenerated}`);
  md.push(`- 이번 실행 페르소나: ${report.executedCount}`);
  md.push(`- PASS/WARNING/FAIL: ${report.summary.pass}/${report.summary.warn}/${report.summary.fail}`);
  md.push(`- HIGH/MEDIUM/LOW: ${report.summary.high}/${report.summary.medium}/${report.summary.low}`);
  md.push(`- 실행 모드: ${report.runMode}`);
  md.push("");
  md.push("## 2. 가장 심각한 문제 TOP 10");
  topIssues.forEach((t, i) => {
    const title = RULE_SUMMARY[t.rule]?.title ?? t.rule;
    md.push(`### ${i + 1}. ${title}`);
    md.push(`- **발생 건수:** ${t.count}건`);
    md.push(`- **영향 여정:** ${journeysWithIssues(results, t.rule)}`);
    if (t.sampleIssue) {
      md.push(`- **대표 페르소나:** ${t.sampleIssue.personaName}`);
      md.push(`- **대표 검색어:** ${t.sampleIssue.query || "-"}`);
      md.push(`- **대표 페이지:** ${pagePathLabel(t.sampleIssue.pageUrl)}`);
      md.push(`- **고객이 느낄 불편:** ${t.sampleIssue.likelyUserFrustration}`);
    }
    md.push(`- **수정 방향:** ${t.suggestion ?? "-"}`);
    md.push("");
  });
  md.push("## 3. 여정별 문제 요약");
  md.push("");
  for (const j of Object.keys(JOURNEY_TYPE_LABELS) as JourneyType[]) {
    md.push(...journeySection(results, j));
  }
  md.push("## 4. 고객 유형별 문제 요약");
  md.push("");
  for (const p of [
    "급한 사람",
    "꼼꼼한 사람",
    "가격 비교형",
    "차를 잘 모르는 사람",
    "정비 지식 있는 사람",
    "모바일로 대충 보는 사람",
    "신뢰 확인형",
    "구매 직전형",
    "문의 전 확인형",
  ]) {
    md.push(...personalitySection(results, p));
  }
  md.push("## 5. 페이지별 문제 요약");
  md.push("");
  const pageMap = new Map<string, DetailedIssue[]>();
  for (const r of results) {
    for (const i of r.issues) {
      const p = pagePathLabel(i.pageUrl);
      const list = pageMap.get(p) ?? [];
      list.push(i);
      pageMap.set(p, list);
    }
  }
  for (const [page, issues] of [...pageMap.entries()].sort((a, b) => b[1].length - a[1].length)) {
    md.push(`### ${page}`);
    md.push(`- 발생 이슈: ${issues.length}건`);
    md.push(`- 대표 문제: ${issues[0].issueType}`);
    md.push(`- 고객 불편: ${issues[0].likelyUserFrustration}`);
    md.push(`- 수정 제안: ${issues[0].suggestedFix}`);
    md.push("");
  }
  md.push("## 6. 차량별 문제 요약");
  md.push("");
  const vehicleMap = new Map<string, ScenarioResult[]>();
  for (const r of results.filter((x) => x.issues.length)) {
    const list = vehicleMap.get(r.vehicleLabel) ?? [];
    list.push(r);
    vehicleMap.set(r.vehicleLabel, list);
  }
  for (const [v, rs] of [...vehicleMap.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 15)) {
    md.push(`### ${v}`);
    md.push(`- 관련 시나리오: ${rs.length}명 | 실패/경고: ${rs.filter((r) => r.finalStatus !== "PASS").length}명`);
    md.push(`- 주요 문제: ${rs[0].issues.map((i) => i.issueType).join(", ")}`);
    md.push(`- 수정 제안: ${rs[0].issues[0]?.suggestedFix ?? "-"}`);
    md.push("");
  }
  md.push("## 7. 규격별 문제 요약");
  md.push("");
  const specMap = new Map<string, ScenarioResult[]>();
  for (const r of results.filter((x) => x.batterySpec && x.issues.length)) {
    const list = specMap.get(r.batterySpec!) ?? [];
    list.push(r);
    specMap.set(r.batterySpec!, list);
  }
  for (const [spec, rs] of [...specMap.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 15)) {
    const exactFail = rs.some((r) => r.issues.some((i) => i.issueType === "battery-exact-match"));
    md.push(`### ${spec}`);
    md.push(`- 시나리오: ${rs.length}명 | exact match 문제: ${exactFail ? "있음" : "없음"}`);
    md.push(`- 수정 제안: ${rs[0].issues[0]?.suggestedFix ?? "-"}`);
    md.push("");
  }
  md.push("## 8. 상세 실패 사례");
  md.push("");
  let caseNum = 0;
  for (const r of results) {
    for (const issue of r.issues.filter((i) => i.severity === "HIGH")) {
      caseNum++;
      if (caseNum > 25) break;
      md.push(...formatFailureCase(r, issue, caseNum));
    }
    if (caseNum > 25) break;
  }
  md.push("## 9. ChatGPT 전달용 요약");
  md.push("");
  md.push(chatgpt);

  fs.writeFileSync(path.join(REPORTS_DIR, "ux-audit-report.md"), md.join("\n"), "utf8");
  fs.writeFileSync(path.join(REPORTS_DIR, "ux-audit-summary.txt"), buildShortSummary(report, topIssues, chatgpt, results), "utf8");
  fs.writeFileSync(path.join(REPORTS_DIR, "ux-audit-raw.json"), JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(
    path.join(REPORTS_DIR, "ux-audit-action-items.md"),
    renderActionItemsMarkdown(report, actionItems),
    "utf8",
  );

  const personaList = allPersonas.map((p) => ({
    id: p.id,
    executed: executedSet.has(p.id),
    personaName: p.personaName,
    journeyType: p.journeyType,
    personality: p.personality,
    vehicle: p.vehicle,
    query: p.query,
    goal: p.goal,
  }));
  fs.writeFileSync(path.join(REPORTS_DIR, "persona-list.json"), JSON.stringify(personaList, null, 2), "utf8");

  const journeyCounts = countByJourney(allPersonas);
  const personaMd = [
    "# UX Audit Persona List",
    "",
    `Total: ${allPersonas.length} | 이번 실행: ${report.executedCount}명`,
    "",
    "## journeyType별 개수 (500명)",
    ...Object.entries(journeyCounts).map(([j, c]) => `- ${JOURNEY_TYPE_LABELS[j as JourneyType]}: ${c}명`),
    "",
    "## 페르소나 목록 (✓ = 이번 실행)",
    "",
  ];
  allPersonas.forEach((p) => {
    const mark = executedSet.has(p.id) ? "✓" : " ";
    personaMd.push(
      `- [${mark}] **${p.id}** | ${p.personaName} | ${JOURNEY_TYPE_LABELS[p.journeyType]} | ${p.personality} | ${p.query || p.startBehavior}`,
    );
  });
  fs.writeFileSync(path.join(REPORTS_DIR, "persona-list.md"), personaMd.join("\n"), "utf8");
}

export { journeyLabel };
