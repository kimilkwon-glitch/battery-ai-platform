"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GUIDE_POST_CATEGORY_META } from "@/data/battery-guide-posts";
import {
  listGuidePostTags,
  listPublishedGuidePosts,
} from "@/lib/guide/battery-guide-posts";
import type { GuidePostCategory } from "@/data/battery-guide-posts";
import { bm } from "@/lib/design-tokens";

type Props = {
  category: GuidePostCategory;
  /** 기존 상단 안내(짧게) 아래에 목록만 붙일 때 */
  showHeader?: boolean;
};

export function BatteryGuidePostsHub({ category, showHeader = true }: Props) {
  const meta = GUIDE_POST_CATEGORY_META[category];
  const allPosts = useMemo(() => listPublishedGuidePosts(category), [category]);
  const tags = useMemo(() => listGuidePostTags(category), [category]);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const posts = useMemo(() => {
    if (!activeTag) return allPosts;
    return allPosts.filter((p) => p.tags.includes(activeTag));
  }, [allPosts, activeTag]);

  return (
    <div className="battery-guide-posts space-y-4" data-guide-category={category}>
      {showHeader ? (
        <section className={`${bm.card} ${bm.cardPad}`}>
          <p className="text-[10px] font-black uppercase tracking-wide text-blue-700">
            가이드
          </p>
          <h2 className="mt-1 text-base font-black text-slate-950">{meta.label}</h2>
          <p className="mt-2 text-sm font-medium text-slate-600">{meta.description}</p>
        </section>
      ) : null}

      {tags.length > 1 ? (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${
              activeTag === null
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            전체
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                activeTag === tag
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-black text-slate-900">가이드 글</h3>
        {posts.length === 0 ? (
          <p className="text-xs font-medium text-slate-500">등록된 글이 없습니다.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/guide/battery/${post.id}`}
                  className={`${bm.cardInteractive} block h-full p-4`}
                >
                  <p className="text-[10px] font-bold text-slate-400">
                    {post.updatedAt.slice(0, 10)}
                  </p>
                  <h4 className="mt-1 text-sm font-black text-slate-900">{post.title}</h4>
                  <p className="mt-2 line-clamp-2 text-xs font-medium text-slate-600">
                    {post.summary}
                  </p>
                  {post.tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {post.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
