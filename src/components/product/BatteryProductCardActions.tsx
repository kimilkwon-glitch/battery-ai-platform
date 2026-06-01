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
    <div className="mt-auto flex flex-col gap-2 pt-3" data-product-card-actions={code}>
      <Link
        href={reviewsHref}
        className="text-center text-[11px] font-bold text-slate-500 underline-offset-2 hover:text-blue-700 hover:underline"
      >
        리뷰 보기
      </Link>
      <Link
        href={detailHref}
        className={`${bm.btnSecondary} w-full justify-center py-2.5 text-[11px] font-black`}
      >
        규격 상세 보기
      </Link>
      {onOrder ? (
        <button
          type="button"
          onClick={onOrder}
          className={`${bm.btnPrimary} w-full justify-center py-3 text-sm font-black`}
        >
          주문하기
        </button>
      ) : (
        <Link
          href={shopOrderHref}
          className={`${bm.btnPrimary} w-full justify-center py-3 text-sm font-black`}
        >
          주문하기
        </Link>
      )}
    </div>
  );
}
