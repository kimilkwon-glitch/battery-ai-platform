export type BatteryUpgradeLookupStatus = "ready" | "collecting";

export type BatteryUpgradeRecord = {
  slug: string;
  displayName: string;
  searchAliases: string[];
  stockBattery: string;
  upgradeBatteries: string[];
  checkPoints: string[];
  cautions: string[];
  /** 가솔린/디젤 등 적용 기준 — 확인포인트 대체 */
  guidanceNote?: string;
  status: BatteryUpgradeLookupStatus;
};

export const BATTERY_UPGRADE_LOOKUP: BatteryUpgradeRecord[] = [
  {
    slug: "grandeur-ig",
    displayName: "그랜저 IG",
    searchAliases: ["그랜저 IG", "그랜저", "IG 그랜저"],
    stockBattery: "AGM70L",
    upgradeBatteries: ["AGM80L"],
    checkPoints: [],
    cautions: [],
    guidanceNote:
      "가솔린 AGM70L 차량은 AGM80L까지 업그레이드 가능성이 있습니다. 디젤 차량은 AGM80L 기본 장착 사례가 있어 별도 업그레이드가 아닌 기본 규격 확인으로 안내합니다.",
    status: "ready",
  },
  {
    slug: "sorento-mq4",
    displayName: "쏘렌토 MQ4",
    searchAliases: ["쏘렌토 MQ4", "쏘렌토 4세대", "MQ4"],
    stockBattery: "AGM80L",
    upgradeBatteries: ["AGM95L"],
    checkPoints: ["배터리 트레이 공간", "단자 방향", "고정 브라켓"],
    cautions: ["하이브리드 트림은 별도 규격", "ISG 옵션 확인"],
    status: "ready",
  },
  {
    slug: "avante-cn7",
    displayName: "아반떼 CN7",
    searchAliases: ["아반떼 CN7", "CN7", "아반떼"],
    stockBattery: "AGM60L",
    upgradeBatteries: ["AGM70L"],
    checkPoints: ["트레이 깊이", "단자 방향", "커버 간섭"],
    cautions: ["ISG 트림은 원래 규격 유지 권장"],
    status: "ready",
  },
  {
    slug: "sportage-nq5",
    displayName: "스포티지 NQ5",
    searchAliases: ["스포티지 NQ5", "스포티지 5세대", "NQ5"],
    stockBattery: "AGM70L",
    upgradeBatteries: ["AGM80L"],
    checkPoints: ["트레이 공간", "단자 L/R", "고정쇠"],
    cautions: ["하이브리드는 AGM60L 기준"],
    status: "ready",
  },
  {
    slug: "sonata-dn8",
    displayName: "쏘나타 DN8",
    searchAliases: ["쏘나타 DN8", "DN8", "쏘나타"],
    stockBattery: "AGM80L",
    upgradeBatteries: ["AGM95L"],
    checkPoints: ["트레이 폭·높이", "단자 방향", "브래킷"],
    cautions: ["LPG/HEV 트림별 규격 상이"],
    status: "collecting",
  },
];

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

export function findBatteryUpgradeByQuery(query: string): BatteryUpgradeRecord | null {
  const q = norm(query);
  if (!q) return null;
  for (const row of BATTERY_UPGRADE_LOOKUP) {
    if (norm(row.displayName).includes(q) || q.includes(norm(row.displayName))) return row;
    if (row.searchAliases.some((a) => norm(a).includes(q) || q.includes(norm(a)))) return row;
    if (norm(row.slug).includes(q)) return row;
  }
  return null;
}

export function getBatteryUpgradeBySlug(slug: string): BatteryUpgradeRecord | null {
  return BATTERY_UPGRADE_LOOKUP.find((r) => r.slug === slug) ?? null;
}
