"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { VehicleConditionFuelSelect } from "@/components/vehicle/VehicleConditionFuelSelect";
import { SaveVehicleRegisterButton } from "@/components/vehicle/SaveVehicleRegisterButton";
import { bm } from "@/lib/design-tokens";
import { searchVehicleCardLabels } from "@/lib/search/search-vehicle-card-display";
import {
  resolveSearchVehicleCardDetailHref,
  slugFromSearchVehicleRow,
} from "@/lib/search/search-vehicle-card-nav";
import type { VehicleSearchRow } from "@/components/platform/SearchVehicleResults";
import { isSignupVehicleSelectActive } from "@/lib/signup-vehicle-draft";
import {
  findConditionByLabel,
  getDefaultSelectedFuel,
  getVehicleDetailUrlWithFuel,
  getVehicleFuelOptions,
  getVehicleSelectionLabel,
  vehicleRequiresFuelSelection,
} from "@/lib/vehicle-registration";
import { cn } from "@/lib/utils";

type Props = {
  row: VehicleSearchRow;
};

/** 검색 결과·세대 선택 — 연료 선택 후 등록·규격보기 */
export function SearchVehicleResultCard({ row }: Props) {
  const searchParams = useSearchParams();
  const signupVehicleSelect =
    searchParams.get("mode") === "signup_vehicle_select" || isSignupVehicleSelectActive();
  const { title, brand, yearRange, imageSrc } = searchVehicleCardLabels(row);
  const slug = slugFromSearchVehicleRow(row);
  const baseDetailHref = resolveSearchVehicleCardDetailHref(row);

  const requiresSelection = useMemo(
    () => (slug ? vehicleRequiresFuelSelection(slug) : false),
    [slug],
  );
  const selectionLabel = slug ? getVehicleSelectionLabel(slug) : "연료";
  const hasFuelOptions = slug ? getVehicleFuelOptions(slug).length > 0 : false;

  const [selectedKey, setSelectedKey] = useState<string | null>(() =>
    slug ? getDefaultSelectedFuel(slug) : null,
  );
  const [selectionHint, setSelectionHint] = useState(false);

  useEffect(() => {
    setSelectedKey(slug ? getDefaultSelectedFuel(slug) : null);
    setSelectionHint(false);
  }, [slug]);

  const selectedCondition = slug ? findConditionByLabel(slug, selectedKey) : null;
  const detailHref = baseDetailHref
    ? getVehicleDetailUrlWithFuel(baseDetailHref, selectedCondition, signupVehicleSelect)
    : null;
  const specHref = detailHref
    ? detailHref.includes("#")
      ? detailHref
      : `${detailHref}#fuel-batteries`
    : row.fuelHref?.trim() || null;

  const handleSpecClick = (e: React.MouseEvent) => {
    if (requiresSelection && !selectedCondition) {
      e.preventDefault();
      setSelectionHint(true);
    }
  };

  const primaryBody = (
    <>
      <div className="bm-search-vehicle-card__media">
        <VehicleCardMedia
          alt={title}
          commercial={/porter|봉고|마이티|k3|쿱|koup/i.test(title)}
          className="bm-vehicle-card-media--search-result"
          placeholderTitle={title}
          slug={slug ?? undefined}
          src={imageSrc}
          variant="card"
        />
      </div>

      <div className="bm-search-vehicle-card__body">
        <div className="bm-search-vehicle-card__main">
          <h3 className="bm-search-vehicle-card__title">{title}</h3>
          <div className="bm-search-vehicle-card__identity">
            {brand ? <span className="bm-search-vehicle-card__brand">{brand}</span> : null}
            {yearRange ? <span className="bm-search-vehicle-card__year">{yearRange}</span> : null}
          </div>
          {slug && hasFuelOptions ? (
            <VehicleConditionFuelSelect
              slug={slug}
              selectedKey={selectedKey}
              onSelect={(label) => {
                setSelectedKey(label);
                setSelectionHint(false);
              }}
              selectionHint={selectionHint}
              compact
              className="bm-search-vehicle-card__fuel-select"
            />
          ) : null}
        </div>

        <div className="bm-search-vehicle-card__footer">
          <span className="bm-search-vehicle-card__cta">
            자세히 보기
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          </span>
        </div>
      </div>
    </>
  );

  const registerBrowseHref = signupVehicleSelect
    ? "/vehicles?mode=signup_vehicle_select"
    : "/vehicles?register=1";

  return (
    <article
      className={cn("bm-search-vehicle-card", detailHref && "bm-search-vehicle-card--clickable")}
      data-search-vehicle-slug={slug ?? undefined}
    >
      {detailHref ? (
        <Link href={detailHref} className="bm-search-vehicle-card__primary group">
          {primaryBody}
        </Link>
      ) : (
        <div className="bm-search-vehicle-card__primary group">{primaryBody}</div>
      )}

      <div className="bm-search-vehicle-card__actions">
        {specHref ? (
          <Link
            href={specHref}
            className={`${bm.btnSecondary} bm-search-vehicle-card__action-btn`}
            onClick={handleSpecClick}
          >
            규격 보기
          </Link>
        ) : null}
        {slug ? (
          <div onClick={(e) => e.stopPropagation()}>
            <SaveVehicleRegisterButton
              slug={slug}
              displayName={row.model.trim() || title}
              yearRange={yearRange || row.year}
              fuelHint={selectedCondition?.conditionLabel}
              recommendedBattery={selectedCondition?.code}
              className={`${bm.btnPrimary} bm-search-vehicle-card__action-btn`}
              label={signupVehicleSelect ? "이 차량 선택" : "내 차량으로 등록"}
              source="vehicleSearch"
              signupVehicleSelect={signupVehicleSelect}
              registerBlocked={requiresSelection && !selectedCondition}
              blockedMessage={`${selectionLabel}를 선택해 주세요.`}
            />
          </div>
        ) : (
          <Link
            href={registerBrowseHref}
            className={`${bm.btnPrimary} bm-search-vehicle-card__action-btn`}
            onClick={(e) => e.stopPropagation()}
          >
            {signupVehicleSelect ? "이 차량 선택" : "내 차량으로 등록"}
          </Link>
        )}
      </div>
    </article>
  );
}
