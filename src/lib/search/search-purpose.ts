import type { SearchVehicleAliasMatch } from "@/lib/search/search-vehicle-aliases";
import type { QueryIntentFlags } from "@/lib/search/search-intent";

/** 현실 고객 검색어 기준 목적/증상 키워드 — 특정 audit 문장 하드코딩 없음 */
const PURPOSE_RULES: { pattern: RegExp; label: string }[] = [
  { pattern: /배터리\s*사진|사진.*배터리|사진으로\s*확인/i, label: "배터리 사진" },
  { pattern: /배터리\s*규격|규격\s*확인|규격\s*문의/i, label: "배터리 규격" },
  { pattern: /12\s*v|12v/i, label: "12V 배터리" },
  { pattern: /보조\s*배터리/i, label: "보조배터리" },
  { pattern: /배터리\s*교체|교체\s*예정|교체\s*검토/i, label: "배터리 교체" },
  { pattern: /블랙박스/i, label: "블랙박스" },
  { pattern: /시동\s*지연|시동/i, label: "시동" },
  { pattern: /방전|재방전/i, label: "방전" },
  { pattern: /업그레이드|대체|교체/i, label: "교체" },
  { pattern: /택배|주문|배송/i, label: "주문" },
  { pattern: /문의|상담/i, label: "문의" },
  { pattern: /가격|비교/i, label: "가격" },
  { pattern: /배터리/i, label: "배터리" },
];

export function extractPurposeKeywords(query: string): string[] {
  const found: string[] = [];
  for (const { pattern, label } of PURPOSE_RULES) {
    if (pattern.test(query) && !found.includes(label)) {
      found.push(label);
    }
  }
  return found.slice(0, 4);
}

export function hasVehicleInQuery(
  query: string,
  alias: SearchVehicleAliasMatch | null,
  vehicleKeywords: string[],
): boolean {
  return Boolean(alias) || vehicleKeywords.length > 0;
}

export function hasPurposeInQuery(query: string, flags: QueryIntentFlags, purposeKeywords: string[]): boolean {
  return purposeKeywords.length > 0 || Object.values(flags).some(Boolean);
}

/** 차량 + 목적 조합 또는 alias/규격/의도가 있으면 focus 검색 */
export function isFocusSearchQuery(
  query: string,
  alias: SearchVehicleAliasMatch | null,
  vehicleKeywords: string[],
  purposeKeywords: string[],
  flags: QueryIntentFlags,
  specs: string[],
): boolean {
  if (Boolean(alias) || specs.length > 0 || Object.values(flags).some(Boolean)) return true;
  const hasVehicle = hasVehicleInQuery(query, alias, vehicleKeywords);
  const hasPurpose = hasPurposeInQuery(query, flags, purposeKeywords);
  return hasVehicle && hasPurpose;
}

export function buildVehiclePurposeMessage(
  query: string,
  purposeKeywords: string[],
  flags: QueryIntentFlags,
): string | null {
  if (/12\s*v|12v|보조\s*배터리/i.test(query)) {
    return "전기·하이브리드 차량의 12V 보조배터리는 모델·연식·트림에 따라 규격이 다릅니다. 차량 연식·연료 또는 현재 장착 배터리 사진 확인이 필요합니다.";
  }
  if (flags.photo || purposeKeywords.includes("배터리 사진")) {
    return "사진으로 규격 확인이 필요한 검색입니다. 차량 연식·연료 또는 현재 장착 배터리 사진을 확인하면 더 정확합니다.";
  }
  if (flags.symptom && /블랙박스/.test(query)) {
    return "블랙박스 방전은 배터리 상태, 주차 시간, 상시전원 설정에 따라 원인이 달라질 수 있습니다.";
  }
  if (purposeKeywords.includes("배터리 규격") || flags.specCheck) {
    return "규격 확인이 필요한 검색입니다. 차량 연식·연료와 단자 방향을 함께 확인하세요.";
  }
  if (purposeKeywords.includes("배터리 교체") || flags.upgrade) {
    return "배터리 교체·업그레이드는 트림·ISG·장착 공간에 따라 달라질 수 있습니다. 연식·연료 확인을 권장합니다.";
  }
  if (purposeKeywords.includes("방전") || (flags.symptom && /방전/i.test(query))) {
    return "방전 증상은 주차 시간, 전장품 사용, 배터리 상태에 따라 원인이 달라질 수 있습니다. 사진·연식·연료 확인을 권장합니다.";
  }
  if (purposeKeywords.includes("배터리") || purposeKeywords.includes("12V 배터리")) {
    return "차량 연식·연료 또는 현재 장착 배터리 사진을 확인하면 더 정확합니다.";
  }
  return null;
}
