"use client";

import { BatteryThumbnail, batteryImageFit } from "@/components/BatteryThumbnail";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { batteryImageCandidates, batteryImageSetForCode, type BatteryImageRole } from "@/lib/battery-image";
import { SEARCH_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import type { BatteryImageSet } from "@/lib/battery-alias-map";

type Props = {
  code: string;
  imageSet?: BatteryImageSet;
  role?: BatteryImageRole;
  ratio?: "16/9" | "4/3" | "1/1";
  tall?: boolean;
  className?: string;
};

/** 실사 URL이 있으면 BatteryThumbnail, 없으면 안내 슬롯 */
export function BatteryImageOrSlot({
  code,
  imageSet,
  role = "main",
  ratio = "4/3",
  tall = false,
  className = "",
}: Props) {
  const set = imageSet ?? batteryImageSetForCode(code);
  const candidates = batteryImageCandidates(set, code, role);
  const hasPhoto = candidates.length > 0 && Boolean(candidates[0]);

  if (hasPhoto) {
    return (
      <div className={className} data-image-slot={`search.battery.product.${code}`} data-image-slot-state="ready">
        <BatteryThumbnail
          code={code}
          imageSet={set}
          role={role}
          fit={batteryImageFit(code)}
          ratio={ratio}
          tall={tall}
          overlayLabel={false}
          surface="transparent"
        />
      </div>
    );
  }

  return (
    <MediaImageSlot
      slot={SEARCH_IMAGE_SLOTS.batteryProduct(code)}
      className={className}
      tall={tall}
    />
  );
}
