"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { VehicleConditionFuelSelect } from "@/components/vehicle/VehicleConditionFuelSelect";
import { SaveVehicleRegisterButton } from "@/components/vehicle/SaveVehicleRegisterButton";
import { bm } from "@/lib/design-tokens";
import { getVehicleAsset } from "@/lib/car-assets";
import { carImageForPlatformVehicleId } from "@/lib/car-data";
import { getVehicleBodyType } from "@/lib/platform-data";
import { getVehicleCardCompactCopy } from "@/lib/vehicle-card-hints";
import {
  findConditionByLabel,
  getDefaultSelectedFuel,
  getVehicleDetailUrlWithFuel,
  getVehicleSelectionLabel,
  vehicleRequiresFuelSelection,
} from "@/lib/vehicle-registration";

export function VehicleRegisterCard({
  vehicleId,
  title,
  href,
  signupVehicleSelect = false,
}: {
  vehicleId: string;
  title: string;
  href: string;
  signupVehicleSelect?: boolean;
}) {
  const copy = getVehicleCardCompactCopy(vehicleId, title);
  const asset = getVehicleAsset(vehicleId);
  const yearRange =
    asset?.yearRange?.replace(/-/g, "~") ?? copy.categoryLine.split(" / ")[0] ?? undefined;
  const imageSrc =
    vehicleId === "rexton-sports-search" ? null : carImageForPlatformVehicleId(vehicleId);
  const bodyType = getVehicleBodyType(vehicleId);
  const isCommercial =
    bodyType === "truck" || bodyType === "van" || /porter|bongo/i.test(vehicleId);
  const requiresSelection = useMemo(() => vehicleRequiresFuelSelection(vehicleId), [vehicleId]);
  const selectionLabel = useMemo(() => getVehicleSelectionLabel(vehicleId), [vehicleId]);

  const [selectedKey, setSelectedKey] = useState<string | null>(() =>
    getDefaultSelectedFuel(vehicleId),
  );
  const [selectionHint, setSelectionHint] = useState(false);

  useEffect(() => {
    setSelectedKey(getDefaultSelectedFuel(vehicleId));
    setSelectionHint(false);
  }, [vehicleId]);

  const selectedCondition = findConditionByLabel(vehicleId, selectedKey);
  const specHref = getVehicleDetailUrlWithFuel(href, selectedCondition, signupVehicleSelect);

  const handleSpecClick = (e: React.MouseEvent) => {
    if (requiresSelection && !selectedCondition) {
      e.preventDefault();
      setSelectionHint(true);
    }
  };

  return (
    <article className={`${bm.cardVehicleMatch} vehicle-register-card`}>
      <div className="vehicle-register-card__media">
        <VehicleCardMedia
          alt={title}
          commercial={isCommercial}
          placeholderTitle={title}
          slug={vehicleId}
          src={imageSrc}
        />
      </div>

      <div className="vehicle-register-card__body">
        <div className="vehicle-register-card__info">
          <h3 className="vehicle-register-card__title">{title}</h3>
          <p className="vehicle-register-card__meta">{copy.categoryLine}</p>

          <VehicleConditionFuelSelect
            slug={vehicleId}
            selectedKey={selectedKey}
            onSelect={(label) => {
              setSelectedKey(label);
              setSelectionHint(false);
            }}
            selectionHint={selectionHint}
          />
        </div>

        <div className="vehicle-register-card__actions">
          <SaveVehicleRegisterButton
            slug={vehicleId}
            displayName={title}
            yearRange={yearRange}
            fuelHint={selectedCondition?.conditionLabel}
            recommendedBattery={selectedCondition?.code}
            className={`${bm.btnPrimary} min-h-[2.75rem] flex-1 text-sm font-black`}
            label={signupVehicleSelect ? "이 차량 선택" : "내 차량으로 등록"}
            source="vehicleBrowse"
            signupVehicleSelect={signupVehicleSelect}
            registerBlocked={requiresSelection && !selectedCondition}
            blockedMessage={`${selectionLabel}를 선택해 주세요.`}
          />
          <Link
            href={specHref}
            onClick={handleSpecClick}
            className={`${bm.btnSecondary} min-h-[2.75rem] flex-1 items-center justify-center text-sm font-black`}
          >
            규격 보기
          </Link>
        </div>
      </div>
    </article>
  );
}
