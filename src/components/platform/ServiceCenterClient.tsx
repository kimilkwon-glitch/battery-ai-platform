"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { BusanRegionMap } from "@/components/service/BusanRegionMap";
import { StoreHubCompactCards } from "@/components/service/StoreHubCompactCards";
import { StoreNeighborhoodSearch } from "@/components/service/StoreNeighborhoodSearch";
import { VISIT_OUTBOUND_PREP_ITEMS } from "@/lib/busan-service-hub-data";
import type { BusanStoreId } from "@/lib/busan-store-matcher";

export function ServiceCenterClient({
  vehicleLabel,
  battery,
  symptom,
}: {
  vehicleLabel?: string;
  battery?: string;
  symptom?: string;
}) {
  const context = [vehicleLabel, battery, symptom].filter(Boolean);
  /** 지도·토글·카드 공통 — 선택된 지점 (null이면 두 카드 기본 강조) */
  const [selectedBranch, setSelectedBranch] = useState<BusanStoreId | null>(null);
  const [hoveredBranch, setHoveredBranch] = useState<BusanStoreId | null>(null);
  const [mapSearchQuery, setMapSearchQuery] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBranch) return;
    const mobile = window.matchMedia("(max-width: 1023px)");
    if (!mobile.matches) return;
    const el = document.getElementById(`store-${selectedBranch}`);
    if (!el) return;
    const timer = window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => window.cancelAnimationFrame(timer);
  }, [selectedBranch]);

  return (
    <div className="busan-service-hub space-y-6 pb-8">
      {context.length > 0 ? (
        <p className="rounded-xl bg-blue-50/60 px-4 py-2 text-xs font-bold text-blue-800 ring-1 ring-blue-100">
          연결 정보: {context.join(" · ")}
        </p>
      ) : null}

      <StoreNeighborhoodSearch
        activeStore={selectedBranch ?? hoveredBranch}
        onMatch={setSelectedBranch}
        onSearchQuery={setMapSearchQuery}
      />

      <BusanRegionMap
        selectedBranch={selectedBranch}
        searchQuery={mapSearchQuery}
        onHoverBranch={setHoveredBranch}
        onSelectBranch={setSelectedBranch}
      />
      <p className="text-center text-xs font-medium text-slate-500">
        지도가 보이지 않으면 가까운 지점으로 전화 상담해 주세요.
      </p>

      <StoreHubCompactCards
        selectedBranch={selectedBranch}
        hoveredBranch={hoveredBranch}
        onSelectBranch={setSelectedBranch}
        onHoverBranch={setHoveredBranch}
      />

      <section
        className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-7"
        id="visit-prep"
      >
        <h3 className="text-xl font-black text-slate-950 sm:text-2xl">
          방문·출장 전 알려주시면 좋은 정보
        </h3>
        <p className="mt-2 max-w-2xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
          아래 정보가 있으면 가까운 지점과 작업 가능 시간을 더 빠르게 안내드릴 수 있습니다.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VISIT_OUTBOUND_PREP_ITEMS.map((item) => (
            <li
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3.5 text-base font-semibold text-slate-800 sm:text-lg"
              key={item}
            >
              <CheckCircle className="size-5 shrink-0 text-emerald-600 sm:size-6" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
