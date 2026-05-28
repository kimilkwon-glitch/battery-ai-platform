import { compareHref } from "@/lib/platform-data";
import { batteryDetailHref, canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { isDeprioritizedBatterySpec } from "@/lib/battery-detail/deprioritized-specs";
import { resolveCoreBatteryHubCode, normalizeCoreBatteryCode } from "@/lib/battery-detail/core-battery-codes";
import type { BatteryDetailHubContent, HubBadge, HubCompareCard } from "@/lib/battery-detail/battery-detail-hub-content";
import { getBatteryDetailHubContent } from "@/lib/battery-detail/battery-detail-hub-content";
import { sanitizeBatteryDetailHubContent } from "@/lib/battery-detail/battery-detail-hub-sanitize";
import {
  areNeverSuggestTogether,
  filterCodesForCustomerCards,
  filterConfusionForDisplay,
} from "@/data/battery/batterySpecRelations";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { getBattery } from "@/lib/platform-data";
import { normalizeBatteryCode } from "@/lib/batteryNormalize";

const CONFIRM = "확인 필요";

function inferTypeLabel(code: string, catalogType?: string): string {
  if (catalogType?.trim()) return catalogType.trim();
  if (/^EV\s*12V/i.test(code)) return "EV 보조 12V";
  if (/^AGM/i.test(code)) return "AGM";
  if (/^DIN/i.test(code)) return "DIN";
  if (/^CMF/i.test(code)) return "CMF";
  if (/^GB/i.test(code)) return "GB";
  if (/^\d{2,3}R$/i.test(code)) return "R타입(JIS)";
  if (/^\d{2,3}L$/i.test(code) || /D31L/i.test(code)) return "L타입(JIS)";
  return CONFIRM;
}

function buildPositioning(code: string, typeLabel: string): string {
  if (/^EV\s*12V/i.test(code)) {
    return "전기차 보조 12V 배터리 규격 — 고전압 메인 배터리가 아닙니다.";
  }
  if (/^CMF80L$/i.test(code)) {
    return "CMF80L 전체 표기를 유지하는 중대형 CMF 규격입니다.";
  }
  if (normalizeBatteryCode(code) === "80L" || code === "80L") {
    return "80L 단독 표기 — CMF80L·AGM80L과 다를 수 있어 라벨 확인이 필요합니다.";
  }
  if (/100R/i.test(code)) {
    return "R타입 상용·포터2 계열에서 확인되는 규격입니다.";
  }
  if (/^DIN/i.test(code)) {
    return "유럽형 DIN 계열 규격 — AGM/JIS와 타입·트레이가 다를 수 있습니다.";
  }
  if (/^AGM/i.test(code)) {
    return "AGM 계열 규격 — ISG·하이브리드 차종은 연료·연식별 확인이 필요합니다.";
  }
  if (isDeprioritizedBatterySpec(code)) {
    return "보조·검색 대응 규격 — 주력 판매 규격이 아닐 수 있어 사진·차량 기준 확인을 권장합니다.";
  }
  return `${typeLabel} 계열 배터리 규격 — 차량·사진 기준 최종 확인을 권장합니다.`;
}

function buildBadges(code: string): HubBadge[] {
  const badges: HubBadge[] = [{ text: "사진확인 권장", tone: "amber" }];
  if (/^EV\s*12V/i.test(code)) badges.unshift({ text: "보조 12V", tone: "blue" });
  if (/CMF80L/i.test(code)) badges.unshift({ text: "CMF 표기 유지", tone: "blue" });
  if (/R$/i.test(code) && !/AGM/i.test(code)) badges.unshift({ text: "R타입 단자", tone: "blue" });
  if (isDeprioritizedBatterySpec(code)) badges.push({ text: "주력 비판매·보조", tone: "gray" });
  return badges;
}

function buildConfusionSpecs(code: string, related: string[]): string[] {
  const family = normalizeBatteryCode(code);
  const out = new Set<string>();
  for (const r of related.slice(0, 4)) {
    if (r !== code) out.add(r);
  }
  if (/CMF80L/i.test(code)) out.add("80L 축약 주문");
  if (/100R/i.test(code)) {
    out.add("90R");
    out.add("CMF100R");
  }
  if (/^EV\s*12V/i.test(code)) {
    out.add("AGM60L");
    out.add("고전압 메인");
  }
  if (family === "80L") {
    out.add("CMF80L");
    out.add("AGM80L");
  }
  if (out.size === 0) out.add("동일 계열 타입·단자 혼동");
  return filterConfusionForDisplay(code, [...out]).slice(0, 5);
}

function buildCompareCards(code: string, relatedCodes: string[]): HubCompareCard[] {
  const cards: HubCompareCard[] = [];
  const seen = new Set<string>();
  for (const target of relatedCodes) {
    const canonical = canonicalBatteryCode(target) || target;
    if (!canonical || canonical === code || seen.has(canonical)) continue;
    if (areNeverSuggestTogether(code, canonical)) continue;
    if (isDeprioritizedBatterySpec(canonical) && !isDeprioritizedBatterySpec(code)) continue;
    if (resolveCoreBatteryHubCode(canonical) && resolveCoreBatteryHubCode(code) === resolveCoreBatteryHubCode(canonical)) {
      continue;
    }
    seen.add(canonical);
    cards.push({
      target: canonical,
      diff: "타입·용량·단자·적용 차량이 다를 수 있습니다 — 무조건 대체하지 마세요.",
      href: compareHref(code, canonical),
      detailHref: batteryDetailHref(canonical),
    });
    if (cards.length >= 3) break;
  }
  return cards;
}

function buildMisorderTips(_code: string): string[] {
  return [];
}

function buildCautionNotes(code: string): string[] {
  const notes: string[] = [];
  if (isDeprioritizedBatterySpec(code)) {
    notes.push("판매 주력 규격이 아닙니다 — 사진·차종 정보를 함께 보는 것이 안전합니다.");
  }
  if (/^EV\s*12V/i.test(code)) {
    notes.push("EV6·아이오닉5 등은 차종별 보조 12V 규격이 다를 수 있습니다.");
  }
  return notes;
}

/** 핵심 8종 외 공통 fallback 허브 콘텐츠 */
export function buildFallbackBatteryDetailHubContent(
  rawCode: string,
  relatedCodes: string[] = [],
): BatteryDetailHubContent {
  const code = canonicalBatteryCode(rawCode) || normalizeCoreBatteryCode(rawCode) || rawCode.trim();
  const spec = parseBatterySpecDisplay(code);
  let catalog;
  try {
    catalog = getBattery(code);
  } catch {
    catalog = { type: "", capacity: "", cca: "", terminal: "" };
  }

  const typeLabel = inferTypeLabel(code, catalog.type);
  const filteredRelated = relatedCodes
    .map((c) => canonicalBatteryCode(c) || c)
    .filter((c) => {
      if (!c || c === code) return false;
      if (isDeprioritizedBatterySpec(c) && !isDeprioritizedBatterySpec(code)) return false;
      return true;
    });

  return sanitizeBatteryDetailHubContent({
    code,
    positioning: buildPositioning(code, typeLabel),
    typeLabel,
    useCase:
      catalog.isgFit?.trim() ||
      (typeLabel !== CONFIRM ? `${typeLabel} 계열 — 차량·트림별 적용` : "차량/사진 기준 확인 필요"),
    badges: buildBadges(code),
    confusionSpecs: buildConfusionSpecs(code, filteredRelated),
    featuredVehicles: [],
    compareCards: buildCompareCards(code, filteredRelated),
    misorderTips: buildMisorderTips(code),
    cautionNotes: buildCautionNotes(code),
  });
}

/** 전용(8) → 없으면 fallback (80L은 CMF80L 전용으로 승격하지 않음) */
export function resolveBatteryDetailHubContent(
  rawCode: string,
  relatedCodes: string[] = [],
): BatteryDetailHubContent {
  const trimmed = rawCode.trim();
  const family = normalizeBatteryCode(trimmed);
  if (family === "80L" || trimmed.toUpperCase() === "80L") {
    return buildFallbackBatteryDetailHubContent(trimmed, relatedCodes);
  }
  const code = canonicalBatteryCode(trimmed) || normalizeCoreBatteryCode(trimmed) || trimmed;
  const core = resolveCoreBatteryHubCode(code);
  if (core) {
    const dedicated = getBatteryDetailHubContent(core);
    if (dedicated) return sanitizeBatteryDetailHubContent(dedicated);
  }
  return buildFallbackBatteryDetailHubContent(code || trimmed, relatedCodes);
}
