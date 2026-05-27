import type { Page } from "@playwright/test";
import type { JourneyRunResult } from "./journeyRunner";
import { vehicleLabelFromPersona } from "./journeyRunner";
import type { Persona, ScenarioMetrics, UxIssue } from "./types";
const DEV_TERMS = [
  "DB",
  "플랫폼 데이터",
  "카탈로그",
  "매핑",
  "API",
  "fallback",
  "imageStatus",
  "데이터 연동",
  "전체 73개",
  "개발",
  " raw",
  " test",
  "로그",
] as const;

const CTA_PATTERNS = [
  "상세 보기",
  "규격 상세 보기",
  "차량 상세",
  "답변 보기",
  "사진으로 확인",
  "상담 준비",
  "문의",
  "확인하기",
  "증상 확인",
  "가이드",
  "비교",
  "더보기",
  "전체 차종",
] as const;

const BATTERY_CODE_RE = /\b(AGM\d+[LR]|DIN\d+[LR]|CMF\d+[LR]|\d{2,3}R)\b/gi;

export async function collectPageMetrics(page: Page): Promise<ScenarioMetrics & { bodyText: string; foldText: string }> {
  const data = await page.evaluate(() => {
    const scrollHeight = document.body.scrollHeight;
    const viewportHeight = window.innerHeight;
    const bodyText = document.body.innerText ?? "";
    const foldText = bodyText.slice(0, 3000);
    const cards = document.querySelectorAll("article, [class*='card'], li.rounded-xl, li.rounded-lg, .rounded-2xl.border");
    let badgeMaxInCard = 0;
    cards.forEach((card) => {
      const badges = card.querySelectorAll("[class*='badge'], span.rounded-md, span.rounded-full, span.rounded-lg");
      badgeMaxInCard = Math.max(badgeMaxInCard, badges.length);
    });
    const imgs = Array.from(document.querySelectorAll("img"));
    let brokenImageCount = 0;
    imgs.forEach((img) => {
      if (img.naturalWidth === 0 && img.complete) brokenImageCount++;
    });
    return {
      scrollHeight,
      viewportHeight,
      bodyText,
      foldText: foldText.trim(),
      visibleCardCount: cards.length,
      badgeMaxInCard,
      brokenImageCount,
    };
  });

  const scrollRatio = data.viewportHeight > 0 ? data.scrollHeight / data.viewportHeight : 0;

  return {
    scrollHeight: data.scrollHeight,
    viewportHeight: data.viewportHeight,
    scrollRatio,
    visibleCardCount: data.visibleCardCount,
    brokenImageCount: data.brokenImageCount,
    badgeMaxInCard: data.badgeMaxInCard,
    foldTextLength: data.foldText.length,
    keywordHitsAboveFold: 0,
    devTermHits: [],
    ctaHits: [],
    bodyText: data.bodyText,
    foldText: data.foldText,
  };
}

function findCtas(text: string): string[] {
  return CTA_PATTERNS.filter((c) => text.includes(c));
}

function findDevTerms(text: string): string[] {
  const lower = text.toLowerCase();
  return DEV_TERMS.filter((term) => {
    if (term === "DB") return /\bDB\b/.test(text) || text.includes("DB ");
    if (term === " raw") return lower.includes(" raw") || lower.includes("raw json");
    if (term === " test") return /\btest\b/i.test(text) && text.includes("UX");
    return text.includes(term);
  });
}

function extractBatteryCodes(text: string): string[] {
  return [...new Set((text.match(BATTERY_CODE_RE) ?? []).map((c) => c.toUpperCase()))];
}

function keywordHitCount(text: string, keywords: string[]): number {
  const upper = text.toUpperCase();
  let hits = 0;
  for (const kw of keywords) {
    if (upper.includes(kw.toUpperCase())) hits++;
  }
  return hits;
}

function issueContext(
  persona: Persona,
  groupLabel: string,
): NonNullable<UxIssue["context"]> {
  return {
    query: persona.query,
    expectedKeywords: [...persona.expectedKeywords],
    groupLabel,
    journeyType: persona.journeyType,
    personality: persona.personality,
    vehicleLabel: vehicleLabelFromPersona(persona),
    batterySpec: persona.batterySpec,
  };
}

