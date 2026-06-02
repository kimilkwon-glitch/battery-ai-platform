"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { GuideTeaserCard } from "@/components/battery/GuideTeaserCard";
import { BrandNoteStrip } from "@/components/battery/BrandNoteStrip";
import { listContentGuideTeasers } from "@/data/battery/contentGuides";
import { GuideCard } from "@/components/common/GuideCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { bm } from "@/lib/design-tokens";
import {
  CATEGORY_PREVIEW_LIMIT,
  GUIDE_FILTER_CATEGORIES,
  type Article,
  type GuideCategory,
  type GuideFilterKey,
  getAllArticles,
  getArticlesByCategory,
  getCategoryPreviewSections,
  getFeaturedGuides,
  getGuideCategoryCount,
  getRecentGuides,
  parseGuideFilterKey,
} from "@/lib/content";

import type { IconKey } from "@/lib/icon-map";

function Panel({
  title,
  children,
  subtitle,
  iconKey,
}: {
  title: string;
  children: ReactNode;
  subtitle?: string;
  iconKey?: IconKey;
}) {
  return (
    <section className={`${bm.card} ${bm.cardPad}`}>
      <SectionHeader label={subtitle} title={title} iconKey={iconKey} />
      {children}
    </section>
  );
}

function GuideGrid({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <p className="py-8 text-center text-sm font-semibold text-[var(--bm-muted)]">해당 카테고리에 등록된 가이드가 없습니다.</p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {articles.map((article) => (
        <GuideCard article={article} key={article.id} />
      ))}
    </div>
  );
}

