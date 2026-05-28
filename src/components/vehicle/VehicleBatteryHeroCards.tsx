import { FuelBatterySpecCard } from "@/components/battery/FuelBatterySpecCard";
import { SectionHeader } from "@/components/common/SectionHeader";
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

  const fuelCards = buildFuelHeroCardGroups(slug, fuelGroups, highlightFuelRaw);

  if (fuelCards.length === 0) return null;

  return (
    <section className={`${bm.card} ${bm.cardPad}`} id="fuel-batteries" data-ux="fuel-battery-hero-cards">
      <SectionHeader
        label="추천 배터리"
        iconKey="batterySpec"
        title={`${vehicleTitle} · 연료별 규격`}
        description={
          useYearCards
            ? "연식별 우선 확인 규격입니다. 2020년 전후로 90R/100R이 달라질 수 있습니다."
            : "연료별 추천 규격입니다. 가솔린·디젤·하이브리드가 다르면 아래 카드에서 보세요."
        }
      />

      {useYearCards ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {conditionLines.map((line) => (
            <FuelBatterySpecCard
              key={line.conditionLabel}
              fuelLabel={line.conditionLabel}
              batteryCode={line.code}
              conditionNote="2020년 전후 연식 확인이 필요할 수 있습니다."
              highlighted={highlightYear === line.highlightKey}
              showExceptionNote={highlightYear === line.highlightKey}
            />
          ))}
        </div>
      ) : fuelCards.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fuelCards.map((group) => (
            <FuelBatterySpecCard
              key={group.fuelLabel}
              fuelLabel={group.fuelLabel}
              batteryCode={resolveVehicleFuelPrimaryBattery(slug, group.fuelLabel)}
              conditionNote="연료·트림에 따라 예외가 있을 수 있습니다."
              highlighted={highlightFuel === group.fuelLabel}
              showExceptionNote={highlightFuel === group.fuelLabel}
            />
          ))}
        </div>
      ) : null}

      {yearChips.length > 0 && useYearCards ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {yearChips.map((chip) => (
            <span
              key={chip.id}
              className={`${bm.filterChip} ${bm.filterChipOff}`}
            >
              {chip.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

