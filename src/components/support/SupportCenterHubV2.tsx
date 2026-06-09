"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import clsx from "clsx";
import { openChatInquiry } from "@/lib/chat-inquiry-events";
import { submitInquiry } from "@/lib/inquiry-storage";
import { INQUIRY_VEHICLE_OPTIONS } from "@/lib/inquiry-vehicle-options";
import { CONTACT } from "@/lib/contact-info";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import {
  COMMERCE_ORDER_LOOKUP_PAGE,
  ORDER_REQUEST_LOOKUP_PAGE,
} from "@/lib/customer-center-routes";
import type { SupportNotice } from "@/lib/support-notices-data";
import {
  SUPPORT_FAQ_ITEMS,
  type FaqCategory,
} from "@/lib/support-faq-data";
import {
  SUPPORT_HUB_BOTTOM_LINKS,
  SUPPORT_HUB_CATEGORIES,
  SUPPORT_HUB_FAQ_INITIAL_LIMIT,
  SUPPORT_HUB_FAQ_QUICK_LINKS,
  SUPPORT_HUB_MOBILE_FAQ_PRIORITY,
  SUPPORT_HUB_MOBILE_QUICK_LINKS,
  SUPPORT_HUB_NOTICE_INITIAL_LIMIT,
  SUPPORT_HUB_PRIMARY_CTAS,
  SUPPORT_HUB_SECONDARY_CTAS,
  faqCategoryToHub,
  type SupportHubCategoryId,
  type SupportHubCtaVariant,
} from "@/lib/support-center-config";

function supportHubCtaVariantClass(variant: SupportHubCtaVariant): string {
  return variant === "primary"
    ? "support-hub-v2__cta--primary"
    : "support-hub-v2__cta--secondary";
}

function useViewportMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function useFaqInitialLimit() {
  const [limit, setLimit] = useState<number>(SUPPORT_HUB_FAQ_INITIAL_LIMIT.desktop);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () =>
      setLimit(mq.matches ? SUPPORT_HUB_FAQ_INITIAL_LIMIT.mobile : SUPPORT_HUB_FAQ_INITIAL_LIMIT.desktop);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return limit;
}

function useNoticeLimit() {
  const [limit, setLimit] = useState<number>(SUPPORT_HUB_NOTICE_INITIAL_LIMIT.desktop);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () =>
      setLimit(mq.matches ? SUPPORT_HUB_NOTICE_INITIAL_LIMIT.mobile : SUPPORT_HUB_NOTICE_INITIAL_LIMIT.desktop);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return limit;
}

type Props = {
  notices: SupportNotice[];
};

