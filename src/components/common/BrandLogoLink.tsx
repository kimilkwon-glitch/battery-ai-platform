"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import {
  BRAND_LOGO_SRC,
  BRAND_LOGO_VISUAL_HEIGHT,
  BRAND_LOGO_VISUAL_WIDTH,
} from "@/lib/brand-assets";

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
      <span className="portal-brand-lockup__logo flex shrink-0 items-center leading-none">
        {!imgError ? (
          <Image
            src={BRAND_LOGO_SRC}
            alt=""
            width={BRAND_LOGO_VISUAL_WIDTH}
            height={BRAND_LOGO_VISUAL_HEIGHT}
            sizes="(max-width: 1023px) 56px, 68px"
            className="portal-brand-lockup__logo-img h-14 w-auto sm:h-16 lg:h-[4.5rem]"
            loading="lazy"
            unoptimized
            onError={() => setImgError(true)}
          />
        ) : (
          <span
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-black text-slate-500 sm:h-14 sm:w-14 lg:h-16 lg:w-16"
            aria-hidden
          >
            BM
          </span>
        )}
      </span>
      <span className="portal-brand-lockup__text flex min-w-0 flex-col justify-center leading-tight">
        <span className="portal-brand-lockup__title truncate text-xl font-extrabold tracking-tight text-[var(--bm-navy)] sm:text-2xl lg:text-[1.65rem]">
          배터리매니저
        </span>
        <span className="portal-brand-lockup__sub text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-xs">
          Battery Manager
        </span>
      </span>
    </Link>
  );
}
