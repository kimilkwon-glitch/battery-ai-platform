import "server-only";
import {
  countMemberPromotionUsages,
  countPromotionUsages,
  getPromotionByCode,
  listActivePromotions,
} from "@/lib/promotion/promotion-store.postgres";
import type { BatteryCartItem } from "@/types/cart";
import type {
  AppliedPromotion,
  PromotionDiscountType,
  PromotionEvaluationContext,
  PromotionEvaluationResult,
  PromotionRecord,
} from "@/types/promotion";

const NEW_MEMBER_DAYS = 30;

function orderSubtotal(ctx: PromotionEvaluationContext): number {
  return ctx.productSubtotal + ctx.batteryReturnFee;
}

function calcDiscountAmount(
  discountType: PromotionDiscountType,
  discountValue: number,
  base: number,
  maxDiscount: number | null,
): number {
  let amount =
    discountType === "percent"
      ? Math.floor((base * discountValue) / 100)
      : Math.min(discountValue, base);
  if (maxDiscount != null && amount > maxDiscount) {
    amount = maxDiscount;
  }
  return Math.max(0, amount);
}

function matchesStringList(
  values: string[] | null,
  candidates: string[],
  normalize: (s: string) => string = (s) => s.trim().toLowerCase(),
): boolean {
  if (!values?.length) return true;
  const set = new Set(values.map(normalize));
  return candidates.some((c) => set.has(normalize(c)));
}

function isExcluded(
  excluded: string[] | null,
  candidates: string[],
  normalize: (s: string) => string = (s) => s.trim().toLowerCase(),
): boolean {
  if (!excluded?.length) return false;
  const set = new Set(excluded.map(normalize));
  return candidates.some((c) => set.has(normalize(c)));
}

function cartContext(items: BatteryCartItem[]) {
  const brands = items.map((i) => i.brandName ?? "").filter(Boolean);
  const specs = items.map((i) => i.batterySpec ?? "").filter(Boolean);
  return { brands, specs };
}

function isPromotionDateValid(promo: PromotionRecord, now = new Date()): boolean {
  if (promo.status === "inactive" || promo.status === "expired") return false;
  const starts = promo.startsAt ? new Date(promo.startsAt) : null;
  const ends = promo.endsAt ? new Date(promo.endsAt) : null;
  if (ends && ends < now) return false;
  if (starts && starts > now) return false;
  return promo.status === "active" || promo.status === "scheduled";
}

async function checkUsageLimits(
  promo: PromotionRecord,
  memberId: string | null | undefined,
): Promise<string | null> {
  if (promo.usageLimitTotal != null) {
    const total = await countPromotionUsages(promo.id);
    if (total >= promo.usageLimitTotal) {
      return "사용할 수 없는 쿠폰입니다.";
    }
  }
  if (memberId && promo.usageLimitPerMember != null) {
    const memberCount = await countMemberPromotionUsages(promo.id, memberId);
    if (memberCount >= promo.usageLimitPerMember) {
      return "이미 사용한 쿠폰입니다.";
    }
  }
  return null;
}

export async function checkPromotionEligibility(
  promo: PromotionRecord,
  ctx: PromotionEvaluationContext,
  now = new Date(),
): Promise<{ ok: true; reason: string } | { ok: false; message: string }> {
  if (!isPromotionDateValid(promo, now)) {
    return { ok: false, message: "쿠폰 사용 기간이 아닙니다." };
  }

  if (promo.memberOnly && !ctx.memberId) {
    return { ok: false, message: "회원 전용 혜택입니다. 로그인 후 이용해 주세요." };
  }

  const subtotal = orderSubtotal(ctx);
  if (promo.minOrderAmount != null && subtotal < promo.minOrderAmount) {
    return { ok: false, message: "최소 주문금액을 충족하지 않습니다." };
  }

  if (promo.firstOrderOnly) {
    const completed = ctx.completedOrderCount ?? 0;
    if (completed > 0) {
      return { ok: false, message: "첫 주문 전용 혜택입니다." };
    }
  }

  if (promo.newMemberOnly && ctx.memberCreatedAt) {
    const created = new Date(ctx.memberCreatedAt);
    const days = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (days > NEW_MEMBER_DAYS) {
      return { ok: false, message: "신규 회원 전용 혜택입니다." };
    }
  }

  const { brands, specs } = cartContext(ctx.items);
  const fulfillment =
    ctx.fulfillmentType === "undecided"
      ? ctx.items[0]?.fulfillment.method ?? ctx.fulfillmentType
      : ctx.fulfillmentType;

  if (
    promo.allowedFulfillmentTypes?.length &&
    !promo.allowedFulfillmentTypes.includes(fulfillment)
  ) {
    return { ok: false, message: "이 상품에는 적용할 수 없는 쿠폰입니다." };
  }

  if (isExcluded(promo.excludedBrands, brands)) {
    return { ok: false, message: "이 상품에는 적용할 수 없는 쿠폰입니다." };
  }
  if (isExcluded(promo.excludedBatterySpecs, specs)) {
    return { ok: false, message: "이 상품에는 적용할 수 없는 쿠폰입니다." };
  }
  if (promo.allowedBrands?.length && !matchesStringList(promo.allowedBrands, brands)) {
    return { ok: false, message: "이 상품에는 적용할 수 없는 쿠폰입니다." };
  }
  if (promo.allowedBatterySpecs?.length && !matchesStringList(promo.allowedBatterySpecs, specs)) {
    return { ok: false, message: "이 상품에는 적용할 수 없는 쿠폰입니다." };
  }

  const usageError = await checkUsageLimits(promo, ctx.memberId);
  if (usageError) return { ok: false, message: usageError };

  const reason =
    promo.type === "automatic"
      ? "조건 충족 자동 적용"
      : promo.code
        ? `쿠폰코드 ${promo.code}`
        : "쿠폰 적용";

  return { ok: true, reason };
}

