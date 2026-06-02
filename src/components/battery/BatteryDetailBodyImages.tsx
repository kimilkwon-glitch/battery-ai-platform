"use client";

import {
  batteryDetailBodyImagesForCode,
  type BatteryDetailBodyImage,
} from "@/lib/battery-detail/battery-detail-body-images";

type Props = {
  code: string;
  brandId?: string;
  manufacturer?: string;
  brand?: string;
};

export function BatteryDetailBodyImages({ code, brandId, manufacturer, brand }: Props) {
  const images = batteryDetailBodyImagesForCode(code, { brandId, manufacturer, brand });

  return (
    <div
      className="battery-detail-body-images mx-auto w-full max-w-3xl space-y-6 sm:space-y-8"
      data-battery-detail-body-images={code}
      aria-label="상품 안내 이미지"
    >
      {images.map((item) => (
        <DetailBodyImage key={item.src} item={item} productCode={code} />
      ))}
    </div>
  );
}

function DetailBodyImage({
  item,
  productCode,
}: {
  item: BatteryDetailBodyImage;
  productCode: string;
}) {
  return (
    <figure className="m-0 overflow-hidden rounded-xl border border-slate-100 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.src}
        alt={item.alt}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full max-w-full"
        data-detail-body-src={item.src}
        data-product-code={productCode}
      />
    </figure>
  );
}
