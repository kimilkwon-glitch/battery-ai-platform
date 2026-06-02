"use client";

import Link from "next/link";
import { bm } from "@/lib/design-tokens";

type Props = {
  batteryCode: string;
  /** /shop 주문 패널 등 — 버튼 클릭 */
  onOrder?: () => void;
  /** 주문하기 링크 (onOrder 없을 때) */
  orderHref?: string;
};

export function BatteryProductCardActions({ batteryCode, onOrder, orderHref }: Props) {
  const code = batteryCode.trim();
  const detailHref = `/batteries/${encodeURIComponent(code)}`;
  const reviewsHref = `${detailHref}#battery-reviews`;
  const shopOrderHref = orderHref ?? `/shop?code=${encodeURIComponent(code)}`;

  return (
    <div className="mt-auto flex flex-col gap-2.5 pt-3" data-product-card-actions={code}>
      <Link
        href={reviewsHref}
        className="inline-flex items-center justify-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-center text-sm font-bold text-emerald-800 ring-1 ring-emerald-100 transition hover:bg-emerald-100 hover:text-emerald-900"
      >
        리뷰 보기
      </Link>
      <Link
        href={detailHref}
        className={`${bm.btnSecondary} w-full justify-center py-3 text-sm font-black transition hover:shadow-sm sm:text-base`}
      >
        규격 상세 보기
      </Link>
      {onOrder ? (
        <button
          type="button"
          onClick={onOrder}
          className={`${bm.btnPrimary} w-full justify-center py-4 text-base font-black shadow-sm transition hover:shadow-md`}
        >
          구매하기
        </button>
      ) : (
        <Link
          href={shopOrderHref}
          className={`${bm.btnPrimary} w-full justify-center py-4 text-base font-black shadow-sm transition hover:shadow-md`}
        >
          구매하기
        </Link>
      )}
    </div>
  );
}
