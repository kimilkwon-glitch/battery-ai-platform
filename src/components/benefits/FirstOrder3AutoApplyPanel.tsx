"use client";

import Link from "next/link";
import { Percent } from "lucide-react";
import clsx from "clsx";
import { HUB_BENEFIT_FIRST_ORDER_3 } from "@/lib/benefits-data";

export function FirstOrder3AutoApplyPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={clsx(
        "home-benefit-auto-apply rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-white shadow-sm",
        compact ? "px-4 py-3.5 sm:px-5 sm:py-4" : "px-5 py-4 sm:px-6 sm:py-5",
      )}
      data-benefit-panel="first-order-auto-apply"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm ring-1 ring-amber-100"
            aria-hidden
          >
            <Percent className="size-5" strokeWidth={2.25} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-amber-950 sm:text-[15px]">첫 주문 3% 쿠폰 자동 적용</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-amber-900/85 sm:text-[13px]">
              회원가입 후 첫 주문 조건을 만족하면 주문 단계에서 자동으로 반영됩니다.
            </p>
          </div>
        </div>
        <Link
          href={HUB_BENEFIT_FIRST_ORDER_3}
          className="home-benefit-auto-apply__cta inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-amber-700 sm:px-5"
        >
          3% 혜택 확인하기
        </Link>
      </div>
    </div>
  );
}
