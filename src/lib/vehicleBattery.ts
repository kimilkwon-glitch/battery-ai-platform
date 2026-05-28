/**
 * 차량-배터리 DB — vehicle-battery-db.json 단일 소스
 */
import dbJson from "@/data/vehicle-battery-db.json";
import { findBatteryProductByCode, getCanonicalBatteryCode } from "@/lib/battery-alias-map";
import { getVehicleAsset, vehicleAssets } from "@/lib/car-assets";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { resolveVehicleFuelPrimaryBattery } from "@/lib/vehicle-fuel-primary-battery";
import {
  normalizeBatteryCode,
  productBatteryCode,
  resolveBatteryDisplay,
  isRetiredBatterySpec,
} from "@/lib/batteryNormalize";
import {
  expandKgMobilitySearchTerms,
  isKgMobilityBrand,
  queryMentionsKgMobilityBrand,
  stripKgMobilityBrandPrefix,
} from "@/lib/search/kg-mobility-brand";

export type VehicleBatteryRecord = {
  id: string;
  brand: string;
  model: string;
  displayName: string;
  detail: string;
  years: string | null;
  startYear: number | null;
  endYear: number | null;
  fuel: string | null;
  batteryOptions: string[];
  primaryBattery: string;
  status: string;
  confidence: string;
  source: string;
  originalProduct?: string;
  rawProduct?: string;
  caution: string;
  aliases: string[];
  correctedBy?: string;
};

type DbRoot = {
  meta: { recordCount: number };
  normalizationRules: Record<string, string>;
  records: VehicleBatteryRecord[];
};

const db = dbJson as DbRoot;
const records = db.records;

const SEARCH_SYNONYMS: [RegExp, string][] = [
  [/하브/g, "하이브리드"],
  [/hev/gi, "하이브리드"],
  [/phev/gi, "하이브리드"],
  [/엘피지/g, "LPG"],
  [/lpg/gi, "LPG"],
  [/가솔/g, "가솔린"],
  [/휘발유/g, "가솔린"],
  [/경유/g, "디젤"],
  [/diesel/gi, "디젤"],
  [/그렌저|그랜져/g, "그랜저"],
  [/소렌토/g, "쏘렌토"],
  [/gasoline/gi, "가솔린"],
];

const MODEL_GROUP_KO: Record<string, string> = {
  grandeur: "그랜저",
  sonata: "쏘나타",
  avante: "아반떼",
  tucson: "투싼",
  santafe: "싼타페",
  palisade: "팰리세이드",
  staria: "스타리아",
  kona: "코나",
  ioniq5: "아이오닉5",
  ioniq6: "아이오닉6",
  porter: "포터",
  k5: "K5",
  k8: "K8",
  k3: "K3",
  seltos: "셀토스",
  sportage: "스포티지",
  sorento: "쏘렌토",
  carnival: "카니발",
  morning: "모닝",
  ray: "레이",
  niro: "니로",
  bongo: "봉고",
  rextorn: "렉스턴",
  tivoli: "티볼리",
  korando: "코란도",
  torres: "토레스",
};

const GENERATION_TOKEN: Record<string, string[]> = {
  "grandeur-tg": ["TG"],
  "grandeur-hg": ["HG"],
  "grandeur-ig": ["IG", "그랜저 IG"],
  "grandeur-ig-fl": ["IG", "더 뉴 그랜저 IG"],
  "grandeur-gn7": ["GN7", "디 올 뉴 그랜저", "그랜저 GN"],
  "sonata-dn8": ["DN8"],
  "sonata-edge": ["디 엣지", "DN8"],
  "tucson-nx4": ["NX4", "4세대"],
  "tucson-nx4-fl": ["NX4", "더 뉴 투싼"],
  "sorento-mq4": ["MQ4"],
  "sorento-mq4-fl": ["MQ4"],
  "sportage-nq5": ["NQ5", "5세대"],
  "k5-dl3": ["DL3", "K5 3"],
  "k8-gl3": ["GL3", "K8"],
  "carnival-ka4": ["KA4", "4세대"],
  "porter2-old": ["포터 II", "04년", "19년"],
  "porter2-new": ["포터 II", "20년"],
  "porter2-ev": ["포터 II EV", "EV"],
  "bongo3-truck": ["봉고", "BONGO"],
  "bongo3-ev": ["봉고3 EV"],
  "staria-us4": ["스타리아"],
};

const VEHICLE_SUBTITLES: Record<string, string> = {
  "grandeur-ig": "6세대 그랜저",
  "grandeur-hg": "5세대 그랜저",
  "grandeur-tg": "5세대 그랜저",
  "grandeur-gn7": "디 올 뉴 그랜저",
  "sorento-mq4": "4세대 쏘렌토",
  "sportage-nq5": "5세대 스포티지",
  "sportage-ql": "4세대 스포티지",
  "k5-dl3": "3세대 K5",
  "porter2-old": "현대 소형트럭",
  "porter2-new": "현대 소형트럭 · 2020년형 이후",
  "staria-us4": "현대 MPV",
  "k3-yd": "K3 쿱 포함 1세대",
};

const IMPORT_BRANDS = new Set(["BMW", "벤츠", "Mercedes", "아udi", "Audi", "Volvo", "볼보", "Porsche", "포르쉐", "Land Rover", "렉서스", "Lexus", "Infiniti", "재규어", "Jaguar"]);

