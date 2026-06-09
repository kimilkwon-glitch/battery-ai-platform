import { productBatteryCode } from "@/lib/batteryNormalize";
import { getBatteryFitmentVehicleLabels } from "@/lib/vehicleBattery";

export type BatteryCardBrandId = "rocket" | "solite";

export type RepresentativeLabelInput = {
  brand?: BatteryCardBrandId | null;
  code: string;
  productId?: string;
  title?: string | null;
};

type AlternateRule = {
  /** title에 하나라도 포함되면 이 후보 선택 */
  match: RegExp;
  label: string;
};

type CuratedMapping = {
  default: string;
  alternates?: AlternateRule[];
};

const FALLBACK_UNKNOWN = "차종별 확인";

/** 브랜드·규격 폴더코드 → 조회용 canonical code */
const CODE_ALIASES: Record<string, string> = {
  GB55066: "DIN50L",
  CMF54459: "DIN44L",
  CMF57412: "DIN74L",
  GB57820: "DIN74L",
  GB57219: "DIN74R",
  CMF56219: "DIN62L",
  "90R": "GB90R",
  "100R": "GB100R",
  "80L": "GB80L",
  "80R": "GB80R",
  "100L": "GB100L",
};

/** 고정 대표 적용 — brand:canonicalCode */
const CURATED: Record<string, CuratedMapping> = {
  // 로케트 일반형 / GB
  "rocket:GB40AL": { default: "올뉴모닝 가솔린" },
  "rocket:GB50L": { default: "더뉴레이 · 레이" },
  "rocket:GB60AL": { default: "엑센트 · i30 · 레이" },
  "rocket:GB80L": {
    default: "K5 1세대 · YF쏘나타",
    alternates: [
      { match: /그랜저\s*HG|LF\s*쏘나타/i, label: "그랜저HG · LF쏘나타 LPG" },
    ],
  },
  "rocket:GB90R": {
    default: "포터2 · 투싼ix",
    alternates: [{ match: /렉스턴\s*G4|마이티/i, label: "렉스턴G4 · 마이티" }],
  },
  "rocket:GB100L": { default: "봉고3 · 베라크루즈" },
  "rocket:GB100R": { default: "뉴쏀토 · 그랜드스타렉스" },
  "rocket:GB120L": { default: "메가트럭 · 카운티 · 대형화물차" },
  "rocket:GB150L": { default: "대형트럭 · 대형버스" },
  "rocket:GB170L": { default: "파비스 · 엑시언트 · 구형 맥쎈" },
  "rocket:GB250L": { default: "볼보 · 스카니아 · 벤츠 악트로스" },

  // 쏠라이트 일반형 / CMF
  "solite:CMF40L": { default: "모닝 가솔린" },
  "solite:CMF50L": { default: "다마스 · 라보" },
  "solite:CMF60L": { default: "아반떼HD · 쏘나타 하이브리드" },
  "solite:CMF80L": { default: "i40 · QM5 · SM5 뉴임프" },
  "solite:CMF90R": { default: "스포티지R 디젤 · 렉스턴스포츠" },
  "solite:CMF100L": { default: "봉고3 · 그랜드카니발" },
  "solite:CMF100R": { default: "포터2 20년 이후" },

  // 로케트 DIN
  "rocket:DIN50L": {
    default: "캐스퍼 · 모닝 어반",
    alternates: [{ match: /베뉴|넥스트\s*스파크|더\s*넥스트/i, label: "베뉴 · 더 넥스트 스파크" }],
  },
  "rocket:DIN62L": { default: "아반떼AD · 아베오" },
  "rocket:DIN74L": {
    default: "크루즈 · 아반떼MD",
    alternates: [{ match: /QM6|SM6/i, label: "QM6 LPG · SM6" }],
  },
  "rocket:DIN74R": { default: "그랜저 하이브리드 · 쏘나타 하이브리드" },
  "rocket:DIN90L": { default: "그랜저IG LPG · 올란도" },
  "rocket:DIN100L": { default: "체어맨 · 캡티바 · 뉴에쿠스" },

  // 쏠라이트 DIN
  "solite:DIN44L": { default: "스파크 · 마티즈 크리에이티브" },
  "solite:DIN62L": { default: "아반떼MD · QM6 · 엑센트" },
  "solite:DIN74L": { default: "말리부 · SM5 · QM3" },
  "solite:DIN74R": { default: "쏘나타 하이브리드" },
  "solite:DIN90L": { default: "SM5 노바 · 뉴SM5" },
  "solite:DIN100L": { default: "제네시스BH330 · 체어맨" },

  // 로케트 AGM
  "rocket:AGM60L": { default: "디올뉴코나 · 셀토스 · 쏘렌토MQ4 HEV" },
  "rocket:AGM70L": { default: "싼타페DM · 쏘나타DN8 · K5 DL3" },
  "rocket:AGM80R": { default: "GV70 · 스타리아" },
  "rocket:AGM95R": { default: "GV80 · G80" },
  "rocket:AGM105L": { default: "제네시스DH · K9 · EQ900" },

  // 쏠라이트 AGM
  "solite:AGM60L": { default: "아이오닉5 · 아이오닉6 · XM3" },
  "solite:AGM70L": { default: "QM6 · SM6 · 트레일블레이저" },
  "solite:AGM80L": { default: "스포티지QL · LF쏘나타" },
  "solite:AGM95L": { default: "팰리세이드 · 더뉴맥스크루즈" },
  "solite:AGM105L": { default: "제네시스DH · K9" },
};

