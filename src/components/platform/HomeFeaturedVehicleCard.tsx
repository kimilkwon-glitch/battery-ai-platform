"use client";

import Link from "next/link";
import { CarGenerationImage } from "@/components/car/CarGenerationImage";
import { VehicleSpecBadge } from "@/components/car/VehicleSpecBadge";
import { productCardShell } from "@/components/car/car-card-styles";
import { carImageForPlatformVehicleId } from "@/lib/car-data";
import { getVehicleBodyType } from "@/lib/platform-data";
import { BatteryMiniSpecLink } from "@/components/battery/BatteryMiniSpecLink";
import { getVehicleCardHints, getVehicleExploreMeta } from "@/lib/vehicle-card-hints";
import {
  formatConditionSpecSummary,
  getVehicleConditionSpecLines,
} from "@/lib/vehicle-condition-spec-lines";

export function HomeFeaturedVehicleCard({
  vehicleId,
  title,
  href,
  onNavigate,
}: {
  vehicleId: string;
  title: string;
  href: string;
  onNavigate?: () => void;
}) {
  const hints = getVehicleCardHints(vehicleId);
  const meta = getVehicleExploreMeta(vehicleId);
  const imageSrc = carImageForPlatformVehicleId(vehicleId);
  const bodyType = getVehicleBodyType(vehicleId);
  const isCommercial = bodyType === "truck" || bodyType === "van" || /porter|bongo/i.test(vehicleId);

  const conditionLines = getVehicleConditionSpecLines(vehicleId);
  const fuelSummary = formatConditionSpecSummary(conditionLines);
  const primaryBattery =
    hints.primaryCode === "사진 확인 필요" ? "규격 확인 필요" : hints.primaryCode;

  return (
    <Link
      className={`group flex h-full flex-col overflow-hidden border border-slate-200 ${productCardShell}`}
      href={href}
      onClick={onNavigate}
    >
      <div className="relative flex h-[132px] items-end justify-center overflow-hidden bg-slate-50/80 sm:h-[148px]">
        {imageSrc ? (
          <CarGenerationImage
            alt={title}
            className={isCommercial ? "!h-[82%] !w-[88%]" : "!h-[86%] !w-[90%]"}
            commercial={isCommercial}
            size="compact"
            src={imageSrc}
          />
        ) : (
          <span className="pb-8 text-xs font-black text-slate-400">{title}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pt-3">
        <div>
          <p className="text-base font-black leading-tight text-slate-950 group-hover:text-blue-700">
            {title}
          </p>
          <p className="mt-0.5 text-[11px] font-bold text-slate-500">{meta.categoryLine}</p>
        </div>
        {fuelSummary ? (
          <p className="text-xs font-bold text-slate-800">{fuelSummary}</p>
        ) : (
          <p className="text-xs font-semibold text-slate-600">
            {primaryBattery.includes("준비") || primaryBattery.includes("확인")
              ? primaryBattery
              : (
                  <>
                    참고 규격 <span className="font-bold text-slate-800">{primaryBattery}</span>
                  </>
                )}
          </p>
        )}
        {conditionLines.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {conditionLines.map((line) => (
              <BatteryMiniSpecLink
                key={`${line.conditionLabel}-${line.code}`}
                code={line.code}
                label={line.conditionLabel}
                compact
              />
            ))}
          </div>
        ) : null}
        {hints.tokens.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {hints.tokens.slice(0, 2).map((token) => (
              <VehicleSpecBadge key={token.kind} token={token} />
            ))}
          </div>
        ) : null}
        <span className="mt-auto text-[11px] font-bold text-blue-600 group-hover:underline">
          {meta.ctaLabel} →
        </span>
      </div>
    </Link>
  );
}
