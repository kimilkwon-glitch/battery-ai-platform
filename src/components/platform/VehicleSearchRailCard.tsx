"use client";

import Link from "next/link";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { vehicleAssets } from "@/lib/car-assets";
import { carImageForPlatformVehicleId } from "@/lib/car-data";
import { getVehicleBodyType } from "@/lib/platform-data";
import { appendSignupVehicleMode } from "@/lib/signup-vehicle-draft";
import type { VehiclesBrowseItem } from "@/lib/vehicles-browse-data";

export function VehicleSearchRailCard({
  item,
  signupVehicleSelect = false,
}: {
  item: VehiclesBrowseItem;
  signupVehicleSelect?: boolean;
}) {
  const href = signupVehicleSelect ? appendSignupVehicleMode(item.href) : item.href;
  const imageSrc = carImageForPlatformVehicleId(item.vehicleId);
  const bodyType = getVehicleBodyType(item.vehicleId);
  const isCommercial =
    bodyType === "truck" || bodyType === "van" || /porter|bongo/i.test(item.vehicleId);
  const asset = vehicleAssets.find(
    (a) => a.id === item.key || a.catalogId === item.vehicleId || a.id === item.vehicleId,
  );
  const subtitle = asset?.yearRange || asset?.generationName;

  return (
    <Link href={href} className="vehicle-search-rail-card group">
      <div className="vehicle-search-rail-card__media">
        <VehicleCardMedia
          alt={item.title}
          commercial={isCommercial}
          placeholderTitle={item.title}
          slug={item.vehicleId}
          src={imageSrc}
          variant="card"
          className="vehicle-search-rail-card__image !min-h-0 !rounded-xl !border-0"
        />
      </div>
      <div className="vehicle-search-rail-card__body">
        <p className="vehicle-search-rail-card__title">{item.title}</p>
        {subtitle ? <p className="vehicle-search-rail-card__sub">{subtitle}</p> : null}
      </div>
    </Link>
  );
}
