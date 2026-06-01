/**
 * 배터리 찜 — 브라우저 localStorage (비로그인·간단 UX).
 * 운영 연동 시 회원 API로 대체.
 */

const WISHLIST_KEY = "bm-wishlist-v1";

function readCodes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c): c is string => typeof c === "string" && c.trim().length > 0);
  } catch {
    return [];
  }
}

function writeCodes(codes: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(codes));
}

export function normalizeWishlistCode(code: string): string {
  return code.trim().toUpperCase();
}

export function listBatteryWishlist(): string[] {
  return readCodes();
}

export function isBatteryWishlisted(code: string): boolean {
  const key = normalizeWishlistCode(code);
  return readCodes().some((c) => normalizeWishlistCode(c) === key);
}

/** 토글 후 찜 여부 반환 */
export function toggleBatteryWishlist(code: string): boolean {
  const key = normalizeWishlistCode(code);
  const list = readCodes().map(normalizeWishlistCode);
  const idx = list.indexOf(key);
  if (idx >= 0) {
    list.splice(idx, 1);
    writeCodes(list);
    return false;
  }
  writeCodes([key, ...list.filter((c) => c !== key)]);
  return true;
}
