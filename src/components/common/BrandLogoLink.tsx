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
        "portal-brand-lockup group inline-flex shrink-0 items-center gap-2 rounded-lg outline-none ring-blue-200 focus-visible:ring-2 sm:gap-2.5",
        className,
      )}
      aria-label="배터리매니저 홈"
    >
      <span className="portal-brand-lockup__logo relative block h-11 w-11 shrink-0 sm:h-14 sm:w-14 lg:h-[4.5rem] lg:w-[4.5rem]">
        {!imgError ? (
          <Image
            src={BRAND_LOGO_SRC}
            alt=""
            width={144}
            height={144}
            sizes="(max-width: 1023px) 56px, 72px"
            className="h-full w-full object-contain object-center"
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
      <span className="portal-brand-lockup__text flex min-w-0 flex-col justify-center leading-none">
        <span className="portal-brand-lockup__title truncate text-lg font-extrabold tracking-tight text-[var(--bm-navy)] sm:text-xl lg:text-2xl">
          배터리매니저
        </span>
        <span className="portal-brand-lockup__sub mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-xs lg:tracking-[0.16em]">
          Battery Manager
        </span>
      </span>
      <span className="sr-only">{BRAND_LOGO_ALT}</span>
    </Link>
  );
}
