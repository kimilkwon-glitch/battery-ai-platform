/**
 * Mock activity generation (script / Node only).
 * vehicle-battery-db.json is loaded here — do not import this module from client components.
 */
import vehicleBatteryDb from "@/data/vehicle-battery-db.json";
import { getAllArticles } from "@/lib/content";

export type MockEventType =
  | "search"
  | "vehicle_view"
  | "battery_view"
  | "content_view"
  | "photo_check_click"
  | "compare_click"
  | "fuel_tab_click"
  | "year_chip_click";

export type MockEvent = {
  id: string;
  sessionId: string;
  type: MockEventType;
  query?: string;
  vehicleId?: string;
  vehicleName?: string;
  batteryId?: string;
  batteryName?: string;
  brand?: string;
  fuel?: string;
  contentId?: string;
  contentTitle?: string;
  comparePair?: string;
  yearChip?: string;
  fuelTab?: string;
  failed?: boolean;
  suggestion?: string;
  createdAt: string;
  source: "mock";
};

export type MockActivityStore = {
  generatedAt: string;
  count: number;
  events: MockEvent[];
};

export type DbVehicleRecord = {
  id: string;
  brand: string;
  model: string;
  displayName: string;
  fuel: string | null;
  primaryBattery: string;
  startYear?: number;
  endYear?: number;
  status?: string;
  caution?: string;
};

export type VehiclePick = {
  record: DbVehicleRecord;
  vehicleId: string;
  vehicleName: string;
  brandKey: string;
  fuel: string;
  batteryId: string;
  isImport: boolean;
  needsPhotoReview: boolean;
};

const DB_RECORDS = (vehicleBatteryDb as { records: DbVehicleRecord[] }).records;

const POPULAR_KEYS: { match: (r: DbVehicleRecord) => boolean; vehicleId: string; weight: number }[] = [
  { match: (r) => /그랜저.*IG|IG.*그랜저/i.test(r.displayName), vehicleId: "grandeur-ig", weight: 14 },
  { match: (r) => /쏘렌토.*MQ4|MQ4|쏘렌토.*4/i.test(r.displayName), vehicleId: "sorento-mq4", weight: 14 },
  { match: (r) => /포터/i.test(r.displayName) || (r.model?.includes("포터") ?? false), vehicleId: "porter2-new", weight: 12 },
  { match: (r) => /스타리아/i.test(r.displayName), vehicleId: "staria-us4", weight: 11 },
  { match: (r) => /카니발.*4|KA4/i.test(r.displayName), vehicleId: "carnival-ka4", weight: 11 },
  { match: (r) => /K5|DL3/i.test((r.displayName + (r.model ?? ""))), vehicleId: "k5-dl3", weight: 10 },
  { match: (r) => /스포티지.*NQ5|NQ5/i.test(r.displayName), vehicleId: "sportage-nq5", weight: 10 },
  { match: (r) => /G80.*RG3|RG3/i.test(r.displayName), vehicleId: "g80-rg3", weight: 8 },
  { match: (r) => /GV70/i.test(r.displayName), vehicleId: "gv70", weight: 8 },
  { match: (r) => /GV80/i.test(r.displayName), vehicleId: "gv80", weight: 8 },
];

const IMPORT_BRANDS = new Set(["BMW", "벤츠", "Mercedes", "Mercedes-Benz", "아우디", "Audi", "볼보", "Volvo", "포르쉐", "Porsche", "렉서스", "Lexus", "토요ota", "Toyota"]);

const TYPO_QUERIES: { query: string; suggestion: string; vehicleHint?: string }[] = [
  { query: "그렌저 밧데리", suggestion: "그랜저로 검색해보세요", vehicleHint: "그랜저" },
  { query: "그랜져 ig", suggestion: "그랜저 IG로 검색해보세요", vehicleHint: "그랜저" },
  { query: "소렌토 하브", suggestion: "쏘렌토 MQ4 하이브리드로 검색해보세요", vehicleHint: "쏘렌토" },
  { query: "쏘렌토 하이브", suggestion: "쏘렌토 MQ4 하이브리드로 검색해보세요", vehicleHint: "쏘렌토" },
  { query: "포터2 20년식 밧터리", suggestion: "포터2 연식별 90R·100R을 확인하세요", vehicleHint: "포터" },
  { query: "스타리아 엘피지", suggestion: "스타리아 LPG AGM80R을 확인하세요", vehicleHint: "스타리아" },
  { query: "gv80 밧데리", suggestion: "GV80 AGM95R 사진 확인을 권장합니다", vehicleHint: "GV80" },
  { query: "bmw520d 배터리", suggestion: "BMW 5시리즈 BMS·AGM 규격을 확인하세요", vehicleHint: "BMW" },
];

