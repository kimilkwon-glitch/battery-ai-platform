import { getBaseBatterySpec, listBaseBatterySpecCodes } from "@/data/battery/baseSpecs";
import { getBatteryKnowledgeTopic, BATTERY_KNOWLEDGE_TOPICS } from "@/data/battery/batteryKnowledge";
import {
  getContentGuide,
  listContentGuideTeasers,
  CONTENT_GUIDES,
} from "@/data/battery/contentGuides";
import { getCompareDeepNote } from "@/data/battery/compareDeepNotes";
import { BRAND_NOTES, BRAND_SECTION_LEAD, BRAND_SECTION_TITLE } from "@/data/battery/brandNotes";
import { getUpgradeRulesForCode, UPGRADE_PRINCIPLES } from "@/data/battery/upgradeRules";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import type { ContentGuide } from "@/data/battery/types";

export {
  getBaseBatterySpec,
  listBaseBatterySpecCodes,
  getBatteryKnowledgeTopic,
  BATTERY_KNOWLEDGE_TOPICS,
  getContentGuide,
  listContentGuideTeasers,
  CONTENT_GUIDES,
  getCompareDeepNote,
  BRAND_NOTES,
  BRAND_SECTION_LEAD,
  BRAND_SECTION_TITLE,
  getUpgradeRulesForCode,
  UPGRADE_PRINCIPLES,
};

export type KnowledgeCardTeaser = {
  title: string;
  summary: string;
  href: string;
};

/** 규격 검색·상세용 — 검색 매칭 로직과 분리 */
export function getKnowledgeCardForSpec(rawCode: string): KnowledgeCardTeaser | null {
  const code = canonicalBatteryCode(rawCode) || rawCode.trim().toUpperCase();
  const spec = getBaseBatterySpec(code);
  if (!spec) return null;

  const terminal =
    spec.terminalLayout === "L"
      ? "L타입"
      : spec.terminalLayout === "R"
        ? "R타입"
        : "단자 확인 필요";

  const lines: string[] = [];
  if (spec.family === "AGM") {
    lines.push(`${code}은 AGM ${spec.capacityAh20Hr ?? ""}Ah급 ${terminal} 규격입니다.`);
    lines.push("ISG·스마트충전 차량은 AGM 유지 여부를 먼저 확인하세요.");
  } else if (spec.family === "CMF" || spec.family === "GB") {
    lines.push(`${code}은 ${terminal} ${spec.capacityAh20Hr ?? ""}Ah급 CMF/일반 계열로 보는 경우가 많습니다.`);
    if (spec.terminalLayout === "R") {
      lines.push("R타입 상용 — AGM L타입과 단순 대체 대상이 아닙니다.");
    }
  } else if (spec.family === "DIN") {
    lines.push(`${code}은 DIN ${terminal} 계열입니다. ISG 차량은 AGM 검토가 우선입니다.`);
  } else if (spec.family === "EV") {
    lines.push(`${code}은 보조 12V 계열 — 고전압 메인과 별개로 봅니다.`);
  }

  if (spec.notes[0]) lines.push(spec.notes[0]);

  const guide = CONTENT_GUIDES.find((g) => g.relatedBatteryCodes?.some((c) => c.toUpperCase() === code));
  return {
    title: `${code} 기본 안내`,
    summary: lines.slice(0, 2).join(" "),
    href: guide ? `/guides/knowledge/${guide.id}` : `/batteries/${encodeURIComponent(code)}`,
  };
}

/** 차량 상세 보조 — 연료별 일반론 */
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
  return "같은 차종이라도 가솔린과 디젤은 시동 부하와 전장 구성 차이로 배터리 규격이 달라질 수 있습니다. 검색 결과는 차량별 데이터가 우선이며, 현재 장착 배터리 사진을 함께 보면 더 안전합니다.";
}

export function getDetailKnowledgeBullets(code: string): string[] {
  const spec = getBaseBatterySpec(code);
  const bullets: string[] = [];
  if (!spec) return bullets;

  if (spec.terminalLayout) {
    bullets.push(
      `${code}은 ${spec.terminalLayout}타입 규격입니다. 현재 장착 배터리도 같은 방향인지 함께 보면 안전합니다.`,
    );
  }
  if (spec.capacityAh20Hr) bullets.push(`12V ${spec.capacityAh20Hr}Ah급${spec.cca ? ` · CCA ${spec.cca} 전후` : ""}`);
  if (spec.commonUse.length) bullets.push(`자주 확인: ${spec.commonUse.slice(0, 3).join(" · ")}`);
  if (spec.brandVariancePossible) bullets.push("브랜드·제조 시기에 따라 제원 차이가 있을 수 있습니다.");
  spec.notes.slice(0, 2).forEach((n) => bullets.push(n));
  return bullets.slice(0, 5);
}

export function findContentGuideForCompare(codeA: string, codeB: string): ContentGuide | null {
  const key = `${codeA}|${codeB}`;
  if (/100R|AGM95L/i.test(key)) return getContentGuide("bk-100r-vs-agm95l");
  if (/90R|100R/i.test(key)) return getContentGuide("bk-90r-100r-confusion");
  return null;
}
