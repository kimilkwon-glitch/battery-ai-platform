"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, MapPin, Phone } from "lucide-react";
import { BusanRegionMap } from "@/components/service/BusanRegionMap";
import { StoreHubCompactCards } from "@/components/service/StoreHubCompactCards";
import { StoreNeighborhoodSearch } from "@/components/service/StoreNeighborhoodSearch";
import { CONTACT } from "@/lib/contact-info";
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
  const [selectedBranch, setSelectedBranch] = useState<BusanStoreId | null>(null);
  const [hoveredBranch, setHoveredBranch] = useState<BusanStoreId | null>(null);
  const [mapSearchQuery, setMapSearchQuery] = useState<string | null>(null);

  return (
    <div className="busan-service-hub space-y-5 pb-8 lg:space-y-6 lg:pb-8">
      <header className="busan-service-hero max-lg:!mb-2 max-lg:!rounded-xl max-lg:!border-0 max-lg:!bg-transparent max-lg:!p-0">
        <p className="cp-hero__kicker max-lg:hidden">Busan Direct Stores</p>
        <h2 className="busan-service-hero__title">부산 직영점 · 출장 교체</h2>
        <p className="busan-service-hero__desc max-lg:hidden">
          덕천점·학장점 권역과 연락처를 바로 확인할 수 있습니다.
        </p>
        <span className="cp-hero__accent max-lg:hidden" aria-hidden />
      </header>

      {context.length > 0 ? (
        <p className="rounded-xl bg-blue-50/60 px-4 py-2 text-xs font-bold text-blue-800 ring-1 ring-blue-100">
          연결 정보: {context.join(" · ")}
        </p>
      ) : null}

      <StoreHubCompactCards
        selectedBranch={selectedBranch}
        hoveredBranch={hoveredBranch}
        onSelectBranch={setSelectedBranch}
        onHoverBranch={setHoveredBranch}
      />

      <StoreNeighborhoodSearch
        activeStore={selectedBranch ?? hoveredBranch}
        onMatch={setSelectedBranch}
        onSearchQuery={setMapSearchQuery}
        enhanced
      />

      <section id="regions" className="scroll-mt-24 hidden lg:block">
        <BusanRegionMap
          selectedBranch={selectedBranch}
          searchQuery={mapSearchQuery}
          onHoverBranch={setHoveredBranch}
          onSelectBranch={setSelectedBranch}
        />
      </section>

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

      <section
        id="contact"
        className="busan-service-contact scroll-mt-24"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Phone className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-base font-black text-slate-900">전화 상담</h3>
            <p className="mt-1 text-sm font-medium text-slate-600">
              매장·출장 가능 여부와 예약 시간을 안내해 드립니다.
            </p>
            <a
              href={CONTACT.customerCenter.tel}
              className="mt-2 inline-block text-lg font-black text-blue-800 hover:underline"
            >
              {CONTACT.customerCenter.phone}
            </a>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/support?tab=inquiry"
            className="inline-flex min-h-[2.5rem] items-center rounded-lg bg-slate-900 px-4 text-sm font-black text-white hover:bg-slate-800"
          >
            상담 문의하기
          </Link>
          <Link
            href="#stores"
            className="inline-flex min-h-[2.5rem] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 hover:border-blue-200"
          >
            <MapPin className="size-4" aria-hidden />
            지점 위치 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