const ARTICLE_IDS = () => getAllArticles().map((a) => ({ id: a.id, title: a.title }));

const COMPARE_PAIRS = [
  ["AGM70L", "AGM80L"],
  ["AGM80L", "DIN74L"],
  ["AGM80L", "AGM95L"],
  ["90R", "100R"],
];

function isDomesticBrand(brand: string): boolean {
  return brand === "현대" || brand === "기아" || brand === "제네시스";
}

function isImportBrand(brand: string): boolean {
  if (isDomesticBrand(brand)) return false;
  return IMPORT_BRANDS.has(brand) || !["현대", "기아", "제네시스"].includes(brand);
}

function brandKey(brand: string): string {
  if (brand === "현대") return "hyundai";
  if (brand === "기아") return "kia";
  if (brand === "제네시스") return "genesis";
  return "import";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "")
    .slice(0, 48) || "vehicle-unknown";
}

export function dbRecordToVehicleId(record: DbVehicleRecord): string {
  for (const p of POPULAR_KEYS) {
    if (p.match(record)) return p.vehicleId;
  }
  const dn = record.displayName;
  if (/포터/i.test(dn) && (record.startYear ?? 0) < 2020) return "porter2-old";
  if (/BMW|520|530/i.test(dn + record.brand)) return "bmw-g30";
  if (/벤츠|E클래스|E-Class/i.test(dn + record.brand)) return `import-${slugify(record.brand + "-e-class")}`;
  if (/아우디|Audi|A6/i.test(dn + record.brand)) return `import-${slugify(record.brand + "-a6")}`;
  return `${brandKey(record.brand)}-${slugify(record.model || record.displayName)}`;
}

export function vehicleDisplayShort(record: DbVehicleRecord): string {
  const dn = record.displayName;
  if (/그랜저.*IG/i.test(dn)) return "그랜저 IG";
  if (/쏘렌토/i.test(dn)) return "쏘렌토 MQ4";
  if (/포터/i.test(dn)) return "포터2";
  if (/스타리아/i.test(dn)) return "스타리아";
  if (/카니발/i.test(dn) && /4|KA4/i.test(dn)) return "카니발 4세대";
  if (/K5|DL3/i.test(dn)) return "K5 DL3";
  if (/스포티지/i.test(dn)) return "스포티지 NQ5";
  if (/G80/i.test(dn)) return "G80 RG3";
  if (/GV70/i.test(dn)) return "GV70";
  if (/GV80/i.test(dn)) return "GV80";
  if (/BMW/i.test(record.brand + dn)) return "BMW 5시리즈";
  if (/벤츠/i.test(record.brand + dn)) return "벤츠 E클래스";
  if (/아우디/i.test(record.brand + dn)) return "아우디 A6";
  return dn.split("(")[0]?.trim() || record.model;
}

function fuelLabel(fuel: string | null): string {
  if (!fuel) return "가솔린";
  if (/하이브|HEV|Hybrid/i.test(fuel)) return "하이브리드";
  if (/디젤|diesel/i.test(fuel)) return "디젤";
  if (/LPG|lpg|엘피지/i.test(fuel)) return "LPG";
  if (/전기|EV/i.test(fuel)) return "전기";
  if (/터보/i.test(fuel)) return "가솔린";
  return fuel;
}

function pickWeightedRecord(pool: DbVehicleRecord[]): DbVehicleRecord {
  const weighted: DbVehicleRecord[] = [];
  for (const r of pool) {
    let w = 1;
    for (const p of POPULAR_KEYS) {
      if (p.match(r)) w = p.weight;
    }
    for (let i = 0; i < w; i++) weighted.push(r);
  }
  return weighted[Math.floor(Math.random() * weighted.length)] ?? pool[0];
}

