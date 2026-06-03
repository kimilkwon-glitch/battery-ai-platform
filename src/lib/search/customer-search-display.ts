import type { VehicleAsset } from "@/lib/car-assets";

/** 메인·상단 검색 자동완성 — 배터리 규격만 */
export const CUSTOMER_BATTERY_SPEC_CODES = [
  "AGM60L",
  "AGM70L",
  "AGM80L",
  "AGM80R",
  "AGM95L",
  "AGM95R",
  "AGM105L",
  "DIN44L",
  "DIN50L",
  "DIN62L",
  "DIN74L",
  "DIN80L",
  "DIN90L",
  "DIN100L",
  "40AL",
  "50L",
  "60L",
  "60R",
  "80L",
  "80R",
  "90L",
  "90R",
  "100L",
  "100R",
] as const;

/** 검색창·자동완성·일반 검색 결과에서 제외 (가이드/증상 페이지에서만) */
export const CUSTOMER_NON_SEARCH_KEYWORDS = [
  "완전방전",
  "시동지연",
  "블랙박스 방전",
  "장기주차 방전",
  "AGM 배터리 차이",
  "하이브리드 보조배터리",
  "배터리 방전",
  "사진 확인",
  "주문 전 확인",
] as const;

const INTERNAL_NOTE_RE =
  /vehicle-battery-db|needsReview|needs_review|미등록|차량표\s*미등록|등록된\s*규격\s*없음|battery:needsReview|battery:linked|\bslug\b|\bdebug\b|\bDB\b|내부|연료별\s*확인|규격\s*재확인|ISG\s*여부|사진·문의로\s*확인|사진\s*문의|문의·사진\s*확인/i;

const DEFAULT_CUSTOMER_NOTE = "연식·옵션별 확인 필요";

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

export function isCustomerGuideSymptomOnlyQuery(query: string): boolean {
  const q = norm(query);
  if (!q) return false;
  return CUSTOMER_NON_SEARCH_KEYWORDS.some((k) => {
    const n = norm(k);
    return q === n || q.includes(n);
  });
}

export function sanitizeCustomerBatterySummary(raw?: string | null): string | null {
  if (!raw?.trim()) return null;
  const text = raw.trim();
  if (INTERNAL_NOTE_RE.test(text)) return null;
  if (/연식,\s*연료,\s*ISG/i.test(text)) {
    return "연료·옵션별 상담 확인 권장";
  }
  const spec = text.match(/대표\s*규격\s*(AGM\d+[LR]|DIN\d+[LR]|\d+[LR])/i)?.[1];
  if (spec) return `대표 규격 ${spec.toUpperCase()}`;
  const bare = text.match(/\b(AGM\d+[LR]|DIN\d+[LR]|\d+[LR])\b/i)?.[1];
  if (bare && !/확인|필요|사진|문의|미등록/i.test(text)) {
    return `대표 규격 ${bare.toUpperCase()}`;
  }
  if (/상담|확인\s*권장|옵션별|연료·|연식·/i.test(text)) {
    return text.length > 28 ? text.slice(0, 28).trim() + "…" : text;
  }
  if (/문의|사진|확인\s*필요|미등록/i.test(text)) {
    return "상담 확인 필요";
  }
  if (text.length > 40) return DEFAULT_CUSTOMER_NOTE;
  return null;
}

/** 검색 결과 행 텍스트 필드 일괄 정리 */
export function sanitizeSearchRowCustomerCopy(
  row: {
    origin?: string;
    recommend?: string;
    upgrade?: string;
    note?: string;
    batteryNotes?: string;
  },
  fallbackSpec?: string | null,
): {
  origin: string;
  recommend: string;
  upgrade: string;
  note: string;
  batteryNotes: string | undefined;
} {
  const spec =
    fallbackSpec ??
    row.recommend?.match(/\b(AGM\d+[LR]|DIN\d+[LR]|\d+[LR])\b/i)?.[0] ??
    row.origin?.match(/\b(AGM\d+[LR]|DIN\d+[LR]|\d+[LR])\b/i)?.[0];
  const specLabel = spec && !/확인|필요|미등록|문의/i.test(spec) ? `대표 규격 ${spec.toUpperCase()}` : null;

  const origin =
    sanitizeCustomerBatterySummary(row.origin) ??
    specLabel ??
    (row.origin && !INTERNAL_NOTE_RE.test(row.origin) ? row.origin : "상담 확인 필요");
  const recommend =
    sanitizeCustomerBatterySummary(row.recommend) ?? specLabel ?? origin;
  const upgrade =
    sanitizeCustomerBatterySummary(row.upgrade) ??
    (/규격\s*재확인|연료별|차량\s*정보/i.test(row.upgrade ?? "") ? "연식·옵션별 확인 필요" : row.upgrade) ??
    "연식·옵션별 확인 필요";
  const note =
    sanitizeCustomerBatterySummary(row.note) ??
    (row.note && /차량표|미등록|문의/i.test(row.note) ? "차량 정보 확인 후 안내 가능" : row.note) ??
    "차량";
  const batteryNotes = sanitizeCustomerBatterySummary(row.batteryNotes) ?? specLabel ?? undefined;

  return { origin, recommend, upgrade, note, batteryNotes };
}

export function formatCustomerBatterySummaryForAsset(asset: VehicleAsset): string {
  if (asset.defaultBatteryCode) {
    return `대표 규격 ${asset.defaultBatteryCode}`;
  }
  const fromNotes = sanitizeCustomerBatterySummary(asset.batteryNotes);
  if (fromNotes) return fromNotes;
  if (asset.batteryMatchStatus === "needsReview") {
    return "상담 확인 필요";
  }
  return "차량 정보 확인 후 안내 가능";
}

export function displayNameSearchPenalty(displayName: string): number {
  if (/뉴\s*스타일|뷰티풀|뉴\s*코란도\s*c/i.test(displayName)) return 35;
  if (displayName.length > 14) return 12;
  return 0;
}

import type { VehicleSearchRow } from "@/components/platform/SearchVehicleResults";

/** 검색 페이지·RSC 직렬화 — needsReview 등 내부 필드 제거 */
export function toCustomerVehicleSearchRow(
  row: VehicleSearchRow,
): Omit<VehicleSearchRow, "needsReview"> & { needsPhotoCheck?: boolean } {
  const clean = sanitizeSearchRowCustomerCopy(row, row.recommend);
  const { needsReview, ...rest } = row;
  const merged = { ...rest, ...clean };
  return needsReview ? { ...merged, needsPhotoCheck: true } : merged;
}

export function batterySpecTerminalHint(code: string): string {
  const m = code.match(/^(\d+)([LR])$/i);
  if (m) return `${m[1]}Ah · ${m[2].toUpperCase()}단자`;
  if (/[LR]$/i.test(code)) {
    const side = code.slice(-1).toUpperCase();
    return code.startsWith("AGM") || code.startsWith("DIN") ? `${side}단자` : `${side}단자`;
  }
  return "배터리 규격";
}