function norm(s: string | null | undefined) {
  return (s ?? "").toLowerCase().replace(/\s+/g, "").replace(/[()~·]/g, "");
}

export function normalizeSearchQuery(query: string): string {
  let q = query.trim();
  for (const [re, rep] of SEARCH_SYNONYMS) {
    q = q.replace(re, rep);
  }
  return q;
}

export { normalizeBatteryCode, resolveBatteryDisplay, isBatteryMatched } from "@/lib/batteryNormalize";

function extractGenerationTokens(slug: string, displayName?: string): string[] {
  const fromMap = GENERATION_TOKEN[slug] ?? [];
  const tokens = new Set(fromMap);
  if (displayName) {
    const m = displayName.match(/\b([A-Z]{2,3}\d?)\b/g);
    m?.forEach((t) => tokens.add(t));
    if (displayName.includes("IG")) tokens.add("IG");
    if (displayName.includes("MQ4")) tokens.add("MQ4");
    if (displayName.includes("RG3")) tokens.add("RG3");
  }
  return [...tokens];
}

export type VehicleDbProfile = {
  slug: string;
  title: string;
  subtitle: string;
  brand: string;
  dbModels: string[];
  generationTokens: string[];
  yearRange?: string;
};

export function getVehicleDbProfile(slug: string): VehicleDbProfile | null {
  const asset = getVehicleAsset(slug);
  const dbModels = asset
    ? [MODEL_GROUP_KO[asset.modelGroup] ?? asset.modelGroup, asset.displayName.split(" ")[0]]
    : [];

  if (asset) {
    return {
      slug,
      title: asset.displayName,
      subtitle: VEHICLE_SUBTITLES[slug] ?? asset.generationName ?? "",
      brand: asset.brand === "hyundai" ? "현대" : asset.brand === "kia" ? "기아" : "",
      dbModels: [...new Set([MODEL_GROUP_KO[asset.modelGroup] ?? "", asset.displayName.split(/[\s/]/)[0]].filter(Boolean))],
      generationTokens: extractGenerationTokens(slug, asset.displayName),
      yearRange: asset.yearRange,
    };
  }

  const slugNorm = slug.replace(/-/g, " ");
  const hit = records.find((r) => norm(r.displayName).includes(norm(slug)) || r.aliases.some((a) => norm(a).includes(norm(slug))));
  if (!hit) return null;

  return {
    slug,
    title: hit.displayName.split("(")[0].trim(),
    subtitle: VEHICLE_SUBTITLES[slug] ?? "",
    brand: hit.brand,
    dbModels: [hit.model],
    generationTokens: extractGenerationTokens(slug, hit.displayName),
    yearRange: hit.years ?? undefined,
  };
}

function slugYearMatchesRecord(slug: string, r: VehicleBatteryRecord): boolean {
  if (slug === "porter2-new") {
    if ((r.startYear ?? 0) >= 2020) return true;
    if (r.years && /20년~|202[0-9]|현재/.test(r.years)) return true;
    return false;
  }
  if (slug === "porter2-old") {
    if (r.endYear != null && r.endYear <= 2019) return true;
    if ((r.startYear ?? 9999) <= 2019 && (r.endYear == null || r.endYear <= 2019)) return true;
    if (r.years && /~19|201[0-9]|19년/.test(r.years) && !/20년~|202[0-9]/.test(r.years)) return true;
    return false;
  }
  return true;
}

function recordMatchesProfile(r: VehicleBatteryRecord, profile: VehicleDbProfile): boolean {
  if (profile.brand && r.brand !== profile.brand && !profile.brand.includes(r.brand)) {
    const importMatch = IMPORT_BRANDS.has(r.brand);
    if (!importMatch && profile.brand) return false;
  }

  const modelOk = profile.dbModels.some(
    (m) => r.model === m || norm(r.displayName).includes(norm(m)) || norm(r.model).includes(norm(m)),
  );
  if (!modelOk) return false;

  if (!slugYearMatchesRecord(profile.slug, r)) return false;

  if (profile.generationTokens.length === 0) return true;

  // 세대 토큰은 표시명·상세만 — 공통 alias "IG" 등으로 HG·FL 레코드가 섞이지 않게
  const hay = norm(`${r.displayName} ${r.detail}`);
  return profile.generationTokens.some((t) => hay.includes(norm(t)));
}

export function getRecordsForSlug(slug: string): VehicleBatteryRecord[] {
  const profile = getVehicleDbProfile(slug);
  if (!profile) {
    const q = norm(slug);
    return records.filter(
      (r) => norm(r.displayName).includes(q) || r.aliases.some((a) => norm(a).includes(q)),
    );
  }
  return records.filter((r) => recordMatchesProfile(r, profile));
}

export type BatteryAlternativeKind = "upgrade" | "alternate";

export type BatteryAlternative = {
  code: string;
  kind: BatteryAlternativeKind;
  label: string;
};

export type FuelBatteryGroup = {
  fuel: string;
  fuelLabel: string;
  primaryBattery: string;
  batteryOptions: string[];
  /** 카드 UI — 권장 외 후보 (업그레이드·트림별 대체) */
  alternatives: BatteryAlternative[];
  records: VehicleBatteryRecord[];
  caution: string;
  /** 상세표용 — 카드 UI에는 노출하지 않음 */
  needsReview: boolean;
  /** 카드에 표시할 병합 연식 (한 줄) */
  yearSummary: string;
};

