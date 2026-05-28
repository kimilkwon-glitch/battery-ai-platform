"use client";



import Link from "next/link";

import { CarGenerationImage } from "@/components/car/CarGenerationImage";

import { bm } from "@/lib/design-tokens";

import { carImageForPlatformVehicleId } from "@/lib/car-data";

import { getVehicleBodyType } from "@/lib/platform-data";

import { BatteryMiniSpecLink } from "@/components/battery/BatteryMiniSpecLink";
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



  return (

    <Link className={`group ${bm.cardVehicleMatch} h-full overflow-hidden`} href={href}>

      <div className="flex h-full flex-col md:grid md:grid-cols-[42%_58%]">

      <div className={`${bm.cardHorizontalMedia} !min-h-[120px] md:!min-h-[150px]`}>

        {imageSrc ? (

          <CarGenerationImage

            alt={title}

            className={isCommercial ? "!h-[86%] !w-[92%] !max-w-[95%]" : "!h-[90%] !w-[94%] !max-w-[95%]"}

            commercial={isCommercial}

            size="compact"

            src={imageSrc}

          />

        ) : (

          <span className="text-[10px] font-black text-slate-500">{title}</span>

        )}

      </div>

      <div className={`${bm.cardHorizontalBody} gap-1`}>

        <p className="truncate text-sm font-black text-slate-950 group-hover:text-blue-700">{title}</p>

        <p className="text-[10px] font-bold text-slate-500">{copy.categoryLine}</p>

        <p className="text-xs font-semibold text-slate-800">{copy.specLine}</p>
        {(() => {
          const conditions = getVehicleConditionSpecLines(vehicleId);
          if (conditions.length < 2) return null;
          return (
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
          );
        })()}

        <p className="line-clamp-2 text-[10px] font-medium leading-relaxed text-slate-500">{copy.cautionLine}</p>

        <span className="mt-auto inline-flex pt-2 text-[11px] font-black text-blue-600 group-hover:underline">

          {copy.ctaLabel} →

        </span>

      </div>

      </div>

    </Link>

  );

}