function vehicleGroupLabel(persona: Persona): string | null {
  if (persona.vehicle?.model) return vehicleLabelFromPersona(persona);
  const vehicleIdx = persona.expectedKeywords.findIndex((k) =>
    /그랜저|쏘렌토|셀토스|G80|포터|스타리아|EV6|BMW|벤츠|K5|카니발|아반떼|모닝|레이|코나|아이오닉|싼타페|투싼|스포티지|GV70|GV80|쏠라/i.test(k),
  );
  if (vehicleIdx < 0) return null;
  return persona.expectedKeywords[vehicleIdx];
}

export function runUxRules(
  persona: Persona,
  metrics: ScenarioMetrics & { bodyText: string; foldText: string },
  url: string,
  journeyResult?: JourneyRunResult,
): UxIssue[] {  const issues: UxIssue[] = [];
  const { bodyText, foldText } = metrics;
  const isMobile = persona.device === "mobile";
  const foldHits = keywordHitCount(foldText, persona.expectedKeywords);
  metrics.keywordHitsAboveFold = foldHits;
  metrics.ctaHits = findCtas(bodyText);
  metrics.devTermHits = findDevTerms(bodyText);

  const journey = persona.journeyType;
  const vehicleLabel = vehicleGroupLabel(persona);
  const vehicleToken = vehicleLabel?.split(" ")[0] ?? persona.vehicle.model;

  const needsTopKeywords =
    journey === "direct_search" ||
    journey === "compare_battery" ||
    (journey === "symptom_check" && persona.query);

  if (needsTopKeywords && persona.expectedKeywords.length > 0 && foldHits === 0) {
    issues.push({
      rule: "core-result-visibility",
      severity: persona.severityWeight === "HIGH" ? "HIGH" : "MEDIUM",
      message: "상단 영역에 기대 키워드가 보이지 않음",
      suggestion: "검색어와 직접 관련된 차량/규격을 첫 화면에 배치하세요.",
      context: issueContext(persona, persona.query || vehicleLabelFromPersona(persona)),
    });
  }

  if (journey === "browse_vehicle" && url.includes("/vehicles") && vehicleToken && !bodyText.includes(vehicleToken)) {
    issues.push({
      rule: "browse-vehicle-missing",
      severity: "HIGH",
      message: `차종 탐색에서 ${vehicleLabel} 관련 정보가 보이지 않음`,
      suggestion: "차종 목록/검색에서 해당 차량을 빠르게 찾을 수 있게 하세요.",
      context: issueContext(persona, vehicleLabelFromPersona(persona)),
    });
  }

  if (journey === "browse_spec" && (url.includes("/compare") || url.includes("/guide")) && persona.batterySpec) {
    if (!bodyText.toUpperCase().includes(persona.batterySpec.toUpperCase()) && !/AGM|DIN|CMF|규격/.test(foldText)) {
      issues.push({
        rule: "browse-spec-missing",
        severity: "MEDIUM",
        message: `규격 탐색에서 ${persona.batterySpec} 관련 정보가 상단에 없음`,
        suggestion: "규격 목록에서 검색·필터로 바로 찾을 수 있게 하세요.",
        context: issueContext(persona, persona.batterySpec),
      });
    }
  }

  if (journey === "photo_check" && !/사진|라벨|단자|촬영/.test(bodyText)) {
    issues.push({
      rule: "photo-guidance-missing",
      severity: "MEDIUM",
      message: "사진 확인 여정에서 촬영 안내(라벨/단자/전체)가 보이지 않음",
      suggestion: "사진 확인 페이지에 어떤 사진을 찍어야 하는지 안내하세요.",
      context: issueContext(persona, "사진 확인"),
    });
  }

  if (journey === "repair_shop_search" && !/정비|매장|방문|출장|교체|서비스/.test(bodyText)) {
    issues.push({
      rule: "repair-shop-missing",
      severity: "HIGH",
      message: "정비소/매장 찾기 여정에서 오프라인 서비스 안내가 보이지 않음",
      suggestion: "작업 가능점·매장·문의 CTA를 명확히 노출하세요.",
      context: issueContext(persona, "정비소/매장"),
    });
  }

  if (journey === "shop_order_check" && !/주문|배송|택배|단자|교체|반납/.test(bodyText)) {
    issues.push({
      rule: "shop-guidance-missing",
      severity: "MEDIUM",
      message: "주문/배송 확인 여정에서 주문 전 안내가 보이지 않음",
      suggestion: "택배 주문·단자 방향·사진 확인 안내를 연결하세요.",
      context: issueContext(persona, persona.batterySpec ?? "주문/배송"),
    });
  }

  if (journey === "faq_browse" && url.includes("/community") && !/답변|질문|Q&A|FAQ/.test(bodyText)) {
    issues.push({
      rule: "faq-content-missing",
      severity: "MEDIUM",
      message: "FAQ 탐색에서 질문/답변 콘텐츠가 불명확",
      suggestion: "FAQ/Q&A 목록과 답변 보기 CTA를 명확히 하세요.",
      context: issueContext(persona, persona.situation),
    });
  }

  if (journeyResult?.stepErrors.some((e) => /click|클릭|이동 실패|goto/i.test(e))) {
    issues.push({
      rule: "journey-navigation-failed",
      severity: "MEDIUM",
      message: `여정 중 네비게이션 실패: ${journeyResult.stepErrors[0]}`,
      suggestion: "메인·사이드바 링크와 CTA 라벨을 일관되게 유지하세요.",
      context: issueContext(persona, persona.startBehavior),
    });
  }
  if (url.includes("/search") && metrics.visibleCardCount >= 10) {
    issues.push({
      rule: "excessive-cards",
      severity: "MEDIUM",
      message: `검색 결과 페이지에 카드/블록이 ${metrics.visibleCardCount}개 이상 노출됨`,
      suggestion: "관련도 높은 결과만 1~3개씩 노출하고 나머지는 더보기로 접으세요.",
    });
  }

  const queryBatteries = extractBatteryCodes(persona.query);
  const targetBattery = persona.batterySpec ?? queryBatteries[0];
  const batteryCodesToCheck =
    queryBatteries.length > 0 ? queryBatteries : targetBattery ? [targetBattery] : [];

  if (batteryCodesToCheck.length > 0 && (url.includes("/search") || journey === "compare_battery")) {
    const foldBatteries = extractBatteryCodes(foldText);
    const unrelated = foldBatteries.filter(
      (b) => !batteryCodesToCheck.some((q) => q === b || q.replace(/[LR]$/, "") === b.replace(/[LR]$/, "")),
    );
    if (unrelated.length >= 3) {
      issues.push({
        rule: "unrelated-batteries",
        severity: "HIGH",
        message: `검색어 규격(${queryBatteries.join(", ")})과 무관한 규격(${unrelated.slice(0, 4).join(", ")})이 상단에 다수 노출`,
        suggestion: "exact match 규격만 우선 표시하고 무관한 AGM/DIN 카드는 숨기세요.",
      });
    }
    const exactInFold = batteryCodesToCheck.some((q) => foldText.toUpperCase().includes(q.toUpperCase()));
    if (!exactInFold && (journey === "direct_search" || journey === "compare_battery")) {
      for (const code of batteryCodesToCheck) {
        issues.push({
          rule: "battery-exact-match",
          severity: "HIGH",
          message: `검색어 배터리 규격 ${code} exact match가 상단에 없음`,
          suggestion: "검색어에 포함된 규격을 최상단 히어로/핵심 결과로 표시하세요.",
          context: issueContext(persona, code),
        });
      }
    }
  }
  const scrollLimit = isMobile ? 6 : 5;
  if (metrics.scrollRatio >= scrollLimit) {
    issues.push({
      rule: "page-too-long",
      severity: metrics.scrollRatio >= scrollLimit + 2 ? "HIGH" : "MEDIUM",
      message: `페이지 길이가 viewport의 ${metrics.scrollRatio.toFixed(1)}배 (기준 ${scrollLimit}배)`,
      suggestion: "핵심 결과만 노출하고 보조 섹션은 접거나 더보기로 처리하세요.",
    });
  }

  if (metrics.devTermHits.length > 0) {
    issues.push({
      rule: "dev-terminology",
      severity: journey === "trust_check" ? "HIGH" : "HIGH",
      message: `고객 화면에 개발자 표현 노출: ${metrics.devTermHits.join(", ")}`,
      suggestion: "DB/플랫폼/카탈로그 등 내부 용어를 고객용 문구로 교체하세요.",
      context: issueContext(persona, metrics.devTermHits.join(", ")),
    });
  }

  const hasCta = persona.expectedCtas.some((c) => bodyText.includes(c)) || metrics.ctaHits.length > 0;
  if (!hasCta) {
    issues.push({
      rule: "missing-cta",
      severity: "MEDIUM",
      message: "상세 보기/규격 확인/답변 보기 등 CTA가 페이지에서 발견되지 않음",
      suggestion: "핵심 결과 카드에 명확한 다음 행동 버튼을 추가하세요.",
      context: issueContext(persona, persona.query || persona.journeyType),
    });
  }
  if (metrics.badgeMaxInCard >= 5) {
    issues.push({
      rule: "badge-overload",
      severity: "MEDIUM",
      message: `카드 하나에 배지/태그가 최대 ${metrics.badgeMaxInCard}개`,
      suggestion: "배지는 1~2개만 강조하고 나머지는 보조 텍스트로 줄이세요.",
    });
  }

  if (isMobile) {
    const hasSearchOrNav = /검색|차종|규격|사진|증상|찾기/.test(foldText);
    if (!hasSearchOrNav && !url.includes("/search")) {
      issues.push({
        rule: "mobile-first-screen",
        severity: "MEDIUM",
        message: "모바일 첫 화면에 검색창 또는 주요 탐색 요소가 불명확",
        suggestion: "모바일 첫 화면에 검색/빠른 탐색을 배치하세요.",
      });
    }
  }

  if (metrics.brokenImageCount > 0) {
    issues.push({
      rule: "broken-images",
      severity: "MEDIUM",
      message: `깨진 이미지 ${metrics.brokenImageCount}개 감지`,
      suggestion: "이미지 경로와 alt를 점검하세요.",
    });
  }

  if (/BMS|IBS/.test(persona.query) && !/BMS|IBS/.test(bodyText)) {
    issues.push({
      rule: "bms-ibs-relevance",
      severity: "MEDIUM",
      message: "BMS/IBS 검색인데 관련 키워드/결과가 페이지에 없음",
      suggestion: "BMS/IBS 가이드·질문을 검색 결과 상단에 연결하세요.",
    });
  }

  if (/사진|촬영|라벨/.test(persona.query + persona.situation) || journey === "photo_check") {
    if (!findCtas(bodyText).some((c) => c.includes("사진")) && !/사진|라벨|단자/.test(foldText)) {
      issues.push({
        rule: "photo-cta",
        severity: "MEDIUM",
        message: "사진 확인 의도인데 사진 관련 CTA가 없음",
        suggestion: "사진으로 규격 확인 버튼을 상단에 배치하세요.",
        context: issueContext(persona, "사진 확인"),
      });
    }
  }

  if (vehicleLabel && journey === "direct_search" && url.includes("/search")) {
    if (vehicleToken && !bodyText.includes(vehicleToken)) {
      issues.push({
        rule: "vehicle-result-missing",
        severity: "HIGH",
        message: `차량명(${vehicleLabel}) 관련 결과가 검색 페이지에 없음`,
        suggestion: "차량 exact match 결과를 상단에 표시하세요.",
        context: issueContext(persona, vehicleLabel),
      });
    }
  }
  if (metrics.badgeMaxInCard >= 3 && foldHits > 0) {
    issues.push({
      rule: "badge-vs-title",
      severity: "LOW",
      message: "배지/태그가 많아 제목보다 보조 정보가 튀는 구조일 수 있음",
      suggestion: "제목을 가장 크게, 배지는 작고 연하게 처리하세요.",
    });
  }

  return issues;
}

export function resultStatus(issues: UxIssue[], error?: string): "pass" | "warn" | "fail" {
  if (error) return "fail";
  if (issues.some((i) => i.severity === "HIGH")) return "fail";
  if (issues.length > 0) return "warn";
  return "pass";
}