export type ParsedYearRange = {
  start: number;
  end: number | null;
  raw: string;
};

function expandTwoDigitYear(two: string): number {
  const n = parseInt(two, 10);
  return n <= 30 ? 2000 + n : 1900 + n;
}

/** 연식 문자열 → { start, end } (표시·병합용) */
export function normalizeYearRange(yearText: string): ParsedYearRange | null {
  const raw = yearText.trim();
  if (!raw) return null;

  const full = raw.match(/(19|20)(\d{2})\s*[-~]\s*(?:(19|20)(\d{2})|현재|이후)/);
  if (full) {
    const start = parseInt(full[1] + full[2], 10);
    if (!full[3] && /현재|이후/.test(raw)) return { start, end: null, raw };
    const end = full[3] ? parseInt(full[3] + full[4], 10) : null;
    return { start, end, raw };
  }

  const short = raw.match(/(\d{2})\s*~\s*(\d{2})\s*년/);
  if (short) {
    return {
      start: expandTwoDigitYear(short[1]),
      end: expandTwoDigitYear(short[2]),
      raw,
    };
  }

  const shortOpen = raw.match(/(\d{2})\s*년?\s*~\s*(?:현재|이후)/);
  if (shortOpen) {
    return { start: expandTwoDigitYear(shortOpen[1]), end: null, raw };
  }

  const shortBare = raw.match(/(\d{2})\s*~\s*(\d{2})(?:년)?(?!\d)/);
  if (shortBare) {
    return {
      start: expandTwoDigitYear(shortBare[1]),
      end: expandTwoDigitYear(shortBare[2]),
      raw,
    };
  }

  return null;
}

