"use client";

import { useEffect, useState } from "react";
import { getUserCouponForBenefit } from "@/lib/coupon-storage";

type Props = {
  className?: string;
  /** 결제·주문 단계 — 할인 반영 문구 강조 */
  variant?: "detail" | "checkout";
};

/**
 * 고객 화면용 할인 안내 — 쿠폰 코드 문자열은 노출하지 않음.
 * 발급된 쿠폰이 있으면 체크아웃·주문 시 자동 반영된다고 안내.
 */
export function BatteryAutoDiscountHint({ className = "", variant = "detail" }: Props) {
  const [hasCoupon, setHasCoupon] = useState(false);

  useEffect(() => {
    setHasCoupon(Boolean(getUserCouponForBenefit("first-order-3")));
  }, []);

  const lines =
    variant === "checkout"
      ? hasCoupon
        ? ["첫 주문 할인이 주문 내역에 자동 반영됩니다.", "상담·주문 시 별도 코드 입력 없이 적용됩니다."]
        : ["첫 주문 시 할인이 자동 적용될 수 있습니다.", "혜택 페이지에서 쿠폰을 받으면 주문 시 자동 반영됩니다."]
      : hasCoupon
        ? ["첫 주문 할인 자동 적용", "상담·주문 시 자동 반영"]
        : ["첫 주문 할인 자동 적용 가능", "주문·결제 단계에서 자동 반영"];

  return (
    <ul
      className={`space-y-0.5 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-[11px] font-semibold text-emerald-950 ${className}`}
      data-auto-discount-hint
    >
      {lines.map((line) => (
        <li key={line} className="flex items-center gap-1.5">
          <span className="text-emerald-600" aria-hidden>
            ✓
          </span>
          {line}
        </li>
      ))}
    </ul>
  );
}
