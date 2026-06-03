"use client";

import Link from "next/link";
import { useState } from "react";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
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
import { addCustomerVehicle } from "@/lib/customer-vehicles-storage";
import { getVehicleBodyType } from "@/lib/platform-data";
import { getVehicleCardCompactCopy } from "@/lib/vehicle-card-hints";
import { getVehicleConditionSpecLines } from "@/lib/vehicle-condition-spec-lines";

export function ExploreVehicleCard({
  vehicleId,
  title,
  href,
  registerMode = false,
}: {
  vehicleId: string;
  title: string;
  href: string;
  registerMode?: boolean;
}) {
  const [registered, setRegistered] = useState(false);
  const copy = getVehicleCardCompactCopy(vehicleId, title);
  const imageSrc =
    vehicleId === "rexton-sports-search" ? null : carImageForPlatformVehicleId(vehicleId);
  const bodyType = getVehicleBodyType(vehicleId);
  const isCommercial = bodyType === "truck" || bodyType === "van" || /porter|bongo/i.test(vehicleId);
  const conditions = getVehicleConditionSpecLines(vehicleId);
  const isSearchPick = vehicleId === "rexton-sports-search";

  const handleRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSearchPick) return;
    addCustomerVehicle({
      slug: vehicleId,
      displayName: title,
      href,
    });
    setRegistered(true);
  };

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
        {registerMode && !isSearchPick ? (
          <button
            type="button"
            onClick={handleRegister}
            className={`${bm.btnPrimary} min-h-[2.75rem] flex-1 text-sm font-black`}
          >
            {registered ? "등록 완료" : "내 차량으로 등록"}
          </button>
        ) : null}
        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
          className={`${registerMode ? bm.btnSecondary : bm.btnNavy} min-h-[2.75rem] flex-1 items-center justify-center text-sm font-black`}
        >
          규격 보기
        </Link>
      </CardInfoActions>
    </>
  );

  if (registerMode && !isSearchPick) {
    return (
      <CardHorizontalLayout
        className={`${bm.cardVehicleMatch} vehicle-browse-card group h-full min-w-0`}
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
