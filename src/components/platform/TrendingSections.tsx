"use client";

import Link from "next/link";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { BatteryMiniThumb } from "@/components/BatteryThumbnail";
import { carImageForPlatformVehicleId } from "@/lib/car-data";
import { getBattery } from "@/lib/platform-data";
import {
  BADGE_TONE,
  type TrendBadge,
  type TrendBatteryItem,
  type TrendHeroIssue,
  type TrendPhotoReviewItem,
  type TrendSearchPattern,
  type TrendSeasonalItem,
  type TrendTopicItem,
  type TrendVehicleItem,
} from "@/lib/trending-hub-data";

function TypeBadge({ badge }: { badge: TrendBadge }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-black ring-1 ${BADGE_TONE[badge]}`}>
      {badge}
    </span>
  );
}

export function TrendingHeroIssues({ items }: { items: TrendHeroIssue[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="group flex flex-col rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/50 p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
        >
          <TypeBadge badge={item.badge} />
          <h2 className="mt-3 text-lg font-black text-slate-900 group-hover:text-blue-700">{item.title}</h2>
          <p className="mt-1.5 flex-1 text-sm font-medium leading-relaxed text-slate-600">{item.description}</p>
          <span className="mt-4 inline-flex w-fit rounded-lg bg-[#1D4ED8] px-3 py-2 text-xs font-black text-white group-hover:bg-blue-700">
            {item.buttonLabel}
          </span>
        </Link>
      ))}
    </section>
  );
}

export function TrendingTopicsSection({ featured, rest }: { featured: TrendTopicItem[]; rest: TrendTopicItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-black text-blue-600">주제</p>
          <h2 className="text-lg font-black text-slate-900">오늘 많이 찾는 주제</h2>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {featured.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm"
          >
            <TypeBadge badge={item.badge} />
            <h3 className="mt-2 text-base font-black text-slate-900 group-hover:text-blue-700">{item.label}</h3>
            <p className="mt-1 flex-1 text-sm font-medium text-slate-500">{item.description}</p>
            <span className="mt-3 text-xs font-bold text-blue-600">안내 보기 →</span>
          </Link>
        ))}
      </div>

      {rest.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {rest.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-800">{item.label}</p>
                <p className="text-xs font-medium text-slate-500">{item.description}</p>
              </div>
              <TypeBadge badge={item.badge} />
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function VehicleThumb({ vehicleId, label }: { vehicleId: string; label: string }) {
  const src = carImageForPlatformVehicleId(vehicleId);
  return (
    <VehicleCardMedia
      alt={label}
      placeholderTitle={label}
      slug={vehicleId}
      src={src}
      variant="thumb"
    />
  );
}

export function TrendingVehicleGrid({ items }: { items: TrendVehicleItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-black text-slate-900">최근 많이 확인된 차량</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.vehicleId}
            href={item.href}
            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:border-blue-200 hover:bg-white hover:shadow-sm"
          >
            <VehicleThumb vehicleId={item.vehicleId} label={item.label} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-900">{item.label}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">{item.reason}</p>
              <p className="mt-1 text-[11px] font-bold text-blue-600">{item.batteryHint}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function TrendingBatteryGrid({ items }: { items: TrendBatteryItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-black text-slate-900">요즘 많이 찾은 배터리</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const bat = getBattery(item.code);
          const hasImage = Boolean(bat.images?.main);
          return (
            <Link
              key={item.code}
              href={item.href}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:border-blue-200 hover:bg-white hover:shadow-sm"
            >
              <div className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                {hasImage ? (
                  <BatteryMiniThumb code={item.code} imageSet={bat.images} role="main" className="h-12 w-full" />
                ) : (
                  <span className="text-[10px] font-black text-slate-400">{item.code}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-900">{item.label}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">{item.reason}</p>
                <p className="mt-1 text-[10px] font-semibold text-slate-400">{item.relatedVehicles}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function TrendingPhotoReviewSection({
  items,
  compact = false,
}: {
  items: TrendPhotoReviewItem[];
  compact?: boolean;
}) {
  const inner = (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"}`}>
        {items.map((item) => (
          <Link
            key={item.vehicleId}
            href={item.href}
            className="flex items-start gap-3 rounded-xl border border-amber-100/80 bg-white/90 p-3 transition hover:border-amber-200 hover:shadow-sm"
          >
            <VehicleThumb vehicleId={item.vehicleId} label={item.label} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-900">{item.label}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-600">{item.reason}</p>
              <span className="mt-2 inline-block text-xs font-black text-blue-600">확인 방법 보기 →</span>
            </div>
          </Link>
        ))}
    </div>
  );

  if (compact) return inner;

  return (
    <section className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 via-white to-blue-50/30 p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-black text-slate-900">사진 확인이 자주 필요한 차량</h2>
          <TypeBadge badge="확인 권장" />
        </div>
        <p className="mt-1 text-sm font-medium text-slate-600">
          단자 방향, 연식, 트림에 따라 규격이 달라질 수 있는 차량입니다.
        </p>
      </div>
      {inner}
    </section>
  );
}

export function TrendingSearchPatterns({ items }: { items: TrendSearchPattern[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-black text-slate-900">최근 검색 패턴</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <span className="text-sm font-bold text-slate-800">{item.label}</span>
            <TypeBadge badge={item.badge} />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function TrendingSeasonalGrid({ items }: { items: TrendSeasonalItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-black text-slate-900">주의 · 계절 이슈</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-3">
            <p className="text-sm font-black text-slate-900">{item.title}</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{item.description}</p>
            <Link href={item.href} className="mt-2 inline-block text-xs font-black text-blue-600 hover:underline">
              {item.guideLabel} →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TrendingSidebar({
  summary,
  specs,
  quickLinks,
  hideQuickLinks = false,
}: {
  summary: readonly string[];
  specs: readonly { code: string; href: string }[];
  quickLinks: readonly { label: string; href: string }[];
  hideQuickLinks?: boolean;
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-[calc(3.5rem+1px)] lg:h-fit">
      <SidebarPanel title="오늘의 요약">
        <ul className="space-y-2">
          {summary.map((line) => (
            <li key={line} className="flex gap-2 text-sm font-medium text-slate-700">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-500" />
              {line}
            </li>
          ))}
        </ul>
      </SidebarPanel>

      <SidebarPanel title="많이 찾는 규격">
        <div className="flex flex-wrap gap-1.5">
          {specs.map((spec) => (
            <Link
              key={spec.code}
              href={spec.href}
              className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-black text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {spec.code}
            </Link>
          ))}
        </div>
      </SidebarPanel>

      {!hideQuickLinks && quickLinks.length > 0 ? (
        <SidebarPanel title="빠른 이동">
          <div className="space-y-1.5">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-2 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
              >
                {link.label} →
              </Link>
            ))}
          </div>
        </SidebarPanel>
      ) : null}
    </aside>
  );
}

function SidebarPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 border-b border-slate-100 pb-2 text-sm font-black text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

export function TrendingNextActions({
  actions,
}: {
  actions: readonly { title: string; description: string; href: string }[];
}) {
  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
      <h2 className="mb-3 text-sm font-black text-slate-900">바로 이어서 확인하기</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href + action.title}
            href={action.href}
            className="rounded-xl border border-white bg-white p-3 shadow-sm transition hover:border-blue-200 hover:shadow-md"
          >
            <p className="text-sm font-black text-slate-900">{action.title}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{action.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
