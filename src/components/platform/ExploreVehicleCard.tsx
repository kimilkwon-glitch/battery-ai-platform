"use client";

import Link from "next/link";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { VehicleRegisterCard } from "@/components/platform/VehicleRegisterCard";
import { appendSignupVehicleMode } from "@/lib/signup-vehicle-draft";
import { CardHorizontalLayout } from "@/components/cards/CardHorizontalLayout";
import {
  CardInfoActions,
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
  registerMode = false,
  signupVehicleSelect = false,
}: {
  vehicleId: string;
  title: string;
  href: string;
  registerMode?: boolean;
  signupVehicleSelect?: boolean;
}) {
  const detailHref = signupVehicleSelect ? appendSignupVehicleMode(href) : href;
  const copy = getVehicleCardCompactCopy(vehicleId, title);
  const imageSrc =
    vehicleId === "rexton-sports-search" ? null : carImageForPlatformVehicleId(vehicleId);
  const bodyType = getVehicleBodyType(vehicleId);
  const isCommercial = bodyType === "truck" || bodyType === "van" || /porter|bongo/i.test(vehicleId);
  const conditions = getVehicleConditionSpecLines(vehicleId);
  const isSearchPick = vehicleId === "rexton-sports-search";

  const inner = (
    <>
      <CardInfoStack className="vehicle-browse-card min-w-0 flex-1">
        <CardInfoTitleRow
          iconKey="vehicle"
          title={title}
          titleClassName="vehicle-browse-card__title line-clamp-2"
        />
        <CardInfoMeta className="vehicle-browse-card__meta">{copy.categoryLine}</CardInfoMeta>
        <p className="vehicle-browse-card__spec">{copy.specLine}</p>
        {conditions.length >= 2 ? (
          <div className="flex flex-wrap gap-1.5">
            {conditions.map((f) => (
              <BatteryMiniSpecLink
                key={`${f.conditionLabel}-${f.code}`}
                code={f.code}
                label={f.conditionLabel}
              />
            ))}
          </div>
        ) : null}
        {copy.cautionLine ? (
          <CardInfoDesc className="vehicle-browse-card__meta">{copy.cautionLine}</CardInfoDesc>
        ) : null}
      </CardInfoStack>
      <CardInfoActions className="vehicle-browse-card__cta-row">
        <Link
          href={detailHref}
          onClick={(e) => e.stopPropagation()}
          className={`${bm.btnNavy} min-h-[2.75rem] flex-1 items-center justify-center text-sm font-black`}
        >
          규격 보기
        </Link>
      </CardInfoActions>
    </>
  );

  if ((registerMode || signupVehicleSelect) && !isSearchPick) {
    return (
      <VehicleRegisterCard
        vehicleId={vehicleId}
        title={title}
        href={href}
        signupVehicleSelect={signupVehicleSelect}
      />
    );
  }

  return (
    <CardHorizontalLayout
      as={Link}
      className={`${bm.cardVehicleMatch} vehicle-browse-card group h-full min-w-0`}
      href={href}
      mediaClassName="!p-0 sm:!w-[42%]"
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
      {inner}
    </CardHorizontalLayout>
  );
}
