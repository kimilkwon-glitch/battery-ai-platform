/**
 * /search 전용 차량 alias — 기존 assetId / catalogId / DB 검색어로 연결
 * 차량 DB 원본은 수정하지 않음
 */
import { getVehicleAsset } from "@/lib/car-assets";
import { normalizeQuery } from "@/lib/search/normalize-query";
import { parseVehicleIntent } from "@/lib/search/parse-vehicle-intent";
import { resolveVehicleAliasDbV01 } from "@/lib/search/resolve-vehicle-alias-v01";
import {
  KG_MOBILITY_CANONICAL_BRAND,
  withKgMobilityOptionalPrefix,
} from "@/lib/search/kg-mobility-brand";

export type SearchVehicleAliasMatch = {
  /** 고객 화면 정식 표기 (car-assets displayName 우선) */
  label: string;
  formalDisplayName?: string;
  brand?: string;
  assetId?: string;
  catalogId?: string;
  dbQuery: string;
  /** 별칭 검색 시 짧은 인식 안내 (비공식 별칭 목록 노출 없음) */
  searchRecognitionNote?: string;
  /** 디버그·QA용 매칭 출처 */
  matchedVia?: string;
};

type AliasRule = {
  label: string;
  brand?: string;
  pattern: RegExp;
  assetId?: string;
  catalogId?: string;
  dbQuery: string;
};