function normalizeLookupCode(code: string): string {
  const raw = productBatteryCode(code).trim().toUpperCase();
  return CODE_ALIASES[raw] ?? raw;
}

function curatedKey(brand: BatteryCardBrandId, code: string): string {
  return `${brand}:${normalizeLookupCode(code)}`;
}

function pickCuratedLabel(mapping: CuratedMapping, title?: string | null): string {
  const hay = `${title ?? ""}`.trim();
  if (hay && mapping.alternates) {
    for (const alt of mapping.alternates) {
      if (alt.match.test(hay)) return alt.label;
    }
  }
  return mapping.default;
}

/** DB fallback 라벨 정제 — 말줄임·내부명·과장 길이 제거 */
function sanitizeFitmentLabel(label: string): string | null {
  const t = label.trim();
  if (!t || t.includes("…") || t.includes("...")) return null;
  if (/럭셔리|세대\)|세대\s|그랜저\s*5|슬러그|slug/i.test(t)) return null;
  if (/^[a-z0-9-]+$/i.test(t) && t.includes("-")) return null;
  if (t.length > 24) return null;
  return t;
}

function terminalSuffix(code: string): "L" | "R" | null {
  const n = normalizeLookupCode(code);
  if (/R$/i.test(n)) return "R";
  if (/L$/i.test(n) || /AL$/i.test(n)) return "L";
  return null;
}

/** R/L 카드에 반대 단자 차종이 섞이지 않도록 휴리스틱 필터 */
function labelMatchesTerminal(label: string, terminal: "L" | "R" | null): boolean {
  if (!terminal) return true;
  if (terminal === "R") {
    if (/스타리아|GV70|GV80|G80\b|포터|렉스턴|마이티|투싼ix/i.test(label)) return true;
    if (/그랜저\s*IG|K5\s*DL|쏘나타\s*DN/i.test(label) && !/하이브리드|HEV/i.test(label)) {
      return false;
    }
  }
  if (terminal === "L") {
    if (/스타리아|GV70|GV80\b/i.test(label) && !/하이브리드|HEV/i.test(label)) return false;
  }
  return true;
}

function dbFallbackLabel(brand: BatteryCardBrandId | null | undefined, code: string): string | null {
  const terminal = terminalSuffix(code);
  const lookup = normalizeLookupCode(code);
  const fitment = getBatteryFitmentVehicleLabels(lookup, 8)
    .map(sanitizeFitmentLabel)
    .filter((v): v is string => Boolean(v))
    .filter((v) => labelMatchesTerminal(v, terminal))
    .slice(0, 3);

  if (fitment.length >= 2) return fitment.join(" · ");
  if (fitment.length === 1) return fitment[0];
  return null;
}

/**
 * 카드 표시용 대표 적용 라벨 — 매칭 DB·주문 로직과 분리.
 * 1) 고정 매핑 2) title 보조 후보 3) DB fallback 4) 차종별 확인
 */
export function getBatteryRepresentativeLabel(input: RepresentativeLabelInput): string {
  const { brand, code, title } = input;
  const normalized = normalizeLookupCode(code);

  if (brand) {
    const mapping =
      CURATED[curatedKey(brand, code)] ??
      CURATED[`${brand}:${normalized}`] ??
      CURATED[`${brand}:${code.trim().toUpperCase()}`];
    if (mapping) return pickCuratedLabel(mapping, title);
  }

  const fromDb = dbFallbackLabel(brand, code);
  if (fromDb) return fromDb;

  return FALLBACK_UNKNOWN;
}

export function getBatteryRepresentativeLabelOrNull(input: RepresentativeLabelInput): string | null {
  const label = getBatteryRepresentativeLabel(input);
  return label === FALLBACK_UNKNOWN ? null : label;
}
