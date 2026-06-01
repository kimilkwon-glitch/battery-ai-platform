"use client";

import Link from "next/link";
import {
  BATTERY_GUIDE_POSTS,
  GUIDE_POST_CATEGORY_META,
  type GuidePostCategory,
} from "@/data/battery-guide-posts";
import { bm } from "@/lib/design-tokens";

/** data 파일 기반 가이드 — 향후 DB/API·콘텐츠 워크벤치 연동 */
export function AdminBatteryGuidePostsPanel() {
  const byCategory = (cat: GuidePostCategory) =>
    BATTERY_GUIDE_POSTS.filter((p) => p.category === cat);

  return (
    <section className={`${bm.card} ${bm.cardPad} mt-8`} id="admin-battery-guide-posts">
      <h2 className="text-sm font-black text-slate-900">배터리 가이드 콘텐츠 (data 파일)</h2>
      <p className="mt-1 text-xs font-medium text-slate-600">
        게시 글은 <code className="text-[10px]">src/data/battery-guide-posts.ts</code> 에서
        관리합니다. DB 연동 전까지 이 목록이 고객 4개 가이드 허브에 반영됩니다.
      </p>
      <div className="mt-4 space-y-4">
        {(Object.keys(GUIDE_POST_CATEGORY_META) as GuidePostCategory[]).map((cat) => {
          const meta = GUIDE_POST_CATEGORY_META[cat];
          const posts = byCategory(cat);
          return (
            <div key={cat} className="rounded-xl border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-black text-slate-800">{meta.label}</p>
                <Link href={meta.hubPath} className="text-[10px] font-bold text-blue-700 hover:underline">
                  고객 페이지 →
                </Link>
              </div>
              <ul className="mt-2 space-y-1">
                {posts.map((p) => (
                  <li key={p.id} className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-600">
                    <span className={p.isPublished ? "text-emerald-700" : "text-slate-400"}>
                      {p.isPublished ? "게시" : "비게시"}
                    </span>
                    <span className="font-bold text-slate-800">{p.title}</span>
                    <span className="text-slate-400">({p.id})</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
