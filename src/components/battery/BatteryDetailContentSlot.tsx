"use client";

import { useState } from "react";
import { bm } from "@/lib/design-tokens";

/**
 * 운영자 제작 상세 이미지 삽입 영역 — CMS/에셋 연동 전 placeholder
 * TODO: 규격별 detail asset 경로 매핑
 */
export function BatteryDetailContentSlot({ code }: { code: string }) {
  const assetPath = `/assets/battery-detail/${code.toLowerCase()}.png`;
  const [hasImage, setHasImage] = useState(false);

  return (
    <section
      className={`${bm.card} ${bm.cardPad}`}
      data-detail-content-slot={code}
      aria-label="상세 콘텐츠"
    >
      <h2 className="text-sm font-black text-slate-900">상세 안내</h2>
      <p className="mt-1 text-xs font-medium text-slate-500">
        규격별 상세 이미지·안내 콘텐츠가 이 영역에 표시됩니다.
      </p>
      <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50/80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetPath}
          alt={`${code} 상세 안내`}
          className={hasImage ? "h-full w-full object-contain p-4" : "hidden"}
          onLoad={() => setHasImage(true)}
          onError={() => setHasImage(false)}
        />
        {!hasImage ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="text-sm font-black text-slate-600">상세 콘텐츠 준비중</p>
            <p className="max-w-sm text-xs font-medium text-slate-400">
              운영 이미지 등록 시 <span className="font-mono text-[10px]">{assetPath}</span> 경로 또는
              CMS 연동으로 교체합니다.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
