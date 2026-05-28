"use client";

import { AppIcon } from "@/components/common/AppIcon";
import { bm } from "@/lib/design-tokens";
import type { IconKey } from "@/lib/icon-map";

type Props = {
  purpose: string;
  caption: string;
  iconKey?: IconKey;
  compact?: boolean;
  className?: string;
};

export function PurposeImageSlot({
  purpose,
  caption,
  iconKey = "photoCheck",
  compact = false,
  className = "",
}: Props) {
  return (
    <div
      className={`${bm.surfaceMuted} flex flex-col items-center justify-center gap-2 rounded-xl ring-1 ring-slate-200/80 ${
        compact ? "min-h-[88px] px-3 py-3" : "min-h-[120px] px-4 py-4"
      } ${className}`}
      data-purpose-slot={purpose}
    >
      <AppIcon iconKey={iconKey} size={compact ? "sm" : "md"} className="text-slate-400" />
      <p className="text-center text-[11px] font-bold leading-snug text-slate-500">{caption}</p>
      <p className="text-center text-[10px] font-medium text-slate-400">직접 제작 이미지 등록 영역</p>
    </div>
  );
}
