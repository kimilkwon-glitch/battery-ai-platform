"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BRAND_QNA_LABEL } from "@/lib/brand";
import { bm } from "@/lib/design-tokens";
import { QnaQuestionCard } from "@/components/platform/QnaQuestionCard";
import { QnaSidebar } from "@/components/platform/QnaSidebar";
import { questions } from "@/lib/platform-data";
import {
  QNA_HERO_CHIPS,
  QNA_PRIMARY_FILTERS,
  QNA_SECONDARY_TAGS,
  QNA_TOPIC_GROUPS,
  QNA_FEATURED_VISIBLE,
  RECENT_QNA_PAGE_SIZE,
  isFeaturedQuestion,
  matchesPrimaryFilter,
  matchesSearchQuery,
  matchesTagFilter,
  matchesTopicGroup,
  sortQuestionsByRecent,
  type QnaPrimaryFilter,
  type QnaTopicKey,
} from "@/lib/qna-hub-data";

function SectionHeader({ kicker, title, desc }: { kicker?: string; title: string; desc?: string }) {
  return (
    <div className="mb-3">
      {kicker ? (
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{kicker}</p>
      ) : null}
      <h2 className="mt-0.5 text-lg font-black text-slate-950">{title}</h2>
      {desc ? <p className="mt-0.5 text-xs font-medium text-slate-400">{desc}</p> : null}
    </div>
  );
}

