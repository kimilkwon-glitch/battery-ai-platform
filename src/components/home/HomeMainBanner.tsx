"use client";

import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";
import { MAIN_BANNER_DESKTOP_SRC, MAIN_BANNER_MOBILE_SRC } from "@/lib/brand-assets";

export function HomeMainBanner() {
  const [desktopError, setDesktopError] = useState(false);
  const [mobileError, setMobileError] = useState(false);

  const showPlaceholder = desktopError && mobileError;

  return (
    <section
      className="home-main-banner mx-auto w-full max-w-3xl sm:max-w-4xl"
      aria-label="메인 프로모션 배너"
      data-home-section="main-banner"
    >
      {showPlaceholder ? (
        <div
          className={clsx(
            "home-main-banner__placeholder flex h-[140px] items-center justify-center rounded-2xl border border-dashed border-slate-200",
            "bg-gradient-to-br from-slate-50 to-blue-50/40 text-center shadow-[var(--bm-shadow-sm)] sm:h-[180px] lg:h-[220px]",
          )}
        >
          <p className="px-4 text-xs font-semibold text-slate-500 sm:text-sm">
            메인 배너 이미지를 연결할 수 있습니다.
            <br />
            <span className="text-[10px] text-slate-400">public/assets/banners/</span>
          </p>
        </div>
      ) : (
        <div
          className={clsx(
            "home-main-banner__frame relative overflow-hidden rounded-2xl border border-slate-200/90",
            "bg-slate-100 shadow-[0_12px_40px_rgba(15,23,42,0.08)]",
            "h-[140px] sm:h-[180px] lg:h-[220px]",
          )}
        >
          {!desktopError ? (
            <Image
              src={MAIN_BANNER_DESKTOP_SRC}
              alt=""
              fill
              className="hidden object-cover object-center sm:block"
              sizes="(max-width: 640px) 0px, (max-width: 1024px) 90vw, 896px"
              priority
              onError={() => setDesktopError(true)}
            />
          ) : null}
          {!mobileError ? (
            <Image
              src={MAIN_BANNER_MOBILE_SRC}
              alt=""
              fill
              className={clsx("object-cover object-center", !desktopError && "sm:hidden")}
              sizes="100vw"
              priority
              onError={() => setMobileError(true)}
            />
          ) : null}
          {desktopError && !mobileError ? (
            <Image
              src={MAIN_BANNER_MOBILE_SRC}
              alt=""
              fill
              className="hidden object-cover object-center sm:block"
              sizes="90vw"
              onError={() => setMobileError(true)}
            />
          ) : null}
        </div>
      )}
    </section>
  );
}
