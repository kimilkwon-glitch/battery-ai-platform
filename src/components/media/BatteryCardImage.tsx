"use client";

import { BatteryImageStage } from "@/components/media/BatteryImageStage";
import type { BatteryBrandKey } from "@/lib/battery-alias-map";
import type { BatteryImageStageVariant } from "@/lib/battery-image-stage";

type Props = {
  code: string;
  className?: string;
  /** @deprecated variant 사용 권장 */
  heightClass?: string;
  variant?: BatteryImageStageVariant;
  flushTop?: boolean;
  /** md+ 좌측 이미지 패널용 — cardRow / compareRow variant */
  layout?: "stack" | "row";
  preferBrand?: BatteryBrandKey;
};

function resolveVariant(
  variant: BatteryImageStageVariant | undefined,
  heightClass: string | undefined,
  layout: "stack" | "row",
): BatteryImageStageVariant {
  const base: BatteryImageStageVariant =
    variant ??
    (heightClass?.includes("88") || heightClass?.includes("100") ? "cardCompact" : "card");

  if (layout !== "row") return base;
  if (base === "card" || base === "search") return "cardRow";
  if (base === "compare") return "compareRow";
  if (base === "cardCompact") return "cardCompact";
  return base;
}

/** 배터리 카드 공통 image stage */
export function BatteryCardImage({
  code,
  className = "",
  heightClass,
  variant,
  flushTop = false,
  layout = "row",
  preferBrand,
}: Props) {
  const resolvedVariant = resolveVariant(variant, heightClass, layout);

  return (
    <BatteryImageStage
      code={code}
      variant={resolvedVariant}
      className={`h-full w-full ${className}`}
      flushTop={flushTop}
      layout={layout}
      preferBrand={preferBrand}
    />
  );
}
