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
        "portal-brand-logo inline-flex shrink-0 items-center rounded-lg outline-none ring-blue-200 focus-visible:ring-2",
        className,
      )}
      aria-label="배터리매니저 홈"
    >
      {!imgError ? (
        <Image
          src={BRAND_LOGO_SRC}
          alt={BRAND_LOGO_ALT}
          width={168}
          height={44}
          className="h-9 w-auto max-w-[10.5rem] object-contain object-left sm:h-10 sm:max-w-[11.5rem] lg:h-11"
          priority
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-sm font-black tracking-tight text-[var(--bm-navy)] sm:text-base">
          배터리매니저
        </span>
      )}
    </Link>
  );
}
