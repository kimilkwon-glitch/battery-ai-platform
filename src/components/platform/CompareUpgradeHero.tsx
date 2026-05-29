"use client";

import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { bm } from "@/lib/design-tokens";
import { compareUpgradeExamples, compareUpgradePairs } from "@/lib/compare-utils";
import { getSearchHref } from "@/lib/battery-search";

type Props = {
  onSelectPair: (a: string, b: string) => void;
  activeA: string;
  activeB: string;
};

export function CompareUpgradeHero({ onSelectPair, activeA, activeB }: Props) {
  return (
    <div className="space-y-5" data-section="upgrade-hero">
      <section className={`${bm.heroPanel} p-5 sm:p-6`}>
        <p className={bm.intentBadge}>용량 업그레이드</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          배터리 용량 업그레이드
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">
          순정 규격보다 큰 배터리를 장착할 수 있는지 확인하세요. 차종·연식·트레이 공간·단자 방향에
          따라 실제 가능 여부가 달라질 수 있습니다.
        </p>

        <form action="/search" method="get" className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <input
            className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none ring-0 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/80"
            name="q"
            type="search"
            aria-label="차량명 또는 현재 배터리 규격"
            placeholder=""
          />
          <button
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-[var(--bm-navy)] px-6 text-sm font-black text-white hover:bg-[var(--bm-primary)]"
            type="submit"
          >
            검색
          </button>
        </form>
        <p className="mt-2 text-[11px] font-semibold text-slate-500">
          예시:{" "}
          {["쏘렌토MQ4", "포터2", "AGM70L", "DIN62L"].map((ex, i) => (
            <span key={ex}>
              {i > 0 ? " · " : null}
              <Link className="text-blue-700 hover:underline" href={getSearchHref(ex)}>
                {ex}
              </Link>
            </span>
          ))}
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            title: "순정 규격",
            body: "현재 차량에 기본 장착되는 배터리 규격을 기준으로 봅니다.",
            icon: "batterySpec" as const,
          },
          {
            title: "업그레이드 후보",
            body: "장착 가능성이 있는 상위 용량 규격을 후보로 비교합니다.",
            icon: "compare" as const,
          },
          {
            title: "확인 필요",
            body: "트레이 공간, 단자 방향, 고정쇠, ISG/IBS 여부를 반드시 확인하세요.",
            icon: "warning" as const,
          },
        ].map((card) => (
          <article className={`${bm.card} ${bm.cardPad}`} key={card.title}>
            <AppIcon iconKey={card.icon} size="md" />
            <h2 className="mt-2 text-sm font-black text-slate-900">{card.title}</h2>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-600">{card.body}</p>
          </article>
        ))}
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className={bm.cardTitle}>대표 업그레이드 흐름</h2>
        <p className={`mt-1 ${bm.muted} text-xs`}>
          일부 차량에서 확인되는 대표 흐름입니다. 무조건 가능하다는 뜻이 아니며, 차종·연식·트레이
          공간에 따라 달라질 수 있습니다.
        </p>
        <ul className="mt-4 space-y-2">
          {compareUpgradeExamples.map((ex) => (
            <li
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100"
              key={ex.label}
            >
              <span className="text-sm font-bold text-slate-800">{ex.label}</span>
              <span className="text-[11px] font-medium text-slate-500">{ex.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className={bm.label}>업그레이드 비교 시작</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {compareUpgradePairs.map((pair) => {
            const active = activeA === pair.a && activeB === pair.b;
            return (
              <button
                key={pair.label}
                type="button"
                onClick={() => onSelectPair(pair.a, pair.b)}
                className={active ? bm.tabBtnActive : bm.tabBtn}
              >
                {pair.label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
