"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { BusanRegionMap } from "@/components/service/BusanRegionMap";
import { StoreHubCompactCards } from "@/components/service/StoreHubCompactCards";
import { StoreNeighborhoodSearch } from "@/components/service/StoreNeighborhoodSearch";
import { VISIT_OUTBOUND_PREP_ITEMS } from "@/lib/busan-service-hub-data";
import type { BusanStoreId } from "@/lib/busan-store-matcher";
import { HUB_PHOTO } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";

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
  const [activeStore, setActiveStore] = useState<BusanStoreId | null>(null);
  const [hoveredStore, setHoveredStore] = useState<BusanStoreId | null>(null);
  const [mapSearchQuery, setMapSearchQuery] = useState<string | null>(null);
  const highlightStore = activeStore ?? hoveredStore;

  return (
    <div className="busan-service-hub space-y-6 pb-8">
      {context.length > 0 ? (
        <p className="rounded-xl bg-blue-50/60 px-4 py-2 text-xs font-bold text-blue-800 ring-1 ring-blue-100">
          연결 정보: {context.join(" · ")}
        </p>
      ) : null}

      <StoreNeighborhoodSearch
        activeStore={highlightStore}
        onMatch={setActiveStore}
        onSearchQuery={setMapSearchQuery}
      />

      <BusanRegionMap
        activeStore={activeStore}
        searchQuery={mapSearchQuery}
        onHoverStore={setHoveredStore}
        onSelect={setActiveStore}
      />
      <p className="text-center text-xs font-medium text-slate-500">
        지도가 보이지 않으면 가까운 지점으로 전화 상담해 주세요.
      </p>

      <StoreHubCompactCards highlightId={highlightStore} />

      <section className={`${bm.card} ${bm.cardPad}`} id="visit-prep">
        <h3 className="text-xl font-black text-slate-950 sm:text-2xl">방문·출장 전 알려주시면 좋은 정보</h3>
        <p className="mt-3 text-base font-semibold leading-relaxed text-slate-600 sm:text-lg">
          이 정보가 있으면 가까운 지점과 작업 가능 시간을 더 빠르게 안내드릴 수 있습니다.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {VISIT_OUTBOUND_PREP_ITEMS.map((item) => (
            <li className="flex items-start gap-3 text-base font-semibold text-slate-800" key={item}>
              <CheckCircle className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2.5 text-sm font-bold">
          <Link className="text-blue-700 hover:underline" href="/order-checklist">
            주문·교체 체크리스트 →
          </Link>
          <span className="text-slate-300">·</span>
          <Link className="text-slate-600 hover:text-blue-700 hover:underline" href={HUB_PHOTO}>
            사진으로 규격 확인 (보조)
          </Link>
          <span className="text-slate-300">·</span>
          <Link className="text-slate-600 hover:text-blue-700 hover:underline" href="/ai">
            문의하기
          </Link>
        </div>
      </section>
    </div>
  );
}
