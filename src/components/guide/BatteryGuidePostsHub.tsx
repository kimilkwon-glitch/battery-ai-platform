"use client";

import { useMemo, useState } from "react";
import { HorizontalScrollIndicator } from "@/components/common/HorizontalScrollIndicator";
import { BatteryGuideCard } from "@/components/guide/BatteryGuideCard";
import { GUIDE_POST_CATEGORY_META, type GuidePost } from "@/data/battery-guide-posts";
import type { GuidePostCategory } from "@/data/battery-guide-posts";
import { useHorizontalScrollIndicator } from "@/hooks/useHorizontalScrollIndicator";
import { guideTagDisplayLabel } from "@/lib/guide/guide-tag-labels";
import { bm } from "@/lib/design-tokens";

type Props = {
  /** 미지정 시 전체 카테고리 */
  category?: GuidePostCategory;
  showHeader?: boolean;
  posts: GuidePost[];
  /** 모바일 가로 스와이프 섹션 제목 */
  listTitle?: string;
};

export function BatteryGuidePostsHub({
  category,
  showHeader = true,
  posts,
  listTitle = "배터리 가이드",
}: Props) {
  const meta = category ? GUIDE_POST_CATEGORY_META[category] : null;
  const allPosts = useMemo(() => posts, [posts]);
  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const p of allPosts) {
      for (const t of p.tags) tagSet.add(t);
    }
    return [...tagSet].sort();
  }, [allPosts]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { scrollRef, metrics } = useHorizontalScrollIndicator<HTMLDivElement>();

  const filteredPosts = useMemo(() => {
    if (!activeTag) return allPosts;
    return allPosts.filter((p) => p.tags.includes(activeTag));
  }, [allPosts, activeTag]);

  return (
    <div className="battery-guide-posts" data-guide-category={category ?? "all"}>
      {showHeader && meta ? (
        <section className={`${bm.card} ${bm.cardPad}`}>
          <p className="text-[10px] font-black uppercase tracking-wide text-blue-700">가이드</p>
          <h2 className="mt-1 text-base font-black text-slate-950">{meta.label}</h2>
          <p className="mt-2 text-sm font-medium text-slate-600">{meta.description}</p>
        </section>
      ) : null}

      {tags.length > 1 ? (
        <div
          className="battery-guide-posts__tags"
          role="tablist"
          aria-label="가이드 주제 필터"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTag === null}
            onClick={() => setActiveTag(null)}
            className={`battery-guide-posts__tag-chip ${
              activeTag === null ? "battery-guide-posts__tag-chip--active" : ""
            }`}
          >
            전체 가이드
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              role="tab"
              aria-selected={activeTag === tag}
              onClick={() => setActiveTag(tag)}
              className={`battery-guide-posts__tag-chip ${
                activeTag === tag ? "battery-guide-posts__tag-chip--active" : ""
              }`}
            >
              {guideTagDisplayLabel(tag)}
            </button>
          ))}
        </div>
      ) : null}

      <section className="battery-guide-posts__list space-y-3">
        <h3 className="battery-guide-posts__list-title text-sm font-black text-slate-900">
          {listTitle}
        </h3>

        {filteredPosts.length === 0 ? (
          <p className="battery-guide-posts__empty rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm font-medium text-slate-500">
            등록된 배터리가이드가 없습니다.
          </p>
        ) : (
          <>
            <div
              ref={scrollRef}
              className="battery-guide-posts__mobile-rail lg:hidden"
              role="region"
              aria-label={`${listTitle} 가로 목록`}
            >
              <div className="battery-guide-posts__mobile-track">
                {filteredPosts.map((post) => (
                  <BatteryGuideCard key={post.id} post={post} className="battery-guide-posts__slide" />
                ))}
              </div>
            </div>
            <HorizontalScrollIndicator
              metrics={metrics}
              className="battery-guide-posts__scroll-indicator lg:hidden"
            />

            <div className="battery-guide-posts__desktop-grid hidden lg:grid">
              {filteredPosts.map((post) => (
                <BatteryGuideCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

