"use client";

import { getVehicleImageUrlBySlug } from "@/lib/media/resolve-asset-image";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";

type Props = {
  slug: string;
  title: string;
  className?: string;
  /** @deprecated 가로형만 사용 — 무시됨 */
  heightClass?: string;
  /** @deprecated 가로형만 사용 — 무시됨 */
  layout?: "stack" | "row";
  variant?: "card" | "thumb";
};

/** slug 기준 차량 카드 이미지 — VehicleCardMedia 래퍼 */
export function VehicleCardImage({
  slug,
  title,
  className = "",
  variant = "card",
}: Props) {
  const src = getVehicleImageUrlBySlug(slug);
  const commercial = /porter|봉고|마이티|스타리아/i.test(title);

  return (
    <VehicleCardMedia
      alt={title}
      className={className}
      commercial={commercial}
      placeholderTitle={title}
      slug={slug}
      src={src}
      variant={variant}
    />
  );
}
