import { BUILD_VERSION } from "@/lib/build-version";

/** 모든 페이지 하단·DOM에서 배포 버전 확인 */
export function BuildVersionStamp() {
  return (
    <div
      className="pointer-events-none mx-auto max-w-[1440px] px-4 pb-3 pt-1 text-center"
      data-build-version={BUILD_VERSION}
      aria-hidden
    >
      <p className="text-[9px] font-mono font-medium tracking-wide text-slate-400/90">
        v {BUILD_VERSION}
      </p>
    </div>
  );
}
