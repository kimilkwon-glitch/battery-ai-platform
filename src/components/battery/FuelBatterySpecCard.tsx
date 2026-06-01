"use client";

import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { BatteryThumbnail, batteryImageFit } from "@/components/BatteryThumbnail";

import { SearchResultSpecChips } from "@/components/platform/SearchResultCoreSummary";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { bm } from "@/lib/design-tokens";

import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { getHomeCardCopy } from "@/data/battery/batterySpecIndex";
import { hasBrandSpecData } from "@/lib/battery-knowledge";

import { getBatteryImageSet } from "@/lib/battery-alias-map";



type Props = {
  fuelLabel: string;
  batteryCode: string;
  highlighted?: boolean;
  showExceptionNote?: boolean;
  conditionNote?: string;
  compact?: boolean;
  /** 차량 상세에서 담기 시 전달 */
  vehicleSlug?: string;
  vehicleTitle?: string;
};



export function FuelBatterySpecCard({
  fuelLabel,
  batteryCode,
  highlighted = false,
  showExceptionNote = false,
  conditionNote,
  compact = false,
  vehicleSlug,
  vehicleTitle,
}: Props) {

  const display = parseBatterySpecDisplay(batteryCode);

  const imageSet = getBatteryImageSet(batteryCode, "rocket");

  const note =

    showExceptionNote && highlighted

      ? conditionNote ?? "연료·연식·트림에 따라 예외가 있을 수 있습니다."

      : conditionNote

        ? conditionNote

        : null;



  return (

    <article

      className={`${bm.card} flex flex-col overflow-hidden transition ${

        highlighted

          ? "ring-2 ring-[var(--bm-primary)] shadow-md"

          : "ring-1 ring-slate-100"

      }`}

      id={highlighted ? "fuel-card-focus" : undefined}

      data-fuel-hero={fuelLabel}

      data-battery-hero={batteryCode}

    >

      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2">

        <span className="text-xs font-black text-slate-800">{fuelLabel}</span>

        <span className="text-lg font-black text-[var(--bm-primary)]">{batteryCode}</span>

      </div>

      <div className={`relative bg-slate-50 ${compact ? "h-[100px]" : "h-[140px]"}`}>

        <BatteryThumbnail

          code={batteryCode}

          imageSet={imageSet?.main ? imageSet : undefined}

          role="main"

          fit={batteryImageFit(batteryCode)}

          tall

          overlayLabel={false}

          surface="transparent"

          className="h-full"

        />

      </div>

      <div className="flex flex-1 flex-col p-3">

        <SearchResultSpecChips

          typeLabel={display.typeLabel}

          seriesLabel={display.seriesLabel}

          terminalLabel={display.terminalLabel}

        />

        {hasBrandSpecData(batteryCode) ? (
          <p className="mt-2 line-clamp-2 text-[10px] font-medium leading-snug text-slate-600">
            {getHomeCardCopy(batteryCode) ?? "브랜드별 제원은 상세 페이지에서 확인"}
          </p>
        ) : null}

        {note ? (
          <p className="mt-2 flex items-start gap-1.5 text-[10px] font-medium leading-snug text-slate-500">
            {highlighted ? (
              <AppIcon iconKey="warning" size="xs" className="mt-0.5 shrink-0" />
            ) : null}
            <span>{note}</span>
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 pt-3">
          <Link
            className={`${bm.btnPrimary} inline-flex w-full items-center justify-center gap-1.5 text-xs`}
            href={`/batteries/${encodeURIComponent(batteryCode)}`}
          >
            <AppIcon iconKey="batterySpec" size="sm" className="!text-white" />
            해당 규격 보기
          </Link>
          <Link
            className="text-center text-[10px] font-bold text-slate-500 hover:text-blue-700 hover:underline"
            href="/photo-check"
          >
            사진으로 확인 (보조)
          </Link>
          {vehicleSlug && vehicleTitle ? (
            <AddToCartButton
              mode="vehicle"
              variant="tertiary"
              label="장바구니 담기"
              batteryCode={batteryCode}
              vehicleSlug={vehicleSlug}
              vehicleTitle={vehicleTitle}
              fuelLabel={fuelLabel}
            />
          ) : null}
        </div>

      </div>

    </article>

  );

}


