"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bm } from "@/lib/design-tokens";
import { getSearchHref } from "@/lib/battery-search";

export function ShopFindBatteryBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <section className={`${bm.card} ${bm.cardPad}`} id="shop-find">
      <h2 className="text-base font-black text-slate-950">1. 내 차에 맞는 배터리 찾기</h2>
      <p className="mt-1 text-xs font-medium text-slate-500">
        차량명·연료·규격을 검색하면 추천 배터리 카드로 바로 확인할 수 있습니다.
      </p>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const query = q.trim() || "배터리";
          router.push(getSearchHref(query));
        }}
      >
        <input
          className={bm.input}
          placeholder="예: 쏘렌토 MQ4 하이브리드, AGM60L"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" className={`${bm.btnPrimary} shrink-0 px-4 text-xs`}>
          검색
        </button>
      </form>
    </section>
  );
}