/** 구체적인 패턴을 먼저 검사 */
const ALIAS_RULES: AliasRule[] = [
  // 수입
  { label: "C클래스 W205", brand: "벤츠", pattern: /C[\s-]*클래스\s*W205|W205\s*C|C[\s-]*Class\s*W205/i, dbQuery: "C클래스" },
  { label: "C클래스", brand: "벤츠", pattern: /C[\s-]*클래스|C[\s-]*Class/i, dbQuery: "C클래스" },
  { label: "520i G30", brand: "BMW", pattern: /520i|5\s*시리즈|G30/i, dbQuery: "520i" },
  { label: "Cooper F56", brand: "미니", pattern: /Cooper\s*F56|F56\s*Cooper|미니\s*Cooper|MINI\s*Cooper/i, dbQuery: "Cooper" },
  { label: "A6 C8", brand: "아우디", pattern: /A6\s*C8|아udi\s*A6\s*C8/i, dbQuery: "A6 C8" },
  { label: "A6", brand: "아우디", pattern: /\bA6\b|아udi\s*A6/i, dbQuery: "A6" },

  // 제네시스
  { label: "G80 RG3", brand: "제네시스", pattern: /G80\s*RG3|RG3\s*G80/i, dbQuery: "G80 RG3" },
  { label: "GV70 JK1", brand: "제네시스", pattern: /GV70\s*JK1|JK1\s*GV70/i, dbQuery: "GV70" },
  { label: "GV80 JX1", brand: "제네시스", pattern: /GV80\s*JX1|JX1\s*GV80/i, dbQuery: "GV80" },
  { label: "GV70", brand: "제네시스", pattern: /\bGV70\b/i, dbQuery: "GV70" },
  { label: "GV80", brand: "제네시스", pattern: /\bGV80\b/i, dbQuery: "GV80" },
  { label: "G80", brand: "제네시스", pattern: /\bG80\b/i, dbQuery: "G80" },

  // KG/쌍용
  {
    label: "렉스턴 스포츠 Y400",
    brand: KG_MOBILITY_CANONICAL_BRAND,
    pattern: withKgMobilityOptionalPrefix("렉스턴\\s*스포츠\\s*Y400|Y400\\s*렉스턴|Rexton\\s*Sports"),
    dbQuery: "렉스턴 스포츠",
  },
  {
    label: "렉스턴 스포츠",
    brand: KG_MOBILITY_CANONICAL_BRAND,
    pattern: withKgMobilityOptionalPrefix("렉스턴\\s*스포츠|렉스턴스포츠|Rexton\\s*Sports"),
    dbQuery: "렉스턴 스포츠",
  },
  {
    label: "티볼리 X100",
    brand: KG_MOBILITY_CANONICAL_BRAND,
    pattern: withKgMobilityOptionalPrefix("티볼리\\s*X100|X100\\s*티볼리"),
    dbQuery: "티볼리 X100",
  },
  {
    label: "티볼리",
    brand: KG_MOBILITY_CANONICAL_BRAND,
    pattern: withKgMobilityOptionalPrefix("티볼리"),
    dbQuery: "티볼리",
  },
  {
    label: "렉스턴",
    brand: KG_MOBILITY_CANONICAL_BRAND,
    pattern: withKgMobilityOptionalPrefix("렉스턴|Rexton"),
    dbQuery: "렉스턴",
  },

  // 현대
  { label: "그랜저 IG", brand: "현대", pattern: /그랜저\s*IG|IG\s*그랜저/i, assetId: "grandeur-ig", catalogId: "grandeur-ig", dbQuery: "그랜저 IG" },
  { label: "그랜저 GN7", brand: "현대", pattern: /그랜저\s*GN7|GN7\s*그랜저|디\s*올\s*뉴\s*그랜저/i, assetId: "grandeur-gn7", catalogId: "grandeur-gn7", dbQuery: "그랜저 GN7" },
  { label: "그랜저 HG", brand: "현대", pattern: /그랜저\s*HG|HG\s*그랜저/i, dbQuery: "그랜저 HG" },
  { label: "투싼 NX4", brand: "현대", pattern: /투싼\s*NX4|NX4\s*투싼|투싼\s*4\s*세대/i, assetId: "tucson-nx4", catalogId: "tucson-nx4", dbQuery: "투싼 NX4" },
  { label: "싼타페 MX5", brand: "현대", pattern: /싼타페\s*MX5|MX5\s*싼타페|디\s*올\s*뉴\s*싼타페/i, assetId: "santafe-mx5", dbQuery: "싼타페 MX5" },
  { label: "싼타페 TM", brand: "현대", pattern: /싼타페\s*TM|TM\s*싼타페/i, assetId: "santafe-tm", catalogId: "santa-fe", dbQuery: "싼타페 TM" },
  { label: "아반떼 CN7", brand: "현대", pattern: /아반떼\s*CN7|CN7\s*아반떼/i, assetId: "avante-cn7", dbQuery: "아반떼 CN7" },
  { label: "아이오닉5 NE", brand: "현대", pattern: /아이오닉\s*5\s*NE|아이오닉5\s*NE|IONIQ\s*5\s*NE/i, assetId: "ioniq5-ne", catalogId: "ioniq5", dbQuery: "아이오닉5" },
  { label: "아이오닉6 CE", brand: "현대", pattern: /아이오닉\s*6\s*CE|아이오닉6\s*CE|IONIQ\s*6\s*CE/i, dbQuery: "아이오닉6" },
  {
    label: "포터2 2020년 이후",
    brand: "현대",
    pattern:
      /포터\s*2\s*(?:20\s*년\s*(?:식|이후)|2020\s*년?\s*(?:식|이후)?)|포터2\s*(?:20\s*년\s*(?:식|이후)|2020)/i,
    assetId: "porter2-new",
    catalogId: "porter2-new",
    dbQuery: "포터2",
  },
  {
    label: "포터2 2019년 이전",
    brand: "현대",
    pattern: /포터\s*2\s*(?:19\s*년\s*(?:식|이전)|2019)/i,
    assetId: "porter2-old",
    catalogId: "porter2-old",
    dbQuery: "포터2",
  },
  { label: "포터2", brand: "현대", pattern: /포터\s*2|포터2|Porter\s*2|2\s*세대\s*포터/i, dbQuery: "포터2" },
  { label: "스타리아 US4", brand: "현대", pattern: /스타리아\s*US4|US4\s*스타리아/i, assetId: "staria-us4", dbQuery: "스타리아" },
  { label: "코나", brand: "현대", pattern: /\b코나\b/i, dbQuery: "코나" },
  { label: "아이오닉5", brand: "현대", pattern: /아이오닉\s*5|아이오닉5|IONIQ\s*5|IONIQ5/i, assetId: "ioniq5-ne", catalogId: "ioniq5", dbQuery: "아이오닉5" },
  { label: "아이오닉6", brand: "현대", pattern: /아이오닉\s*6|아이오닉6|IONIQ\s*6|IONIQ6/i, dbQuery: "아이오닉6" },
  { label: "스타리아", brand: "현대", pattern: /스타리아/i, assetId: "staria-us4", dbQuery: "스타리아" },
  { label: "투싼", brand: "현대", pattern: /투싼/i, assetId: "tucson-nx4", catalogId: "tucson-nx4", dbQuery: "투싼" },
  { label: "아반떼", brand: "현대", pattern: /아반떼/i, assetId: "avante-cn7", dbQuery: "아반떼" },
  { label: "그랜저", brand: "현대", pattern: /그랜저/i, assetId: "grandeur-ig", catalogId: "grandeur-ig", dbQuery: "그랜저" },
  { label: "싼타페", brand: "현대", pattern: /싼타페/i, assetId: "santafe-tm", catalogId: "santa-fe", dbQuery: "싼타페" },

  // 기아
  { label: "K5 DL3", brand: "기아", pattern: /K5\s*DL3|DL3\s*K5|올\s*뉴\s*K5/i, dbQuery: "K5" },
  { label: "K8 GL3", brand: "기아", pattern: /K8\s*GL3|GL3\s*K8|케이\s*8|케이8/i, assetId: "k8-gl3", dbQuery: "K8" },
  { label: "쏘렌토 MQ4", brand: "기아", pattern: /쏘렌토\s*MQ4|MQ4\s*쏘렌토|쏘렌토\s*4\s*세대/i, dbQuery: "쏘렌토 MQ4" },
  { label: "카니발 KA4", brand: "기아", pattern: /카니발\s*KA4|KA4\s*카니발|카니발\s*4\s*세대/i, assetId: "carnival-ka4", catalogId: "carnival-ka4", dbQuery: "카니발 KA4" },
  {
    label: "스포티지 NQ5",
    brand: "기아",
    pattern: /스포티지\s*NQ5|NQ5\s*스포티지|스포티지\s*5\s*세대/i,
    assetId: "sportage-nq5",
    catalogId: "sportage-nq5",
    dbQuery: "스포티지",
  },
  { label: "셀토스 SP2", brand: "기아", pattern: /셀토스\s*SP2|SP2\s*셀토스/i, assetId: "seltos-sp2", catalogId: "seltos", dbQuery: "셀토스 SP2" },
  { label: "모닝 JA", brand: "기아", pattern: /모닝\s*JA|JA\s*모닝/i, dbQuery: "모닝" },
  { label: "레이 TAM", brand: "기아", pattern: /레이\s*TAM|TAM\s*레이/i, dbQuery: "레이" },
  {
    label: "봉고3",
    brand: "기아",
    pattern: /봉고\s*3|봉고3|Bongo\s*3|Bongo\s*III|3\s*세대\s*봉고/i,
    assetId: "bongo3-truck",
    catalogId: "bongo3-truck",
    dbQuery: "봉고3",
  },
  { label: "EV6 CV", brand: "기아", pattern: /EV6\s*CV|CV\s*EV6/i, assetId: "ev6", catalogId: "ev6", dbQuery: "EV6" },
  { label: "K8", brand: "기아", pattern: /\bK8\b|케이\s*8|케이8/i, assetId: "k8-gl3", dbQuery: "K8" },
  { label: "K5", brand: "기아", pattern: /\bK5\b/i, dbQuery: "K5" },
  { label: "쏘렌토", brand: "기아", pattern: /쏘렌토/i, dbQuery: "쏘렌토" },
  { label: "스포티지", brand: "기아", pattern: /스포티지/i, dbQuery: "스포티지" },
  { label: "셀토스", brand: "기아", pattern: /셀토스/i, assetId: "seltos-sp2", catalogId: "seltos", dbQuery: "셀토스" },
  { label: "모닝", brand: "기아", pattern: /모닝/i, dbQuery: "모닝" },
  { label: "레이", brand: "기아", pattern: /레이/i, dbQuery: "레이" },
  { label: "EV6", brand: "기아", pattern: /\bEV6\b/i, assetId: "ev6", catalogId: "ev6", dbQuery: "EV6" },
  { label: "카니발", brand: "기아", pattern: /카니발/i, assetId: "carnival-ka4", catalogId: "carnival-ka4", dbQuery: "카니발" },
];

