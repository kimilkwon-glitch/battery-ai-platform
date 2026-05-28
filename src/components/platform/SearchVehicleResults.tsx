import Link from "next/link";

import { BatteryMiniThumb } from "@/components/BatteryThumbnail";

import { CarGenerationImage } from "@/components/car/CarGenerationImage";

import { bm } from "@/lib/design-tokens";

import { getBattery } from "@/lib/platform-data";



export type VehicleSearchRow = {

  model: string;

  year: string;

  fuel: string;

  origin: string;

  recommend: string;

  upgrade: string;

  note?: string;

  href: string;

  imageSrc?: string | null;

  batteryNotes?: string;

  fuelHref?: string;

  needsReview?: boolean;

};



export function SearchVehicleResults({
  rows,
  compact = false,
  searchLayout = false,
}: {
  rows: VehicleSearchRow[];
  compact?: boolean;
  searchLayout?: boolean;
}) {

  const agm60 = getBattery("AGM60L");



  return (

    <div className="space-y-2">

      {rows.map((row, index) => {

        const { model, year, fuel, origin, recommend, upgrade, note, href, imageSrc, batteryNotes, fuelHref, needsReview } = row;

        const showBatteryThumb = recommend === "AGM60L" || origin === "AGM60L";



        return (

          <div

            className={`grid gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-[var(--bm-border)] hover:bg-white hover:shadow-sm ${compact ? "md:grid-cols-[96px_1fr_auto]" : "md:grid-cols-[116px_1fr_190px]"}`}

            key={`${model}-${index}`}

          >

            <Link className="contents" href={href}>

              <span className={`relative block overflow-hidden rounded-xl ${compact ? "h-[88px]" : "h-[105px]"} ${bm.imageVehicle.replace("shrink-0", "")}`}>

                {imageSrc ? (

                  <CarGenerationImage alt={model} className="!h-full !w-full" size="compact" src={imageSrc} />

                ) : (

                  <span className="flex h-full items-center justify-center bg-slate-100 text-[10px] font-black text-slate-400">{model}</span>

                )}

                {showBatteryThumb ? (

                  <span className="absolute bottom-2 right-2 z-10">

                    <BatteryMiniThumb code="AGM60L" imageSet={agm60.images} role="main" className="h-12 w-12 shadow-sm" />

                  </span>

                ) : null}

              </span>

              <span>
                <span className={`block font-black tracking-[-0.02em] text-slate-950 ${compact || searchLayout ? "text-base" : "mt-2 text-lg"}`}>{model}</span>

                <span className="mt-1 block text-xs font-medium text-slate-500">
                  연식 {year} · {fuel}
                  {!compact && !searchLayout && note ? ` · ${note}` : ""}
                </span>

                {(searchLayout || compact) && recommend && !model.toUpperCase().includes(recommend.toUpperCase().replace(/\s+/g, "")) ? (
                  <span className="mt-1 block text-[11px] font-semibold text-slate-600">추천 규격 {recommend}</span>
                ) : null}

                {!compact && !searchLayout && batteryNotes ? (
                  <span className="mt-1 block text-[11px] font-semibold leading-relaxed text-slate-600">{batteryNotes}</span>
                ) : null}

                {!compact && !searchLayout ? (
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    <span className={`${bm.badge} ${bm.badgeGray}`}>순정 {origin}</span>
                    <span className={`${bm.badge} ${bm.badgeBlue}`}>추천 {recommend}</span>
                  </span>
                ) : null}
              </span>

            </Link>

            <span className="flex shrink-0 items-center">

              <Link className={compact || searchLayout ? `${bm.btnPrimary} whitespace-nowrap px-3 py-2 text-xs` : bm.btnSecondary} href={href}>

                {compact || searchLayout ? "차량 상세 보기" : "상세보기"}

              </Link>

              {!compact && fuelHref ? (

                <Link className={`${bm.btnPrimary} ml-2`} href={fuelHref}>

                  연료별 배터리

                </Link>

              ) : null}

              {!compact && !fuelHref ? (

                <Link className={`${bm.btnNavy} ml-2`} href={href}>

                  차량 보기

                </Link>

              ) : null}

            </span>

          </div>

        );

      })}

    </div>

  );

}

