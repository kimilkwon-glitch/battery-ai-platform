import type { SearchQAResult, SearchQAWarning } from "@/lib/search/search-quality-types";

const AGM95L_COMPARE = /AGM95L.*비교|비교.*AGM95L/i;

function codesInText(text: string): string[] {
  const found = new Set<string>();
  const re = /\b(AGM|DIN|CMF|GB|EFB)\s*(\d+[A-Z]*R?L?)\b|\b(\d{2,3}R)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const code = (m[1] && m[2] ? `${m[1]}${m[2]}` : m[3])?.toUpperCase();
    if (code) found.add(code.replace(/\s+/g, ""));
  }
  return [...found];
}

function ctaLabels(result: SearchQAResult): string {
  return result.ctas.map((c) => c.label).join(" ");
}

function allBatteryCodes(result: SearchQAResult): string[] {
  const set = new Set<string>();
  for (const b of result.batteryResults) set.add(b.code.toUpperCase());
  for (const v of result.vehicleResults) for (const c of v.batteryCodes) set.add(c.toUpperCase());
  if (result.primaryResult.batteryCodes) {
    for (const c of result.primaryResult.batteryCodes) set.add(c.toUpperCase());
  }
  for (const g of result.generationCards) for (const c of g.batteryCodes) set.add(c.toUpperCase());
  return [...set];
}

