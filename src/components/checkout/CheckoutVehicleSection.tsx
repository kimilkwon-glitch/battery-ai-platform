"use client";

import { useMemo, useState } from "react";
import { getCustomerVehicles, type CustomerVehicleRecord } from "@/lib/customer-vehicles-storage";
import { isCustomerLoggedIn } from "@/lib/customer-auth-session";
import type { OrderRequestVehicle } from "@/types/order-request";

const inputClass =
  "checkout-input mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-medium";

const FUEL_OPTIONS = ["가솔린", "디젤", "LPG", "하이브리드", "전기"] as const;

type Props = {
  values: OrderRequestVehicle;
  onChange: (patch: Partial<OrderRequestVehicle>) => void;
};

export function CheckoutVehicleSection({ values, onChange }: Props) {
  const [open, setOpen] = useState(
    Boolean(values.name || values.year || values.fuelType || values.plateSuffix),
  );
  const loggedIn = isCustomerLoggedIn();
  const savedVehicles = useMemo(
    () => (typeof window !== "undefined" ? getCustomerVehicles() : []),
    [open, loggedIn],
  );

  const applyVehicle = (v: CustomerVehicleRecord) => {
    onChange({
      name: v.displayName,
      year: v.year ?? v.yearRange,
      fuelType: v.fuel ?? v.fuelHint,
      currentBatterySpec: v.recommendedBattery,
    });
    setOpen(true);
  };

  return (
    <section className="checkout-card space-y-3" id="checkout-vehicle">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div>
          <h2 className="checkout-card__title">차량 정보 확인</h2>
          <p className="checkout-card__hint">
            차량 정보를 입력하면 배터리 확인에 도움이 됩니다. 모르시면 비워두셔도 됩니다.
          </p>
        </div>
        <span className="shrink-0 text-xs font-black text-blue-700">
          {open ? "접기" : "펼치기"}
        </span>
      </button>

      {loggedIn && savedVehicles.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {savedVehicles.length === 1 ? (
            <button
              type="button"
              onClick={() => applyVehicle(savedVehicles[0]!)}
              className="checkout-btn-secondary px-4 py-2 text-xs font-black"
            >
              내 차량 정보 불러오기
            </button>
          ) : (
            <label className="flex flex-1 items-center gap-2 text-xs font-bold text-slate-700">
              <span className="shrink-0">내 차량</span>
              <select
                className="checkout-input min-h-[2.5rem] flex-1 rounded-xl px-2 py-2 text-xs font-bold"
                defaultValue=""
                onChange={(e) => {
                  const row = savedVehicles.find((v) => v.id === e.target.value);
                  if (row) applyVehicle(row);
                }}
              >
                <option value="" disabled>
                  차량 선택
                </option>
                {savedVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.displayName}
                    {v.year ? ` · ${v.year}` : ""}
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
          <p className="text-[11px] font-medium text-slate-500">
            차량정보를 모르셔도 주문은 가능합니다. 정확한 규격 확인이 필요하면 사진 확인 후
            안내드릴 수 있습니다.
          </p>
          <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <p className="text-[10px] font-bold text-slate-500">사진 확인 (선택)</p>
            <label className="flex items-start gap-2 text-[11px] font-medium text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(values.photoCheckNeeded)}
                onChange={(e) => onChange({ photoCheckNeeded: e.target.checked })}
                className="mt-0.5"
              />
              <span>기존 배터리 사진 확인 필요</span>
            </label>
            <label className="flex items-start gap-2 text-[11px] font-medium text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(values.registrationPhotoNeeded)}
                onChange={(e) => onChange({ registrationPhotoNeeded: e.target.checked })}
                className="mt-0.5"
              />
              <span>차량등록증 사진 확인 필요</span>
            </label>
          </div>
        </div>
      ) : null}
    </section>
  );
}
