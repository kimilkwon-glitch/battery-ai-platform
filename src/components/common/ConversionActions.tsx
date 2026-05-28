import Link from "next/link";
import { bm } from "@/lib/design-tokens";

export type ConversionAction = {
  label: string;
  href: string;
};

/** 1차 블루 · 2차 테두리 · 3차 텍스트 링크 — 카드/섹션 하단 공통 */
export function ConversionActions({
  primary,
  secondary,
  tertiary,
  className = "",
}: {
  primary: ConversionAction;
  secondary?: ConversionAction;
  tertiary?: ConversionAction;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center ${className}`}>
      <Link className={`${bm.btnNavy} min-h-[44px] w-full justify-center sm:w-auto`} href={primary.href}>
        {primary.label}
      </Link>
      {secondary ? (
        <Link
          className={`${bm.btnSecondary} min-h-[44px] w-full justify-center sm:w-auto`}
          href={secondary.href}
        >
          {secondary.label}
        </Link>
      ) : null}
      {tertiary ? (
        <Link className={`${bm.btnTertiary} min-h-[44px] sm:ml-1`} href={tertiary.href}>
          {tertiary.label}
        </Link>
      ) : null}
    </div>
  );
}
