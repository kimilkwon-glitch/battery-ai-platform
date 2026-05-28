"use client";

import Link from "next/link";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";
import { BRAND_HERO_LABEL } from "@/lib/brand";
import { getSearchHref } from "@/lib/battery-search";
import { HUB_PHOTO, HUB_STORE } from "@/lib/customer-hub-routes";
import {
  HOME_HERO,
  HOME_HERO_EXAMPLES,
  HOME_SEARCH_TYPE_CHIPS,
} from "@/lib/home-upgrade-v2-data";
import { HOME_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import { bm } from "@/lib/design-tokens";

export function HomePlatformHero() {
  return (
    <section className={bm.heroPanel} data-home-section="hero">
      <div className="border-b border-blue-50/80 bg-gradient-to-r from-blue-50/50 to-white px-5 py-2.5 lg:px-7">
        <p className="text-[11px] font-bold tracking-wide text-[#2563EB]">{BRAND_HERO_LABEL}</p>
      </div>
      <div className="grid gap-0 lg:grid-cols-[1fr_minmax(240px,360px)]">
        <div className="p-5 lg:p-7">
          <h1 className="text-2xl font-bold leading-[1.25] tracking-[-0.03em] text-[#0F172A] sm:text-[1.75rem]">
            {HOME_HERO.headline}
          </h1>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">{HOME_HERO.subline}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{HOME_HERO.tagline}</p>

          <VehicleSearchBox
            className="mt-5"
            inputClassName={`${bm.input} h-12 font-semibold`}
            placeholder="차량명 · 배터리 규격 · 증상 검색"
            showButton
            buttonLabel="검색"
          />

          <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">검색 유형</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {HOME_SEARCH_TYPE_CHIPS.map((chip) => (
              <Link
                key={chip.label}
                className={
                  chip.tone === "primary"
                    ? "rounded-xl border-2 border-[var(--bm-primary)] bg-blue-50/40 px-3 py-2.5 transition hover:bg-blue-50"
                    : chip.tone === "secondary"
                      ? "rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 transition hover:border-slate-300"
                      : "rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition hover:border-blue-200 hover:bg-blue-50/30"
                }
                href={chip.href}
              >
                <p
                  className={`text-xs font-bold ${chip.tone === "secondary" ? "text-slate-600" : "text-slate-900"}`}
                >
                  {chip.label}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-500">{chip.desc}</p>
              </Link>
            ))}
          </div>

          <p className="mt-4 text-[10px] font-bold text-slate-400">대표 예시 검색</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {HOME_HERO_EXAMPLES.map((keyword) => (
              <Link
                key={keyword}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                href={getSearchHref(keyword)}
              >
                {keyword}
              </Link>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link className={`${bm.btnPrimary} text-xs`} href="/vehicles">
              내 차량 기준으로 확인
            </Link>
            <Link className={`${bm.btnSecondary} text-xs`} href={HUB_STORE}>
              부산 매장·출장 문의
            </Link>
            <Link className={`${bm.btnGhost} text-xs`} href={HUB_PHOTO}>
              사진으로 최종 확인
            </Link>
          </div>
        </div>
        <div className="border-t border-slate-100 p-4 lg:border-l lg:border-t-0 lg:p-5">
          <p className="mb-2 text-[10px] font-bold text-slate-500">플랫폼 미리보기</p>
          <MediaImageSlot slot={HOME_IMAGE_SLOTS.heroMatching()} />
        </div>
      </div>
    </section>
  );
}
