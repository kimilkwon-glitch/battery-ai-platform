"use client";

import Link from "next/link";

import { BatteryThumbnail, batteryImageFit } from "@/components/BatteryThumbnail";

import { SearchResultSpecChips } from "@/components/platform/SearchResultCoreSummary";

import { bm } from "@/lib/design-tokens";

import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";

import { getBatteryImageSet } from "@/lib/battery-alias-map";



type Props = {

  fuelLabel: string;

  batteryCode: string;

  highlighted?: boolean;

  showExceptionNote?: boolean;

  conditionNote?: string;

};



export function FuelBatterySpecCard({

  fuelLabel,

  batteryCode,

  highlighted = false,

  showExceptionNote = false,

  conditionNote,

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

      <div className="relative h-[140px] bg-slate-50">

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

        {note ? (

          <p className="mt-2 text-[10px] font-medium leading-snug text-slate-500">{note}</p>

        ) : null}

        <div className="mt-auto flex flex-col gap-2 pt-3">

          <Link

            className={`${bm.btnPrimary} w-full text-center text-xs`}

            href={`/batteries/${encodeURIComponent(batteryCode)}`}

          >

            해당 규격 보기

          </Link>

          <Link className={`${bm.btnSecondary} w-full text-center text-xs`} href="/analysis/photo">

            사진으로 확인

          </Link>

        </div>

      </div>

    </article>

  );

}