export function CommunityClient({ initialQ }: { initialQ?: string }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQ ?? "");
  const [primaryFilter, setPrimaryFilter] = useState<QnaPrimaryFilter>("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showTopicSections, setShowTopicSections] = useState(false);
  const [showMoreQuestions, setShowMoreQuestions] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [recentVisible, setRecentVisible] = useState(RECENT_QNA_PAGE_SIZE);

  useEffect(() => {
    if (initialQ) setSearchQuery(initialQ);
  }, [initialQ]);

  const isFiltered = primaryFilter !== "all" || Boolean(tagFilter) || Boolean(searchQuery.trim());

  const filtered = useMemo(() => {
    return sortQuestionsByRecent(questions).filter(
      (q) =>
        matchesSearchQuery(q, searchQuery) &&
        matchesPrimaryFilter(q, primaryFilter) &&
        (tagFilter ? matchesTagFilter(q, tagFilter) : true),
    );
  }, [searchQuery, primaryFilter, tagFilter]);

  const featured = useMemo(() => {
    const ids = new Set<string>();
    const items = sortQuestionsByRecent(questions).filter((q) => isFeaturedQuestion(q));
    return items.slice(0, QNA_FEATURED_VISIBLE).filter((q) => {
      if (ids.has(q.id)) return false;
      ids.add(q.id);
      return true;
    });
  }, []);

  const featuredIds = useMemo(() => new Set(featured.map((q) => q.id)), [featured]);

  const recent = useMemo(() => {
    return sortQuestionsByRecent(questions)
      .filter((q) => !featuredIds.has(q.id))
      .slice(0, recentVisible);
  }, [featuredIds, recentVisible]);

  const recentTotal = useMemo(
    () => sortQuestionsByRecent(questions).filter((q) => !featuredIds.has(q.id)).length,
    [featuredIds],
  );

  const topicSections = useMemo(() => {
    const shown = new Set([...featuredIds, ...recent.map((q) => q.id)]);
    return QNA_TOPIC_GROUPS.map((group) => ({
      ...group,
      items: sortQuestionsByRecent(questions)
        .filter((q) => matchesTopicGroup(q, group.key as QnaTopicKey))
        .filter((q) => !shown.has(q.id))
        .slice(0, 2),
    })).filter((g) => g.items.length > 0);
  }, [featuredIds, recent]);

  const visibleSecondaryTags = showAllTags ? QNA_SECONDARY_TAGS : QNA_SECONDARY_TAGS.slice(0, 4);

  const applyChipSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setPrimaryFilter("all");
      setTagFilter(null);
      router.replace(`/community?q=${encodeURIComponent(query)}`, { scroll: false });
    },
    [router],
  );

  const onPrimaryFilter = (key: QnaPrimaryFilter) => {
    setPrimaryFilter(key);
    setRecentVisible(RECENT_QNA_PAGE_SIZE);
  };

  return (
    <div className="space-y-5">
      <section className={`${bm.heroPanel} p-5 lg:p-6`}>
        <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#2563EB]">{BRAND_QNA_LABEL}</p>
        <h1 className="mt-2 text-2xl font-black leading-tight tracking-[-0.03em] text-[#0F172A] lg:text-[1.75rem]">
          배터리 궁금증,
          <br className="sm:hidden" /> 실제 질문처럼 찾아보세요
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-[#64748B]">
          차종·규격·증상별로 자주 묻는 배터리 질문을 정리했습니다.
        </p>

        <form
          className="mt-4 flex max-w-2xl gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            router.replace(`/community?q=${encodeURIComponent(searchQuery)}`, { scroll: false });
          }}
        >
          <input
            className="h-12 min-w-0 flex-1 rounded-xl bg-white px-4 text-base font-bold shadow-sm outline-none ring-1 ring-[#DBEAFE] focus:ring-2 focus:ring-[#2563EB]"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="차종, 배터리 규격, 증상으로 질문 검색"
            type="search"
            value={searchQuery}
          />
          <button
            className="shrink-0 rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white shadow-sm hover:bg-[#1D4ED8]"
            type="submit"
          >
            질문 검색
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {QNA_HERO_CHIPS.slice(0, 4).map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => applyChipSearch(chip.query)}
              className="rounded-lg border border-[#DBEAFE] bg-white px-3 py-1.5 text-xs font-black text-[#334155] transition hover:border-[#93C5FD] hover:bg-blue-50 hover:text-[#1D4ED8]"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1D4ED8]"
            href="/community"
          >
            비슷한 질문 먼저 찾기
          </Link>
          <Link
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#0F172A] ring-1 ring-blue-100 transition hover:bg-blue-50"
            href="/analysis/photo"
          >
            규격 문의 준비하기
          </Link>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.06em] text-[#64748B]">필터</p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {QNA_PRIMARY_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => onPrimaryFilter(f.key)}
                  className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-bold transition ${
                    primaryFilter === f.key
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "bg-[#F8FAFC] text-[#475569] ring-1 ring-slate-200 hover:bg-blue-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {visibleSecondaryTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTagFilter(tagFilter === t ? null : t)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    tagFilter === t
                      ? "bg-[#1D4ED8] text-white"
                      : "bg-white text-[#64748B] ring-1 ring-slate-200 hover:ring-blue-200"
                  }`}
                >
                  {t}
                </button>
              ))}
              {!showAllTags ? (
                <button
                  type="button"
                  onClick={() => setShowAllTags(true)}
                  className="text-xs font-black text-[#2563EB] hover:underline"
                >
                  더보기
                </button>
              ) : null}
            </div>
          </section>

          {isFiltered ? (
            <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
              <SectionHeader
                desc={`${filtered.length}개 질문`}
                title="검색·필터 결과"
              />
              <div className="space-y-3">
                {filtered.map((q) => (
                  <QnaQuestionCard
                    key={q.id}
                    open={expanded === q.id}
                    onToggle={() => setExpanded(expanded === q.id ? null : q.id)}
                    question={q}
                  />
                ))}
              </div>
              {filtered.length === 0 ? (
                <p className="py-10 text-center text-sm font-semibold text-[#64748B]">조건에 맞는 질문이 없습니다.</p>
              ) : null}
            </section>
          ) : (
            <>
              <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                <SectionHeader kicker="FAQ" desc="매장에서 가장 자주 반복되는 질문" title="자주 묻는 질문" />
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {featured.map((q) => (
                    <QnaQuestionCard
                      compact
                      featured
                      key={q.id}
                      open={expanded === q.id}
                      onToggle={() => setExpanded(expanded === q.id ? null : q.id)}
                      question={q}
                    />
                  ))}
                </div>
              </section>

              {!showMoreQuestions ? (
                <button
                  type="button"
                  onClick={() => setShowMoreQuestions(true)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                >
                  더 많은 질문 보기
                </button>
              ) : (
                <>
                  {recent.length > 0 ? (
                    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                      <SectionHeader kicker="추가" desc="자주 묻는 질문 외" title="더 많은 질문" />
                      <div className="space-y-2.5">
                        {recent.map((q) => (
                          <QnaQuestionCard
                            key={q.id}
                            open={expanded === q.id}
                            onToggle={() => setExpanded(expanded === q.id ? null : q.id)}
                            question={q}
                          />
                        ))}
                      </div>
                      {recentVisible < recentTotal ? (
                        <button
                          type="button"
                          onClick={() => setRecentVisible((c) => c + RECENT_QNA_PAGE_SIZE)}
                          className="mt-4 w-full rounded-xl border border-blue-200 bg-[#F8FBFF] py-2.5 text-sm font-black text-[#2563EB] transition hover:bg-blue-50"
                        >
                          더 보기 (+{RECENT_QNA_PAGE_SIZE})
                        </button>
                      ) : null}
                    </section>
                  ) : null}
                </>
              )}

              {topicSections.length > 0 ? (
                <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                  {!showTopicSections ? (
                    <button
                      type="button"
                      onClick={() => setShowTopicSections(true)}
                      className="w-full rounded-xl border border-blue-200 bg-[#F8FBFF] py-2.5 text-sm font-black text-[#2563EB] transition hover:bg-blue-50"
                    >
                      주제별 질문 더 보기 ({topicSections.reduce((n, g) => n + g.items.length, 0)}개)
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {topicSections.map((group) => (
                        <div key={group.key}>
                          <SectionHeader kicker="주제별" title={`${group.label} 질문`} />
                          <div className="space-y-3">
                            {group.items.map((q) => (
                              <QnaQuestionCard
                                key={q.id}
                                open={expanded === q.id}
                                onToggle={() => setExpanded(expanded === q.id ? null : q.id)}
                                question={q}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ) : null}
            </>
          )}
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <QnaSidebar
            onFilter={(filter) => {
              setPrimaryFilter(filter);
              setTagFilter(null);
              setSearchQuery("");
            }}
            onSearch={applyChipSearch}
          />
        </div>
      </div>
    </div>
  );
}