function vehicleIntentToAlias(rawQuery: string): SearchVehicleAliasMatch | null {
  const { normalizedQuery } = normalizeQuery(rawQuery);
  const intent = parseVehicleIntent(normalizedQuery);
  if (!intent.hasVehicle) return null;
  return {
    label: intent.label,
    brand: intent.brand ?? undefined,
    assetId: intent.assetId,
    catalogId: intent.catalogId,
    dbQuery: intent.dbQuery,
  };
}

/** Vehicle-first canonical → alias DB v0.1 → regex alias 폴백 */
export function resolveSearchVehicleAlias(rawQuery: string): SearchVehicleAliasMatch | null {
  const canonical = vehicleIntentToAlias(rawQuery);
  if (canonical) return canonical;

  const aliasDb = resolveVehicleAliasDbV01(rawQuery);
  if (aliasDb) return aliasDb;

  const q = normalizeQuery(rawQuery).normalizedQuery.replace(/\s*배터리\s*$/i, "").trim();
  if (!q) return null;
  for (const rule of ALIAS_RULES) {
    if (rule.pattern.test(q)) {
      return {
        label: rule.label,
        brand: rule.brand,
        assetId: rule.assetId,
        catalogId: rule.catalogId,
        dbQuery: rule.dbQuery,
      };
    }
  }
  return null;
}

export function listSearchVehicleAliasLabels(): string[] {
  return ALIAS_RULES.map((r) => r.label);
}
