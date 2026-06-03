"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  findBatteryUpgradeByQuery,
  type BatteryUpgradeRecord,
} from "@/data/battery/battery-upgrade-lookup";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";

function UpgradeResultCard({ record }: { record: BatteryUpgradeRecord }) {
  const collecting = record.status === "collecting";

  return (
    <article className="upgrade-lookup-result rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-lg font-black text-slate-950">{record.displayName}</h3>
        {collecting ? (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-800 ring-1 ring-amber-200">
            데이터 수집 중
          </span>
        ) : (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-800 ring-1 ring-emerald-200">
            조회 가능
          </span>
        )}
      </div>

      {collecting ? (
        <ul className="mt-4 space-y-2 text-sm font-medium leading-relaxed text-slate-700">
          <li>해당 차량의 용량 업그레이드 데이터는 현재 추가 수집 중입니다.</li>
          <li>기본 규격은 확인 가능하지만, 업그레이드 가능 여부는 검토 중입니다.</li>
          <li>
            무리한 업그레이드는 장착 불량이나 단자 간섭이 생길 수 있어 확인 후 안내드립니다.
          </li>
        </ul>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            기본 장착 규격
          </p>
          <p className="mt-2 text-base font-black text-slate-900">{record.stockBattery}</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">
            업그레이드 가능 규격
          </p>
          <p className="mt-2 text-base font-black text-blue-900">
            {record.upgradeBatteries.join(" · ")}
          </p>
        </div>
      </div>

      {record.checkPoints.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-black text-slate-500">확인 포인트</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm font-medium text-slate-700">
            {record.checkPoints.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {record.cautions.length > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/40 p-4">
          <p className="text-xs font-black text-amber-900">주의사항</p>
          <ul className="mt-2 space-y-1 text-sm font-medium text-amber-950/90">
            {record.cautions.map((c) => (
              <li key={c} className="flex gap-2">
                <span aria-hidden>·</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/battery-upgrade/${record.slug}`}
          className={`${bm.btnSecondary} min-h-[2.75rem] text-sm font-black`}
        >
          상세 비교 보기
        </Link>
        <Link
          href={HUB_STORE_DETAIL}
          className={`${bm.btnTertiary} min-h-[2.75rem] text-sm font-black`}
        >
          상담하기
        </Link>
      </div>
    </article>
  );
}

type Props = {
  initialQuery?: string;
  compact?: boolean;
};

export function UpgradeBatteryLookup({ initialQuery = "", compact }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const hasInitial = Boolean(initialQuery.trim());
  const [searched, setSearched] = useState(hasInitial);

  const result = useMemo(() => {
    if (!searched || !query.trim()) return null;
    return findBatteryUpgradeByQuery(query);
  }, [query, searched]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  return (
    <section
      className={compact ? "space-y-4" : `${bm.card} ${bm.cardPad} space-y-4`}
      id="upgrade-lookup"
      aria-labelledby="upgrade-lookup-title"
    >
      <div>
        <h2 id="upgrade-lookup-title" className="text-lg font-black text-slate-950 sm:text-xl">
          용량 업그레이드 조회
        </h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          차량명으로 기본 배터리와 업그레이드 가능 배터리를 확인하세요. 데이터가 없는 차량은
          수집 중 안내가 표시됩니다.
        </p>
      </div>

      <form onSubmit={onSearch} className="flex flex-col gap-2 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">차량명 검색</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearched(false);
            }}
            placeholder="차량명으로 업그레이드 가능 여부 조회 (예: 그랜저 IG, 쏘렌토 MQ4)"
            className="w-full max-w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm font-semibold text-slate-900 shadow-sm ring-0 placeholder:text-slate-400"
          />
        </label>
        <button
          type="submit"
          className={`${bm.btnPrimary} min-h-[3rem] shrink-0 px-6 text-sm font-black sm:min-w-[7rem]`}
        >
          조회
        </button>
      </form>

      {searched && !result ? (
        <div className="upgrade-lookup-result rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-5">
          <p className="text-sm font-black text-slate-800">검색 결과가 없습니다</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
            해당 차량의 용량 업그레이드 데이터는 현재 추가 수집 중입니다. 무리한 업그레이드는
            장착 불량이나 단자 간섭이 생길 수 있어 확인 후 안내드립니다.
          </p>
          <Link
            href={HUB_STORE_DETAIL}
            className={`${bm.btnSecondary} mt-4 inline-flex min-h-[2.75rem] text-sm font-black`}
          >
            상담하기
          </Link>
        </div>
      ) : null}

      {result ? <UpgradeResultCard record={result} /> : null}
    </section>
  );
}
