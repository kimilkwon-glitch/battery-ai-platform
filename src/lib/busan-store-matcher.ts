/** 동네명·구명 키워드 → 덕천점/학장점 추천 (클라이언트 매칭, 검색 로직과 무관) */

export type BusanStoreId = "deokcheon" | "hakjang";

export type StoreMatchResult =
  | { status: "matched"; storeId: BusanStoreId; keyword: string }
  | { status: "unknown" };

const DEOKCHEON_KEYWORDS = [
  "북구",
  "대저1",
  "대저1동",
  "금정",
  "연제",
  "덕천",
  "구포",
  "만덕",
  "화명",
  "화명동",
  "금곡",
  "구서",
  "장전",
  "온천",
  "사직",
  "연산",
  "연산동",
  "동래",
  "대저",
] as const;

const HAKJANG_KEYWORDS = [
  "사상",
  "사하",
  "강서",
  "명지",
  "명지동",
  "대저2",
  "대저2동",
  "진구",
  "부산진",
  "학장",
  "감전",
  "괘법",
  "모라",
  "주례",
  "엄궁",
  "하단",
  "하단동",
  "당리",
  "괴정",
  "신평",
  "장림",
  "서면",
  "개금",
  "가야",
  "부전",
  "전포",
] as const;

function normalizeQuery(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}

export function recommendBusanStore(raw: string): StoreMatchResult {
  const q = normalizeQuery(raw);
  if (!q) return { status: "unknown" };

  for (const kw of DEOKCHEON_KEYWORDS) {
    if (q.includes(kw)) return { status: "matched", storeId: "deokcheon", keyword: kw };
  }
  for (const kw of HAKJANG_KEYWORDS) {
    if (q.includes(kw)) return { status: "matched", storeId: "hakjang", keyword: kw };
  }
  return { status: "unknown" };
}

export const BUSAN_REGION_DISPLAY = {
  deokcheon: {
    label: "덕천점",
    regions: "북구 · 대저1동 · 금정 · 연제",
    blurb: "북구·금정·연제권은 덕천점 기준으로 우선 안내드립니다.",
  },
  hakjang: {
    label: "학장점",
    regions: "사상 · 사하 · 강서 · 명지 · 대저2동 · 진구",
    blurb: "사상·사하·강서·명지권은 학장점 기준으로 우선 안내드립니다.",
  },
} as const;

export const BUSAN_STORE_MATCH_UNKNOWN = {
  title: "상담 후 가까운 직영점으로 안내",
  body: "차량 위치와 일정에 따라 덕천점 또는 학장점으로 배정됩니다.",
} as const;
