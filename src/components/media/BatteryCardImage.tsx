"use client";

import { BatteryImageOrSlot } from "@/components/media/BatteryImageOrSlot";
import { batteryImageFit } from "@/components/BatteryThumbnail";

type Props = {
  code: string;
  className?: string;
  heightClass?: string;
};

/** 배터리 asset 우선 — 카드용 contain */
export function BatteryCardImage({
  code,
  className = "",
  heightClass = "h-[120px] sm:h-[130px]",
}: Props) {
  return (
    <BatteryImageOrSlot
      code={code}
      ratio="4/3"
      tall={false}
      className={`${heightClass} w-full ${className}`}
      role="main"
    />
  );
}
