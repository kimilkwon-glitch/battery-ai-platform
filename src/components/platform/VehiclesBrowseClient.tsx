"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ExploreVehicleCard } from "@/components/platform/ExploreVehicleCard";
import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";
import {
  filterBrowseItems,
  getAllBrowseItems,
  getVehiclesByManufacturerSections,
  VEHICLES_BRAND_FILTERS,
  type VehiclesBrandFilter,
} from "@/lib/vehicles-browse-data";
import { bm } from "@/lib/design-tokens";
import { useState } from "react";

export function VehiclesBrowseClient() {
  const searchParams = useSearchParams();
  const registerMode = searchParams.get("register") === "1";
  const [brand, setBrand] = useState<VehiclesBrandFilter>("전체");

  const manufacturerSections = useMemo(() => getVehiclesByManufacturerSections(), []);
  const allItems = useMemo(() => getAllBrowseItems(), []);
  const filtered = useMemo(() => filterBrowseItems(allItems, brand), [allItems, brand]);

  if (registerMode) {
    return <VehicleRegisterBrowse brand={brand} setBrand={setBrand} filtered={filtered} />;
  }

  return (
    <div className="vehicle-search-hub space-y-6">
      <section className="vehicle-search-hub__hero">
        <p className="vehicle-search-hub__eyebrow">차종검색</p>
        <h2 className="vehicle-search-hub__title">내 차량을 빠르게 찾아보세요</h2>
        <p className="vehicle-search-hub__lead">
          차량명·연식·모델명으로 검색하거나, 제조사별 목록에서 바로 선택할 수 있습니다.
        </p>
        <div className="vehicle-search-hub__search">
          <VehicleSearchBox
            placeholder="예: 그랜저 IG, 싼타페 TM, K5, 스타리아"
            showButton
            buttonLabel="검색"
            shimmerSubmit
            className="vehicle-search-hub__search-box"
            inputClassName="vehicle-search-hub__search-input"
          />
        </div>
      </section>

      <div className="vehicle-search-hub__sections space-y-8">
        {manufacturerSections.map((section) => (
          <section key={section.id} className="vehicle-search-hub__manufacturer" aria-label={section.label}>
            <h3 className="vehicle-search-hub__manufacturer-name">{section.label}</h3>
            <div className="vehicle-search-hub__divider" aria-hidden />
            <div className="vehicle-search-hub__row">
              {section.items.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="vehicle-search-hub__pill"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="text-center text-sm font-semibold text-slate-500">
        원하는 차종이 없으면{" "}
        <Link className="font-black text-blue-600 hover:underline" href="/search">
          통합검색
        </Link>
        을 이용해 주세요.
      </p>
    </div>
  );
}

function VehicleRegisterBrowse({
  brand,
  setBrand,
  filtered,
}: {
  brand: VehiclesBrandFilter;
  setBrand: (b: VehiclesBrandFilter) => void;
  filtered: ReturnType<typeof filterBrowseItems>;
}) {
  return (
    <div className="space-y-4">
      <section className="vehicle-register-banner">
        <h2 className="text-lg font-black text-slate-950 sm:text-xl">차량정보 등록</h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
          브랜드와 차종을 선택한 뒤 「내 차량으로 등록」을 누르면 마이페이지에 저장됩니다. 등록 후
          규격 보기로 배터리를 확인할 수 있습니다.
        </p>
        <Link href="/mypage" className={`${bm.btnSecondary} mt-3 inline-flex text-sm font-black`}>
          마이페이지에서 확인
        </Link>
      </section>

      <section className={`${bm.card} p-4 sm:p-5`}>
        <p className="text-sm font-black uppercase tracking-wide text-blue-600">제조사</p>
        <h2 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">등록할 차종 선택</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {VEHICLES_BRAND_FILTERS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBrand(b)}
              className={`${bm.filterChip} ${brand === b ? bm.filterChipOn : bm.filterChipOff}`}
            >
              {b}
            </button>
          ))}
        </div>
      </section>

      <section className={`${bm.card} p-4 sm:p-5`}>
        <h2 className="text-base font-black text-slate-950 sm:text-lg">등록할 차종 ({filtered.length})</h2>
        <div className="mt-4 grid gap-4">
          {filtered.map((item) => (
            <ExploreVehicleCard
              href={item.href}
              key={`reg-${item.key}`}
              title={item.title}
              vehicleId={item.vehicleId}
              registerMode
            />
          ))}
        </div>
      </section>
    </div>
  );
}