export function getRandomVehicleRecord(): VehiclePick {
  const domestic = DB_RECORDS.filter((r) => isDomesticBrand(r.brand) && r.primaryBattery);
  const imports = DB_RECORDS.filter((r) => isImportBrand(r.brand) && r.primaryBattery);
  const pool = Math.random() < 0.7 ? domestic : imports;
  const record = pickWeightedRecord(pool.length ? pool : DB_RECORDS);
  const imp = isImportBrand(record.brand);
  const fuel = fuelLabel(record.fuel);
  return {
    record,
    vehicleId: dbRecordToVehicleId(record),
    vehicleName: vehicleDisplayShort(record),
    brandKey: brandKey(record.brand),
    fuel,
    batteryId: record.primaryBattery,
    isImport: imp,
    needsPhotoReview: imp || record.status === "raw" || Boolean(record.caution?.includes("사진")),
  };
}

export function getRandomBatteryFromVehicle(vehicle: VehiclePick): string {
  const opts = vehicle.record.primaryBattery ? [vehicle.record.primaryBattery] : [];
  if (vehicle.fuel.includes("하이브") && vehicle.vehicleName.includes("쏘렌토")) return "AGM60L";
  if (vehicle.vehicleName.includes("포터") && (vehicle.record.startYear ?? 0) >= 2020) return "100R";
  if (vehicle.vehicleName.includes("포터")) return "90R";
  if (vehicle.vehicleName.includes("스타리아")) return "AGM80R";
  return opts[0] ?? vehicle.batteryId;
}

const SEARCH_TEMPLATES: ((v: VehiclePick) => string)[] = [
  (v) => `${v.vehicleName.replace(/\s+/g, "")} 배터리`,
  (v) => `${v.vehicleName.toLowerCase()} ${v.fuel}`,
  (v) => `${v.vehicleName} ${v.fuel}`,
  (v) => {
    const y = v.record.startYear;
    if (y && y >= 2015) return `${v.vehicleName.split(" ")[0]} ${String(y).slice(2)}년식`;
    return `${v.vehicleName} 배터리`;
  },
  (v) => `${v.vehicleName.split(" ")[0]} ${v.batteryId}`,
  (v) => (v.fuel === "하이브리드" ? `${v.vehicleName.split(" ")[0]} 하브` : `${v.vehicleName} 경유`),
  (v) => (v.fuel === "LPG" ? `${v.vehicleName.toLowerCase()} lpg` : `${v.vehicleName} 가솔린`),
  (v) => `${v.vehicleName.toLowerCase()} ${v.batteryId.toLowerCase()}`,
  (v) => (v.isImport ? `${v.vehicleName.toLowerCase()} 밧데리` : `${v.vehicleName} 배터리`),
];

export function generateSearchQueryFromVehicle(vehicle: VehiclePick): string {
  const fn = SEARCH_TEMPLATES[Math.floor(Math.random() * SEARCH_TEMPLATES.length)];
  return fn(vehicle);
}

