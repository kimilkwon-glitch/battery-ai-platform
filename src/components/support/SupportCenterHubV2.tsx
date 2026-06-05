"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import clsx from "clsx";
import { openChatInquiry } from "@/lib/chat-inquiry-events";
import { addInquiry } from "@/lib/inquiry-storage";
import { INQUIRY_VEHICLE_OPTIONS } from "@/lib/inquiry-vehicle-options";
import { SUPPORT_NOTICES } from "@/lib/support-notices-data";
import {
  SUPPORT_FAQ_ITEMS,
  type FaqCategory,
} from "@/lib/support-faq-data";
import {
  SUPPORT_HUB_CATEGORIES,
  SUPPORT_HUB_HELP_LINKS,
  SUPPORT_HUB_INFO_LINES,
  SUPPORT_HUB_PRIMARY_CTAS,
  SUPPORT_HUB_SECONDARY_CTAS,
  faqCategoryToHub,
  type SupportHubCategoryId,
} from "@/lib/support-center-config";

export function SupportCenterHubV2() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SupportHubCategoryId>("all");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    contact: "",
    vehicle: "",
    message: "",
  });

  useEffect(() => {
    if (searchParams.get("tab") === "inquiry") {
      document.getElementById("support-inquiry")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchParams]);

  const q = query.trim().toLowerCase();

  const filteredFaq = useMemo(() => {
    return SUPPORT_FAQ_ITEMS.filter((item) => {
      const hubCat = faqCategoryToHub(item.category as Exclude<FaqCategory, "전체">);
      if (category !== "all" && hubCat !== category) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      );
    });
  }, [q, category]);

  const recentNotices = SUPPORT_NOTICES.slice(0, 5);

  const submitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    addInquiry({
      name: inquiryForm.name.trim() || "고객",
      contact: inquiryForm.contact.trim(),
      vehicle: inquiryForm.vehicle.trim() || undefined,
      message: inquiryForm.message.trim(),
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      source: "support",
      inquiryType: "일반문의",
    });
    setInquirySubmitted(true);
  };

  return (
    <div className="support-hub-v2 mx-auto max-w-3xl space-y-8" data-page="support-center-v2">
      {/* 1) 헤더 */}
      <header className="support-hub-v2__hero text-center sm:text-left">
        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          고객센터
        </h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
          주문, 배송, 교체, 배터리 문의를 한곳에서 빠르게 확인하세요.
        </p>
        <div className="support-hub-v2__cta-row mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {SUPPORT_HUB_PRIMARY_CTAS.map((cta) =>
            cta.id === "consult" ? (
              <button
                key={cta.id}
                type="button"
                className="support-hub-v2__cta support-hub-v2__cta--primary"
                onClick={() => {
                  openChatInquiry();
                  document.getElementById("support-inquiry")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {cta.label}
              </button>
            ) : (
              <Link
                key={cta.id}
                href={cta.href}
                className={clsx(
                  "support-hub-v2__cta",
                  cta.variant === "primary"
                    ? "support-hub-v2__cta--primary"
                    : "support-hub-v2__cta--secondary",
                )}
              >
                {cta.label}
              </Link>
            ),
          )}
        </div>
      </header>

      {/* 2) 대표 안내 */}
      <section className="support-hub-v2__info" aria-label="고객센터 안내">
        <ul className="support-hub-v2__info-list">
          {SUPPORT_HUB_INFO_LINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      {/* 3) FAQ 검색 */}
      <section className="support-hub-v2__search">
        <h2 className="support-hub-v2__section-title">무엇을 도와드릴까요?</h2>
        <label className="support-hub-v2__search-label">
          <Search className="support-hub-v2__search-icon" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예) 주문 확인, 출장 교체, AGM 배터리, 반납, 배송 안내"
            className="support-hub-v2__search-input"
          />
        </label>
      </section>

      {/* 4) 카테고리 칩 */}
      <div
        className="support-hub-v2__chips"
        role="tablist"
        aria-label="FAQ 카테고리"
      >
        {SUPPORT_HUB_CATEGORIES.map((chip) => (
          <button
            key={chip.id}
            type="button"
            role="tab"
            aria-selected={category === chip.id}
            className={clsx(
              "support-hub-v2__chip",
              category === chip.id && "support-hub-v2__chip--active",
            )}
            onClick={() => setCategory(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 5) FAQ 리스트 */}
      <section className="support-hub-v2__faq" aria-label="자주 묻는 질문">
        <div className="space-y-2">
          {filteredFaq.map((item) => {
            const open = openFaqId === item.id;
            return (
              <div key={item.id} className="support-hub-v2__faq-item">
                <button
                  type="button"
                  className="support-hub-v2__faq-trigger"
                  onClick={() => setOpenFaqId(open ? null : item.id)}
                  aria-expanded={open}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={clsx("size-4 shrink-0 text-slate-400 transition", open && "rotate-180")}
                    aria-hidden
                  />
                </button>
                {open ? (
                  <div className="support-hub-v2__faq-panel">
                    {item.answer.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {filteredFaq.length === 0 ? (
          <p className="py-10 text-center text-sm font-medium text-slate-500">
            검색 결과가 없습니다. 상담 문의로 연결해 주세요.
          </p>
        ) : null}
      </section>

      {/* 6) 보조 링크 */}
      <section className="support-hub-v2__links" aria-label="안내 링크">
        <h2 className="support-hub-v2__section-title text-base">안내 바로가기</h2>
        <ul className="support-hub-v2__link-list">
          {SUPPORT_HUB_HELP_LINKS.map((link) => (
            <li key={link.href + link.label}>
              <Link href={link.href} className="support-hub-v2__link-item">
                {link.label}
                <span aria-hidden>→</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUPPORT_HUB_SECONDARY_CTAS.map((cta) => (
            <Link key={cta.href} href={cta.href} className="support-hub-v2__chip support-hub-v2__chip--link">
              {cta.label}
            </Link>
          ))}
        </div>
      </section>

      {/* 7) 공지 */}
      <section id="support-notices" className="support-hub-v2__notices" aria-label="공지사항">
        <div className="flex items-center justify-between gap-2">
          <h2 className="support-hub-v2__section-title text-base">공지사항</h2>
          <Link href="#support-notices" className="text-xs font-bold text-blue-700 hover:underline">
            최근 공지
          </Link>
        </div>
        <ol className="support-hub-v2__notice-list">
          {recentNotices.map((notice) => (
            <li key={notice.id}>
              <Link href={`/support/notices/${notice.id}`} className="support-hub-v2__notice-row">
                {notice.important ? (
                  <span className="support-hub-v2__notice-badge">중요</span>
                ) : null}
                <span className="min-w-0 flex-1 truncate font-semibold text-slate-900">
                  {notice.title}
                </span>
                <time className="shrink-0 text-xs text-slate-500">{notice.date}</time>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* 문의 접수 (앵커) */}
      <section id="support-inquiry" className="support-hub-v2__inquiry scroll-mt-24">
        <h2 className="support-hub-v2__section-title text-base">상담 문의 접수</h2>
        <p className="mt-1 text-sm text-slate-600">
          문의를 남겨주시면 확인 후 연락드립니다.
        </p>
        {inquirySubmitted ? (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-5 text-center text-sm font-semibold text-emerald-800">
            문의가 접수되었습니다. 확인 후 연락드리겠습니다.
          </p>
        ) : (
          <form className="mt-4 grid gap-3" onSubmit={submitInquiry}>
            <input
              required
              placeholder="이름"
              className="support-hub-v2__field"
              value={inquiryForm.name}
              onChange={(e) => setInquiryForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              required
              type="tel"
              placeholder="연락처 (010-0000-0000)"
              className="support-hub-v2__field"
              value={inquiryForm.contact}
              onChange={(e) => setInquiryForm((f) => ({ ...f, contact: e.target.value }))}
            />
            <select
              className="support-hub-v2__field"
              value={inquiryForm.vehicle}
              onChange={(e) => setInquiryForm((f) => ({ ...f, vehicle: e.target.value }))}
            >
              {INQUIRY_VEHICLE_OPTIONS.map((opt) => (
                <option key={opt.value || "empty"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <textarea
              required
              rows={4}
              placeholder="문의 내용"
              className="support-hub-v2__field"
              value={inquiryForm.message}
              onChange={(e) => setInquiryForm((f) => ({ ...f, message: e.target.value }))}
            />
            <button type="submit" className="support-hub-v2__cta support-hub-v2__cta--primary w-full">
              문의 접수하기
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
