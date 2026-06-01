import { getBaseBatterySpec, listBaseBatterySpecCodes } from "@/data/battery/baseSpecs";
import {
  getBatteryKnowledgeTopic,
  BATTERY_KNOWLEDGE_TOPICS,
  getKnowledgeTopicsForSpec,
} from "@/data/battery/batteryKnowledge";
import {
  getContentGuide,
  listContentGuideTeasers,
  CONTENT_GUIDES,
} from "@/data/battery/batteryGuideContents";
import { getCompareDeepNote } from "@/data/battery/compareDeepNotes";
import { BRAND_NOTES, BRAND_SECTION_LEAD, BRAND_SECTION_TITLE } from "@/data/battery/batteryBrandNotes";
import { getUpgradeRulesForCode, UPGRADE_PRINCIPLES } from "@/data/battery/batteryUpgradeRules";
import {
  getBrandSpecsForNormalizedCode,
  getCustomerBrandSpecs,
  getHomeCardCopy,
  getNormalizedBatterySummary,
  getPrimaryBrandSpec,
  getSpecCardCopy,
  hasBrandSpecData,
  normalizeSpecCode,
  formatDimensions,
  terminalLayoutLabel,
} from "@/data/battery/batterySpecIndex";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import type { ContentGuide } from "@/data/battery/types";

export {
  getBaseBatterySpec,
  listBaseBatterySpecCodes,
  getBatteryKnowledgeTopic,
  BATTERY_KNOWLEDGE_TOPICS,
  getKnowledgeTopicsForSpec,
  getContentGuide,
  listContentGuideTeasers,
  CONTENT_GUIDES,
  getCompareDeepNote,
  BRAND_NOTES,
  BRAND_SECTION_LEAD,
  BRAND_SECTION_TITLE,
  getUpgradeRulesForCode,
  UPGRADE_PRINCIPLES,
  getBrandSpecsForNormalizedCode,
  getCustomerBrandSpecs,
  getHomeCardCopy,
  getNormalizedBatterySummary,
  getPrimaryBrandSpec,
  getSpecCardCopy,
  hasBrandSpecData,
  normalizeSpecCode,
  formatDimensions,
  terminalLayoutLabel,
};

export type KnowledgeCardTeaser = {
  title: string;
  summary: string;
  href: string;
};

/** 규격 검색·상세·카드 — 브랜드 제원 DB 우선 */
export function getKnowledgeCardForSpec(rawCode: string): KnowledgeCardTeaser | null {
  const code = normalizeSpecCode(canonicalBatteryCode(rawCode) || rawCode);
  const copy = getSpecCardCopy(code);
  if (copy) {
    const guide = CONTENT_GUIDES.find((g) => g.relatedBatteryCodes?.some((c) => normalizeSpecCode(c) === code));
    return {
      title: `${code} 제원·안내`,
      summary: copy.primary,
      href: guide ? `/guides/knowledge/${guide.id}` : `/batteries/${encodeURIComponent(code)}`,
    };
  }
  const spec = getBaseBatterySpec(code);
  if (!spec) return null;
  return {
    title: `${code} 기본 안내`,
    summary: spec.notes[0] ?? `${code} 규격 정보`,
    href: `/batteries/${encodeURIComponent(code)}`,
  };
}

export function getVehicleFuelKnowledgeBlurb(fuelLabel: string | undefined): string | null {
  if (!fuelLabel) return null;
  if (/디젤/i.test(fuelLabel)) {
    return "디젤은 시동·전장 부하 때문에 가솔린보다 큰 규격이 들어가는 경우가 많습니다. 차량별 데이터가 우선입니다.";
  }
  if (/가솔린/i.test(fuelLabel)) {
    return "가솔린은 상대적으로 작은 규격이 들어가는 경우가 많으나, ISG·옵션에 따라 AGM이 필요할 수 있습니다.";
  }
  if (/하이브리드|HEV|PHEV/i.test(fuelLabel)) {
    return "하이브리드는 보조 12V·AGM60L 등 차종별 규격이 다릅니다. 연료 탭과 사진을 함께 확인하세요.";
  }
  if (/전기|EV/i.test(fuelLabel)) {
    return "EV는 보조 12V가 메인 고전압 팩과 별개입니다. 차종별 위치·규격을 확인하세요.";
  }
  return null;
}

export function getDefaultVehicleFuelKnowledgeBlurb(): string {
  return "연료를 선택하면 더 정확해집니다.";
}

export function getDetailKnowledgeBullets(code: string): string[] {
  const norm = normalizeSpecCode(code);
  const summary = getNormalizedBatterySummary(norm);
  if (summary) {
    const bullets: string[] = [summary.expertMemo];
    if (summary.seriesLabel) bullets.push(`${summary.seriesLabel} 계열 · ${terminalLayoutLabel(summary.terminalLayout)}`);
    if (summary.cca) bullets.push(`대표 CCA ${summary.cca}A 전후 (브랜드별 차이 가능)`);
    if (summary.confusionSpecs.length) bullets.push(`혼동: ${summary.confusionSpecs.join(", ")}`);
    return bullets.slice(0, 5);
  }
  const spec = getBaseBatterySpec(norm);
  const bullets: string[] = [];
  if (!spec) return bullets;
  if (spec.terminalLayout && spec.terminalLayout !== "UNKNOWN") {
    bullets.push(`${norm}은 ${spec.terminalLayout}타입 — 현재 장착도 같은 방향인지 확인하세요.`);
  }
  return bullets.slice(0, 5);
}

export function findContentGuideForCompare(codeA: string, codeB: string): ContentGuide | null {
  const key = `${codeA}|${codeB}`;
  if (/100R|AGM95L/i.test(key)) return getContentGuide("bk-100r-vs-agm95l");
  if (/90R|100R/i.test(key)) return getContentGuide("bk-90r-100r-confusion");
  return null;
}
