"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from "@/lib/brand-assets";

export function BrandLogoLink({ className }: { className?: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href="/"
      className={clsx(
        "portal-brand-lockup group inline-flex max-w-[min(100%,16rem)] shrink-0 items-center gap-2.5 rounded-lg outline-none ring-blue-200 transition hover:opacity-95 focus-visible:ring-2 sm:max-w-none sm:gap-3 lg:gap-3.5",
        className,
      )}
      aria-label="배터리매니저 홈"
    >
      <span className="relative block h-11 w-[3rem] shrink-0 sm:h-12 sm:w-[3.35rem] lg:h-14 lg:w-[3.75rem]">
        {!imgError ? (
          <Image
            src={BRAND_LOGO_SRC}
            alt={BRAND_LOGO_ALT}
            width={120}
            height={48}
            className="h-full w-full object-contain object-left"
            priority
            unoptimized
            onError={() => setImgError(true)}
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center rounded-xl bg-slate-100 text-[10px] font-black text-slate-500"
            aria-hidden
          >
            BM
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-col items-start leading-none">
        <span className="portal-brand-lockup__title truncate text-base font-extrabold tracking-tight text-[var(--bm-navy)] sm:text-lg lg:text-xl">
          배터리매니저
        </span>
        <span className="portal-brand-lockup__sub mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:block lg:text-[10px]">
          Battery Manager
        </span>
      </span>
      <span className="sr-only">{BRAND_LOGO_ALT}</span>
    </Link>
  );
}
