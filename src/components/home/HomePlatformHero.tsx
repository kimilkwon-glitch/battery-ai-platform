"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Battery,
  Camera,
  Car,
  Search,
} from "lucide-react";
import { BatteryImageStage } from "@/components/media/BatteryImageStage";
import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";
import { BRAND_HERO_LABEL } from "@/lib/brand";
import { getSearchHref } from "@/lib/battery-search";
import { HUB_PHOTO, HUB_STORE } from "@/lib/customer-hub-routes";
import {
  HOME_HERO,
  HOME_HERO_EXAMPLES,
  HOME_SEARCH_TYPE_CHIPS,
} from "@/lib/home-upgrade-v2-data";
import { bm } from "@/lib/design-tokens";

const CHIP_ICONS = {
  "차량명 검색": Car,
  "배터리 규격 검색": Battery,
  "증상 진단": AlertTriangle,
  "사진 확인": Camera,
} as const;

export function HomePlatformHero() {
  return (
    <div className={bm.heroDark} data-home-section="hero" data-precision-garage="hero">
      <div className={`${bm.heroDarkAccent} px-5 py-3 lg:px-7`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-sky-200">{BRAND_HERO_LABEL}</p>
        <p className="mt-1 text-[10px] font-semibold text-slate-300">
          정밀 fitment · 배터리 매칭 플랫폼
        </p>
      </div>
      <div className="grid gap-0 lg:grid-cols-[1fr_minmax(240px,320px)]">
        <div className="order-1 p-5 lg:order-none lg:p-7">
          <h1 className="bm-section-title text-[1.65rem] leading-[1.25] text-slate-50 sm:text-[2rem] lg:text-[2.1rem]">
            {HOME_HERO.headline}
          </h1>
          <p className={`mt-3 ${bm.heroLeadP2}`}>{HOME_HERO.subline}</p>
          <p className="mt-2 text-sm font-medium text-slate-300">{HOME_HERO.tagline}</p>

          <div className={`bm-hero-search-shell mt-5`}>
            <VehicleSearchBox
              className="w-full"
              inputClassName="h-11 w-full rounded-lg border-0 bg-white px-3 text-sm font-semibold text-slate-900 outline-none ring-0 placeholder:text-slate-500"
              placeholder="차량명 · AGM80L · 방전 증상"
              showButton
              buttonLabel="검색"
              shimmerSubmit
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
            <Link className={`${bm.btnNavy} flex-1 text-xs`} href="/vehicles">
              내 차량 확인
            </Link>
            <Link className={`${bm.btnSecondary} flex-1 text-xs !text-slate-900`} href={getSearchHref("AGM80L")}>
              규격 검색
            </Link>
          </div>

          <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-slate-300">검색 유형</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {HOME_SEARCH_TYPE_CHIPS.map((chip) => {
              const Icon = CHIP_ICONS[chip.label as keyof typeof CHIP_ICONS] ?? Search;
              return (
                <Link
                  key={chip.label}
                  className={`bm-hero-chip ${chip.tone === "primary" ? "bm-hero-chip--primary" : ""}`}
                  href={chip.href}
                >
                  <span className="flex items-center gap-2">
                    <span className="bm-icon-pill" aria-hidden>
                      <Icon className="size-3.5" strokeWidth={2.5} />
                    </span>
                    <span>
                      <span className="bm-hero-chip__title">{chip.label}</span>
                      <span className="bm-hero-chip__desc mt-0.5 block">{chip.desc}</span>
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          <p className="mt-4 text-[10px] font-bold text-slate-300">인기 검색</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {HOME_HERO_EXAMPLES.map((keyword) => (
              <Link
                key={keyword}
                className="rounded-full border border-slate-500/50 bg-slate-800/50 px-3 py-1.5 text-[11px] font-bold text-slate-100 transition hover:border-sky-400/60 hover:bg-slate-700/80"
                href={getSearchHref(keyword)}
              >
                {keyword}
              </Link>
            ))}
          </div>

          <div className="mt-4 hidden flex-wrap gap-2 lg:flex">
            <Link className={`${bm.btnNavy} text-xs`} href="/vehicles">
              내 차량 기준으로 확인
            </Link>
            <Link
              className={`${bm.btnSecondary} text-xs !bg-white !text-slate-900 hover:!bg-slate-50`}
              href={HUB_STORE}
            >
              부산 매장·출장 문의
            </Link>
            <Link
              className={`${bm.btnGhost} text-xs !text-slate-200 !ring-slate-500 hover:!bg-slate-800/60 hover:!text-white`}
              href={HUB_PHOTO}
            >
              사진으로 최종 확인
            </Link>
          </div>
        </div>
        <div className="order-2 border-t border-slate-600/40 bg-slate-900/20 p-4 lg:order-none lg:border-l lg:border-t-0 lg:p-5">
          <p className="mb-2 text-[10px] font-bold text-slate-300">매칭 미리보기 · AGM80L</p>
          <BatteryImageStage code="AGM80L" variant="hero" className="mx-auto max-w-[280px]" />
        </div>
      </div>
    </div>
  );
}
