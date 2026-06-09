"use client";

import clsx from "clsx";
import { bm } from "@/lib/design-tokens";
import {
  getVehicleFuelOptions,
  getVehicleSelectionLabel,
  vehicleRequiresFuelSelection,
} from "@/lib/vehicle-registration";

type Props = {
  slug: string;
  selectedKey: string | null;
  onSelect: (label: string) => void;
  selectionHint?: boolean;
  /** 검색 카드 등 compact 레이아웃 */
  compact?: boolean;
  className?: string;
};

export function VehicleConditionFuelSelect({
  slug,
  selectedKey,
  onSelect,
  selectionHint = false,
  compact = false,
  className,
}: Props) {
  const conditions = getVehicleFuelOptions(slug);
  if (conditions.length === 0) return null;

  const requiresSelection = vehicleRequiresFuelSelection(slug);
  const selectionLabel = getVehicleSelectionLabel(slug);
  const selected = conditions.find((c) => c.conditionLabel === selectedKey) ?? null;

  return (
    <div
      className={clsx(
        compact ? "vehicle-condition-fuel-select--compact" : "vehicle-register-card__fuel",
        className,
      )}
    >
      <p
        className={
          compact ? "vehicle-condition-fuel-select__label" : "vehicle-register-card__fuel-label"
        }
      >
        {selectionLabel} 선택
        {requiresSelection ? (
          <span
            className={
              compact
                ? "vehicle-condition-fuel-select__required"
                : "vehicle-register-card__fuel-required"
            }
          >
            필수
          </span>
        ) : null}
      </p>
      <div
        className={
          compact ? "vehicle-condition-fuel-select__pills" : "vehicle-register-card__fuel-pills"
        }
        role="group"
        aria-label={`${selectionLabel} 선택`}
      >
        {conditions.map((c) => (
          <button
            key={c.conditionLabel}
            type="button"
            aria-pressed={selectedKey === c.conditionLabel}
            onClick={() => onSelect(c.conditionLabel)}
            className={clsx(
              bm.filterChip,
              compact ? "vehicle-condition-fuel-select__pill" : "vehicle-register-card__fuel-pill",
              selectedKey === c.conditionLabel ? bm.filterChipOn : bm.filterChipOff,
            )}
          >
            {c.conditionLabel}
          </button>
        ))}
      </div>
      <p className={compact ? "vehicle-condition-fuel-select__spec" : "vehicle-register-card__spec"}>
        {selected ? (
          <>
            추천 규격{" "}
            <strong
              className={
                compact
                  ? "vehicle-condition-fuel-select__spec-code"
                  : "vehicle-register-card__spec-code"
              }
            >
              {selected.code}
            </strong>
          </>
        ) : requiresSelection ? (
          <span className="text-slate-500">
            {selectionLabel}를 선택하면 추천 규격이 표시됩니다.
          </span>
        ) : null}
      </p>
      {selectionHint ? (
        <p
          className={compact ? "vehicle-condition-fuel-select__hint" : "vehicle-register-card__hint"}
          role="alert"
        >
          {selectionLabel}를 먼저 선택해 주세요.
        </p>
      ) : null}
    </div>
  );
}
