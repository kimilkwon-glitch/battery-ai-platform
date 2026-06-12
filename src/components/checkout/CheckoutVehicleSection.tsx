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

function vehicleSummary(values: OrderRequestVehicle): string | null {
  const parts = [values.name?.trim(), values.year?.trim(), values.fuelType?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function checkoutVehicleInfoValid(vehicle: OrderRequestVehicle): boolean {
  return Boolean(vehicle.name?.trim());
}

export function CheckoutVehicleSection({
  values,
  onChange,
  needsVehicleConfirm = false,
  vehicleConfirmHref = HUB_SEARCH,
}: Props) {
  const [open, setOpen] = useState(true);
  const loggedIn = isCustomerLoggedIn();
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [defaultApplied, setDefaultApplied] = useState(false);
  const summary = vehicleSummary(values);
  const missingRequired = !checkoutVehicleInfoValid(values);

  const vehicleChoices = useMemo(() => {
    if (!loggedIn || typeof window === "undefined") return [];
    return getCheckoutVehicleChoices();
  }, [loggedIn, open]);

  const applyVehicle = (vehicle: CheckoutVehicleChoice) => {
    onChange({
      name: vehicle.displayName,
      year: vehicle.year ?? vehicle.yearRange,
      fuelType: vehicle.fuel ?? vehicle.fuelHint,
    });
    setSelectedVehicleId(vehicle.id);
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
        });
      }
    }
    setDefaultApplied(true);
  }, [loggedIn, defaultApplied, vehicleChoices, values.name, onChange]);

  return (
    <section className="checkout-card space-y-3" id="checkout-vehicle">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="checkout-card__title">
            차량 정보 <span className="text-red-600">(공구확인용)</span>
          </h2>
          {summary ? (
            <p className="checkout-card__hint mt-1">{summary}</p>
          ) : (
            <p className="checkout-card__hint mt-1">
              공구 확인을 위해 차량명을 입력해 주세요. 연식·연료도 함께 적어 주시면 확인에 도움이 됩니다.
            </p>
          )}
          {missingRequired && open ? (
            <p className="mt-1 text-[11px] font-bold text-red-600">차량명은 필수입니다.</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="checkout-vehicle-section__toggle shrink-0 text-xs font-black text-blue-700"
        >
          {open ? "접기" : summary ? "수정" : "입력"}
        </button>
      </div>

      {!open && needsVehicleConfirm && !summary ? (
        <Link
          href={vehicleConfirmHref}
          className="checkout-btn-secondary inline-flex px-3 py-2 text-xs font-black"
        >
          차종 검색으로 확인
        </Link>
      ) : null}

      {loggedIn && vehicleChoices.length > 0 && open ? (
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
            <label className="flex w-full flex-col gap-1 text-xs font-bold text-slate-700 sm:flex-row sm:items-center sm:gap-2">
              <span className="shrink-0">내 차량</span>
              <select
                className="checkout-input min-h-[2.5rem] w-full min-w-0 rounded-xl px-2 py-2 text-xs font-bold"
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
      ) : loggedIn && open ? (
        <p className="text-[11px] font-medium text-slate-500">등록된 차량정보 없음</p>
      ) : null}

      {open ? (
        <div className="grid gap-3">
          <label className="block">
            <span className="checkout-label">
              차량명 <span className="text-red-600">*</span>
            </span>
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
              <option value="">선택</option>
              {FUEL_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </section>
  );
}
