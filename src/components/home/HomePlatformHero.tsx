"use client";

import Link from "next/link";
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

export function HomePlatformHero() {
  return (
    <section className={`${bm.heroPanel} mb-1`} data-home-section="hero" data-precision-garage="hero">
      <div className={bm.heroPanelAccent}>
        <p className={bm.label}>{BRAND_HERO_LABEL}</p>
        <p className="mt-1 text-[10px] font-semibold text-[var(--bm-muted)]">
          정밀 fitment · 배터리 매칭 플랫폼
        </p>
      </div>
      <div className="grid gap-0 lg:grid-cols-[1fr_minmax(240px,360px)]">
        <div className="order-1 p-5 lg:order-none lg:p-7">
          <h1 className={bm.heroDisplay}>{HOME_HERO.headline}</h1>
          <p className={`mt-3 ${bm.heroLead}`}>{HOME_HERO.subline}</p>
          <p className={`mt-2 text-sm font-medium ${bm.muted}`}>{HOME_HERO.tagline}</p>

          <div className={`${bm.searchInset} mt-5`}>
            <VehicleSearchBox
              className="w-full"
              inputClassName={`${bm.input} !h-12 !border-0 !bg-transparent !shadow-none !ring-0 font-semibold`}
              placeholder="차량명 · AGM80L · 방전 증상"
              showButton
              buttonLabel="검색"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
            <Link className={`${bm.btnNavy} flex-1 text-xs`} href="/vehicles">
              내 차량 확인
            </Link>
            <Link className={`${bm.btnSecondary} flex-1 text-xs`} href={getSearchHref("AGM80L")}>
              규격 검색
            </Link>
          </div>

          <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-[var(--bm-muted)]">검색 유형</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {HOME_SEARCH_TYPE_CHIPS.map((chip) => (
              <Link
                key={chip.label}
                className={
                  chip.tone === "primary"
                    ? "rounded-xl border-2 border-[var(--bm-primary)] bg-blue-50/60 px-3 py-2.5 shadow-[var(--bm-shadow-sm)] transition motion-safe:hover:-translate-y-0.5"
                    : chip.tone === "secondary"
                      ? `${bm.surfaceMuted} px-3 py-2.5 transition motion-safe:hover:border-[var(--bm-primary)]/20`
                      : `${bm.card} px-3 py-2.5 transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[var(--bm-accent)]/30`
                }
                href={chip.href}
              >
                <p
                  className={`text-xs font-bold ${chip.tone === "secondary" ? "text-[var(--bm-muted)]" : "text-[var(--bm-text)]"}`}
                >
                  {chip.label}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-[var(--bm-muted)]">{chip.desc}</p>
              </Link>
            ))}
          </div>

          <p className="mt-4 text-[10px] font-bold text-[var(--bm-muted)]">인기 검색</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {HOME_HERO_EXAMPLES.map((keyword) => (
              <Link key={keyword} className={bm.chipExample} href={getSearchHref(keyword)}>
                {keyword}
              </Link>
            ))}
          </div>

          <div className="mt-4 hidden flex-wrap gap-2 lg:flex">
            <Link className={`${bm.btnNavy} text-xs`} href="/vehicles">
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
        <div className="order-2 border-t border-[var(--bm-border)] p-4 lg:order-none lg:border-l lg:border-t-0 lg:p-5">
          <p className="mb-2 text-[10px] font-bold text-[var(--bm-muted)]">매칭 미리보기 · AGM80L</p>
          <BatteryImageStage code="AGM80L" variant="hero" className="mx-auto max-w-[300px]" />
        </div>
      </div>
    </section>
  );
}
