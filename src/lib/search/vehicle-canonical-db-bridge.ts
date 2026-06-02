/**
 * parseVehicleIntent canonicalKey ↔ vehicle-battery-db.json (slug·표시명) 연결
 */
export type CanonicalDbBridge = {
  /** getRecordsForSlug / getVehicleDbProfile 키 */
  dbSlugs: string[];
  /** slug 매칭 실패 시 displayName 검색용 */
  displayNamePatterns?: RegExp[];
  /** 연료 필터 (canonical fuel과 함께 사용) */
  fuelHint?: string;
};

/** canonicalKey → 기존 차량 배터리 DB 조회 힌트 */
export const CANONICAL_DB_BRIDGE: Record<string, CanonicalDbBridge> = {
  "kia-sorento-mq4-hybrid": {
    dbSlugs: ["sorento-mq4"],
    displayNamePatterns: [/쏘렌토\s*MQ4\s*하이브리드/i, /쏘렌토MQ4\s*하이브리드/i],
    fuelHint: "하이브리드",
  },
  "kia-sorento-mq4": {
    dbSlugs: ["sorento-mq4"],
    displayNamePatterns: [/쏘렌토\s*MQ4/i, /쏘렌토MQ4/i],
  },
  "hyundai-santafe-mx5-hybrid": {
    dbSlugs: ["santafe-mx5", "santafe-tm"],
    displayNamePatterns: [/싼타페\s*MX5\s*하이브리드/i],
    fuelHint: "하이브리드",
  },
  "kia-bongo3": {
    dbSlugs: ["bongo3-truck"],
    displayNamePatterns: [/봉고\s*3|봉고3/i],
  },
  "kia-sportage-nq5-hybrid": {
    dbSlugs: ["sportage-nq5", "seltos-sp2"],
    displayNamePatterns: [/스포티지\s*NQ5\s*하이브리드/i],
    fuelHint: "하이브리드",
  },
  "kia-k8-hybrid": {
    dbSlugs: ["k8-gl3"],
    displayNamePatterns: [/K8.*하이브리드|케이8.*하이브리드/i],
    fuelHint: "하이브리드",
  },
  "hyundai-grandeur-gn7-hybrid": {
    dbSlugs: ["grandeur-gn7"],
    displayNamePatterns: [/그랜저\s*GN7\s*하이브리드/i],
    fuelHint: "하이브리드",
  },
  "hyundai-tucson-nx4-hybrid": {
    dbSlugs: ["tucson-nx4"],
    displayNamePatterns: [/투싼\s*NX4\s*하이브리드/i],
    fuelHint: "하이브리드",
  },
  "hyundai-ioniq5-ne": {
    dbSlugs: ["ioniq5-ne"],
    displayNamePatterns: [/아이오닉\s*5|아이오닉5/i],
    fuelHint: "전기",
  },
  "kia-ev6-cv": {
    dbSlugs: ["ev6"],
    displayNamePatterns: [/\bEV6\b/i],
    fuelHint: "전기",
  },
  "hyundai-porter2-from2020": {
    dbSlugs: ["porter2-new"],
    displayNamePatterns: [/포터\s*II.*20년|포터2.*2020/i],
  },
  "hyundai-porter2-until2019": {
    dbSlugs: ["porter2-old"],
    displayNamePatterns: [/포터\s*II.*~19|포터2.*2019/i],
  },
  "hyundai-porter2": {
    dbSlugs: ["porter2-new", "porter2-old"],
    displayNamePatterns: [/포터\s*II|포터2/i],
  },
  "genesis-gv70": {
    dbSlugs: ["gv70"],
    displayNamePatterns: [/GV70|제네시스\s*GV70/i],
  },
  "genesis-gv80": {
    dbSlugs: ["gv80"],
    displayNamePatterns: [/GV80|제네시스\s*GV80/i],
  },
  "genesis-gv60": {
    dbSlugs: ["gv60"],
    displayNamePatterns: [/GV60|제네시스\s*GV60/i],
  },
  "hyundai-staria-us4": {
    dbSlugs: ["staria-us4"],
    displayNamePatterns: [/스타리아/i],
  },
};

export function resolveDbBridge(
  canonicalKey: string | null,
  assetId?: string,
): CanonicalDbBridge | null {
  if (canonicalKey && CANONICAL_DB_BRIDGE[canonicalKey]) {
    return CANONICAL_DB_BRIDGE[canonicalKey];
  }
  if (assetId) {
    return { dbSlugs: [assetId] };
  }
  return null;
}
