"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search } from "lucide-react";
import clsx from "clsx";
import {
  BUSAN_REGION_DISPLAY,
  BUSAN_STORE_MATCH_UNKNOWN,
  recommendBusanStore,
  type BusanStoreId,
} from "@/lib/busan-store-matcher";

export function StoreNeighborhoodSearch({
  onMatch,
  activeStore,
  onSearchQuery,
  enhanced,
}: {
  onMatch: (storeId: BusanStoreId | null) => void;
  activeStore: BusanStoreId | null;
  onSearchQuery?: (query: string | null) => void;
  enhanced?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    const result = recommendBusanStore(query);
    setSubmitted(trimmed);
    onSearchQuery?.(trimmed || null);
    if (result.status === "matched") {
      onMatch(result.storeId);
    } else {
      onMatch(null);
    }
  };

  const result = submitted ? recommendBusanStore(submitted) : null;

  return (
    <section
      className={clsx(
        "busan-store-search rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5",
        enhanced && "busan-store-search--enhanced",
      )}
      id="neighborhood-search"
    >
      <form className="flex flex-col gap-3 sm:flex-row sm:items-stretch" onSubmit={handleSubmit}>
        <label className="relative flex-1">
          <span className="sr-only">동네명 검색</span>
          <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none ring-blue-200 transition focus:border-blue-400 focus:bg-white focus:ring-2"
            placeholder="화명동, 명지동, 연산동, 하단동"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-black text-white transition hover:bg-slate-800"
        >
          <Search className="size-4" aria-hidden />
          가까운 지점 확인
        </button>
      </form>

      <AnimatePresence mode="wait">
        {result && submitted ? (
          <motion.div
            key={result.status === "matched" ? result.storeId : "unknown"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className={clsx(
              "mt-4 rounded-xl p-4 ring-1",
              result.status === "matched"
                ? result.storeId === "deokcheon"
                  ? "bg-blue-50/70 ring-blue-100"
                  : "bg-emerald-50/70 ring-emerald-100"
                : "bg-amber-50/60 ring-amber-100",
            )}
          >
            {result.status === "matched" ? (
              <>
                <p className="text-xs font-black text-slate-500">추천 지점</p>
                <p className="mt-1 text-lg font-black text-slate-900">
                  {BUSAN_REGION_DISPLAY[result.storeId].label}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {BUSAN_REGION_DISPLAY[result.storeId].blurb}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-black text-slate-900">{BUSAN_STORE_MATCH_UNKNOWN.title}</p>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">
                  {BUSAN_STORE_MATCH_UNKNOWN.body}
                </p>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {activeStore ? (
        <p className="mt-3 hidden text-[11px] font-semibold text-slate-500 lg:block">
          <span className="font-black text-slate-800">{BUSAN_REGION_DISPLAY[activeStore].label}</span> 권역이
          선택되었습니다.
        </p>
      ) : null}
    </section>
  );
}