function buildApplied(
  promo: PromotionRecord,
  discountAmount: number,
  reason: string,
): AppliedPromotion {
  return {
    promotionId: promo.id,
    title: promo.title,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discountAmount,
    reason,
  };
}

export async function evaluatePromotions(
  ctx: PromotionEvaluationContext,
): Promise<PromotionEvaluationResult> {
  const baseSubtotal = orderSubtotal(ctx);
  const active = await listActivePromotions();
  const automatic = active.filter((p) => p.type === "automatic");

  const eligibleAutomatic: PromotionEvaluationResult["eligibleAutomatic"] = [];
  const autoCandidates: Array<{ promo: PromotionRecord; reason: string; amount: number }> = [];

  for (const promo of automatic.sort((a, b) => b.priority - a.priority)) {
    const check = await checkPromotionEligibility(promo, ctx);
    if (check.ok) {
      const amount = calcDiscountAmount(
        promo.discountType,
        promo.discountValue,
        baseSubtotal,
        promo.maxDiscountAmount,
      );
      if (amount > 0) {
        eligibleAutomatic.push({ promotion: promo, reason: check.reason });
        autoCandidates.push({ promo, reason: check.reason, amount });
      }
    }
  }

  let applied: AppliedPromotion[] = [];
  let discountTotal = 0;

  if (autoCandidates.length > 0) {
    const stackableAuto = autoCandidates.filter((c) => c.promo.stackable);
    if (stackableAuto.length > 0) {
      for (const c of stackableAuto) {
        const remaining = Math.max(0, baseSubtotal - discountTotal);
        const amount = Math.min(
          c.amount,
          calcDiscountAmount(
            c.promo.discountType,
            c.promo.discountValue,
            remaining,
            c.promo.maxDiscountAmount,
          ),
        );
        if (amount > 0) {
          applied.push(buildApplied(c.promo, amount, c.reason));
          discountTotal += amount;
        }
      }
    } else {
      const best = autoCandidates[0]!;
      applied.push(buildApplied(best.promo, best.amount, best.reason));
      discountTotal = best.amount;
    }
  }

  let couponError: string | undefined;
  const code = ctx.couponCode?.trim();
  if (code) {
    const couponPromo = await getPromotionByCode(code);
    if (!couponPromo || couponPromo.type !== "coupon_code") {
      couponError = "사용할 수 없는 쿠폰입니다.";
    } else {
      const check = await checkPromotionEligibility(couponPromo, ctx);
      if (!check.ok) {
        couponError = check.message;
      } else {
        const remaining = Math.max(0, baseSubtotal - discountTotal);
        const amount = calcDiscountAmount(
          couponPromo.discountType,
          couponPromo.discountValue,
          remaining,
          couponPromo.maxDiscountAmount,
        );
        if (amount <= 0) {
          couponError = "사용할 수 없는 쿠폰입니다.";
        } else if (applied.length > 0 && !couponPromo.stackable && !applied.some((a) => a.promotionId === couponPromo.id)) {
          const couponApplied = buildApplied(couponPromo, amount, check.reason);
          const couponOnly = [couponApplied];
          const couponDiscount = amount;
          if (couponDiscount > discountTotal) {
            applied = couponOnly;
            discountTotal = couponDiscount;
          }
        } else if (!applied.some((a) => a.promotionId === couponPromo.id)) {
          applied.push(buildApplied(couponPromo, amount, check.reason));
          discountTotal += amount;
        }
      }
    }
  }

  discountTotal = Math.min(discountTotal, baseSubtotal);
  const finalAmount = Math.max(0, baseSubtotal - discountTotal);

  return {
    appliedPromotions: applied,
    promotionDiscountTotal: discountTotal,
    finalAmount,
    eligibleAutomatic,
    couponError,
  };
}

/** 주문에 저장된 혜택 스냅샷으로 금액 재검증 */
export function recomputeWithStoredPromotions(
  baseSubtotal: number,
  applied: AppliedPromotion[],
): { promotionDiscountTotal: number; finalAmount: number } {
  let discountTotal = 0;
  for (const a of applied) {
    discountTotal += a.discountAmount;
  }
  discountTotal = Math.min(discountTotal, baseSubtotal);
  return {
    promotionDiscountTotal: discountTotal,
    finalAmount: Math.max(0, baseSubtotal - discountTotal),
  };
}
