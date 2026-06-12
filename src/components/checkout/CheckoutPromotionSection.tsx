"use client";

import { useCallback, useEffect, useState } from "react";
import { apiValidatePromotions } from "@/lib/promotion/promotion-client";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { AppliedPromotion } from "@/types/promotion";
import type { BatteryCartItem } from "@/types/cart";
import type {
  OrderRequestFulfillmentMethod,
  OrderRequestUsedBatteryOption,
} from "@/types/order-request";

type Props = {
  items: BatteryCartItem[];
  fulfillmentType: OrderRequestFulfillmentMethod;
  returnBatteryOption: OrderRequestUsedBatteryOption;
  baseTotal: number | null;
  couponCode: string;
  onCouponCodeChange: (code: string) => void;
  appliedPromotions: AppliedPromotion[];
  promotionDiscountTotal: number;
  finalTotal: number | null;
  eligibleAutomaticTitles: string[];
  onPromotionUpdate: (data: {
    appliedPromotions: AppliedPromotion[];
    promotionDiscountTotal: number;
    finalTotal: number;
    eligibleAutomaticTitles: string[];
    couponError?: string;
  }) => void;
};

export function CheckoutPromotionSection({
  items,
  fulfillmentType,
  returnBatteryOption,
  baseTotal,
  couponCode,
  onCouponCodeChange,
  appliedPromotions,
  promotionDiscountTotal,
  finalTotal,
  eligibleAutomaticTitles,
  onPromotionUpdate,
}: Props) {
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageOk, setMessageOk] = useState(false);

  const runValidate = useCallback(
    async (code: string | null) => {
      if (baseTotal == null) return;
      setApplying(true);
      setMessage(null);
      const res = await apiValidatePromotions({
        cartItems: items,
        fulfillmentType,
        returnBatteryOption,
        couponCode: code?.trim() || undefined,
      });
      setApplying(false);

      if (!res.ok) {
        setMessage(res.message);
        setMessageOk(false);
        return;
      }

      if (res.couponError) {
        setMessage(res.couponError);
        setMessageOk(false);
      } else if (code?.trim()) {
        setMessage("쿠폰이 적용되었습니다.");
        setMessageOk(true);
      }

      onPromotionUpdate({
        appliedPromotions: res.appliedPromotions,
        promotionDiscountTotal: res.promotionDiscountTotal,
        finalTotal: res.finalAmount,
        eligibleAutomaticTitles: res.eligibleAutomatic.map((e) => e.title),
        couponError: res.couponError,
      });
    },
    [
      baseTotal,
      couponCode,
      fulfillmentType,
      items,
      onPromotionUpdate,
      returnBatteryOption,
    ],
  );

  useEffect(() => {
    if (baseTotal == null) return;
    void runValidate(null);
    // 자동 혜택만 갱신 — 쿠폰은 적용 버튼으로만 반영
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTotal, fulfillmentType, returnBatteryOption, items]);

  const handleApplyCoupon = () => {
    void runValidate(couponCode);
  };

  const handleRemoveCoupon = () => {
    onCouponCodeChange("");
    void runValidate(null);
  };

  return (
    <section className="checkout-card space-y-4" aria-label="쿠폰 및 혜택">
      <h2 className="checkout-card__title">쿠폰·혜택</h2>

      {eligibleAutomaticTitles.length > 0 ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2.5">
          <p className="text-[11px] font-black text-amber-900">자동 적용 가능한 혜택</p>
          <ul className="mt-1 space-y-0.5">
            {eligibleAutomaticTitles.map((title) => (
              <li key={title} className="text-xs font-semibold text-amber-950">
                {title}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[11px] font-medium text-amber-800">
            로그인 후 주문 조건에 맞는 혜택은 자동으로 적용됩니다.
          </p>
        </div>
      ) : null}

      <div className="checkout-promotion-section__coupon-row flex flex-wrap gap-2">
        <input
          type="text"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold uppercase sm:min-w-[12rem]"
          placeholder="쿠폰코드를 입력하세요"
          value={couponCode}
          onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
          aria-label="쿠폰코드"
        />
        <button
          type="button"
          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white disabled:opacity-50"
          disabled={applying || !couponCode.trim()}
          onClick={handleApplyCoupon}
        >
          적용
        </button>
        {couponCode ? (
          <button
            type="button"
            className="rounded-xl border px-3 py-2 text-xs font-bold text-slate-600"
            onClick={handleRemoveCoupon}
          >
            제거
          </button>
        ) : null}
      </div>

      {message ? (
        <p
          className={`text-xs font-bold ${messageOk ? "text-emerald-700" : "text-red-600"}`}
          role="alert"
        >
          {message}
        </p>
      ) : null}

      <p className="text-[11px] font-medium leading-relaxed text-slate-500">
        회원가입 후 첫 주문 3% 혜택은 로그인 후 조건 충족 시 자동 적용됩니다. 쿠폰코드가 있는 혜택만
        위 입력란에서 직접 적용할 수 있습니다.
      </p>

      {appliedPromotions.length > 0 || (promotionDiscountTotal ?? 0) > 0 ? (
        <div className="space-y-1 border-t border-slate-100 pt-3">
          <p className="text-[11px] font-black text-slate-500">할인 내역</p>
          {baseTotal != null ? (
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>할인 전 주문금액</span>
              <span className="tabular-nums font-semibold text-slate-800">
                {formatPriceWon(baseTotal)}
              </span>
            </div>
          ) : null}
          {appliedPromotions.map((p) => (
            <div key={p.promotionId} className="flex justify-between text-xs font-semibold text-slate-800">
              <span>{p.title}</span>
              <span className="font-black text-red-600">-{formatPriceWon(p.discountAmount)}</span>
            </div>
          ))}
          {finalTotal != null ? (
            <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-black text-slate-950">
              <span>최종 결제금액</span>
              <span className="tabular-nums">{formatPriceWon(finalTotal)}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
