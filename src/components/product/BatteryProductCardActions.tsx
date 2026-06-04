"use client";

import clsx from "clsx";
import Link from "next/link";
import {
  BATTERY_SPEC_DETAIL_VIEW_LABEL,
  resolveBatteryProductCardLinks,
  type BatteryProductBrandSlug,
} from "@/lib/battery-card-cta";

const ACTION_BASE =
  "inline-flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-black transition sm:py-3";

const ACTION_BASE_COMPACT =
  "home-spec-card-action inline-flex w-full items-center justify-center rounded-lg px-2.5 py-2 text-xs font-extrabold transition sm:text-[0.8125rem]";

type Props = {
  batteryCode: string;
  brandId?: BatteryProductBrandSlug | string | null;
  onOrder?: () => void;
  orderHref?: string | null;
  /** 메인 라인업 카드 — 서브 버튼 뉴트럴 톤 */
  tone?: "catalog" | "default";
  /** 메인 라인업 — 정보 영역 확보용 컴팩트 버튼 */
  compact?: boolean;
};

export function BatteryProductCardActions({
  batteryCode,
  brandId,
  onOrder,
  orderHref,
  tone = "default",
  compact = false,
}: Props) {
  const links = resolveBatteryProductCardLinks({
    batteryCode,
    brandId,
    defaultBrandId: "rocket",
  });
  const productHref = orderHref ?? links.productDetailHref;
  const subBtn = compact ? ACTION_BASE_COMPACT : ACTION_BASE;
  const orderBtn = compact
    ? `${ACTION_BASE_COMPACT} home-spec-card-action--order min-h-[2.375rem] py-2 text-[0.8125rem] sm:min-h-[2.5rem]`
    : ACTION_BASE;

  return (
    <div
      className={clsx("home-spec-card-actions flex flex-col", compact ? "gap-1.5" : "gap-2")}
      data-product-card-actions={links.batteryCode}
    >
      <Link
        href={links.reviewHref}
        className={clsx(
          subBtn,
          "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/90 hover:bg-emerald-200",
        )}
      >
        리뷰 보기
      </Link>
      <Link
        href={links.batterySpecGuideHref}
        className={clsx(
          subBtn,
          tone === "catalog"
            ? "home-spec-card-action home-spec-card-action--spec"
            : "bg-blue-50 text-blue-950 ring-1 ring-blue-200/90 hover:bg-blue-100",
        )}
      >
        {BATTERY_SPEC_DETAIL_VIEW_LABEL}
      </Link>
      {onOrder ? (
        <button
          type="button"
          onClick={onOrder}
          className={clsx(
            orderBtn,
            "bg-[var(--bm-primary)] text-white shadow-sm ring-1 ring-blue-600/30 hover:bg-blue-700",
          )}
        >
          주문하기
        </button>
      ) : productHref ? (
        <Link
          href={productHref}
          className={clsx(
            orderBtn,
            "bg-[var(--bm-primary)] text-white shadow-sm ring-1 ring-blue-600/30 hover:bg-blue-700",
          )}
        >
          주문하기
        </Link>
      ) : (
        <span
          className={clsx(
            orderBtn,
            "cursor-not-allowed border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400",
          )}
          aria-disabled
        >
          상품 준비중
        </span>
      )}
    </div>
  );
}
