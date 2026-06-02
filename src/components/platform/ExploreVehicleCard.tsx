"use client";

import Link from "next/link";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { CardHorizontalLayout } from "@/components/cards/CardHorizontalLayout";
import {
  CardInfoActions,
  CardInfoCtaLink,
  CardInfoDesc,
  CardInfoMeta,
  CardInfoStack,
  CardInfoTitleRow,
} from "@/components/cards/CardHorizontalInfo";
import { BatteryMiniSpecLink } from "@/components/battery/BatteryMiniSpecLink";
import { bm } from "@/lib/design-tokens";
import { carImageForPlatformVehicleId } from "@/lib/car-data";
import { getVehicleBodyType } from "@/lib/platform-data";
import { getVehicleCardCompactCopy } from "@/lib/vehicle-card-hints";
import { getVehicleConditionSpecLines } from "@/lib/vehicle-condition-spec-lines";

export function ExploreVehicleCard({
  vehicleId,
  title,
  href,
}: {
  vehicleId: string;
  title: string;
  href: string;
}) {
  const copy = getVehicleCardCompactCopy(vehicleId, title);
  const imageSrc =
    vehicleId === "rexton-sports-search" ? null : carImageForPlatformVehicleId(vehicleId);
  const bodyType = getVehicleBodyType(vehicleId);
  const isCommercial = bodyType === "truck" || bodyType === "van" || /porter|bongo/i.test(vehicleId);
  const conditions = getVehicleConditionSpecLines(vehicleId);

  return (
    <CardHorizontalLayout
      as={Link}
      className={`${bm.cardVehicleMatch} group h-full`}
      href={href}
      mediaClassName="!p-0"
      imagePanel={
        <VehicleCardMedia
          alt={title}
          commercial={isCommercial}
          placeholderTitle={title}
          slug={vehicleId}
          src={imageSrc}
        />
      }
    >
      <CardInfoStack>
        <CardInfoTitleRow iconKey="vehicle" title={title} titleClassName="truncate text-sm" />
        <CardInfoMeta className="text-[10px] font-bold text-slate-500">{copy.categoryLine}</CardInfoMeta>
        <p className="text-xs font-semibold text-slate-800">{copy.specLine}</p>
        {conditions.length >= 2 ? (
          <div className="flex flex-wrap gap-1">
            {conditions.map((f) => (
              <BatteryMiniSpecLink
                key={`${f.conditionLabel}-${f.code}`}
                code={f.code}
                label={f.conditionLabel}
                compact
              />
            ))}
          </div>
        ) : null}
        <CardInfoDesc className="text-[10px]">{copy.cautionLine}</CardInfoDesc>
      </CardInfoStack>
      <CardInfoActions>
        <CardInfoCtaLink>{copy.ctaLabel} →</CardInfoCtaLink>
      </CardInfoActions>
    </CardHorizontalLayout>
  );
}
