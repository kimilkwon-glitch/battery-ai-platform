"use client";

import Link from "next/link";
import { ContentUiIcon } from "@/components/content/ContentUiIcon";

/** 메인 사이드 — 상담·작업 가능점만 (중복 섹션 제거) */
export function HomeSidebar() {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-wide text-blue-600">상담</p>
      <h2 className="mt-0.5 text-sm font-black text-slate-950">배터리 Q&A · 매장·출장</h2>
      <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-500">
        교체 전 Q&A 확인과 작업 가능점 안내를 이어서 볼 수 있습니다.
      </p>
      <div className="mt-3.5 grid gap-2">
        <Link
          className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition hover:border-blue-300 hover:bg-blue-50/50"
          href="/qa"
        >
          <ContentUiIcon iconKey="faq" rounded="lg" size={32} />
          <span className="text-xs font-black text-slate-800">배터리 Q&A</span>
        </Link>
        <Link
          className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition hover:border-blue-300 hover:bg-blue-50/50"
          href="/service-center"
        >
          <ContentUiIcon iconKey="caution" rounded="lg" size={32} />
          <span className="text-xs font-black text-slate-800">매장·출장 안내</span>
        </Link>
        <Link
          className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition hover:border-blue-300 hover:bg-blue-50/50"
          href="/shop"
        >
          <ContentUiIcon iconKey="shopping-notice" rounded="lg" size={32} />
          <span className="text-xs font-black text-slate-800">택배·쇼핑</span>
        </Link>
        <Link
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 transition hover:bg-blue-700"
          href="/analysis/photo"
        >
          <ContentUiIcon className="bg-white/95 ring-white/30" iconKey="photo-analysis" rounded="lg" size={32} />
          <span className="text-xs font-black text-white">사진으로 규격 확인</span>
        </Link>
      </div>
    </section>
  );
}
