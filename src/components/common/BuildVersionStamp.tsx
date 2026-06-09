"use client";

import { usePathname } from "next/navigation";
import { BUILD_STAMP } from "@/lib/build-stamp";

/** 내부 audit·관리 화면에서만 DOM에 빌드 버전 노출 (고객 화면 비노출) */
export function BuildVersionStamp() {
  const pathname = usePathname();
  const internalOnly =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/__ai-audit") ||
    pathname === "/ai-audit" ||
    pathname === "/qa";

  if (!internalOnly) return null;

  return (
    <div
      className="pointer-events-none mx-auto max-w-[1440px] px-4 pb-3 pt-1 text-center"
      data-build-version={BUILD_STAMP}
      aria-hidden
    >
      <p className="text-[9px] font-mono font-medium tracking-wide text-slate-400/90">
        v {BUILD_STAMP}
      </p>
    </div>
  );
}
