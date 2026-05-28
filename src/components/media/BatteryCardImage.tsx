"use client";

import { BatteryImageStage } from "@/components/media/BatteryImageStage";
import type { BatteryImageStageVariant } from "@/lib/battery-image-stage";

type Props = {
  code: string;
  className?: string;
  /** @deprecated variant 사용 권장 */
  heightClass?: string;
  variant?: BatteryImageStageVariant;
  flushTop?: boolean;
};

/** 배터리 카드 공통 image stage */
export function BatteryCardImage({
  code,
  className = "",
  heightClass,
  variant,
  flushTop = false,
}: Props) {
  const resolvedVariant: BatteryImageStageVariant =
    variant ??
    (heightClass?.includes("88") || heightClass?.includes("100") ? "cardCompact" : "card");

  return (
    <BatteryImageStage
      code={code}
      variant={resolvedVariant}
      className={className}
      flushTop={flushTop}
    />
  );
}
