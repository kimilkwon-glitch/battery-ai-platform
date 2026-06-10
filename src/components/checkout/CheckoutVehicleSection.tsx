"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isCustomerLoggedIn } from "@/lib/customer-auth-session";
import { HUB_SEARCH } from "@/lib/customer-hub-routes";
import {
  findCheckoutVehicleById,
  getCheckoutVehicleChoices,
  resolveDefaultCheckoutVehicleId,
  type CheckoutVehicleChoice,
} from "@/lib/checkout/checkout-vehicle-choices";
import type { OrderRequestVehicle } from "@/types/order-request";

const inputClass =
  "checkout-input mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-medium";

const FUEL_OPTIONS = ["가솔린", "디젤", "LPG", "하이브리드", "전기"] as const;

type Props = {
  values: OrderRequestVehicle;
  onChange: (patch: Partial<OrderRequestVehicle>) => void;
  needsVehicleConfirm?: boolean;
  vehicleConfirmHref?: string;
};

function vehicleChoiceLabel(vehicle: CheckoutVehicleChoice): string {
  const parts = [vehicle.displayName];
  const year = vehicle.year ?? vehicle.yearRange;
  if (year) parts.push(year);
  return parts.join(" · ");
}

export function CheckoutVehicleSection({
  values,
  onChange,
  needsVehicleConfirm = false,
  vehicleConfirmHref = HUB_SEARCH,
}: Props) {
  const [open, setOpen] = useState(
    needsVehicleConfirm ||
      Boolean(values.name || values.year || values.fuelType || values.plateSuffix),
  );
  const loggedIn = isCustomerLoggedIn();
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [defaultApplied, setDefaultApplied] = useState(false);

  const vehicleChoices = useMemo(() => {
    if (!loggedIn || typeof window === "undefined") return [];
    return getCheckoutVehicleChoices();
  }, [loggedIn, open]);

  const applyVehicle = (vehicle: CheckoutVehicleChoice) => {
    onChange({
      name: vehicle.displayName,
      year: vehicle.year ?? vehicle.yearRange,
      fuelType: vehicle.fuel ?? vehicle.fuelHint,
      currentBatterySpec: vehicle.recommendedBattery,
    });
    setSelectedVehicleId(vehicle.id);
    setOpen(true);
  };

  useEffect(() => {
    if (!loggedIn || defaultApplied || vehicleChoices.length === 0) return;

    const defaultId = resolveDefaultCheckoutVehicleId(vehicleChoices);
    if (!defaultId) return;

    setSelectedVehicleId(defaultId);
    if (!values.name?.trim()) {
      const row = findCheckoutVehicleById(vehicleChoices, defaultId);
      if (row) {
        onChange({
          name: row.displayName,
          year: row.year ?? row.yearRange,
          fuelType: row.fuel ?? row.fuelHint,
          currentBatterySpec: row.recommendedBattery,
        });
      }
    }
    setDefaultApplied(true);
  }, [loggedIn, defaultApplied, vehicleChoices, values.name, onChange]);

  return (
    <section className="checkout-card space-y-3" id="checkout-vehicle">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div>
          <h2 className="checkout-card__title">차량 정보 (선택)</h2>
        </div>
        <span className="shrink-0 text-xs font-black text-blue-700">
          {open ? "접기" : "펼치기"}
        </span>
      </button>

      {needsVehicleConfirm && !values.name?.trim() ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-3">
          <p className="text-xs font-black text-amber-950">차량 기준 확인 필요</p>
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-amber-900/90">
            선택한 배터리 규격이 내 차에 맞는지 확인하려면 차량 정보를 입력하거나 차종을 선택해 주세요.
          </p>
          <Link
            href={vehicleConfirmHref}
            className="checkout-btn-secondary mt-2 inline-flex px-3 py-2 text-xs font-black"
          >
            차량 확인하기
          </Link>
        </div>
      ) : null}

      {loggedIn && vehicleChoices.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {vehicleChoices.length === 1 ? (
            <button
              type="button"
              onClick={() => applyVehicle(vehicleChoices[0]!)}
              className="checkout-btn-secondary px-4 py-2 text-xs font-black"
            >
              내 차량 정보 불러오기
            </button>
          ) : (
            <label className="flex flex-1 items-center gap-2 text-xs font-bold text-slate-700">
              <span className="shrink-0">내 차량</span>
              <select
                className="checkout-input min-h-[2.5rem] flex-1 rounded-xl px-2 py-2 text-xs font-bold"
                value={selectedVehicleId}
                onChange={(e) => {
                  const row = findCheckoutVehicleById(vehicleChoices, e.target.value);
                  if (row) applyVehicle(row);
                }}
              >
                <option value="" disabled>
                  차량 선택
                </option>
                {vehicleChoices.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicleChoiceLabel(vehicle)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      ) : loggedIn ? (
        <p className="text-[11px] font-medium text-slate-500">등록된 차량정보 없음</p>
      ) : null}

      {open ? (
        <div className="grid gap-3">
          <label className="block">
            <span className="checkout-label">차량명</span>
            <input
              type="text"
              className={inputClass}
              value={values.name ?? ""}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="예: 쏘렌토 MQ4"
            />
          </label>
          <label className="block">
            <span className="checkout-label">연식</span>
            <input
              type="text"
              className={inputClass}
              value={values.year ?? ""}
              onChange={(e) => onChange({ year: e.target.value })}
              placeholder="2021"
            />
          </label>
          <label className="block">
            <span className="checkout-label">연료 타입</span>
            <select
              className={inputClass}
              value={values.fuelType ?? ""}
              onChange={(e) => onChange({ fuelType: e.target.value || undefined })}
            >
              <option value="">선택 (선택사항)</option>
              {FUEL_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="checkout-label">차량번호 뒷자리</span>
            <input
              type="text"
              className={inputClass}
              value={values.plateSuffix ?? ""}
              onChange={(e) => onChange({ plateSuffix: e.target.value })}
              placeholder="예: 1234"
              maxLength={4}
            />
          </label>
          <label className="block">
            <span className="checkout-label">현재 장착 배터리 규격</span>
            <input
              type="text"
              className={inputClass}
              value={values.currentBatterySpec ?? ""}
              onChange={(e) => onChange({ currentBatterySpec: e.target.value })}
              placeholder="예: AGM80L"
            />
          </label>
        </div>
      ) : null}
    </section>
  );
}
