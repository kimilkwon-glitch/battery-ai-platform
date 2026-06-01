"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { bm } from "@/lib/design-tokens";
import { HUB_PHOTO_CHECK } from "@/lib/platform-hub-routes";

export function BatteryDetailContentSlot({ code }: { code: string }) {
  const assetPath = `/assets/battery-detail/${code.toLowerCase()}.png`;
  const [hasImage, setHasImage] = useState<boolean | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setHasImage(true);
    img.onerror = () => setHasImage(false);
    img.src = assetPath;
  }, [assetPath]);

  if (hasImage === true) {
    return (
      <section
        id="battery-detail-info"
        className={`${bm.card} ${bm.cardPad} scroll-mt-24`}
        data-detail-content-slot={code}
        aria-label="상세 안내"
      >
        <h2 className="text-sm font-black text-slate-900">상세 정보</h2>
        <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assetPath}
            alt={`${code} 상세 안내`}
            className="h-full w-full object-contain p-2"
          />
        </div>
      </section>
    );
  }

  if (hasImage === false) {
    return (
      <section data-detail-content-slot={code} aria-label="규격 확인">
        <div className="flex gap-3 rounded-xl bg-gradient-to-br from-slate-800 via-[#1e3a5f] to-blue-700 p-4 text-white sm:p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
            <AppIcon iconKey="photoCheck" size="md" className="!text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black">{code} 규격 확인</h2>
            <p className="mt-1 text-xs font-medium leading-relaxed text-white/90">
              라벨 코드·L/R 단자·트레이 형태는 기존 배터리 사진으로 확인하는 것이 가장 안전합니다.
            </p>
            <Link
              className={`${bm.btnSecondary} mt-3 inline-flex border-white/30 bg-white/95 text-xs text-slate-900 hover:bg-white`}
              href={HUB_PHOTO_CHECK}
            >
              사진으로 단자 확인하기
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
