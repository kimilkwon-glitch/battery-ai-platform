"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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

function Panel({ title, children, subtitle }: { title: string; children: ReactNode; subtitle?: string }) {
  return (
    <section className={`${bm.card} ${bm.cardPad}`}>
      <SectionHeader label={subtitle} title={title} />
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

  return (
    <section className="mx-auto grid max-w-[1280px] gap-4 px-0 lg:grid-cols-[260px_minmax(0,1fr)_280px]">
      <aside className="space-y-3 lg:sticky lg:top-[72px] lg:self-start">
        <Panel title="가이드 분류">
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
                    isActive
                      ? "bg-[var(--bm-primary)] text-white shadow-sm"
                      : "bg-slate-50 text-slate-700 ring-1 ring-[var(--bm-border)] hover:bg-blue-50"
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

        <Panel title="빠른 링크">
          <div className="space-y-1.5">
            <Link className={`${bm.btnPrimary} w-full`} href="/vehicles">
              차량 목록
            </Link>
            <Link className={`${bm.btnNavy} w-full`} href="/compare">
              배터리 비교
            </Link>
            <Link className={`${bm.btnSecondary} w-full`} href="/search">
              규격 검색
            </Link>
            <button
              type="button"
              onClick={() => selectCategory("오주문 방지")}
              className={`${bm.btnSecondary} w-full !border-amber-100 !text-amber-900 hover:!bg-amber-50`}
            >
              오주문 방지
            </button>
          </div>
        </Panel>
      </aside>

      <div className="min-w-0 space-y-4">
        <div className={`${bm.heroPanel} ${bm.cardPad}`}>
          <p className={bm.label}>Battery Manager</p>
          <h1 className="mt-1 text-xl font-black text-slate-950">차량별 배터리 가이드</h1>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-[var(--bm-muted)]">
            차량명·연식·연료에 따라 달라지는 배터리 규격과 오주문 방지 포인트를 정리했습니다.
          </p>
        </div>

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
          <Link className={`${bm.btnPrimary} mt-3 w-full`} href="/analysis/photo">
            사진 규격 확인
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
