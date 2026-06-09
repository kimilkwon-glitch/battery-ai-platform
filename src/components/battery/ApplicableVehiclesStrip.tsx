"use client";

import Link from "next/link";
import { useState } from "react";
import { VehicleCardImage } from "@/components/media/VehicleCardImage";
import { buildVehicleDetailHref } from "@/lib/battery-cta";

export type ApplicableVehicleChip = {
  slug: string;
  title: string;
  fuel?: string;
};

const STRIP_LIMIT = 5;

type Props = {
  vehicles: ApplicableVehicleChip[];
  specCode?: string;
  className?: string;
};

export function ApplicableVehiclesStrip({ vehicles, specCode, className = "" }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (vehicles.length === 0) return null;

  const stripItems = vehicles.slice(0, STRIP_LIMIT);
  const rest = vehicles.slice(STRIP_LIMIT);
  const showRest = expanded && rest.length > 0;

  return (
    <section className={`applicable-vehicles-strip ${className}`} aria-labelledby="applicable-vehicles-title">
      <h2 id="applicable-vehicles-title" className="text-base font-black text-slate-900 lg:text-lg">
        대표 적용 차량
      </h2>
      <p className="mt-1 text-xs font-medium text-slate-500 lg:text-sm">
        연식·트림에 따라 다를 수 있습니다.
      </p>

      {/* 모바일 — 가로 스크롤 compact */}
      <div className="applicable-vehicles-strip__scroll mt-3 flex gap-2.5 overflow-x-auto pb-1 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stripItems.map((v) => (
          <Link
            key={`${v.slug}-${v.title}`}
            href={buildVehicleDetailHref(v.slug, v.fuel)}
            className="applicable-vehicles-strip__card flex w-[8.5rem] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div className="h-[4.5rem] overflow-hidden bg-slate-50">
              <VehicleCardImage slug={v.slug} title={v.title} className="!h-full !min-h-0" />
            </div>
            <div className="px-2 py-2">
              <p className="line-clamp-2 text-[11px] font-bold leading-tight text-slate-800">{v.title}</p>
              {v.fuel ? (
                <p className="mt-0.5 text-[10px] font-semibold text-slate-500">{v.fuel}</p>
              ) : null}
              <span className="mt-1 inline-block text-[10px] font-black text-blue-600">상세 →</span>
            </div>
          </Link>
        ))}
      </div>

      {/* PC — 기존 그리드 유지 */}
      <ul className="mt-4 hidden list-none gap-3 lg:grid lg:grid-cols-2">
        {vehicles.slice(0, 8).map((v) => (
          <li key={v.slug}>
            <Link
              href={buildVehicleDetailHref(v.slug, v.fuel)}
              className="group bm-card-vehicle-match flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-md lg:grid lg:grid-cols-[minmax(0,44%)_56%]"
            >
              <div className="bm-card-horizontal__media !border-0 !p-0">
                <VehicleCardImage slug={v.slug} title={v.title} />
              </div>
              <div className="flex flex-col justify-center border-t border-slate-100 px-3 py-2.5 lg:border-l lg:border-t-0">
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">{v.title}</p>
                {specCode ? (
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">{specCode}</p>
                ) : null}
                <span className="mt-1 inline-block text-xs font-black text-blue-600">차량 상세 보기 →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {rest.length > 0 ? (
        <div className="mt-3 lg:hidden">
          {!expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-xs font-black text-blue-700 underline"
            >
              대표 적용 차량 더보기 ({rest.length}개)
            </button>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {rest.map((v) => (
                  <Link
                    key={`more-${v.slug}`}
                    href={buildVehicleDetailHref(v.slug, v.fuel)}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-800"
                  >
                    {v.title}
                  </Link>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="mt-2 text-xs font-bold text-slate-500 underline"
              >
                접기
              </button>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
