"use client";

import Link from "next/link";
import { ContentUiIcon } from "@/components/content/ContentUiIcon";
import type { ContentUiIconKey } from "@/lib/content-ui-icons";
import {
  QNA_PREP_CHECKLIST,
  QNA_SIDEBAR_TOPICS,
  sortQuestionsByRecent,
  type QnaPrimaryFilter,
} from "@/lib/qna-hub-data";
import { diagnosisHref, photoHref, questions, searchHref } from "@/lib/platform-data";

function SidebarActionLink({
  href,
  label,
  iconKey,
  variant = "default",
}: {
  href: string;
  label: string;
  iconKey: ContentUiIconKey;
  variant?: "default" | "primary" | "dark";
}) {
  const variantClass =
    variant === "primary"
      ? "bg-[#2563EB] text-white"
      : variant === "dark"
        ? "bg-[#0F172A] text-white"
        : "bg-white text-[#0F172A] ring-1 ring-blue-100";

  return (
    <Link
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 transition hover:opacity-90 ${variantClass}`}
      href={href}
    >
      <ContentUiIcon iconKey={iconKey} rounded="lg" size={32} />
      <span className="text-sm font-black">{label}</span>
    </Link>
  );
}

export function QnaSidebar({
  onFilter,
  onSearch,
}: {
  onFilter: (filter: QnaPrimaryFilter) => void;
  onSearch: (query: string) => void;
}) {
  const recentAnswers = sortQuestionsByRecent(questions)
    .filter((q) => q.status !== "답변중")
    .slice(0, 5);

  return (
    <aside className="space-y-3">
      <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.06em] text-[#2563EB]">주제</p>
        <h2 className="mt-0.5 text-sm font-black text-[#0F172A]">많이 묻는 주제</h2>
        <div className="mt-3 space-y-1.5">
          {QNA_SIDEBAR_TOPICS.map((topic) => (
            <button
              key={topic.label}
              type="button"
              onClick={() => {
                if ("filter" in topic) onFilter(topic.filter);
                else onSearch(topic.query);
              }}
              className="block w-full rounded-lg bg-[#F8FAFC] px-3 py-2 text-left text-sm font-bold text-[#334155] ring-1 ring-blue-50 transition hover:bg-blue-50 hover:text-[#2563EB]"
            >
              {topic.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.06em] text-[#64748B]">바로가기</p>
        <div className="mt-2 space-y-1.5">
          <SidebarActionLink href="/vehicles" iconKey="spec-guide" label="차량 검색" variant="primary" />
          <SidebarActionLink href={searchHref("AGM80L")} iconKey="upgrade" label="배터리 규격 검색" variant="dark" />
          <SidebarActionLink href={diagnosisHref("slow-engine-start")} iconKey="start-delay" label="증상 확인" />
          <SidebarActionLink href={photoHref("AGM80L")} iconKey="photo-analysis" label="사진으로 규격 확인" />
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-[#F8FBFF] p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.06em] text-[#64748B]">최신</p>
        <h2 className="mt-0.5 text-sm font-black text-[#0F172A]">최근 답변</h2>
        <ul className="mt-2 space-y-2">
          {recentAnswers.map((q) => (
            <li key={q.id}>
              <Link className="line-clamp-2 text-xs font-bold leading-snug text-[#475569] hover:text-[#2563EB]" href={`/qa?q=${encodeURIComponent(q.title.slice(0, 20))}`}>
                {q.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-amber-100 bg-gradient-to-br from-[#FFFBEB] to-white p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.06em] text-amber-700">문의 전 준비사항</p>
        <h2 className="mt-0.5 text-sm font-black text-[#0F172A]">질문 전 확인할 것</h2>
        <ul className="mt-2 space-y-1">
          {QNA_PREP_CHECKLIST.map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-[10px] font-black text-amber-800">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
