"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import {
  SUPPORT_FAQ_CATEGORIES,
  SUPPORT_FAQ_ITEMS,
  type FaqCategory,
  type SupportFaqItem,
} from "@/lib/support-faq-data";
import { bm } from "@/lib/design-tokens";

export function CustomerFaqAccordion({
  faqItems = SUPPORT_FAQ_ITEMS,
  initialCategory = "전체" as FaqCategory,
  showSearch = true,
  externalQuery,
}: {
  faqItems?: SupportFaqItem[];
  initialCategory?: FaqCategory;
  showSearch?: boolean;
  /** 상위 검색창과 연동 (고객센터 메인) */
  externalQuery?: string;
}) {
  const [faqCategory, setFaqCategory] = useState<FaqCategory>(initialCategory);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const q = (externalQuery ?? query).trim().toLowerCase();

  const filteredFaq = useMemo(() => {
    return faqItems.filter((item) => {
      if (faqCategory !== "전체" && item.category !== faqCategory) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      );
    });
  }, [faqItems, q, faqCategory]);

  return (
    <section className="space-y-4" data-component="customer-faq-accordion">
      {showSearch ? (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="FAQ 검색"
          className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none ring-blue-200 focus:ring-2"
        />
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {SUPPORT_FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFaqCategory(cat)}
            className={
              faqCategory === cat
                ? "rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-black text-white"
                : "rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600"
            }
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filteredFaq.map((item) => {
          const open = openFaq === item.id;
          return (
            <div key={item.id} className={`${bm.card} overflow-hidden`}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5"
                onClick={() => setOpenFaq(open ? null : item.id)}
                aria-expanded={open}
              >
                <span className="text-sm font-black text-slate-900">{item.question}</span>
                <ChevronDown
                  className={clsx("size-4 shrink-0 text-slate-400 transition", open && "rotate-180")}
                />
              </button>
              {open ? (
                <div className="border-t border-slate-100 px-4 pb-4 pt-2 sm:px-5">
                  <div className="space-y-2.5 text-sm font-medium leading-relaxed text-slate-600">
                    {item.answer.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {filteredFaq.length === 0 ? (
        <p className="py-8 text-center text-sm font-medium text-slate-500">검색 결과가 없습니다.</p>
      ) : null}
    </section>
  );
}