function weightedPickIndex(weights: number[]): number {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function randomCreatedAt(baseMs: number): string {
  const d = new Date(baseMs);
  const hourWeights = [
    0.3, 0.2, 0.15, 0.1, 0.1, 0.15, 0.4, 0.7, 1.2, 1.4, 1.3, 1.1,
    0.9, 1.3, 1.4, 1.5, 1.4, 1.2, 1.0, 0.9, 1.1, 1.2, 0.8, 0.5,
  ];
  const dayWeights = [5, 4, 3, 2, 1.5, 1.2, 1];
  d.setDate(d.getDate() - weightedPickIndex(dayWeights));
  d.setHours(weightedPickIndex(hourWeights), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);
  const offset = "+09:00";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${offset}`;
}

let eventCounter = 0;

function nextEventId(): string {
  eventCounter += 1;
  return `mock_evt_${String(eventCounter).padStart(4, "0")}`;
}

function baseEvent(sessionId: string, type: MockEventType, createdAt: string, partial: Partial<MockEvent>): MockEvent {
  return {
    id: nextEventId(),
    sessionId,
    type,
    createdAt,
    source: "mock",
    ...partial,
  };
}

export function generateMockUserSession(index: number, baseMs: number): MockEvent[] {
  const sessionId = `mock_session_${String(index).padStart(3, "0")}`;
  const events: MockEvent[] = [];
  const useTypo = Math.random() < 0.08;
  let vehicle: VehiclePick | null = null;
  let t = baseMs - Math.floor(Math.random() * 3600000);

  if (useTypo) {
    const typo = TYPO_QUERIES[Math.floor(Math.random() * TYPO_QUERIES.length)];
    events.push(
      baseEvent(sessionId, "search", randomCreatedAt(t), {
        query: typo.query,
        failed: true,
        suggestion: typo.suggestion,
      }),
    );
    return events;
  }

  const flow = Math.floor(Math.random() * 5);
  vehicle = getRandomVehicleRecord();
  const query = generateSearchQueryFromVehicle(vehicle);
  const battery = getRandomBatteryFromVehicle(vehicle);

  events.push(
    baseEvent(sessionId, "search", randomCreatedAt(t), {
      query,
      vehicleId: vehicle.vehicleId,
      vehicleName: vehicle.vehicleName,
      batteryId: battery,
      batteryName: battery,
      brand: vehicle.brandKey,
      fuel: vehicle.fuel,
    }),
  );
  t -= 60000 + Math.floor(Math.random() * 120000);

  if (flow === 4) {
    const articles = ARTICLE_IDS();
    const art = articles[Math.floor(Math.random() * articles.length)];
    events.push(
      baseEvent(sessionId, "content_view", randomCreatedAt(t), {
        contentId: art.id,
        contentTitle: art.title,
      }),
    );
    return events;
  }

  events.push(
    baseEvent(sessionId, "vehicle_view", randomCreatedAt(t), {
      vehicleId: vehicle.vehicleId,
      vehicleName: vehicle.vehicleName,
      brand: vehicle.brandKey,
      fuel: vehicle.fuel,
      batteryId: battery,
      batteryName: battery,
    }),
  );
  t -= 45000 + Math.floor(Math.random() * 90000);

  if (flow >= 1 && vehicle.fuel) {
    events.push(
      baseEvent(sessionId, "fuel_tab_click", randomCreatedAt(t), {
        vehicleId: vehicle.vehicleId,
        vehicleName: vehicle.vehicleName,
        fuelTab: vehicle.fuel,
        fuel: vehicle.fuel,
      }),
    );
    t -= 30000;
  }

  if (flow === 1 && vehicle.vehicleName.includes("포터")) {
    const chip = (vehicle.record.startYear ?? 0) >= 2020 ? "2020년 이후" : "2019년 이전";
    events.push(
      baseEvent(sessionId, "year_chip_click", randomCreatedAt(t), {
        vehicleId: vehicle.vehicleId,
        vehicleName: vehicle.vehicleName,
        yearChip: chip,
      }),
    );
    t -= 30000;
  }

  events.push(
    baseEvent(sessionId, "battery_view", randomCreatedAt(t), {
      batteryId: battery,
      batteryName: battery,
      vehicleId: vehicle.vehicleId,
      vehicleName: vehicle.vehicleName,
    }),
  );
  t -= 30000;

  if (vehicle.needsPhotoReview && Math.random() < 0.55) {
    events.push(
      baseEvent(sessionId, "photo_check_click", randomCreatedAt(t), {
        vehicleId: vehicle.vehicleId,
        vehicleName: vehicle.vehicleName,
        brand: vehicle.brandKey,
      }),
    );
  }

  if (Math.random() < 0.12) {
    const pair = COMPARE_PAIRS[Math.floor(Math.random() * COMPARE_PAIRS.length)];
    events.push(
      baseEvent(sessionId, "compare_click", randomCreatedAt(t - 20000), {
        comparePair: pair.join(","),
        batteryId: pair[0],
        batteryName: pair[0],
      }),
    );
  }

  return events;
}

export function generateMockActivity(count = 500): MockActivityStore {
  eventCounter = 0;
  const sessionCount = 120 + Math.floor(Math.random() * 61);
  const baseMs = Date.now();
  const events: MockEvent[] = [];
  let remaining = count;

  for (let s = 1; s <= sessionCount && remaining > 0; s++) {
    const sessionEvents = generateMockUserSession(s, baseMs - s * 60000);
    const slice = sessionEvents.slice(0, Math.min(sessionEvents.length, remaining));
    events.push(...slice);
    remaining -= slice.length;
  }

  while (remaining > 0) {
    const extra = generateMockUserSession(sessionCount + events.length, baseMs);
    events.push(extra[0]);
    remaining -= 1;
  }

  events.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "+09:00"),
    count: events.length,
    events,
  };
}
