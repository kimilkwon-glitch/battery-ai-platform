"use client";

import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { bm } from "@/lib/design-tokens";
import { storeLinks } from "@/lib/external-links";
import { getSearchHref } from "@/lib/battery-search";
import { HUB_PHOTO, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

const WORK_CASE_LINKS = [
  {
    store: "덕천점",
    blog: storeLinks.deokcheon.blog,
    label: "덕천점 블로그 후기 보기",
  },
  {
    store: "학장점",
    blog: storeLinks.hakjang.blog,
    label: "학장점 블로그 후기 보기",
  },
] as const;

const FEATURED_VEHICLES = [
  { title: "포터2 · 90R/100R", href: getSearchHref("포터2 배터리") },
  { title: "쏘렌토 MQ4 · 연료별", href: getSearchHref("쏘렌토 MQ4") },
  { title: "스포티지 NQ5 하이브리드", href: getSearchHref("스포티지 NQ5 하이브리드") },
] as const;

export function ReviewsPageClient({ initialBattery }: { initialBattery?: string }) {
  return (
    <div className="reviews-page bm-zone bm-zone--review space-y-6">
      {initialBattery ? (
        <p className="text-sm font-bold text-[var(--color-accent-review)]">
          {initialBattery} 관련 작업 사례 —{" "}
          <Link href="/reviews" className="font-semibold text-slate-500 hover:underline">
            전체 안내
          </Link>
        </p>
      ) : null}

      <section className={`${bm.card} ${bm.cardPad}`}>
        <p className={bm.intentBadge}>작업 사례 · 고객 후기</p>
        <h2 className={`${bm.sectionTitle} mt-2`}>실제 작업 기준으로 정리했습니다</h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          실제 작업 사례와 고객 문의가 많은 차량을 기준으로 정리했습니다. 블로그·매장 상담에서 현장
          사진과 교체 과정을 확인할 수 있습니다.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {WORK_CASE_LINKS.map((item) => (
          <a
            key={item.store}
            href={item.blog}
            target="_blank"
            rel="noopener noreferrer"
            className={`${bm.cardInteractive} flex flex-col p-4`}
          >
            <AppIcon iconKey="guide" size="md" />
            <p className="mt-2 text-sm font-black text-slate-900">{item.label}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">네이버 블로그 · 현장 작업 사진</p>
          </a>
        ))}
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h3 className="text-sm font-black text-slate-900">자주 문의되는 차량</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {FEATURED_VEHICLES.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 ring-1 ring-slate-200 hover:bg-white"
            >
              {v.title}
            </Link>
          ))}
        </div>
      </section>

      <section className={bm.platformStrip}>
        <p className={bm.label}>다음 행동</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className={`${bm.btnNavy} inline-flex items-center gap-1.5 text-xs`} href="/vehicles">
            <AppIcon iconKey="vehicle" size="sm" className="!text-white" />
            내 차 배터리 상담하기
          </Link>
          <Link className={`${bm.btnSecondary} inline-flex items-center gap-1.5 text-xs`} href={HUB_PHOTO}>
            <AppIcon iconKey="photoCheck" size="sm" />
            사진으로 확인
          </Link>
          <Link className={`${bm.btnTertiary} inline-flex text-xs`} href={HUB_STORE_DETAIL}>
            매장·택배 상담
          </Link>
          <Link className={`${bm.btnTertiary} inline-flex text-xs`} href="/guides">
            작업 사례 보러가기
          </Link>
        </div>
      </section>
    </div>
  );
}
