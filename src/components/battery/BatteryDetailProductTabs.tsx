"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BatteryDetailBodyImages } from "@/components/battery/BatteryDetailBodyImages";
import { getBattery } from "@/lib/platform-data";
import { CUSTOMER_CENTER_HUB } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

const TABS = [
  { id: "detail", label: "상품상세정보" },
  { id: "reviews", label: "리뷰" },
  { id: "qna", label: "상품문의" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Props = {
  code: string;
};

export function BatteryDetailProductTabs({ code }: Props) {
  const [tab, setTab] = useState<TabId>("detail");
  const catalogBattery = getBattery(code);
  const reviewsHref = `/reviews?battery=${encodeURIComponent(code)}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (hash === "battery-reviews") setTab("reviews");
  }, []);

  return (
    <section className="scroll-mt-24 space-y-4" data-battery-product-tabs={code}>
      <nav
        className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
        role="tablist"
        aria-label="상품 정보 탭"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              id={`battery-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`min-h-[44px] flex-1 shrink-0 rounded-lg px-4 text-sm font-black transition ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      {tab === "detail" ? (
        <div
          role="tabpanel"
          id="battery-detail-info"
          aria-labelledby="battery-tab-detail"
          className={`${bm.card} ${bm.cardPad}`}
        >
          <div id="battery-detail-body-guide">
            <BatteryDetailBodyImages code={code} brandId={catalogBattery.brandId} />
          </div>
        </div>
      ) : null}

      {tab === "reviews" ? (
        <div
          role="tabpanel"
          id="battery-reviews"
          aria-labelledby="battery-tab-reviews"
          className={`${bm.card} ${bm.cardPad}`}
        >
          <p className="text-sm font-medium text-slate-500">아직 등록된 리뷰가 없습니다.</p>
          <Link href={reviewsHref} className={`${bm.btnSecondary} mt-4 inline-flex text-sm`}>
            리뷰 페이지 보기
          </Link>
        </div>
      ) : null}

      {tab === "qna" ? (
        <div
          role="tabpanel"
          id="battery-qna"
          aria-labelledby="battery-tab-qna"
          className={`${bm.card} ${bm.cardPad} space-y-3`}
        >
          <p className="text-sm font-medium text-slate-600">규격·장착 문의는 고객센터에서 도와드립니다.</p>
          <div className="flex flex-wrap gap-2">
            <Link href={CUSTOMER_CENTER_HUB} className={`${bm.btnSecondary} text-sm`}>
              고객센터
            </Link>
            <Link href="/community" className={`${bm.btnTertiary} text-sm`}>
              Q&amp;A 보기
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
