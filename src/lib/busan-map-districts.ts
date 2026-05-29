import type { BusanStoreId } from "@/lib/busan-store-matcher";

/** 안내용 부산 권역 블록 지도 — 행정 경계와 100% 일치하지 않음 */

export type BusanDistrictId =
  | "buk"
  | "geumjeong"
  | "yeonje"
  | "daejeo1"
  | "sasang"
  | "saha"
  | "gangseo"
  | "myeongji"
  | "daejeo2"
  | "jingu";

export type BusanMapDistrict = {
  id: BusanDistrictId;
  label: string;
  storeId: BusanStoreId;
  path: string;
  labelX: number;
  labelY: number;
};

/** 부산 윤곽(배경) + 서쪽 강서·명지, 북동부, 중앙·서부 권역 대략 배치 */
export const BUSAN_MAP_VIEWBOX = "0 0 420 360";

export const BUSAN_COASTLINE_PATH =
  "M 8 52 C 28 28 72 18 118 22 C 168 18 248 24 298 48 C 348 72 382 118 398 168 C 408 218 392 272 358 308 C 318 342 248 352 188 338 C 128 328 78 302 48 268 C 22 238 6 198 8 158 C 10 118 4 82 8 52 Z";

export const BUSAN_WATER_PATH =
  "M 248 268 C 298 248 348 228 398 198 L 398 360 L 0 360 L 0 298 C 48 318 128 332 188 328 C 212 318 232 292 248 268 Z";

export const BUSAN_MAP_DISTRICTS: BusanMapDistrict[] = [
  {
    id: "gangseo",
    label: "강서",
    storeId: "hakjang",
    path: "M 18 72 L 58 52 L 78 108 L 62 148 L 28 138 L 14 98 Z",
    labelX: 44,
    labelY: 102,
  },
  {
    id: "myeongji",
    label: "명지",
    storeId: "hakjang",
    path: "M 22 148 L 62 138 L 76 198 L 52 228 L 20 208 L 16 172 Z",
    labelX: 44,
    labelY: 188,
  },
  {
    id: "daejeo2",
    label: "대저2동",
    storeId: "hakjang",
    path: "M 68 198 L 98 188 L 112 238 L 88 252 L 62 242 Z",
    labelX: 86,
    labelY: 222,
  },
  {
    id: "buk",
    label: "북구",
    storeId: "deokcheon",
    path: "M 98 38 L 158 32 L 172 88 L 142 108 L 96 98 Z",
    labelX: 132,
    labelY: 72,
  },
  {
    id: "daejeo1",
    label: "대저1동",
    storeId: "deokcheon",
    path: "M 72 88 L 100 78 L 118 128 L 88 142 L 68 118 Z",
    labelX: 92,
    labelY: 112,
  },
  {
    id: "geumjeong",
    label: "금정",
    storeId: "deokcheon",
    path: "M 162 28 L 228 24 L 248 82 L 208 102 L 168 88 Z",
    labelX: 202,
    labelY: 62,
  },
  {
    id: "yeonje",
    label: "연제",
    storeId: "deokcheon",
    path: "M 188 92 L 248 86 L 268 142 L 222 158 L 182 132 Z",
    labelX: 222,
    labelY: 122,
  },
  {
    id: "sasang",
    label: "사상",
    storeId: "hakjang",
    path: "M 88 118 L 148 112 L 168 178 L 128 198 L 82 172 Z",
    labelX: 124,
    labelY: 158,
  },
  {
    id: "saha",
    label: "사하",
    storeId: "hakjang",
    path: "M 52 228 L 118 218 L 138 278 L 92 292 L 48 268 Z",
    labelX: 92,
    labelY: 258,
  },
  {
    id: "jingu",
    label: "진구",
    storeId: "hakjang",
    path: "M 132 168 L 198 158 L 218 228 L 168 248 L 128 212 Z",
    labelX: 172,
    labelY: 202,
  },
];

export const BUSAN_STORE_PINS: Record<
  BusanStoreId,
  { x: number; y: number; label: string }
> = {
  deokcheon: { x: 168, y: 58, label: "덕천점" },
  hakjang: { x: 108, y: 178, label: "학장점" },
};

export const BUSAN_MAP_PALETTE = {
  deokcheon: {
    fill: "#3b82f6",
    fillMuted: "#93c5fd",
    stroke: "#2563eb",
    bg: "rgba(59,130,246,0.08)",
  },
  hakjang: {
    fill: "#0d9488",
    fillMuted: "#5eead4",
    stroke: "#0f766e",
    bg: "rgba(13,148,136,0.08)",
  },
  neutral: {
    fill: "#94a3b8",
    stroke: "#cbd5e1",
  },
} as const;

export function districtsForStore(storeId: BusanStoreId): BusanMapDistrict[] {
  return BUSAN_MAP_DISTRICTS.filter((d) => d.storeId === storeId);
}
