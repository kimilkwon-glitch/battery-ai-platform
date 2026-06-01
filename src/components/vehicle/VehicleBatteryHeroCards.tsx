"use client";

import { useState } from "react";
import { FuelBatterySpecCard } from "@/components/battery/FuelBatterySpecCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { VEHICLE_HERO_CARD_LIMIT } from "@/lib/vehicle-fuel-display";
import { bm } from "@/lib/design-tokens";
import { getVehicleConditionSpecLines } from "@/lib/vehicle-condition-spec-lines";
import {
  buildFuelHeroCardGroups,
  normalizeVehicleFuelParam,
  resolveVehicleFuelPrimaryBattery,
} from "@/lib/vehicle-fuel-primary-battery";
import type { FuelBatteryGroup, YearChip } from "@/lib/vehicleBattery";

type Props = {
  slug: string;
  vehicleTitle: string;
  fuelGroups: FuelBatteryGroup[];
  yearChips: YearChip[];
  highlightFuel?: string | null;
  highlightYear?: string | null;
};

export function VehicleBatteryHeroCards({
  slug,
  vehicleTitle,
  fuelGroups,
  yearChips,
  highlightFuel: highlightFuelRaw,
  highlightYear,
}: Props) {
  const highlightFuel = normalizeVehicleFuelParam(highlightFuelRaw);
  const conditionLines = getVehicleConditionSpecLines(slug);
  const useYearCards = conditionLines.length >= 2 && /porter2/i.test(slug);
  const [expanded, setExpanded] = useState(false);

  const fuelCards = buildFuelHeroCardGroups(slug, fuelGroups, highlightFuelRaw);

  if (fuelCards.length === 0) return null;

  const primaryCards = fuelCards.slice(0, VEHICLE_HERO_CARD_LIMIT);
  const extraCards = fuelCards.slice(VEHICLE_HERO_CARD_LIMIT);

  return (
    <section className={`${bm.card} ${bm.cardPad}`} id="fuel-batteries" data-ux="fuel-battery-hero-cards">
      <SectionHeader
        label="추천 배터리"
        iconKey="batterySpec"
        title={`${vehicleTitle} · 연료별 규격`}
        description="대표 규격만 먼저 보여드립니다. 연료·ISG·연식에 따라 달라질 수 있습니다."
      />

      {useYearCards ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {conditionLines.slice(0, VEHICLE_HERO_CARD_LIMIT).map((line) => (
            <FuelBatterySpecCard
              key={line.conditionLabel}
              fuelLabel={line.conditionLabel}
              batteryCode={line.code}
              conditionNote="연식별 확인이 필요할 수 있습니다."
              highlighted={highlightYear === line.highlightKey}
              showExceptionNote={highlightYear === line.highlightKey}
              vehicleSlug={slug}
              vehicleTitle={vehicleTitle}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {primaryCards.map((group) => (
              <FuelBatterySpecCard
                key={group.fuelLabel}
                fuelLabel={group.fuelLabel}
                batteryCode={resolveVehicleFuelPrimaryBattery(slug, group.fuelLabel)}
                conditionNote={
                  group.fuelLabel === "확인 필요"
                    ? "연식·트림 확인 후 규격을 확정하세요."
                    : "연료·트림에 따라 예외가 있을 수 있습니다."
                }
                highlighted={highlightFuel === group.fuelLabel}
                showExceptionNote={highlightFuel === group.fuelLabel}
                vehicleSlug={slug}
                vehicleTitle={vehicleTitle}
              />
            ))}
          </div>

          {extraCards.length > 0 ? (
            <>
              {expanded ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {extraCards.map((group) => (
                    <FuelBatterySpecCard
                      key={group.fuelLabel}
                      fuelLabel={group.fuelLabel}
                      batteryCode={resolveVehicleFuelPrimaryBattery(slug, group.fuelLabel)}
                      compact
                      conditionNote="추가 후보 — 확인 필요할 수 있습니다."
                      vehicleSlug={slug}
                      vehicleTitle={vehicleTitle}
                    />
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-black text-slate-700 hover:bg-white"
              >
                {expanded ? "접기" : `전체 후보 보기 (${fuelCards.length}개 연료·조건)`}
              </button>
            </>
          ) : null}
        </>
      )}

      {yearChips.length > 0 && useYearCards ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {yearChips.map((chip) => (
            <span key={chip.id} className={`${bm.filterChip} ${bm.filterChipOff}`}>
              {chip.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
