import { classifySearch } from "@/lib/platform-data";
import { normalizeSearchQuery } from "@/lib/search/normalize-search-query";
import { resolveSearchVehicleAlias } from "@/lib/search/search-vehicle-aliases";
import {
  extractVehicleTrimFromQuery,
  formatSearchVehicleDisplayLabel,
} from "@/lib/search/search-vehicle-display";
import { extractQuerySpecTokens } from "@/lib/search/search-query-specs";
import { sanitizeStariaBatterySpecsForCustomer } from "@/lib/search/staria-query-spec-guard";
import { detectQueryIntentFlags } from "@/lib/search/search-intent";
import { extractPurposeKeywords } from "@/lib/search/search-purpose";

export type AiQuerySummary = {
  query: string;
  vehicleLabel: string | null;
  specLabels: string[];
  symptomLabels: string[];
  symptomDisplay: string;
  purposeLabel: string | null;
  referenceSpec: string | null;
  guidance: string | null;
  ctas: { label: string; href: string }[];
};

const UPGRADE_GUIDANCE =
  "업그레이드 후보 규격은 차량 트레이 공간, 단자 방향, ISG 여부, 현재 장착 배터리 기준으로 확인해야 합니다. 트레이 사이즈 정보가 없는 차량은 사진 확인 또는 문의 후 안내합니다.";

function isUpgradeReviewWithoutSpecs(query: string, specTokens: string[]): boolean {
  if (!/업그레이드|검토/i.test(query)) return false;
  if (specTokens.length > 0) return false;
  return !/\b(AGM|DIN|CMF|EFB)\d+[LR]?/i.test(query);
}

function formatSymptomDisplay(labels: string[], query: string): string {
  if (labels.length === 0) return "—";
  if (/12\s*v|12v/i.test(query) && /방전/i.test(query)) return "12V 방전";
  if (labels.includes("블랙박스") && labels.includes("방전")) return "블랙박스 방전";
  if (labels.includes("시동") && labels.includes("지연")) return "시동 지연";
  return labels.join(", ");
}

function enrichVehicleLabel(query: string, label: string, brand?: string): string {
  const trim = extractVehicleTrimFromQuery(query);
  let base = brand && !label.startsWith(brand) ? `${brand} ${label}` : label;
  if (trim && !base.toUpperCase().includes(trim)) {
    base = `${base} ${trim}`;
  }
  return base;
}

function inferReferenceSpec(query: string, specTokens: string[]): string | null {
  if (specTokens[0]) return specTokens[0];
  if (/\bA6\b/i.test(query) && /블랙박스|방전/i.test(query)) return "115D31R";
  return null;
}

function extractSymptomLabels(query: string, flags: ReturnType<typeof detectQueryIntentFlags>): string[] {
  const labels: string[] = [];
  if (/12\s*v|12v/i.test(query)) labels.push("12V");
  if (/블랙박스/i.test(query)) labels.push("블랙박스");
  if (/방전|재방전/i.test(query)) labels.push("방전");
  if (/시동\s*지연|지연/i.test(query)) labels.push("시동");
  const purpose = extractPurposeKeywords(query);
  for (const p of purpose) {
    if (!labels.includes(p)) labels.push(p);
  }
  if (flags.symptom && labels.length === 0) labels.push("증상");
  return labels.slice(0, 4);
}

function buildPurposeLabel(query: string, flags: ReturnType<typeof detectQueryIntentFlags>): string | null {
  if (flags.compare) return "비교";
  if (flags.upgrade) return "업그레이드";
  if (flags.order) return "주문";
  if (/단자\s*방향|단자방향/i.test(query)) return "단자 방향 확인";
  if (flags.symptom) return "증상 확인";
  return null;
}

function buildCtas(flags: ReturnType<typeof detectQueryIntentFlags>): AiQuerySummary["ctas"] {
  if (flags.order) {
    return [
      { label: "주문 전 규격 확인", href: "/order-checklist" },
      { label: "단자 방향 확인", href: "/guides" },
      { label: "사진으로 확인", href: "/analysis/photo" },
      { label: "문의하기", href: "/service-center" },
    ];
  }
  if (flags.symptom) {
    return [
      { label: "증상 확인", href: "/diagnosis" },
      { label: "사진으로 확인", href: "/analysis/photo" },
      { label: "문의하기", href: "/service-center" },
      { label: "규격 가이드 보기", href: "/guides" },
    ];
  }
  return [
    { label: "사진으로 확인", href: "/analysis/photo" },
    { label: "문의하기", href: "/service-center" },
    { label: "차량 상세 보기", href: "/vehicles" },
    { label: "규격 가이드 보기", href: "/guides" },
  ];
}

function buildGuidance(
  query: string,
  flags: ReturnType<typeof detectQueryIntentFlags>,
  upgradeOnly: boolean,
): string | null {
  if (upgradeOnly) return UPGRADE_GUIDANCE;
  if (flags.symptom && /12\s*v|12v/i.test(query)) {
    return "12V 방전은 배터리 상태, 주차 시간, 전장 사용 여부를 확인해야 합니다.";
  }
  if (flags.symptom && /블랙박스/.test(query)) {
    return "블랙박스 방전은 배터리 상태, 주차 시간, 상시전원 설정에 따라 원인이 달라질 수 있습니다.";
  }
  if (flags.symptom && /시동\s*지연|지연/i.test(query)) {
    return "시동 지연은 12V 보조배터리·전압·전장 부하 상태를 함께 확인하는 것이 좋습니다.";
  }
  if (flags.order) {
    return "택배 주문 전에는 차량 연식·연료·단자 방향·현재 장착 배터리 사진 확인이 필요합니다.";
  }
  if (flags.upgrade && /\b(AGM|DIN|CMF)\d/i.test(query)) {
    return "업그레이드는 트레이 공간·단자 방향·현재 장착 배터리 확인이 필요합니다.";
  }
  return null;
}

export function buildAiQuerySummary(rawQuery: string): AiQuerySummary | null {
  const q = normalizeSearchQuery(rawQuery);
  if (!q) return null;

  const alias = resolveSearchVehicleAlias(q);
  const intent = classifySearch(q);
  const flags = detectQueryIntentFlags(q);
  const specTokens = sanitizeStariaBatterySpecsForCustomer(
    q,
    alias,
    extractQuerySpecTokens(q),
  );
  const upgradeOnly = isUpgradeReviewWithoutSpecs(q, specTokens);

  let vehicleLabel: string | null = null;
  if (alias) {
    vehicleLabel = enrichVehicleLabel(q, formatSearchVehicleDisplayLabel(q, alias), alias.brand);
  } else if (intent.vehicle?.displayName) {
    const brand = intent.vehicle.brand ?? "";
    const raw = brand ? `${brand} ${intent.vehicle.displayName}` : intent.vehicle.displayName;
    vehicleLabel = enrichVehicleLabel(q, raw, brand);
  }

  const specLabels = upgradeOnly ? ["확인 필요"] : specTokens.length > 0 ? specTokens : [];
  const symptomLabels = extractSymptomLabels(q, flags);
  const referenceSpec = upgradeOnly ? null : inferReferenceSpec(q, specTokens);

  return {
    query: q,
    vehicleLabel,
    specLabels,
    symptomLabels,
    symptomDisplay: formatSymptomDisplay(symptomLabels, q),
    purposeLabel: buildPurposeLabel(q, flags),
    referenceSpec,
    guidance: buildGuidance(q, flags, upgradeOnly),
    ctas: buildCtas(flags),
  };
}
