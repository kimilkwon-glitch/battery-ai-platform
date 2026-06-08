/**
 * 레거시 쿠폰 localStorage — 주문·결제 할인 source of truth 아님.
 * 실제 혜택·할인은 DB promotions + evaluatePromotions 기준.
 * 고객 화면·주문 계산에 사용하지 않음. /admin/coupons 임시 화면 호환용만 유지.
 */

export type CouponStatus = "unused" | "used";

export type CouponRecord = {
  id: string;
  code: string;
  benefitId: string;
  benefitName: string;
  issuedAt: string;
  status: CouponStatus;
  customerName?: string;
  customerContact?: string;
  memo?: string;
};

const COUPONS_KEY = "bm-coupons-v1";
const USER_SLOT_PREFIX = "bm-user-coupon-";

function randomSuffix(length = 4): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]!;
  }
  return out;
}

export function generateCouponCode(benefitId: string): string {
  const slug = benefitId === "first-order-3" ? "FIRST3" : benefitId.toUpperCase().replace(/-/g, "").slice(0, 8);
  return `BM-${slug}-${randomSuffix(4)}`;
}

function readAll(): CouponRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COUPONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CouponRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(rows: CouponRecord[]) {
  localStorage.setItem(COUPONS_KEY, JSON.stringify(rows));
}

function userSlotKey(benefitId: string) {
  return `${USER_SLOT_PREFIX}${benefitId}`;
}

/** 이 브라우저에서 이미 발급된 쿠폰 (혜택별 1장) */
export function getUserCouponForBenefit(benefitId: string): CouponRecord | null {
  if (typeof window === "undefined") return null;
  const code = localStorage.getItem(userSlotKey(benefitId));
  if (!code) return null;
  return readAll().find((c) => c.code === code && c.benefitId === benefitId) ?? null;
}

export function listCoupons(): CouponRecord[] {
  return readAll().sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
}

export function issueCoupon(input: {
  benefitId: string;
  benefitName: string;
}): { ok: true; coupon: CouponRecord } | { ok: false; reason: "already_issued"; coupon: CouponRecord } {
  const existing = getUserCouponForBenefit(input.benefitId);
  if (existing) {
    return { ok: false, reason: "already_issued", coupon: existing };
  }

  const coupon: CouponRecord = {
    id: `cpn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    code: generateCouponCode(input.benefitId),
    benefitId: input.benefitId,
    benefitName: input.benefitName,
    issuedAt: new Date().toISOString(),
    status: "unused",
  };

  writeAll([coupon, ...readAll()]);
  localStorage.setItem(userSlotKey(input.benefitId), coupon.code);
  return { ok: true, coupon };
}

export function updateCouponStatus(code: string, status: CouponStatus) {
  writeAll(readAll().map((c) => (c.code === code ? { ...c, status } : c)));
}

export function updateCouponMeta(
  code: string,
  patch: Partial<Pick<CouponRecord, "customerName" | "customerContact" | "memo" | "status">>,
) {
  writeAll(readAll().map((c) => (c.code === code ? { ...c, ...patch } : c)));
}

export function deleteCoupon(code: string) {
  const rows = readAll().filter((c) => c.code !== code);
  writeAll(rows);
  if (typeof window !== "undefined") {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(USER_SLOT_PREFIX) && localStorage.getItem(key) === code) {
        localStorage.removeItem(key);
      }
    }
  }
}
