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
        "portal-brand-lockup group inline-flex max-w-[min(100%,14rem)] shrink-0 items-center gap-2 rounded-lg outline-none ring-blue-200 transition hover:opacity-95 focus-visible:ring-2 sm:max-w-none sm:gap-2.5 lg:gap-3",
        className,
      )}
      aria-label="배터리매니저 홈"
    >
      {!imgError ? (
        <span className="relative block shrink-0">
          <Image
            src={BRAND_LOGO_SRC}
            alt=""
            width={56}
            height={56}
            className="h-10 w-auto object-contain object-left sm:h-11 lg:h-12"
            priority
            onError={() => setImgError(true)}
            aria-hidden
          />
        </span>
      ) : (
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-black text-slate-500 sm:size-11 lg:size-12"
          aria-hidden
        >
          BM
        </span>
      )}
      <span className="flex min-w-0 flex-col items-start leading-none">
        <span className="portal-brand-lockup__title truncate text-[15px] font-extrabold tracking-tight text-[var(--bm-navy)] sm:text-base lg:text-[17px]">
          배터리매니저
        </span>
        <span className="portal-brand-lockup__sub mt-0.5 hidden text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block lg:text-[9px]">
          Battery Manager
        </span>
      </span>
      <span className="sr-only">{BRAND_LOGO_ALT}</span>
    </Link>
  );
}
