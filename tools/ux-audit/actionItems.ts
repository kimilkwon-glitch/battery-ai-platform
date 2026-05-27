import type { AuditReport, DetailedIssue, ScenarioResult } from "./types";
import { JOURNEY_TYPE_LABELS } from "./types";

export type ActionItem = {
  priority: number;
  title: string;
  evidence: string;
  affectedPersonas: string[];
  affectedPages: string[];
  recommendedFix: string;
  risk: string;
  cursorPromptHint: string;
  customerReactions: string[];
  improvementReason?: string;
};

const ISSUE_TITLES: Record<string, string> = {
  "core-result-visibility": "검색 결과 상단 핵심 차량/규격 노출",
  "missing-cta": "CTA 위치·문구 정리",
  "battery-exact-match": "배터리 규격 exact match 상단 배치",
  "vehicle-result-missing": "검색 결과 차량명 매칭",
  "browse-vehicle-missing": "차종 탐색에서 차량 찾기",
  "browse-spec-missing": "규격 탐색 정보 구조",
  "photo-guidance-missing": "사진 확인 촬영 안내",
  "repair-shop-missing": "정비소/매장 찾기 안내",
  "shop-guidance-missing": "주문/배송 전 안내",
  "faq-content-missing": "FAQ/Q&A 콘텐츠 구조",
  "journey-navigation-failed": "메인·사이드바 네비게이션 일관성",
  "dev-terminology": "고객용 문구로 내부 용어 제거",
  "excessive-cards": "검색 결과 카드 수 축소",
  "unrelated-batteries": "무관한 배터리 카드 숨김",
  "page-too-long": "페이지 길이·접기 처리",
  "photo-cta": "사진 확인 CTA 배치",
  "bms-ibs-relevance": "BMS/IBS 검색 연결",
};

function pagePath(url: string): string {
  try {
    const u = new URL(url);
    const p = u.pathname;
    if (p === "/" || p === "") return "/";
    if (p.startsWith("/search")) return "/search";
    if (p.includes("/vehicles")) return "차량 상세/목록";
    if (p.includes("/compare")) return "배터리 규격/비교";
    if (p.includes("/community")) return "FAQ/질문";
    if (p.includes("/analysis/photo")) return "사진 확인";
    if (p.includes("/service-center")) return "정비소/매장";
    if (p.includes("/diagnosis")) return "증상 확인";
    if (p.includes("/shop")) return "쇼핑/주문";
    return p;
  } catch {
    return url || "(unknown)";
  }
}

export function buildActionItems(results: ScenarioResult[]): ActionItem[] {
  const byType = new Map<string, DetailedIssue[]>();
  for (const r of results) {
    for (const issue of r.issues) {
      const list = byType.get(issue.issueType) ?? [];
      list.push(issue);
      byType.set(issue.issueType, list);
    }
  }

  const sorted = [...byType.entries()].sort((a, b) => {
    const sev = (issues: DetailedIssue[]) => {
      if (issues.some((i) => i.severity === "HIGH")) return 3;
      if (issues.some((i) => i.severity === "MEDIUM")) return 2;
      return 1;
    };
    const d = sev(b[1]) - sev(a[1]);
    return d !== 0 ? d : b[1].length - a[1].length;
  });

  return sorted.slice(0, 15).map(([type, issues], idx) => {
    const sample = issues[0];
    const personas = [...new Set(issues.map((i) => i.personaName))].slice(0, 8);
    const pages = [...new Set(issues.map((i) => pagePath(i.pageUrl)))].slice(0, 6);

    const matching = results.filter((r) => r.issues.some((i) => i.issueType === type));
    const frustrationQuotes = matching
      .flatMap((r) => r.issues.filter((i) => i.issueType === type).map((i) => i.likelyUserFrustration))
      .filter(Boolean);
    const seenQuotes = new Set<string>();
    const customerReactions: string[] = [];
    for (const q of frustrationQuotes.sort((a, b) => a.length - b.length)) {
      const key = q.slice(0, 36);
      if (seenQuotes.has(key)) continue;
      seenQuotes.add(key);
      customerReactions.push(q);
      if (customerReactions.length >= 3) break;
    }
    if (customerReactions.length < 3) {
      for (const r of matching.sort((a, b) => a.userRating - b.userRating)) {
        const key = r.userComment.slice(0, 36);
        if (seenQuotes.has(key)) continue;
        seenQuotes.add(key);
        customerReactions.push(r.userComment);
        if (customerReactions.length >= 3) break;
      }
    }
    const lowNextCount = matching.filter((r) => r.nextActionLikelihood === "low").length;
    const avgRating =
      matching.length > 0 ? matching.reduce((s, r) => s + r.userRating, 0) / matching.length : 0;

    return {
      priority: idx + 1,
      title: ISSUE_TITLES[type] ?? type,
      evidence: `${issues.length}건 | 예: ${sample.evidence.slice(0, 120)}`,
      affectedPersonas: personas,
      affectedPages: pages,
      recommendedFix: sample.suggestedFix,
      risk: issues.some((i) => i.severity === "HIGH")
        ? "HIGH — 급한/구매 직전 고객 이탈 가능"
        : "MEDIUM — 탐색·비교 고객 불편 누적",
      cursorPromptHint: `${ISSUE_TITLES[type] ?? type}: ${pages.join(", ")} 페이지에서 ${sample.expected}. ${sample.suggestedFix}`,
      customerReactions,
      improvementReason:
        matching.length > 0
          ? `${type} 관련 고객 평균 별점 ${avgRating.toFixed(1)}, low 이탈 의향 ${lowNextCount}명`
          : undefined,
    };
  });
}

export function renderActionItemsMarkdown(report: AuditReport, items: ActionItem[]): string {
  const lines: string[] = ["# UX Audit Action Items", ""];
  lines.push("> Cursor/ChatGPT용 수정 후보 목록 — 코드 변경은 포함하지 않음");
  lines.push("");

  for (const item of items) {
    lines.push(`## 우선순위 ${item.priority} — ${item.title}`);
    lines.push(`- **priority:** ${item.priority}`);
    lines.push(`- **evidence:** ${item.evidence}`);
    lines.push(`- **affectedPersonas:** ${item.affectedPersonas.join("; ")}`);
    lines.push(`- **affectedPages:** ${item.affectedPages.join(", ")}`);
    lines.push(`- **recommendedFix:** ${item.recommendedFix}`);
    lines.push(`- **risk:** ${item.risk}`);
    lines.push(`- **cursorPromptHint:** ${item.cursorPromptHint}`);
    if (item.customerReactions.length) {
      lines.push(`- **고객 반응:**`);
      item.customerReactions.forEach((c) => lines.push(`  - "${c}"`));
    }
    if (item.improvementReason) {
      lines.push(`- **개선 이유:** ${item.improvementReason}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push(`생성: ${report.executedAt} | 모드: ${report.runMode} | 실행 ${report.executedCount}명`);
  return lines.join("\n");
}

export function pagePathLabel(url: string): string {
  return pagePath(url);
}

export { JOURNEY_TYPE_LABELS };
