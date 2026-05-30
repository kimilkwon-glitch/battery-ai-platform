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
        "portal-brand-lockup group inline-flex shrink-0 items-center gap-1.5 rounded-lg outline-none ring-blue-200 focus-visible:ring-2 sm:gap-2",
        className,
      )}
      aria-label="배터리매니저 홈"
    >
      <span className="portal-brand-lockup__logo relative block h-12 w-12 shrink-0 sm:h-[3.75rem] sm:w-[3.75rem] lg:h-20 lg:w-20">
        {!imgError ? (
          <Image
            src={BRAND_LOGO_SRC}
            alt=""
            width={160}
            height={160}
            sizes="(max-width: 1023px) 60px, 80px"
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
      <span className="portal-brand-lockup__text flex min-w-0 flex-col justify-center gap-0 leading-none">
        <span className="portal-brand-lockup__title truncate text-lg font-extrabold tracking-tight text-[var(--bm-navy)] sm:text-xl lg:text-2xl">
          배터리매니저
        </span>
        <span className="portal-brand-lockup__sub text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px] lg:tracking-[0.14em]">
          Battery Manager
        </span>
      </span>
      <span className="sr-only">{BRAND_LOGO_ALT}</span>
    </Link>
  );
}