export function SupportCenterHubV2({ notices }: Props) {
  const searchParams = useSearchParams();
  const isMobile = useViewportMobile();
  const faqInitialLimit = useFaqInitialLimit();
  const noticeLimit = useNoticeLimit();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SupportHubCategoryId>("all");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [faqExpanded, setFaqExpanded] = useState(false);
  const [inquiryExpanded, setInquiryExpanded] = useState(false);
  const [noticesExpanded, setNoticesExpanded] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    contact: "",
    vehicle: "",
    message: "",
  });

  const expandInquiryAndScroll = useCallback(() => {
    setInquiryExpanded(true);
    requestAnimationFrame(() => {
      document.getElementById("support-inquiry-name")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  useEffect(() => {
    if (searchParams.get("tab") === "inquiry") {
      if (isMobile) {
        expandInquiryAndScroll();
      } else {
        document.getElementById("support-inquiry")?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [searchParams, isMobile, expandInquiryAndScroll]);

  const q = query.trim().toLowerCase();

  useEffect(() => {
    setFaqExpanded(false);
    setOpenFaqId(null);
  }, [q, category]);

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

  const useMobileFaqPriority = isMobile && !q && category === "all" && !faqExpanded;

  const priorityFaq = useMemo(() => {
    if (!useMobileFaqPriority) return [];
    const byId = new Map(filteredFaq.map((item) => [item.id, item]));
    return SUPPORT_HUB_MOBILE_FAQ_PRIORITY.map((id) => byId.get(id)).filter(
      (item): item is (typeof SUPPORT_FAQ_ITEMS)[number] => Boolean(item),
    );
  }, [filteredFaq, useMobileFaqPriority]);

  const visibleFaq = faqExpanded
    ? filteredFaq
    : useMobileFaqPriority
      ? priorityFaq
      : filteredFaq.slice(0, faqInitialLimit);

  const hiddenFaqCount = faqExpanded
    ? 0
    : useMobileFaqPriority
      ? Math.max(0, filteredFaq.length - priorityFaq.length)
      : Math.max(0, filteredFaq.length - faqInitialLimit);

  const recentNotices = notices.slice(0, noticeLimit);
  const mobileNotices = noticesExpanded ? notices : notices.slice(0, noticeLimit);
  const hiddenNoticeCount = Math.max(0, notices.length - noticeLimit);

  const heroCtas = isMobile
    ? [...SUPPORT_HUB_PRIMARY_CTAS].reverse()
    : SUPPORT_HUB_PRIMARY_CTAS;

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitInquiry({
      name: inquiryForm.name.trim() || "고객",
      contact: inquiryForm.contact.trim(),
      vehicle: inquiryForm.vehicle.trim() || undefined,
      message: inquiryForm.message.trim(),
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      source: "support",
      inquiryType: "일반문의",
      category: "other",
    });
    if (result.ok) setInquirySubmitted(true);
  };

  const scrollToInquiry = () => {
    openChatInquiry();
    if (isMobile) {
      expandInquiryAndScroll();
      return;
    }
    document.querySelector(".support-hub-v2__inquiry--sidebar")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="support-hub-v2 mx-auto max-w-6xl space-y-6 lg:space-y-8" data-page="support-center-v2">
      <header
        className={clsx(
          "support-hub-v2__hero text-center sm:text-left",
          isMobile && "support-hub-v2__hero--compact",
        )}
      >
        <p className="support-hub-v2__hero-kicker hidden sm:block">Battery Manager Support</p>
        <h1 className="support-hub-v2__hero-title">고객센터</h1>
        <p className="support-hub-v2__hero-desc">
          {isMobile
            ? "주문 조회, 상담 문의, FAQ를 한곳에서 확인하세요."
            : "FAQ 검색, 주문 조회, 상담 문의를 한곳에서 이용하세요."}
        </p>
        <div
          className={clsx(
            "support-hub-v2__cta-row mt-5 flex gap-2",
            isMobile ? "support-hub-v2__cta-row--compact flex-row" : "flex-col sm:flex-row",
          )}
        >
          {heroCtas.map((cta) =>
            cta.id === "consult" ? (
              <button
                key={cta.id}
                type="button"
                className={clsx("support-hub-v2__cta", supportHubCtaVariantClass(cta.variant))}
                onClick={scrollToInquiry}
              >
                {cta.label}
              </button>
            ) : (
              <Link
                key={cta.id}
                href={cta.href}
                className={clsx("support-hub-v2__cta", supportHubCtaVariantClass(cta.variant))}
              >
                {cta.label}
              </Link>
            ),
          )}
        </div>
      </header>

      <div className="support-hub-v2__layout">
        <div className="support-hub-v2__main space-y-5">
          <section className={clsx("support-hub-v2__search", isMobile && "support-hub-v2__search--compact")}>
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

          <section className="support-hub-v2__faq" aria-label="자주 묻는 질문">
            <div className="support-hub-v2__faq-head">
              <span className="support-hub-v2__faq-badge">자주 찾는 질문</span>
              <h2 className="support-hub-v2__section-title">자주 묻는 질문</h2>
              <p className="support-hub-v2__faq-lead hidden sm:block">
                배터리 규격, 주문·배송, 반납, 장착 방식 등 자주 문의하시는 내용입니다.
              </p>
            </div>
            <div className="support-hub-v2__faq-list">
              {visibleFaq.map((item) => {
                const open = openFaqId === item.id;
                return (
                  <div
                    key={item.id}
                    className={clsx("support-hub-v2__faq-item", open && "support-hub-v2__faq-item--open")}
                  >
                    <button
                      type="button"
                      className="support-hub-v2__faq-trigger"
                      onClick={() => setOpenFaqId(open ? null : item.id)}
                      aria-expanded={open}
                    >
                      <span className="support-hub-v2__faq-question">{item.question}</span>
                      <ChevronDown
                        className={clsx(
                          "support-hub-v2__faq-chevron size-4 shrink-0 transition",
                          open && "rotate-180",
                        )}
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
            {!faqExpanded && hiddenFaqCount > 0 ? (
              <button
                type="button"
                className={clsx(
                  "support-hub-v2__faq-more mt-3",
                  isMobile ? "support-hub-v2__faq-more--compact" : "w-full",
                )}
                onClick={() => setFaqExpanded(true)}
              >
                자주 묻는 질문 더보기 (+{hiddenFaqCount})
              </button>
            ) : null}
            {faqExpanded && filteredFaq.length > faqInitialLimit ? (
              <button
                type="button"
                className={clsx(
                  "support-hub-v2__faq-more mt-3",
                  isMobile ? "support-hub-v2__faq-more--compact" : "w-full",
                )}
                onClick={() => setFaqExpanded(false)}
              >
                FAQ 접기
              </button>
            ) : null}
            <div className="support-hub-v2__faq-quicklinks hidden lg:flex" aria-label="FAQ 관련 빠른 링크">
              {SUPPORT_HUB_FAQ_QUICK_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="support-hub-v2__chip support-hub-v2__chip--link">
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="support-hub-v2__quick-menu lg:hidden" aria-label="빠른 안내">
            <h2 className="support-hub-v2__section-title">빠른 안내</h2>
            <div className="support-hub-v2__quick-grid">
              {SUPPORT_HUB_MOBILE_QUICK_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="support-hub-v2__quick-btn">
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <section id="support-notices-mobile" className="support-hub-v2__notices-mobile lg:hidden">
            <div className="flex items-center justify-between gap-2">
              <h2 className="support-hub-v2__section-title">최근 안내</h2>
            </div>
            <ol className="support-hub-v2__notice-list support-hub-v2__notice-list--compact">
              {mobileNotices.map((notice) => (
                <li key={notice.id}>
                  <Link href={`/support/notices/${notice.id}`} className="support-hub-v2__notice-row">
                    <span className="support-hub-v2__notice-row-inner">
                      {notice.important ? (
                        <span className="support-hub-v2__notice-badge">중요</span>
                      ) : null}
                      <span className="support-hub-v2__notice-title">{notice.title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            {!noticesExpanded && hiddenNoticeCount > 0 ? (
              <button
                type="button"
                className="support-hub-v2__faq-more support-hub-v2__faq-more--compact mt-2"
                onClick={() => setNoticesExpanded(true)}
              >
                최근 안내 더보기 (+{hiddenNoticeCount})
              </button>
            ) : null}
          </section>

          <section
            id="support-inquiry"
            className="support-hub-v2__side-card support-hub-v2__inquiry support-hub-v2__inquiry--main scroll-mt-24 lg:hidden"
          >
            {inquiryExpanded || inquirySubmitted ? (
              <InquiryForm
                inquirySubmitted={inquirySubmitted}
                inquiryForm={inquiryForm}
                setInquiryForm={setInquiryForm}
                onSubmit={handleInquirySubmit}
              />
            ) : (
              <div className="support-hub-v2__inquiry-collapsed">
                <h2 className="support-hub-v2__section-title text-base">상담 문의 접수</h2>
                <p className="mt-1 text-sm text-slate-600">
                  차량 정보나 주문 확인이 필요하시면 문의를 남겨주세요.
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  급하시면{" "}
                  <a href={CONTACT.customerCenter.tel} className="font-bold text-blue-700 hover:underline">
                    {CONTACT.customerCenter.phone}
                  </a>
                  으로 전화해 주세요.
                </p>
                <button
                  type="button"
                  className="support-hub-v2__cta support-hub-v2__cta--secondary support-hub-v2__inquiry-open mt-4 w-full"
                  onClick={expandInquiryAndScroll}
                >
                  문의 양식 열기
                </button>
              </div>
            )}
          </section>

          <div className="support-hub-v2__contact-mini lg:hidden">
            <p className="support-hub-v2__contact-mini-title">
              고객센터{" "}
              <a href={CONTACT.customerCenter.tel} className="hover:underline">
                {CONTACT.customerCenter.phone}
              </a>
            </p>
            <p className="support-hub-v2__contact-mini-desc">
              차량 정보나 주문 확인이 필요하시면 문의해 주세요.
            </p>
            <button
              type="button"
              className="support-hub-v2__cta support-hub-v2__cta--primary support-hub-v2__contact-mini-cta mt-3 w-full"
              onClick={scrollToInquiry}
            >
              상담 문의하기
            </button>
          </div>
        </div>

        <aside className="support-hub-v2__sidebar hidden space-y-3 lg:block">
          <div className="support-hub-v2__side-card support-hub-v2__side-card--consult">
            <h3 className="support-hub-v2__side-title">상담이 필요하신가요?</h3>
            <p className="support-hub-v2__side-desc">
              차량 정보나 주문 확인이 필요하시면 고객센터로 문의해 주세요.
            </p>
            <div className="support-hub-v2__phone-list">
              <div className="support-hub-v2__phone-list-item">
                <span className="font-bold text-slate-700">{CONTACT.customerCenter.label}</span>
                <a href={CONTACT.customerCenter.tel} className="support-hub-v2__phone-number hover:underline">
                  {CONTACT.customerCenter.phone}
                </a>
              </div>
            </div>
            <button
              type="button"
              className="support-hub-v2__cta support-hub-v2__cta--primary mt-3 w-full"
              onClick={scrollToInquiry}
            >
              상담 문의하기
            </button>
            <p className="mt-3 text-[11px] font-medium text-slate-500">
              가까운 매장 정보는{" "}
              <Link href={HUB_STORE_DETAIL} className="font-bold text-blue-700 hover:underline">
                매장 안내
              </Link>
              에서 확인하실 수 있습니다.
            </p>
          </div>

          <div className="support-hub-v2__side-card support-hub-v2__side-card--store">
            <h3 className="support-hub-v2__side-title">매장·출장 안내</h3>
            <p className="support-hub-v2__side-desc">
              부산 덕천점·학장점 위치와 출장 가능 권역을 확인하세요.
            </p>
            <Link
              href={HUB_STORE_DETAIL}
              className="support-hub-v2__cta support-hub-v2__cta--secondary mt-3 w-full"
            >
              매장 안내 보기
            </Link>
          </div>

          <div className="support-hub-v2__side-card support-hub-v2__side-card--lookup">
            <h3 className="support-hub-v2__side-title">주문 조회</h3>
            <p className="support-hub-v2__side-desc">
              주문번호와 연락처로 결제·주문 내역을 확인할 수 있습니다.
            </p>
            <Link
              href={COMMERCE_ORDER_LOOKUP_PAGE}
              className="support-hub-v2__cta support-hub-v2__cta--secondary mt-3 w-full"
            >
              주문 조회하기
            </Link>
            <Link
              href={ORDER_REQUEST_LOOKUP_PAGE}
              className="mt-2 block text-center text-xs font-bold text-slate-600 underline"
            >
              상담 접수 조회
            </Link>
          </div>

          <div id="support-notices" className="support-hub-v2__side-card">
            <div className="flex items-center justify-between gap-2">
              <h3 className="support-hub-v2__side-title">최근 안내</h3>
              <span className="text-[11px] font-bold text-slate-500">배송·운영 안내</span>
            </div>
            <p className="support-hub-v2__side-desc">
              배송, 운영시간, 이벤트 안내를 확인하세요.
            </p>
            <ol className="support-hub-v2__notice-list support-hub-v2__notice-list--compact">
              {recentNotices.map((notice) => (
                <li key={notice.id}>
                  <Link href={`/support/notices/${notice.id}`} className="support-hub-v2__notice-row">
                    <span className="support-hub-v2__notice-row-inner">
                      {notice.important ? (
                        <span className="support-hub-v2__notice-badge">중요</span>
                      ) : null}
                      <span className="support-hub-v2__notice-title">{notice.title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <section className="support-hub-v2__side-card support-hub-v2__inquiry support-hub-v2__inquiry--sidebar scroll-mt-24">
            <InquiryForm
              inquirySubmitted={inquirySubmitted}
              inquiryForm={inquiryForm}
              setInquiryForm={setInquiryForm}
              onSubmit={handleInquirySubmit}
            />
          </section>
        </aside>
      </div>

      <section className="support-hub-v2__bottom-grid hidden lg:grid" aria-label="안내 바로가기">
        {SUPPORT_HUB_BOTTOM_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="support-hub-v2__bottom-card">
            <span>{link.label}</span>
            <span>{link.desc}</span>
          </Link>
        ))}
      </section>

      <div className="hidden flex-wrap justify-center gap-2 lg:flex lg:justify-start">
        {SUPPORT_HUB_SECONDARY_CTAS.map((cta) => (
          <Link key={cta.href} href={cta.href} className="support-hub-v2__chip support-hub-v2__chip--link">
            {cta.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function InquiryForm({
  inquirySubmitted,
  inquiryForm,
  setInquiryForm,
  onSubmit,
}: {
  inquirySubmitted: boolean;
  inquiryForm: { name: string; contact: string; vehicle: string; message: string };
  setInquiryForm: React.Dispatch<
    React.SetStateAction<{ name: string; contact: string; vehicle: string; message: string }>
  >;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <>
      <h2 className="support-hub-v2__section-title text-base">상담 문의 접수</h2>
      <p className="mt-1 text-sm text-slate-600">
        문의 내용을 확인한 뒤 순서대로 연락드립니다. 급하시면{" "}
        <a href={CONTACT.customerCenter.tel} className="font-bold text-blue-700 hover:underline">
          {CONTACT.customerCenter.phone}
        </a>
        로 전화해 주세요.
      </p>
      {inquirySubmitted ? (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-5 text-center text-sm font-semibold text-emerald-800">
          문의가 접수되었습니다. 확인 후 연락드리겠습니다.
        </p>
      ) : (
        <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
          <input
            id="support-inquiry-name"
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
            rows={3}
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
    </>
  );
}
