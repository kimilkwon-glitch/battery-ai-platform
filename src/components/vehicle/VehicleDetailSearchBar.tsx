"use client";

import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";

export function VehicleDetailSearchBar() {
  return (
    <div className="vehicle-detail-search-bar" data-vehicle-detail-search>
      <VehicleSearchBox
        className="vehicle-detail-search-bar__box"
        placeholder="차종명 또는 배터리 규격을 검색해 보세요"
        showButton
        buttonLabel="검색"
      />
    </div>
  );
}