/** 인접·겹치는 구간만 병합 */
export function mergeYearRanges(ranges: ParsedYearRange[]): ParsedYearRange[] {
  if (!ranges.length) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: ParsedYearRange[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const last = merged[merged.length - 1];
    const lastEnd = last.end ?? 9999;
    if (cur.start <= lastEnd + 2) {
      const nextEnd = cur.end == null ? null : Math.max(lastEnd, cur.end);
      last.end = cur.end == null || last.end == null ? null : nextEnd;
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

function formatOneYearRange(r: ParsedYearRange): string {
  if (r.end == null) return `${r.start}~현재`;
  if (r.start === r.end) return `${r.start}`;
  return `${r.start}~${r.end}`;
}

/** raw 연식 문자열 배열 → 카드 표시용 한 줄 */
export function formatDisplayYearRange(inputs: string[]): string {
  const parsed = [...new Set(inputs)]
    .map(normalizeYearRange)
    .filter((r): r is ParsedYearRange => r != null);
  if (!parsed.length) return "";

  const merged = mergeYearRanges(parsed);
  if (merged.length === 1) return formatOneYearRange(merged[0]);
  return "연식별 적용";
}

/** DB 레코드 startYear/endYear 우선, 없으면 years 문자열 파싱 */
export function formatDisplayYearRangeFromRecords(recs: VehicleBatteryRecord[]): string {
  const withNumeric = recs.filter((r) => r.startYear != null);
  if (withNumeric.length) {
    const intervals = withNumeric.map((r) => ({
      start: r.startYear!,
      end: r.endYear,
      open: /현재|이후/.test(r.years ?? ""),
    }));
    intervals.sort((a, b) => a.start - b.start);

    let contiguous = true;
    for (let i = 1; i < intervals.length; i++) {
      const prevEnd = intervals[i - 1].end ?? 9999;
      if (intervals[i].start > prevEnd + 2) {
        contiguous = false;
        break;
      }
    }

    if (contiguous) {
      const start = Math.min(...intervals.map((s) => s.start));
      const open = intervals.some((s) => s.open || s.end == null);
      if (open) return `${start}~현재`;
      const end = Math.max(...intervals.map((s) => s.end ?? 0));
      return `${start}~${end}`;
    }
    return "연식별 적용";
  }

  return formatDisplayYearRange(recs.map((r) => r.years).filter(Boolean) as string[]);
}

export function buildFuelBatteryGroupFromRecords(
  fuelLabelKey: string,
  _primary: string,
  groupRecs: VehicleBatteryRecord[],
): FuelBatteryGroup {
  return buildFuelBatteryGroup(fuelLabelKey, groupRecs);
}

function extractCapacityHint(code: string): number | null {
  const m = code.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function classifyAlternativeKind(primary: string, alt: string): BatteryAlternativeKind {
  const pAh = extractCapacityHint(primary);
  const aAh = extractCapacityHint(alt);
  if (pAh != null && aAh != null && aAh > pAh) return "upgrade";
  return "alternate";
}

function alternativeDisplayLabel(kind: BatteryAlternativeKind): string {
  return kind === "upgrade" ? "업그레이드 가능" : "트림별 상이";
}

function recordYearInterval(r: VehicleBatteryRecord): { start: number; end: number | null } | null {
  if (r.startYear != null) return { start: r.startYear, end: r.endYear };
  const parsed = r.years ? normalizeYearRange(r.years) : null;
  if (parsed) return { start: parsed.start, end: parsed.end };
  return null;
}

function yearIntervalsOverlap(
  a: { start: number; end: number | null } | null,
  b: { start: number; end: number | null } | null,
): boolean {
  if (!a || !b) return true;
  const aEnd = a.end ?? 9999;
  const bEnd = b.end ?? 9999;
  return a.start <= bEnd + 2 && b.start <= aEnd + 2;
}

/** 같은 연료 내 비연속 연식 구간은 별도 버킷 */
function clusterRecordsByYearBucket(recs: VehicleBatteryRecord[]): VehicleBatteryRecord[][] {
  const buckets: VehicleBatteryRecord[][] = [];
  for (const r of recs) {
    const interval = recordYearInterval(r);
    let placed = false;
    for (const bucket of buckets) {
      if (bucket.some((b) => yearIntervalsOverlap(recordYearInterval(b), interval))) {
        bucket.push(r);
        placed = true;
        break;
      }
    }
    if (!placed) buckets.push([r]);
  }
  return buckets;
}

function buildFuelBatteryGroup(fuelLabelKey: string, groupRecs: VehicleBatteryRecord[]): FuelBatteryGroup {
  const primary = canonicalBatteryCode(pickPrimaryBatteryFromRecords(groupRecs));

  const otherPrimaries = [
    ...new Set(
      groupRecs
        .map((r) => normalizeBatteryCode(r.primaryBattery))
        .filter((c) => c && c !== primary),
    ),
  ];

  const dbOptions = [
    ...new Set(groupRecs.flatMap((r) => r.batteryOptions.map(normalizeBatteryCode))),
  ].filter((o) => o && o !== primary);

  const altCodes = [...new Set([...otherPrimaries, ...dbOptions])];

  const alternatives: BatteryAlternative[] = altCodes.map((code) => {
    const kind = classifyAlternativeKind(primary, code);
    return { code, kind, label: alternativeDisplayLabel(kind) };
  });

  const hasConfirmed = groupRecs.some(hasConfirmedBatteryData);

  return {
    fuel: fuelLabelKey,
    fuelLabel: fuelLabelKey,
    primaryBattery: primary,
    batteryOptions: altCodes,
    alternatives,
    records: groupRecs,
    caution: "연식·트림에 따라 배터리 규격이 다를 수 있습니다.",
    needsReview: !hasConfirmed && groupRecs.some(needsPhotoReview),
    yearSummary: formatDisplayYearRangeFromRecords(groupRecs),
  };
}

function fuelLabel(fuel: string | null): string {
  if (!fuel) return "공통";
  if (/하이브|hev|phev/i.test(fuel)) return "하이브리드";
  if (/lpg/i.test(fuel)) return "LPG";
  if (/디젤|diesel/i.test(fuel)) return "디젤";
  if (/가솔|gasoline|휘발/i.test(fuel)) return "가솔린";
  if (/전기|ev/i.test(fuel)) return "전기";
  return fuel;
}

/** UI 필터 — 레코드 연료 라벨 */
export function getRecordFuelLabel(record: VehicleBatteryRecord): string {
  return fuelLabel(record.fuel);
}

function batteryVoteWeight(r: VehicleBatteryRecord): number {
  let w = 1;
  if (r.status === "confirmed") w += 12;
  else if (r.status !== "needs_review") w += 2;
  if (r.confidence === "high") w += 4;
  else if (r.confidence === "medium") w += 1;
  return w;
}

function ahRankFromCode(code: string): number {
  const m = code.match(/(\d{2,3})/);
  return m ? parseInt(m[1], 10) : 0;
}

/** 동일 연료·연식 버킷 — 다수·확정 레코드 우선, 동률이면 용량 큰 규격 */
export function pickPrimaryBatteryFromRecords(recs: VehicleBatteryRecord[]): string {
  const votes = new Map<string, number>();
  for (const r of recs) {
    const code = productBatteryCode(r.primaryBattery) || normalizeBatteryCode(r.primaryBattery);
    if (!code) continue;
    votes.set(code, (votes.get(code) ?? 0) + batteryVoteWeight(r));
  }
  if (!votes.size) return "";

  const ranked = [...votes.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return ahRankFromCode(b[0]) - ahRankFromCode(a[0]);
  });
  return ranked[0]![0];
}

export function pickRepresentativeBatteryCodes(codes: string[]): string {
  const votes = new Map<string, number>();
  for (const raw of codes) {
    const code = productBatteryCode(raw) || normalizeBatteryCode(raw);
    if (!code) continue;
    votes.set(code, (votes.get(code) ?? 0) + 1);
  }
  if (!votes.size) return "";
  const ranked = [...votes.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return ahRankFromCode(b[0]) - ahRankFromCode(a[0]);
  });
  return ranked[0]![0];
}

export function hasConfirmedBatteryData(record: VehicleBatteryRecord): boolean {
  return record.status === "confirmed" && Boolean(record.primaryBattery?.trim() || record.batteryOptions.length);
}

export function needsPhotoReview(record: VehicleBatteryRecord): boolean {
  if (hasConfirmedBatteryData(record)) return false;
  if (record.status === "needs_review" || record.status === "raw") return true;
  if (record.confidence === "low") return true;
  return false;
}

export function groupRecordsByFuel(recs: VehicleBatteryRecord[]): FuelBatteryGroup[] {
  const byFuel = new Map<string, VehicleBatteryRecord[]>();
  for (const r of recs) {
    const fuel = fuelLabel(r.fuel);
    const battery = normalizeBatteryCode(r.primaryBattery);
    if (!battery) continue;
    if (!byFuel.has(fuel)) byFuel.set(fuel, []);
    byFuel.get(fuel)!.push(r);
  }

  const order = ["가솔린", "디젤", "LPG", "하이브리드", "전기", "공통"];
  const groups: FuelBatteryGroup[] = [];

  for (const fuelKey of order) {
    const fuelRecs = byFuel.get(fuelKey);
    if (!fuelRecs?.length) continue;
    for (const bucket of clusterRecordsByYearBucket(fuelRecs)) {
      groups.push(buildFuelBatteryGroup(fuelKey, bucket));
    }
    byFuel.delete(fuelKey);
  }

  for (const [fuelKey, fuelRecs] of byFuel) {
    for (const bucket of clusterRecordsByYearBucket(fuelRecs)) {
      groups.push(buildFuelBatteryGroup(fuelKey, bucket));
    }
  }

  return groups;
}

export type YearChip = {
  id: string;
  label: string;
  maxEndYear?: number;
  minStartYear?: number;
};

export function getYearChipsForSlug(slug: string, recs: VehicleBatteryRecord[]): YearChip[] {
  if (!/porter|포터/i.test(slug) && !recs.some((r) => /포터/.test(r.model))) return [];

  return [
    { id: "to2019", label: "~2019년식 (90R)", maxEndYear: 2019 },
    { id: "from2020", label: "2020년~ (100R)", minStartYear: 2020 },
  ];
}

export type VehicleSearchHit = {
  slug: string;
  title: string;
  subtitle: string;
  brand: string;
  yearRange: string;
  fuels: { fuel: string; battery: string }[];
  needsReview: boolean;
  imageSrc: string | null;
  href: string;
  fuelHref: string;
  recordCount: number;
};

/** fitment·배터리 상세 — DB 레코드 → platform vehicleId (표시명이 아닌 slug 단일 소스) */
function explicitVehicleSlugForRecord(r: VehicleBatteryRecord): string | null {
  const hay = norm(`${r.displayName} ${r.detail} ${r.aliases.join(" ")} ${r.years ?? ""}`);

  if (/mq4/i.test(hay) && /쏘렌토|sorento/i.test(hay)) return "sorento-mq4";
  if (/nq5/i.test(hay) && /스포티지|sportage/i.test(hay)) return "sportage-nq5";
  if (/ql/i.test(hay) && /스포티지|sportage/i.test(hay) && !/nq5/i.test(hay)) return "sportage-ql";
  if (/dn8/i.test(hay) && /쏘나타|sonata/i.test(hay)) return "sonata-dn8";
  if (/ig/i.test(hay) && /그랜저|grandeur/i.test(hay) && !/gn7/i.test(hay)) return "grandeur-ig";
  if (/gn7/i.test(hay) && /그랜저|grandeur/i.test(hay)) return "grandeur-gn7";
  if (/dl3/i.test(hay) && /k5|케이5/i.test(hay)) return "k5-dl3";
  if (/gl3/i.test(hay) && /k8/i.test(hay)) return "k8-gl3";
  if (/ka4/i.test(hay) && /카니발|carnival/i.test(hay)) return "carnival-ka4";
  if (/포터|porter/i.test(hay) && /20년|2020|현재|from2020/i.test(hay)) return "porter2-new";
  if (/포터|porter/i.test(hay)) return "porter2-old";
  if (/셀토스|seltos/i.test(hay) && /sp2|더뉴|페이스/i.test(hay)) return "seltos-sp2-fl";
  if (/셀토스|seltos/i.test(hay)) return "seltos-sp2";
  if (/코나|kona/i.test(hay)) return "kona-os";

  return null;
}

function scoreAssetForRecord(asset: (typeof vehicleAssets)[number], r: VehicleBatteryRecord): number {
  const ko = MODEL_GROUP_KO[asset.modelGroup];
  if (ko && r.model !== ko && !norm(r.model).includes(norm(ko))) return 0;

  const hay = norm(`${r.displayName} ${r.detail} ${r.aliases.join(" ")} ${r.years ?? ""}`);
  const assetId = asset.catalogId ?? asset.id;
  let score = 0;

  const genTokens = GENERATION_TOKEN[assetId];
  if (genTokens?.some((t) => hay.includes(norm(t)))) score += 120;

  if (/mq4/i.test(hay)) {
    if (assetId.includes("mq4")) score += 100;
    else if (/sorento-xm|sorento-um(?!-fl)/.test(assetId)) score -= 90;
  }
  if (/쏘렌토\s*r|sorentor|쏘렌토r/i.test(hay) && !/mq4/i.test(hay) && assetId === "sorento-xm") score += 70;

  for (const al of asset.aliases) {
    const na = norm(al);
    if (na.length < 2 || !hay.includes(na)) continue;
    score += na.length;
    if (na === norm("쏘렌토") && /mq4/i.test(hay)) score -= 8;
  }

  if (norm(asset.displayName) && hay.includes(norm(asset.displayName))) score += 15;

  return score;
}

function slugForRecord(r: VehicleBatteryRecord): string {
  const explicit = explicitVehicleSlugForRecord(r);
  if (explicit) return explicit;

  const hay = norm(`${r.displayName} ${r.detail} ${r.aliases.join(" ")}`);
  let bestId = "";
  let bestScore = 0;
  for (const asset of vehicleAssets) {
    const s = scoreAssetForRecord(asset, r);
    if (s > bestScore) {
      bestScore = s;
      bestId = asset.catalogId ?? asset.id;
    }
  }
  if (bestScore > 0) {
    if (/mq4/i.test(hay) && bestId === "sorento-xm") return "sorento-mq4";
    return bestId;
  }

  const token = r.displayName.match(/IG|MQ4|DN8|RG3|GV80|GV70|K9|G90|G80/i)?.[0];
  if (token && r.model) return `${norm(r.model)}-${token.toLowerCase()}`.replace(/[^a-z0-9-]/g, "");
  return norm(r.model).replace(/[^a-z0-9가-힣]/g, "-").slice(0, 40);
}

function scoreVehicleBatteryRecordsForQuery(
  query: string,
): { record: VehicleBatteryRecord; score: number }[] {
  const normalized = normalizeSearchQuery(query);
  const q = norm(normalized);
  if (!q) return [];

  const stripped = norm(stripKgMobilityBrandPrefix(normalized));
  const fuelHint = ["가솔린", "디젤", "LPG", "하이브리드", "전기"].find((f) => q.includes(norm(f)));
  const kgQuery = queryMentionsKgMobilityBrand(query);

  const scored: { record: VehicleBatteryRecord; score: number }[] = [];
  for (const r of records) {
    let score = 0;
    const hay = norm(`${r.brand} ${r.model} ${r.displayName} ${r.detail} ${r.aliases.join(" ")} ${r.fuel ?? ""}`);
    if (hay.includes(q)) score += 80;
    else if (stripped && stripped !== q && hay.includes(stripped)) score += 75;
    else if (q.split("").every((c) => hay.includes(c)) && q.length >= 3) score += 40;

    if (kgQuery && isKgMobilityBrand(r.brand)) score += 30;
    if (fuelHint && r.fuel && norm(r.fuel).includes(fuelHint)) score += 20;
    if (score > 0) scored.push({ record: r, score });
  }
  return scored;
}

export function searchVehicleBatteryDb(query: string, limit = 12): VehicleSearchHit[] {
  const terms = [...new Set([query, ...expandKgMobilitySearchTerms(query)])].filter((t) => t.trim());
  if (!terms.length) return [];

  const bestByRecord = new Map<VehicleBatteryRecord, number>();
  for (const term of terms) {
    for (const { record, score } of scoreVehicleBatteryRecordsForQuery(term)) {
      const prev = bestByRecord.get(record) ?? 0;
      if (score > prev) bestByRecord.set(record, score);
    }
  }

  const scored = [...bestByRecord.entries()].map(([record, score]) => ({ record, score }));

  const qNorm = norm(normalizeSearchQuery(query));
  const fuelHint = ["가솔린", "디젤", "LPG", "하이브리드", "전기"].find((f) => qNorm.includes(norm(f)));

  const byModel = new Map<string, VehicleBatteryRecord[]>();
  for (const { record, score } of scored.sort((a, b) => b.score - a.score)) {
    const key = `${record.brand}|${record.model}|${norm(record.displayName).slice(0, 24)}`;
    if (!byModel.has(key)) byModel.set(key, []);
    if (byModel.get(key)!.length < 8) byModel.get(key)!.push(record);
  }

  const hits: VehicleSearchHit[] = [];
  for (const [, recs] of byModel) {
    if (hits.length >= limit) break;
    const r0 = recs[0];
    const slug = slugForRecord(r0);
    const asset = getVehicleAsset(slug);
    const groups = groupRecordsByFuel(recs);
    hits.push({
      slug,
      title: asset?.displayName ?? r0.displayName.split("(")[0].trim(),
      subtitle: VEHICLE_SUBTITLES[slug] ?? r0.detail.split("(")[0].trim(),
      brand: r0.brand,
      yearRange: r0.years ?? asset?.yearRange ?? "-",
      fuels: groups.slice(0, 4).map((g) => ({ fuel: g.fuelLabel, battery: g.primaryBattery })),
      needsReview: recs.some(needsPhotoReview),
      imageSrc: asset?.image ?? null,
      href: `/vehicle/${slug}`,
      fuelHref: `/vehicle/${slug}${fuelHint ? `?fuel=${encodeURIComponent(fuelHint)}` : ""}#fuel-batteries`,
      recordCount: recs.length,
    });
  }
  return hits;
}

export function getRelatedVehicleSlugs(slug: string, limit = 4): { slug: string; title: string; battery: string }[] {
  const profile = getVehicleDbProfile(slug);
  if (!profile) return [];

  const sameModel = profile.dbModels[0];
  const relatedAssets = vehicleAssets.filter(
    (a) =>
      a.id !== slug &&
      (MODEL_GROUP_KO[a.modelGroup] === sameModel || a.modelGroup === profile.slug.split("-")[0]),
  );

  return relatedAssets.slice(0, limit).map((a) => {
    const db = getVehicleCardBatteryInfo(a.catalogId ?? a.id);
    return {
      slug: a.catalogId ?? a.id,
      title: a.displayName,
      battery: db.displayCode || a.defaultBatteryCode || "정보 준비중",
    };
  });
}

export function getRelatedBatteryCodes(code: string, limit = 4): string[] {
  const canonical = normalizeBatteryCode(code);
  const family = canonical.replace(/\d+.*/, "");
  const sizes = ["60", "70", "80", "95", "105"];
  const terminal = canonical.endsWith("R") ? "R" : "L";
  const related: string[] = [];

  for (const size of sizes) {
    const candidate = `${family}${size}${terminal}`;
    if (candidate !== canonical && getCanonicalBatteryCode(candidate)) related.push(normalizeBatteryCode(candidate));
  }
  return related.filter((c, i, arr) => arr.indexOf(c) === i).slice(0, limit);
}

function scoreBatteryFitRecord(r: VehicleBatteryRecord, canonical: string): number {
  let s = 0;
  if (r.status === "confirmed") s += 20;
  if (normalizeBatteryCode(r.primaryBattery) === canonical) s += 10;
  if (/하이브리드|hev/i.test(r.fuel ?? "") && /^AGM60/i.test(canonical)) s += 8;
  if (/쏘렌토|sorento/i.test(r.displayName) && /mq4/i.test(r.displayName) && /하이브|hev/i.test(r.fuel ?? "")) {
    s += 12;
  }
  if (/셀토스|seltos/i.test(r.displayName) && /^AGM60/i.test(canonical)) s += 8;
  if (/코나/i.test(r.displayName) && /^AGM60/i.test(canonical)) s += 6;
  if (/포터/i.test(r.displayName) && /100R/i.test(canonical)) s += 9;
  if (/20년|2020|현재/i.test(r.years ?? r.detail) && /100R/i.test(canonical)) s += 6;
  return s;
}

export type FitmentVehicleCard = {
  slug: string;
  title: string;
  brand: string;
  fuel: string;
  label: string;
};

function formatFitmentLabel(r: VehicleBatteryRecord): string {
  const title = r.displayName.replace(/\s*\([^)]*\)\s*$/u, "").trim();
  const fuel = (r.fuel ?? "").trim();
  if (/하이브|hev/i.test(fuel) && /쏘렌토/i.test(title) && /mq4/i.test(title)) {
    return "쏘렌토 MQ4 HEV";
  }
  if (/셀토스/i.test(title)) return "셀토스";
  if (/포터/i.test(title) && /20년|2020|현재/i.test(`${r.years ?? ""} ${r.detail}`)) return "포터2 2020~";
  if (/포터/i.test(title)) return "포터2";
  if (/코나/i.test(title)) return "코나";
  if (title.length > 28) return `${title.slice(0, 26)}…`;
  return title;
}

/** 검색·쇼핑·배터리 상세 공통 — 대표 적용 차량 */
export function getBatteryFitmentVehicles(code: string, limit = 8): FitmentVehicleCard[] {
  const canonical = normalizeBatteryCode(code);
  const sorted = getRecordsForBattery(canonical, 48);
  const seen = new Set<string>();
  const cards: FitmentVehicleCard[] = [];

  for (const r of sorted) {
    const slug = slugForRecord(r);
    const key = `${slug}::${(r.fuel ?? "").trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const title = r.displayName.replace(/\s*\([^)]*\)\s*$/u, "").trim();
    cards.push({
      slug,
      title,
      brand: r.brand,
      fuel: (r.fuel ?? "확인 필요").trim(),
      label: formatFitmentLabel(r),
    });
    if (cards.length >= limit) break;
  }

  return cards;
}

export function getBatteryFitmentVehicleLabels(code: string, limit = 4): string[] {
  return getBatteryFitmentVehicles(code, limit).map((v) => v.label);
}

export function getRecordsForBattery(code: string, limit = 24): VehicleBatteryRecord[] {
  if (isRetiredBatterySpec(code)) return [];
  const canonical = normalizeBatteryCode(code);
  return records
    .filter(
      (r) =>
        normalizeBatteryCode(r.primaryBattery) === canonical ||
        r.batteryOptions.some((b) => normalizeBatteryCode(b) === canonical),
    )
    .sort((a, b) => scoreBatteryFitRecord(b, canonical) - scoreBatteryFitRecord(a, canonical))
    .slice(0, limit);
}

export type VehicleCardBatteryInfo = {
  displayCode: string;
  productCode?: string;
  batteryOptions: string[];
  hasConfirmedDb: boolean;
  needsPhotoReview: boolean;
};

/** 차량 카드·검색 — DB confirmed 배터리 우선, 이미지 미매칭과 무관 */
export function getVehicleCardBatteryInfo(slug: string): VehicleCardBatteryInfo {
  const recs = getRecordsForSlug(slug);
  if (!recs.length) {
    return { displayCode: "", batteryOptions: [], hasConfirmedDb: false, needsPhotoReview: false };
  }

  const confirmed = recs.filter(hasConfirmedBatteryData);
  const hasConfirmedDb = confirmed.length > 0;
  const source = hasConfirmedDb ? confirmed : recs;
  const groups = groupRecordsByFuel(source);
  const primaryRaw = groups[0]?.primaryBattery ?? source[0]?.primaryBattery ?? "";
  const displayCode = primaryRaw ? resolveBatteryDisplay(primaryRaw).displayCode : "";
  const batteryOptions = [
    ...new Set(groups.flatMap((g) => g.batteryOptions.map((c) => resolveBatteryDisplay(c).displayCode))),
  ].filter(Boolean);

  return {
    displayCode,
    productCode: displayCode ? findBatteryProductByCode(displayCode) : undefined,
    batteryOptions,
    hasConfirmedDb,
    needsPhotoReview: !hasConfirmedDb && recs.some(needsPhotoReview),
  };
}

export function getVehicleBatteryPageData(slug: string) {
  const profile = getVehicleDbProfile(slug);
  const recs = getRecordsForSlug(slug);
  const fuelGroups = groupRecordsByFuel(recs).map((g) => {
    const unified = resolveVehicleFuelPrimaryBattery(slug, g.fuelLabel);
    return unified ? { ...g, primaryBattery: unified } : g;
  });
  const yearChips = getYearChipsForSlug(slug, recs);
  const relatedVehicles = getRelatedVehicleSlugs(slug);
  const hasConfirmedDb = recs.some(hasConfirmedBatteryData);
  const needsAnyReview = !hasConfirmedDb && recs.some(needsPhotoReview);
  const summary = buildVehicleBatterySummary(slug, fuelGroups);

  return {
    profile,
    records: recs,
    fuelGroups,
    yearChips,
    relatedVehicles,
    needsAnyReview,
    hasData: recs.length > 0,
    summary,
  };
}

export type VehicleBatterySummaryLine = {
  label: string;
  battery: string;
};

export type VehicleBatterySummary = {
  lines: VehicleBatterySummaryLine[];
  alternatives: string[];
  checkPoints: string[];
  representativeBattery: string;
  verdictNotes: string[];
};

/** 연료별 DB 그룹 → 상단 빠른 요약 */
export function buildVehicleBatterySummary(
  slug: string,
  fuelGroups: FuelBatteryGroup[],
): VehicleBatterySummary | null {
  if (fuelGroups.length === 0) return null;

  const lines: VehicleBatterySummaryLine[] = [];
  const gasPrimary = resolveVehicleFuelPrimaryBattery(slug, "가솔린");
  const dieselPrimary = resolveVehicleFuelPrimaryBattery(slug, "디젤");

  if (gasPrimary && dieselPrimary && gasPrimary === dieselPrimary) {
    lines.push({ label: "가솔린/디젤", battery: gasPrimary });
  } else {
    if (gasPrimary) lines.push({ label: "가솔린", battery: gasPrimary });
    if (dieselPrimary) lines.push({ label: "디젤", battery: dieselPrimary });
  }

  for (const g of fuelGroups) {
    if (g.fuelLabel === "가솔린" || g.fuelLabel === "디젤") {
      if (gasPrimary && dieselPrimary && gasPrimary === dieselPrimary) continue;
    }
    if (!lines.some((l) => l.label === g.fuelLabel)) {
      const code = resolveVehicleFuelPrimaryBattery(slug, g.fuelLabel) || g.primaryBattery;
      lines.push({ label: g.fuelLabel, battery: code });
    }
  }

  const alternatives = [
    ...new Set(fuelGroups.flatMap((g) => g.batteryOptions).filter(Boolean)),
  ].slice(0, 4);

  const checkPoints = ["연료/트림 확인"];
  const cautionText = fuelGroups.map((g) => g.caution).join(" ");
  if (/ISG|IBS|하이브리드|스마트/i.test(cautionText)) checkPoints.push("ISG 여부");
  if (/단자|L\/R|좌\/우/i.test(cautionText)) checkPoints.push("단자 방향");

  const representativeBattery =
    gasPrimary || dieselPrimary || fuelGroups[0]?.primaryBattery || "";

  const verdictNotes: string[] = [];
  if (representativeBattery) verdictNotes.push(`대표 규격 ${representativeBattery}`);
  verdictNotes.push("확인 기준: 연료·트림");
  if (checkPoints.length > 1) {
    verdictNotes.push(`주의: ${checkPoints.slice(1).join(", ")}`);
  }

  return {
    lines,
    alternatives,
    checkPoints,
    representativeBattery,
    verdictNotes,
  };
}

export function getBatteryDetailData(code: string) {
  if (isRetiredBatterySpec(code)) {
    return getBatteryDetailData("DIN74R");
  }
  const displayCode =
    canonicalBatteryCode(code) ||
    productBatteryCode(code) ||
    code.trim().replace(/\s+/g, "").toUpperCase();
  const matchKey = normalizeBatteryCode(displayCode);
  const matching = getRecordsForBattery(matchKey, 48);
  const fitment = getBatteryFitmentVehicles(matchKey, 12);
  const vehicles = fitment.map((v) => ({
    slug: v.slug,
    title: v.title,
    brand: v.brand,
    fuel: fuelLabel(v.fuel),
  }));
  return {
    code: displayCode,
    records: matching,
    vehicles,
    relatedCodes: getRelatedBatteryCodes(matchKey),
  };
}

export { records as vehicleBatteryRecords };
