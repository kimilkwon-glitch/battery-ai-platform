import { getCustomerFrustrationForIssue, sanitizeCustomerText } from "./customerFeedback";
import type {
  DetailedIssue,
  JourneyType,
  PageObservation,
  Persona,
  ScenarioMetrics,
  Severity,
  StepLogEntry,
  UxIssue,
} from "./types";
import { JOURNEY_TYPE_LABELS } from "./types";

const ISSUE_TEMPLATES: Record<
  string,
  { expected: string; actual: string; frustration: (p: Persona) => string; fix: string }
> = {
  "core-result-visibility": {
    expected: "상단 영역에 차량명·규격·증상 관련 핵심 키워드가 보여야 함",
    actual: "상단 영역에 기대 키워드가 부족하거나 관련 없는 카드가 먼저 노출됨",
    frustration: (p) =>
      p.personality === "급한 사람"
        ? "급한 고객은 내 차 결과를 못 찾고 바로 이탈할 가능성이 높음"
        : "첫 화면에서 내 차 정보를 확인하지 못하면 신뢰가 떨어짐",
    fix: "검색/탐색 결과 최상단에 차량명+규격+상황 요약 카드를 배치하고 사진확인/문의 CTA를 추가",
  },
  "missing-cta": {
    expected: "상세 보기·규격 확인·답변 보기·문의 등 다음 행동 CTA가 보여야 함",
    actual: "기대 CTA가 페이지에서 발견되지 않음",
    frustration: () => "다음에 무엇을 해야 할지 모르면 문의·구매로 넘어가지 못함",
    fix: "핵심 결과 카드에 명확한 CTA(상세 보기, 사진 확인, 문의)를 배치",
  },
  "battery-exact-match": {
    expected: "검색어에 포함된 배터리 규격이 상단에 exact match로 노출되어야 함",
    actual: "검색 규격이 상단 fold 영역에 없음",
    frustration: (p) =>
      p.personality === "꼼꼼한 사람" || p.personality === "구매 직전형"
        ? "규격을 확신하지 못해 주문·교체를 보류할 가능성이 높음"
        : "잘못된 규격을 고를까 불안해 더 찾아보다 이탈",
    fix: "검색어 규격을 최상단 히어로/핵심 결과로 표시하고 L/R·단자 방향을 함께 안내",
  },
  "vehicle-result-missing": {
    expected: "검색 페이지 상단에 해당 차량 관련 결과가 있어야 함",
    actual: "차량명 관련 결과가 검색 페이지 본문에서 확인되지 않음",
    frustration: () => "내 차가 이 사이트에 없는 것처럼 느껴져 이탈 가능",
    fix: "차량 exact match 결과를 검색 상단에 노출",
  },
  "browse-vehicle-missing": {
    expected: "차종 탐색 페이지에서 내 차량을 찾을 수 있어야 함",
    actual: "차종 목록/검색에서 해당 차량 정보가 보이지 않음",
    frustration: () => "차종으로 찾기를 선택했는데 내 차를 못 찾으면 탐색을 포기",
    fix: "차종 목록 검색·필터·인기 차종 바로가기로 빠르게 찾을 수 있게",
  },
  "browse-spec-missing": {
    expected: "규격 탐색에서 해당 AGM/DIN/CMF 규격 정보가 보여야 함",
    actual: "규격 목록 상단에 기대 규격이 없음",
    frustration: () => "규격표를 봐도 내 규격을 못 찾으면 사진/문의로 넘어가기 어려움",
    fix: "규격 목록에 검색·필터·대표 규격 카드 강조",
  },
  "photo-guidance-missing": {
    expected: "사진 확인 페이지에 라벨·단자·전체샷 촬영 안내가 있어야 함",
    actual: "사진 촬영 안내 텍스트/CTA가 보이지 않음",
    frustration: (p) =>
      p.personality === "차를 잘 모르는 사람"
        ? "어떤 사진을 찍어야 하는지 몰라 문의로 넘어가지 못하고 포기"
        : "사진 확인 버튼은 찾았지만 안내가 없어 막막함",
    fix: "사진 확인 페이지에 촬영 예시·체크리스트·문의 CTA 배치",
  },
  "repair-shop-missing": {
    expected: "정비소/매장/출장/방문 안내와 문의 CTA가 보여야 함",
    actual: "오프라인 서비스·매장 찾기 안내가 페이지에 없음",
    frustration: () => "직접 방문·출장 교체를 원하는 고객은 오프라인 안내 없이 이탈",
    fix: "작업 가능점·매장·문의 CTA를 정비소 찾기 여정에 명확히 연결",
  },
  "shop-guidance-missing": {
    expected: "택배 주문·단자 방향·배송·반납 안내가 보여야 함",
    actual: "주문/배송 관련 안내가 페이지에 없음",
    frustration: () => "주문 전 확인 사항이 없으면 잘못 주문할까 불안",
    fix: "주문 전 체크리스트(단자 방향·사진 확인·배송)를 쇼핑/안내 페이지에 연결",
  },
  "faq-content-missing": {
    expected: "FAQ/Q&A에서 질문·답변 콘텐츠가 보여야 함",
    actual: "FAQ 탐색에서 질문/답변 구조가 불명확",
    frustration: () => "답을 못 찾으면 전화·다른 사이트로 넘어감",
    fix: "Q&A 목록·답변 보기·관련 CTA를 FAQ 여정에 명확히",
  },
  "journey-navigation-failed": {
    expected: "메인·사이드바 링크 클릭으로 의도한 페이지로 이동해야 함",
    actual: "여정 중 링크/버튼 클릭 또는 페이지 이동 실패",
    frustration: () => "원하는 메뉴를 못 찾으면 사이트 사용을 포기",
    fix: "메인·사이드바 CTA 라벨과 href를 일관되게 유지",
  },
  "dev-terminology": {
    expected: "고객용 자연어 문구만 보여야 함",
    actual: "DB·플랫폼·카탈로그 등 개발자 표현이 노출됨",
    frustration: (p) =>
      p.personality === "신뢰 확인형"
        ? "내부 용어가 보이면 테스트 페이지처럼 느껴져 신뢰 하락"
        : "전문 용어가 많으면 초보 고객이 불안해함",
    fix: "고객 화면에서 내부/개발 용어를 일상어로 교체",
  },
};

