"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExploreVehicleCard } from "@/components/platform/ExploreVehicleCard";
import { ManufacturerVehicleRail } from "@/components/platform/ManufacturerVehicleRail";
import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";
import {
  filterBrowseItems,
  getAllBrowseItems,
  getVehiclesByManufacturerSections,
  VEHICLES_BRAND_FILTERS,
  type VehiclesBrandFilter,
} from "@/lib/vehicles-browse-data";
import { bm } from "@/lib/design-tokens";

export function VehiclesBrowseClient() {
  const searchParams = useSearchParams();
  const registerMode = searchParams.get("register") === "1";
  const signupVehicleSelect = searchParams.get("mode") === "signup_vehicle_select";
  const [brand, setBrand] = useState<VehiclesBrandFilter>("전체");

  const manufacturerSections = useMemo(() => getVehiclesByManufacturerSections(), []);
  const allItems = useMemo(() => getAllBrowseItems(), []);
  const filtered = useMemo(() => filterBrowseItems(allItems, brand), [allItems, brand]);

  if (registerMode) {
    return <VehicleRegisterBrowse brand={brand} setBrand={setBrand} filtered={filtered} />;
  }

  return (
    <div className="vehicle-search-hub">
      {signupVehicleSelect ? (
        <section className="signup-vehicle-select-banner">
          <p className="signup-vehicle-select-banner__title">회원가입 중 차량 선택</p>
          <p className="signup-vehicle-select-banner__desc">
            차량을 선택하면 회원가입 폼으로 돌아갑니다. 로그인 없이 진행됩니다.
          </p>
        </section>
      ) : null}
      <section className="vehicle-search-hub__hero">
        <div className="vehicle-search-hub__hero-inner">
          <h1 className="vehicle-search-hub__title">차종검색</h1>
          <p className="vehicle-search-hub__lead">
            차량명이나 연식, 모델명으로 내 차에 맞는 배터리를 확인해보세요.
          </p>
          <div className="vehicle-search-hub__search">
            <VehicleSearchBox
              placeholder="예: 그랜저 IG, 싼타페 TM, K5 2세대, 스타리아"
              showButton
              buttonLabel="검색"
              shimmerSubmit
              className="vehicle-search-hub__search-box"
              inputClassName="vehicle-search-hub__search-input"
            />
          </div>
        </div>
      </section>

      <div className="vehicle-search-hub__sections">
        {manufacturerSections.map((section) => (
          <ManufacturerVehicleRail
            key={section.id}
            label={section.label}
            items={section.items}
            signupVehicleSelect={signupVehicleSelect}
          />
        ))}
      </div>

      <p className="vehicle-search-hub__footer-note">
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