/** 자동 검수 룰 — query·QA 결과 기반 */
export function evaluateSearchQualityRules(query: string, result: SearchQAResult): SearchQAWarning[] {
  const q = query.trim();
  const qLower = q.toLowerCase();
  const warnings: SearchQAWarning[] = [];
  const codes = allBatteryCodes(result);
  const ctaText = ctaLabels(result);

  const push = (level: SearchQAWarning["level"], message: string, reason: string) => {
    warnings.push({ level, message, reason });
  };

  // 1) K3
  if (/^k3$/i.test(q)) {
    if (result.vehicleResults.length === 0 && result.generationCards.length === 0) {
      push("error", "K3 검색에 차량/세대 카드가 없습니다.", "k3_generation_cards");
    }
    const hasGenHint =
      result.branchGuide.message.includes("세대") ||
      result.summary.includes("세대") ||
      result.warnings.some((w) => w.reason === "k3_generation_hint");
    if (result.generationCards.length > 1 && !hasGenHint && !result.summary.includes("세대")) {
      push("caution", "K3 세대 선택 안내 문구가 보이지 않습니다.", "k3_generation_hint");
    }
  }

  // 2) 쏘렌토 MQ4
  if (/쏘렌토\s*mq4/i.test(q)) {
    const hybrid = /하이브리드/i.test(q);
    if (hybrid) {
      const primary = result.primaryResult.batteryCodes.map((c) => c.toUpperCase());
      if (primary.length > 0 && !primary.includes("AGM60L")) {
        push("error", "쏘렌토 MQ4 하이브리드 검색에서 AGM60L이 primary가 아닙니다.", "sorento_mq4_hybrid_agm60l");
      }
    } else if (!hybrid && codes.includes("AGM60L") && codes.includes("AGM80L")) {
      const mixedConfirm =
        result.successType === "immediate_confirmed" &&
        result.primaryResult.batteryCodes.length === 1;
      if (mixedConfirm) {
        push("caution", "MQ4 일반 검색에서 AGM60L/AGM80L이 단일 확정처럼 보입니다.", "sorento_mq4_fuel_split");
      }
      if (!result.branchGuide.visible && result.successType !== "fuel_trim_branch") {
        push("caution", "MQ4 연료/트림 분기 안내가 약합니다.", "sorento_mq4_branch");
      }
    }
  }

  // 3) 스타리아
  if (/스타리아/i.test(q) && !/agm80r/i.test(q)) {
    const topCodes = [
      ...result.primaryResult.batteryCodes,
      ...result.batteryResults.slice(0, 2).map((b) => b.code),
    ].map((c) => c.toUpperCase());
    if (topCodes.some((c) => c === "CMF80L" || c === "AGM80L")) {
      push("error", "스타리아 검색에 CMF80L/AGM80L 혼동 규격이 상단에 노출됩니다.", "staria_agm80r");
    }
    if (!codes.some((c) => c.includes("80R") || c === "AGM80R" || c === "CMF80R")) {
      if (result.batteryResults.length > 0 || result.primaryResult.batteryCodes.length > 0) {
        push("caution", "스타리아 검색에서 AGM80R 계열이 약합니다.", "staria_agm80r_weak");
      }
    }
  }

  // 4) 포터2
  if (/포터\s*2|포터2/i.test(q)) {
    const year2020 = /2020|20년/.test(q);
    if (!result.branchGuide.visible && !ctaText.includes("90") && !ctaText.includes("100")) {
      if (result.vehicleResults.length > 0 || result.primaryResult.batteryCodes.length > 0) {
        push("caution", "포터2 90R/100R 연식 분기가 약합니다.", "porter2_year_branch");
      }
    }
    if (year2020) {
      const primary = result.primaryResult.batteryCodes.map((c) => c.toUpperCase());
      if (primary.length > 0 && !primary.some((c) => c.includes("100"))) {
        push("caution", "포터2 2020년식 검색에서 100R 안내가 약합니다.", "porter2_2020_100r");
      }
    }
    const rCtaCount = (ctaText.match(/90R|100R/gi) ?? []).length;
    if (rCtaCount >= 4) {
      push("caution", "포터2 검색 CTA에 90R/100R 반복이 많습니다.", "porter2_cta_repeat");
    }
  }

  // 5) 100R
  if (/\b100\s*r\b|\b100r\b/i.test(q) && !/포터|봉고/i.test(q)) {
    if (AGM95L_COMPARE.test(ctaText) || codes.includes("AGM95L")) {
      push("error", "100R 검색에 AGM95L 비교/혼동이 있습니다.", "100r_no_agm95l");
    }
    const qaTitles = result.relatedQa.map((x) => x.title).join(" ");
    if (/AGM95L/i.test(qaTitles)) {
      push("error", "100R 검색 Q&A에 AGM95L이 섞입니다.", "100r_qa_agm95l");
    }
  }

  // 6) AGM70L
  if (/\bagm\s*70\s*l\b|\bagm70l\b/i.test(q) && !/택배|출장|매장/.test(q)) {
    const hasDetail = result.batteryResults.some((b) => b.code.toUpperCase() === "AGM70L");
    const hasCta =
      ctaText.includes("상세") ||
      ctaText.includes("택배") ||
      ctaText.includes("주문") ||
      result.ctas.some((c) => c.url.includes("/batteries/"));
    if (!hasDetail && result.primaryResult.type !== "battery") {
      push("caution", "AGM70L 검색에 규격 상세 연결이 약합니다.", "agm70l_detail");
    }
    if (!hasCta && result.ctas.length < 2) {
      push("caution", "AGM70L 검색 다음 행동(CTA)이 부족합니다.", "agm70l_cta");
    }
  }

  // 7) 증상
  const symptomQueries = ["시동지연", "완전방전", "블랙박스 방전", "장기주차 방전", "배터리 경고등"];
  if (symptomQueries.some((s) => q.includes(s) || qLower.includes(s.replace(/\s/g, "")))) {
    if (result.successType === "battery_code" && result.primaryResult.type === "battery") {
      push("caution", "증상 검색인데 배터리 규격만 상단에 노출됩니다.", "symptom_not_product_first");
    }
    const hasGuidance =
      result.successType === "symptom_qa" ||
      result.relatedQa.length > 0 ||
      ctaText.includes("사진") ||
      ctaText.includes("증상") ||
      ctaText.includes("문의");
    if (!hasGuidance) {
      push("caution", "증상 검색에 안내·Q&A·사진 CTA 연결이 약합니다.", "symptom_guidance");
    }
  }

  // 8) 출장/택배
  if (/부산.*출장|덕천|학장/.test(q) && !/agm|din|cmf/i.test(q)) {
    const serviceFirst =
      result.detectedIntent === "service" ||
      result.detectedIntent === "store" ||
      ctaText.includes("출장") ||
      ctaText.includes("매장");
    if (!serviceFirst) {
      push("caution", "출장/매장 목적 검색인데 서비스 CTA 우선순위가 약합니다.", "service_cta_priority");
    }
  }

  if (/agm\s*70\s*l.*택배|택배.*agm\s*70\s*l/i.test(q)) {
    const hasBattery = codes.includes("AGM70L");
    const hasShip = ctaText.includes("택배") || ctaText.includes("주문") || result.detectedIntent === "shipping";
    if (!hasBattery || !hasShip) {
      push("caution", "AGM70L 택배 주문 검색에서 규격+택배 CTA가 약합니다.", "agm70l_shipping");
    }
  }

  // 고객 금지 문구 (QA에서도 참고 — 결과 텍스트 스캔)
  const blob = JSON.stringify(result);
  for (const banned of ["준비중", "샘플입니다", "UI 검증", "mock", "fixture", "TODO", "demo"]) {
    if (blob.includes(banned)) {
      push("error", `고객 금지 문구 감지: ${banned}`, "forbidden_copy");
    }
  }

  return warnings;
}

export { codesInText };
