"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import clsx from "clsx";
import { addInquiry } from "@/lib/inquiry-storage";
import { SUPPORT_NOTICES } from "@/lib/support-notices-data";
import {
  SUPPORT_FAQ_CATEGORIES,
  SUPPORT_FAQ_ITEMS,
  type FaqCategory,
} from "@/lib/support-faq-data";
import { bm } from "@/lib/design-tokens";

type TabId = "notices" | "faq" | "inquiry";

const INQUIRY_TYPES = [
  "배터리 규격 문의",
  "출장/방문 문의",
  "택배주문 문의",
  "반납/미반납 문의",
  "기타",
] as const;

type InquiryType = (typeof INQUIRY_TYPES)[number];

export function SupportCenterClient() {
  const [tab, setTab] = useState<TabId>("notices");
  const [query, setQuery] = useState("");
  const [faqCategory, setFaqCategory] = useState<FaqCategory>("전체");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    contact: string;
    vehicle: string;
    inquiryType: InquiryType;
    message: string;
  }>({
    name: "",
    contact: "",
    vehicle: "",
    inquiryType: INQUIRY_TYPES[0],
    message: "",
  });

  const q = query.trim().toLowerCase();

  const filteredNotices = useMemo(() => {
    if (!q) return SUPPORT_NOTICES;
    return SUPPORT_NOTICES.filter(
      (n) => n.title.toLowerCase().includes(q) || n.date.includes(q),
    );
  }, [q]);

  const filteredFaq = useMemo(() => {
    return SUPPORT_FAQ_ITEMS.filter((item) => {
      if (faqCategory !== "전체" && item.category !== faqCategory) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
      );
    });
  }, [q, faqCategory]);

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    addInquiry({
      name: form.name.trim() || "고객",
      contact: form.contact.trim(),
      vehicle: form.vehicle.trim() || undefined,
      message: `[${form.inquiryType}] ${form.message.trim()}`,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      source: "support",
      inquiryType: form.inquiryType,
    });
    setInquirySubmitted(true);
  };

  return (
    <div className="support-center bm-zone bm-zone--support space-y-6" data-page="support-center">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="bm-tab-rail bm-tab-rail--support">
          {(
            [
              ["notices", "공지사항"],
              ["faq", "FAQ"],
              ["inquiry", "문의하기"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={clsx(
                "bm-tab-rail__btn",
                tab === id && "bm-tab-rail__btn--active",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색어를 입력해주세요"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-semibold outline-none ring-blue-200 focus:ring-2"
          />
        </label>
      </div>

      {tab === "notices" ? (
        <section className={`${bm.card} overflow-hidden`}>
          <ol className="divide-y divide-slate-100">
            {filteredNotices.map((notice, index) => (
              <li key={notice.id}>
                <Link
                  href={`/support/notices/${notice.id}`}
                  className="support-notice-row flex items-center gap-4 px-4 py-4 transition hover:bg-blue-50/40 sm:px-6 sm:py-5"
                >
                  <span className="w-8 shrink-0 text-center text-sm font-black text-slate-400">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {notice.important ? (
                        <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-black text-red-700 ring-1 ring-red-100">
                          중요
                        </span>
                      ) : null}
                      <p className="truncate text-sm font-black text-slate-900 sm:text-base">
                        {notice.title}
                      </p>
                    </div>
                  </div>
                  <time className="shrink-0 text-xs font-bold text-slate-500">{notice.date}</time>
                </Link>
              </li>
            ))}
          </ol>
          {filteredNotices.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm font-medium text-slate-500">
              검색 결과가 없습니다.
            </p>
          ) : null}
        </section>
      ) : null}

      {tab === "faq" ? (
        <section className="space-y-4">
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
        </section>
      ) : null}

      {tab === "inquiry" ? (
        <section className={`${bm.card} ${bm.cardPad} max-w-xl`}>
          {inquirySubmitted ? (
            <p className="rounded-xl bg-emerald-50 px-4 py-6 text-center text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
              문의가 접수되었습니다. 확인 후 연락드리겠습니다.
            </p>
          ) : (
            <form className="space-y-4" onSubmit={handleInquiry}>
              <p className="text-xs font-semibold text-slate-500">
                접수된 문의는 채팅상담과 함께 운영자 화면에서 확인됩니다. (localStorage 임시 저장)
              </p>
              {(["name", "contact", "vehicle"] as const).map((field) => (
                <label key={field} className="block text-xs font-bold text-slate-700">
                  {field === "name" ? "이름" : field === "contact" ? "연락처" : "차량명"}
                  <input
                    required={field !== "vehicle"}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  />
                </label>
              ))}
              <label className="block text-xs font-bold text-slate-700">
                문의 유형
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"
                  value={form.inquiryType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      inquiryType: e.target.value as InquiryType,
                    }))
                  }
                >
                  {INQUIRY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold text-slate-700">
                문의 내용
                <textarea
                  required
                  rows={5}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </label>
              <button type="submit" className={bm.btnPrimary}>
                문의 접수하기
              </button>
            </form>
          )}
        </section>
      ) : null}
    </div>
  );
}
