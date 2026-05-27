"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getHomeActivitySummary,
  getHomeActivitySummaryStatic,
  type RecentSearch,
} from "@/lib/activity";
import { getSearchHref } from "@/lib/battery-search";
import { popularComparisons } from "@/lib/platform-data";

const COMPARE_REASONS: Record<string, string> = {
  "AGM70L-AGM80L": "용량업·ISG 호환 비교",
  "AGM80L-DIN74L": "AGM vs DIN 오주문 방지",
  "AGM80L-AGM95L": "대형 세단·SUV 용량 비교",
  "EV 12V-AGM70L": "EV 12V와 일반 AGM 구분",
};

export function HomeSidebarActivity() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(
    getHomeActivitySummaryStatic().recentSearches,
  );

  useEffect(() => {
    setRecentSearches(getHomeActivitySummary().recentSearches);
  }, []);

  return (
    <>
      <Panel title="최근 검색된 키워드">
        {recentSearches.length === 0 ? (
          <p className="text-[10px] font-semibold text-slate-500">검색하면 최근 기록이 쌓입니다.</p>
        ) : (
          recentSearches.slice(0, 8).map((s, index) => (
            <Link
              className="mb-1 grid grid-cols-[22px_1fr] gap-2 rounded-md px-1 py-1.5 hover:bg-blue-50"
              href={getSearchHref(s.query)}
              key={`${s.query}-${s.createdAt}`}
            >
              <span className="text-xs font-black text-slate-400">{index + 1}</span>
              <span>
                <span className="block text-xs font-black">{s.query}</span>
                <span className="text-[10px] font-semibold text-slate-500">
                  {s.matchedBattery ? `${s.matchedBattery} 확인` : s.matchedVehicle ?? "최근 검색"}
                </span>
              </span>
            </Link>
          ))
        )}
      </Panel>

      <Panel title="많이 비교한 배터리">
        {popularComparisons.map(([a, b]) => {
          const key = `${a}-${b}`;
          return (
            <Link
              className="mb-1 flex justify-between rounded-lg bg-slate-50 px-2 py-2 text-xs ring-1 ring-slate-200 hover:bg-blue-50"
              href={`/compare?items=${a},${b}`}
              key={key}
            >
              <span className="font-black">
                {a} vs {b}
              </span>
              <span className="text-[10px] font-bold text-blue-600">{COMPARE_REASONS[key] ?? "비교"}</span>
            </Link>
          );
        })}
      </Panel>
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <h2 className="mb-2 border-b border-slate-100 pb-2 text-sm font-black">{title}</h2>
      {children}
    </section>
  );
}