export function GuidesHubClient({ initialCategory }: { initialCategory?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [active, setActive] = useState<GuideFilterKey>(() =>
    parseGuideFilterKey(initialCategory ?? searchParams.get("category")),
  );

  useEffect(() => {
    setActive(parseGuideFilterKey(searchParams.get("category") ?? initialCategory));
  }, [searchParams, initialCategory]);

  const selectCategory = useCallback(
    (key: GuideFilterKey) => {
      setActive(key);
      const params = new URLSearchParams(searchParams.toString());
      if (key === "all") params.delete("category");
      else params.set("category", key);
      const qs = params.toString();
      router.replace(qs ? `/guides?${qs}` : "/guides", { scroll: false });
    },
    [router, searchParams],
  );

  const allArticles = useMemo(() => getAllArticles(), []);
  const totalCount = allArticles.length;

  const recentGuides = useMemo(() => getRecentGuides(), []);
  const recentIds = useMemo(() => new Set(recentGuides.map((a) => a.id)), [recentGuides]);

  const featuredGuides = useMemo(() => getFeaturedGuides(recentIds), [recentIds]);
  const featuredIds = useMemo(() => new Set(featuredGuides.map((a) => a.id)), [featuredGuides]);

  const shownIds = useMemo(() => new Set([...recentIds, ...featuredIds]), [recentIds, featuredIds]);

  const categoryPreviews = useMemo(() => getCategoryPreviewSections(shownIds), [shownIds]);

  const filteredArticles = useMemo(() => {
    if (active === "all") return [];
    return getArticlesByCategory(active as GuideCategory);
  }, [active]);

  const activeLabel = GUIDE_FILTER_CATEGORIES.find((c) => c.key === active)?.label ?? "전체 가이드";

  const symptomTopics = [
    { label: "완전방전", href: "/symptoms" },
    { label: "시동지연", href: "/symptoms" },
    { label: "블랙박스 방전", href: "/diagnosis/blackbox-drain" },
    { label: "장기주차 방전", href: "/symptoms" },
    { label: "AGM 배터리 차이", href: "/guides/knowledge/bk-agm-vs-din" },
    { label: "하이브리드 보조배터리", href: "/guides/knowledge/bk-ev-aux-12v" },
    { label: "배터리 규격 보는 법", href: "/guide/spec" },
    { label: "주문 전 확인사항", href: "/order-checklist" },
  ] as const;

  const quickTopics = [
    { label: "자주 묻는 질문", href: "/qa" },
    { label: "오주문 방지", href: "/guides?category=오주문 방지" },
    { label: "AGM/DIN 차이", href: "/guides/knowledge/bk-agm-vs-din" },
    { label: "L/R 단자", href: "/guide/spec" },
    { label: "포터2 90R/100R", href: "/guides/porter2-year-battery-guide" },
    { label: "EV 보조 12V", href: "/guides/knowledge/bk-ev-aux-12v" },
    { label: "용량 업그레이드", href: "/compare" },
    { label: "택배·반납 안내", href: "/shop#order-check" },
  ] as const;

  return (
    <section className={`${bm.hubCatalog} mx-auto grid max-w-[1280px] gap-4 px-0 lg:grid-cols-[260px_minmax(0,1fr)_280px]`}>
      <aside className="space-y-3 lg:sticky lg:top-[72px] lg:self-start">
        <Panel title="가이드 분류" iconKey="guide">
          <div className="space-y-1.5">
            {GUIDE_FILTER_CATEGORIES.map((cat) => {
              const isActive = active === cat.key;
              const count = cat.key === "all" ? totalCount : getGuideCategoryCount(cat.key as GuideCategory);
              return (
                <button
                  type="button"
                  key={cat.key}
                  onClick={() => selectCategory(cat.key)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-black transition ${
                    isActive ? bm.tabBtnActive : bm.tabBtn
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`shrink-0 text-[10px] font-semibold ${isActive ? "text-white/80" : "text-slate-400"}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel title="관련 안내" iconKey="route">
          <div className="space-y-1.5">
            <Link className={`${bm.btnNavy} w-full`} href="/order-checklist">
              오주문 방지 체크
            </Link>
            <Link className={`${bm.btnNavy} w-full`} href="/symptoms">
              증상 진단
            </Link>
            <Link className={`${bm.btnSecondary} w-full`} href="/photo-check">
              사진 확인 안내
            </Link>
            <Link className={`${bm.btnSecondary} w-full`} href="/service-center">
              매장·출장 안내
            </Link>
            <Link className={`${bm.btnSecondary} w-full`} href="/shop">
              택배주문
            </Link>
            <Link className={`${bm.btnSecondary} w-full`} href="/compare">
              규격 비교
            </Link>
            <button
              type="button"
              onClick={() => selectCategory("오주문 방지")}
              className={`${bm.btnGhost} w-full !text-amber-900`}
            >
              가이드: 오주문 방지 글
            </button>
          </div>
        </Panel>
      </aside>

      <div className="min-w-0 space-y-4">
        <div className={`${bm.heroPanel} ${bm.cardPad}`}>
          <p className={bm.label}>불안 제거 센터</p>
          <h1 className={`${bm.heroDisplay} mt-2 text-xl sm:text-2xl`}>배터리 선택 전, 여기서 먼저 확인</h1>
          <p className={`mt-3 ${bm.heroLead} text-sm sm:text-base`}>
            차종·연식·연료·단자 방향 때문에 헷갈리는 포인트를 고객 언어로 정리했습니다.
          </p>
          <p className={`mt-2 ${bm.textSub} text-xs`}>
            가이드 → 규격 상세 → Q&A → 사진 확인 순으로 이어가면 오주문을 줄일 수 있습니다.
          </p>
        </div>

        <section className={`${bm.card} ${bm.cardPad}`}>
          <SectionHeader
            label="증상·주문 전 확인"
            title="검색창이 아닌 가이드에서 확인할 주제"
            description="완전방전·시동지연 등은 메인 검색 자동완성에 넣지 않고, 여기서 안내합니다."
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {symptomTopics.map((t) => (
              <Link
                key={t.label}
                href={t.href}
                className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </section>

        <section className={`${bm.card} ${bm.cardPad}`}>
          <SectionHeader label="주제별 바로가기" title="배터리 가이드 주제" />
          <div className="mt-3 flex flex-wrap gap-2">
            {quickTopics.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-800"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </section>

        <section className={`${bm.card} ${bm.cardPad}`} id="battery-knowledge">
          <SectionHeader
            label="배터리 기본 안내"
            title="교체·비교 전 알아두면 좋은 10가지"
            description="목적형 이미지 슬롯 — 직접 제작한 사진을 나중에 연결할 수 있습니다."
          />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {listContentGuideTeasers().map((g) => (
              <GuideTeaserCard guide={g} key={g.id} />
            ))}
          </div>
        </section>

        <BrandNoteStrip compact />

        {active === "all" ? (
          <>
            <Panel subtitle="최신" title="최근 추가된 가이드">
              <GuideGrid articles={recentGuides} />
            </Panel>

            <Panel subtitle="실무 추천" title="추천 가이드">
              <GuideGrid articles={featuredGuides} />
            </Panel>

            {categoryPreviews.map(({ category, items }) => (
              <Panel key={category} subtitle={category} title={category}>
                <GuideGrid articles={items} />
                {getGuideCategoryCount(category) > CATEGORY_PREVIEW_LIMIT ? (
                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      onClick={() => selectCategory(category)}
                      className="text-xs font-black text-[var(--bm-primary)] hover:underline"
                    >
                      {category} 전체 보기 →
                    </button>
                  </div>
                ) : null}
              </Panel>
            ))}
          </>
        ) : (
          <Panel subtitle="카테고리" title={activeLabel}>
            <p className="-mt-2 mb-4 text-xs font-semibold text-[var(--bm-muted)]">
              {filteredArticles.length}개의 가이드 · 차종·연식·규격 기준 실무 안내입니다.
            </p>
            <GuideGrid articles={filteredArticles} />
          </Panel>
        )}
      </div>

      <aside className="space-y-3 lg:sticky lg:top-[72px] lg:self-start">
        <section className={`${bm.card} ${bm.cardPad}`}>
          <p className={bm.label}>오주문 방지</p>
          <h2 className="mt-1 text-sm font-black text-slate-950">사진으로 규격 확인</h2>
          <p className="mt-2 text-[11px] font-semibold leading-relaxed text-[var(--bm-muted)]">
            배터리 상단 라벨, 단자 방향, 장착 위치를 보면 오주문을 줄일 수 있습니다.
          </p>
          <Link className={`${bm.btnSecondary} mt-3 w-full`} href="/analysis/photo">
            사진 규격 확인
          </Link>
          <Link className={`${bm.btnNavy} mt-2 w-full`} href="/vehicles">
            내 차량 기준 확인
          </Link>
          <button
            type="button"
            onClick={() => selectCategory("오주문 방지")}
            className="mt-2 block text-[10px] font-black text-[var(--bm-muted)] hover:text-[var(--bm-primary)] hover:underline"
          >
            오주문 방지 가이드 모음 →
          </button>
        </section>

        <section className={`${bm.card} ${bm.cardPad} bg-blue-50/40`}>
          <p className="text-[11px] font-black text-slate-500">규격 이해</p>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">
            AGM/DIN, CCA/Ah, L/R 단자 등 기본 규격은 규격 가이드에서 확인할 수 있습니다.
          </p>
          <Link className="mt-2 inline-block text-[10px] font-black text-[var(--bm-primary)] hover:underline" href="/guide/spec">
            배터리 규격 가이드 →
          </Link>
        </section>
      </aside>
    </section>
  );
}
