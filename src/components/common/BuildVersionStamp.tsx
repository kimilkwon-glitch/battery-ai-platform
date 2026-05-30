"use client";

import { usePathname } from "next/navigation";
import { BUILD_STAMP } from "@/lib/build-stamp";

/** 모든 페이지 하단·DOM에서 배포 버전 확인 */
export function BuildVersionStamp() {
  const pathname = usePathname();
  if (pathname?.startsWith("/__ai-audit") || pathname === "/ai-audit") {
    return null;
  }

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