function defaultTemplate(rule: string) {
  return (
    ISSUE_TEMPLATES[rule] ?? {
      expected: "페이지가 고객 목표에 맞는 정보를 제공해야 함",
      actual: "기대와 다른 UX 문제가 감지됨",
      frustration: () => "원하는 정보를 찾지 못해 이탈 가능",
      fix: "해당 페이지의 정보 구조·CTA·노출 우선순위를 개선",
    }
  );
}

function inferActionBeforeIssue(issue: UxIssue, stepsLog: StepLogEntry[]): string {
  if (issue.actionBeforeIssue) return issue.actionBeforeIssue;
  const failed = [...stepsLog].reverse().find((s) => !s.success);
  if (failed) {
    if (failed.action === "search") return "검색 실행 후 결과 상단 확인";
    if (failed.action.startsWith("expect")) return `검색/탐색 후 ${failed.action} 단계 확인`;
    if (failed.action === "clickLink" || failed.action === "findAndClickAny")
      return `메인/탐색에서 ${Array.isArray(failed.target) ? failed.target[0] : failed.target} 클릭 시도`;
    return `${failed.action} 단계 (${failed.notes})`;
  }
  const last = stepsLog[stepsLog.length - 1];
  return last ? `${last.action}: ${last.notes}` : "페이지 로드 후 확인";
}

function buildEvidence(issue: UxIssue, obs: PageObservation, metrics: ScenarioMetrics): string {
  const parts: string[] = [];
  if (issue.rule === "core-result-visibility" && issue.context?.expectedKeywords.length) {
    const missing = issue.context.expectedKeywords.filter(
      (k) => !obs.topVisibleTextSample.toUpperCase().includes(k.toUpperCase()),
    );
    if (missing.length) parts.push(`상단 텍스트에 ${missing.join(", ")} 없음`);
  }
  if (issue.rule === "missing-cta") {
    parts.push(`감지된 CTA: ${metrics.ctaHits.join(", ") || "없음"}`);
  }
  if (issue.rule === "dev-terminology") {
    parts.push(`노출 용어: ${metrics.devTermHits.join(", ")}`);
  }
  if (!parts.length) {
    parts.push(`상단 텍스트 샘플 ${obs.topVisibleTextSample.slice(0, 120).replace(/\s+/g, " ")}…`);
  }
  return parts.join(" | ");
}

export function enrichIssues(
  rawIssues: UxIssue[],
  persona: Persona,
  vehicleLabel: string,
  stepsLog: StepLogEntry[],
  observation: PageObservation,
  metrics: ScenarioMetrics,
  screenshotPaths: Map<string, string>,
): DetailedIssue[] {
  return rawIssues.map((issue, idx) => {
    const tpl = defaultTemplate(issue.rule);
    const issueId = `${persona.id}_${issue.rule}_${idx + 1}`;

    return {
      issueId,
      issueType: issue.rule,
      severity: issue.severity,
      pageUrl: observation.pageUrl,
      pageTitle: observation.pageTitle,
      journeyType: persona.journeyType,
      personaName: persona.personaName,
      vehicleLabel,
      query: persona.query,
      actionBeforeIssue: inferActionBeforeIssue(issue, stepsLog),
      expected: tpl.expected,
      actual: issue.message || tpl.actual,
      evidence: buildEvidence(issue, observation, metrics),
      likelyUserFrustration: sanitizeCustomerText(
        getCustomerFrustrationForIssue(persona, issue.rule),
      ),
      suggestedFix: issue.suggestion ?? tpl.fix,
      relatedText: [
        ...observation.visibleHeadings.slice(0, 5),
        ...metrics.devTermHits,
        ...(issue.context?.expectedKeywords ?? []),
      ].slice(0, 8),
      screenshotPath: screenshotPaths.get(issue.rule),
      topVisibleTextSample: observation.topVisibleTextSample.slice(0, 800),
      visibleCtas: metrics.ctaHits.length ? metrics.ctaHits : observation.visibleButtons.slice(0, 10),
      visibleCardsCount: metrics.visibleCardCount,
      unrelatedResultsCount: Math.max(0, metrics.visibleCardCount - metrics.keywordHitsAboveFold - 2),
      scrollHeightRatio: Math.round(metrics.scrollRatio * 10) / 10,
    };
  });
}

export function maxSeverity(issues: { severity: Severity }[]): Severity {
  if (issues.some((i) => i.severity === "HIGH")) return "HIGH";
  if (issues.some((i) => i.severity === "MEDIUM")) return "MEDIUM";
  return "LOW";
}

export function toFinalStatus(status: "pass" | "warn" | "fail"): "PASS" | "WARNING" | "FAIL" {
  if (status === "pass") return "PASS";
  if (status === "warn") return "WARNING";
  return "FAIL";
}

export function journeyLabel(j: JourneyType): string {
  return JOURNEY_TYPE_LABELS[j];
}
