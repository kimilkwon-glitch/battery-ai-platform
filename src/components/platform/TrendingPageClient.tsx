"use client";

import Link from "next/link";
import { useState } from "react";
import { PortalHeader } from "@/components/portal";
import { SmartNextActions } from "@/components/common/SmartNextActions";
import { bm } from "@/lib/design-tokens";
import {
  TrendingBatteryGrid,
  TrendingHeroIssues,
  TrendingPhotoReviewSection,
  TrendingSearchPatterns,
  TrendingSeasonalGrid,
  TrendingSidebar,
  TrendingTopicsSection,
  TrendingVehicleGrid,
} from "@/components/platform/TrendingSections";
import {
  BRAND_TRENDING_LABEL,
  trendingBatteryHighlights,
  trendingFeaturedTopics,
  trendingHeroIssues,
  trendingPhotoReviewItems,
  trendingPopularSpecs,
  trendingQuickLinks,
  trendingSearchPatterns,
  trendingSeasonalIssues,
  trendingTodaySummary,
  trendingVehicleHighlights,
} from "@/lib/trending-hub-data";

function CollapsibleBlock({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <h2 className="text-sm font-black text-slate-900">{title}</h2>
        <span className="text-[10px] font-black text-blue-600">{open ? "접기" : "더보기"}</span>
      </button>
      {open ? <div className="border-t border-slate-100 px-4 pb-4 pt-2">{children}</div> : null}
    </section>
  );
}

export function TrendingPageClient() {
  const featuredTopics = trendingFeaturedTopics.filter((t) => t.featured);
  const restTopics = trendingFeaturedTopics.filter((t) => !t.featured);

  return (
    <main className={bm.pageBg}>
      <PortalHeader title="배터리 트렌드·주의" showSearch searchPlaceholder="차량·규격·증상 검색" />
      <section className={`relative z-0 ${bm.pageContainer} scroll-mt-24`}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#2563EB]">{BRAND_TRENDING_LABEL}</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0F172A] sm:text-[1.65rem]">
              배터리 트렌드·주의 이슈
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
              최근 검색·차량 조회에서 자주 확인되는 이슈를 요약했습니다.
            </p>
          </div>
        </div>

        <div className="mb-5">
          <p className="mb-3 text-[11px] font-black text-blue-600">핵심 이슈</p>
          <TrendingHeroIssues items={trendingHeroIssues.slice(0, 3)} />
        </div>

        <div className="mb-5">
          <p className="mb-3 text-[11px] font-black text-amber-700">주의·계절 이슈</p>
          <TrendingSeasonalGrid items={trendingSeasonalIssues.slice(0, 4)} />
        </div>

        <div className="mb-5">
          <p className="mb-3 text-[11px] font-black text-slate-600">사진 확인이 자주 필요한 차량</p>
          <TrendingPhotoReviewSection items={trendingPhotoReviewItems.slice(0, 4)} compact />
        </div>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-black text-slate-900">빠른 이동</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {trendingQuickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="order-1 space-y-4 lg:order-1">
            <CollapsibleBlock title="오늘 많이 찾는 주제">
              <TrendingTopicsSection featured={featuredTopics} rest={restTopics} />
            </CollapsibleBlock>

            <CollapsibleBlock title="최근 많이 확인된 차량 · 배터리">
              <div className="grid gap-4 lg:grid-cols-2">
                <TrendingVehicleGrid items={trendingVehicleHighlights} />
                <TrendingBatteryGrid items={trendingBatteryHighlights} />
              </div>
            </CollapsibleBlock>

            <CollapsibleBlock title="최근 검색 패턴">
              <TrendingSearchPatterns items={trendingSearchPatterns} />
            </CollapsibleBlock>

            <SmartNextActions context={{ type: "trending", batteryCode: "AGM80L" }} limit={4} />
          </div>

          <div className="order-2 lg:order-2">
            <CollapsibleBlock title="오늘의 요약 · 많이 찾는 규격" defaultOpen>
              <TrendingSidebar
                summary={trendingTodaySummary}
                specs={trendingPopularSpecs}
                quickLinks={[]}
                hideQuickLinks
              />
            </CollapsibleBlock>
          </div>
        </div>

        <nav className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-400">
          <Link href="/" className="hover:text-blue-600">
            홈
          </Link>
          <span>›</span>
          <span className="text-slate-600">트렌드·주의</span>
        </nav>
      </section>
    </main>
  );
}
