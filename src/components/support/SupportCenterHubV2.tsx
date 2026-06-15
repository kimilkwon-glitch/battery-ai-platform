"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import clsx from "clsx";
import { SimpleInquiryForm, type SimpleInquiryFormValues } from "@/components/inquiry/SimpleInquiryForm";
import {
  SUPPORT_INQUIRY_CHIPS,
  chipCategory,
  chipLabel,
  getInquiryPageUrl,
} from "@/lib/inquiry/inquiry-form-shared";
import { submitInquiry } from "@/lib/inquiry-storage";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { scrollElementIntoViewWithOffset } from "@/lib/dom/scroll-element-into-view-with-offset";
import {
  COMMERCE_ORDER_LOOKUP_PAGE,
  ORDER_REQUEST_LOOKUP_PAGE,
} from "@/lib/customer-center-routes";
import type { SupportNotice } from "@/lib/support-notices-data";
import {
  SUPPORT_FAQ_ITEMS,
  type FaqCategory,
  type SupportFaqItem,
} from "@/lib/support-faq-data";
import { faqMatchesSearch } from "@/lib/support-faq-search";
import {
  SUPPORT_HUB_CATEGORIES,
  SUPPORT_HUB_FAQ_INITIAL_LIMIT,
  SUPPORT_HUB_FAQ_QUICK_LINKS,
  SUPPORT_HUB_MOBILE_FAQ_PRIORITY,
  SUPPORT_HUB_NOTICE_INITIAL_LIMIT,
  SUPPORT_HUB_PRIMARY_CTAS,
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
  faqItems?: SupportFaqItem[];
};

export function SupportCenterHubV2({ notices, faqItems }: Props) {
  const faqSource = faqItems ?? SUPPORT_FAQ_ITEMS;
  const searchParams = useSearchParams();
  const isMobile = useViewportMobile();
  const faqInitialLimit = useFaqInitialLimit();
  const noticeLimit = useNoticeLimit();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SupportHubCategoryId>("all");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [faqExpanded, setFaqExpanded] = useState(false);
  const [noticesExpanded, setNoticesExpanded] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);

  const scrollToInquiry = useCallback(() => {
    const el = document.getElementById("support-inquiry");
    if (el) scrollElementIntoViewWithOffset(el, { behavior: "smooth" });
  }, []);

  const priceInquiryPrefill = useMemo(() => {
    if (searchParams.get("inquiryKind") !== "price") return null;
    const productCode = searchParams.get("productCode")?.trim() ?? "";
    const productName = searchParams.get("productName")?.trim() ?? "";
    const brand = searchParams.get("brand")?.trim() ?? "";
    const from = searchParams.get("from")?.trim() ?? "";
    if (!productCode && !productName) return null;
    const label = [brand, productName || productCode].filter(Boolean).join(" ");
    const lines = [
      "가격 문의드립니다.",
      "",
      productName ? `상품명: ${productName}` : null,
      productCode ? `규격/상품코드: ${productCode}` : null,
      brand ? `브랜드: ${brand}` : null,
      from ? `참고 URL: ${from}` : null,
    ].filter(Boolean);
    return {
      productCode: productCode || undefined,
      productName: productName || productCode || undefined,
      productHint: label,
      initialMessage: lines.join("\n"),
      pageUrl: from || undefined,
    };
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("tab") === "inquiry") {
      scrollToInquiry();
    }
  }, [searchParams, scrollToInquiry]);

  const q = query.trim().toLowerCase();

  useEffect(() => {
    setFaqExpanded(false);
    setOpenFaqId(null);
  }, [q, category]);

  const filteredFaq = useMemo(() => {
    return faqSource.filter((item) => {
      const hubCat = faqCategoryToHub(item.category as Exclude<FaqCategory, "전체">);
      if (category !== "all" && hubCat !== category) return false;
      return faqMatchesSearch(item, q);
    });
  }, [faqSource, q, category]);

  const useMobileFaqPriority = isMobile && !q && category === "all" && !faqExpanded;

  const priorityFaq = useMemo(() => {
    if (!useMobileFaqPriority) return [];
    const byId = new Map(filteredFaq.map((item) => [item.id, item]));
    return SUPPORT_HUB_MOBILE_FAQ_PRIORITY.map((id) => byId.get(id)).filter(
      (item): item is SupportFaqItem => Boolean(item),
    );
  }, [filteredFaq, useMobileFaqPriority]);

  const visibleFaq = q
    ? filteredFaq
    : faqExpanded
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

  const handleInquirySubmit = async (values: SimpleInquiryFormValues) => {
    setInquirySubmitting(true);
    const chip = values.chipId ?? (priceInquiryPrefill ? "spec" : SUPPORT_INQUIRY_CHIPS[0]?.id ?? "other");
    const result = await submitInquiry({
      name: values.name?.trim() || "고객",
      contact: values.contact.trim(),
      vehicle: values.vehicle?.trim() || undefined,
      message: values.message.trim(),
      pageUrl: priceInquiryPrefill?.pageUrl ?? getInquiryPageUrl(),
      source: "support",
      inquiryType: priceInquiryPrefill ? "가격문의" : chipLabel(chip, SUPPORT_INQUIRY_CHIPS),
      category: chipCategory(chip, SUPPORT_INQUIRY_CHIPS),
      productCode: priceInquiryPrefill?.productCode,
      productName: priceInquiryPrefill?.productName,
      batteryCode: priceInquiryPrefill?.productCode,
    });
    setInquirySubmitting(false);
    if (result.ok) setInquirySubmitted(true);
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
            isMobile ? "hidden" : "flex-col sm:flex-row",
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
            className="support-hub-v2__chips hidden lg:flex"
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
                관련 질문을 찾지 못했습니다. 다른 키워드로 검색하거나 상담 문의를 이용해 주세요.
              </p>
            ) : null}
            {!q && !faqExpanded && hiddenFaqCount > 0 ? (
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

          <QuickActionsCard className="lg:hidden" />

          <RecentNoticesCard
            className="lg:hidden"
            notices={mobileNotices}
            hiddenCount={hiddenNoticeCount}
            expanded={noticesExpanded}
            onExpand={() => setNoticesExpanded(true)}
          />

          <section
            id="support-inquiry"
            className="support-hub-v2__side-card support-hub-v2__inquiry support-hub-v2__inquiry--main scroll-mt-24 lg:hidden"
          >
            <InquiryForm
              inquirySubmitted={inquirySubmitted}
              submitting={inquirySubmitting}
              onSubmit={handleInquirySubmit}
              priceInquiryPrefill={priceInquiryPrefill}
            />
          </section>
        </div>

        <aside className="support-hub-v2__sidebar hidden space-y-4 lg:block">
          <QuickActionsCard />

          <RecentNoticesCard notices={recentNotices} />

          <section className="support-hub-v2__side-card support-hub-v2__inquiry support-hub-v2__inquiry--sidebar scroll-mt-24">
            <InquiryForm
              inquirySubmitted={inquirySubmitted}
              submitting={inquirySubmitting}
              onSubmit={handleInquirySubmit}
              priceInquiryPrefill={priceInquiryPrefill}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}

function SupportNoticeBadge({ important }: { important?: boolean }) {
  if (important) {
    return <span className="support-hub-v2__notice-badge">중요</span>;
  }
  return <span className="support-hub-v2__notice-badge support-hub-v2__notice-badge--info">안내</span>;
}

function QuickActionsCard({ className }: { className?: string }) {
  return (
    <section
      className={clsx("support-hub-v2__side-card support-hub-v2__side-card--quick", className)}
      aria-label="자주 찾는 기능"
    >
      <h3 className="support-hub-v2__side-title">자주 찾는 기능</h3>
      <p className="support-hub-v2__side-desc">주문 확인과 매장 안내를 빠르게 이용하세요.</p>
      <div className="support-hub-v2__quick-actions">
        <Link href={COMMERCE_ORDER_LOOKUP_PAGE} className="support-hub-v2__quick-action">
          주문 조회
        </Link>
        <Link href={ORDER_REQUEST_LOOKUP_PAGE} className="support-hub-v2__quick-action">
          상담 접수 조회
        </Link>
        <Link href={HUB_STORE_DETAIL} className="support-hub-v2__quick-action">
          매장·출장 안내
        </Link>
      </div>
    </section>
  );
}

function RecentNoticesCard({
  notices,
  hiddenCount = 0,
  expanded = true,
  onExpand,
  className,
}: {
  notices: SupportNotice[];
  hiddenCount?: number;
  expanded?: boolean;
  onExpand?: () => void;
  className?: string;
}) {
  return (
    <section
      id="support-notices"
      className={clsx("support-hub-v2__side-card support-hub-v2__side-card--notices", className)}
      aria-label="최근 안내"
    >
      <h3 className="support-hub-v2__side-title">최근 안내</h3>
      <p className="support-hub-v2__side-desc">배송·운영·이벤트 공지를 확인하세요.</p>
      <ol className="support-hub-v2__notice-list support-hub-v2__notice-list--airy">
        {notices.map((notice) => (
          <li key={notice.id}>
            <Link href={`/support/notices/${notice.id}`} className="support-hub-v2__notice-row">
              <SupportNoticeBadge important={notice.important} />
              <span className="support-hub-v2__notice-body">
                <span className="support-hub-v2__notice-title">{notice.title}</span>
                <span className="support-hub-v2__notice-date">{notice.date}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {!expanded && hiddenCount > 0 && onExpand ? (
        <button
          type="button"
          className="support-hub-v2__faq-more support-hub-v2__faq-more--compact mt-3 w-full"
          onClick={onExpand}
        >
          최근 안내 더보기 (+{hiddenCount})
        </button>
      ) : null}
    </section>
  );
}

function InquiryForm({
  inquirySubmitted,
  submitting,
  onSubmit,
  priceInquiryPrefill,
}: {
  inquirySubmitted: boolean;
  submitting: boolean;
  onSubmit: (values: SimpleInquiryFormValues) => void | Promise<void>;
  priceInquiryPrefill?: {
    productHint?: string;
    initialMessage?: string;
  } | null;
}) {
  return (
    <div className="support-hub-v2__inquiry-card">
      <h2 className="support-hub-v2__inquiry-title">
        {priceInquiryPrefill ? "상품·가격 문의" : "문의 접수"}
      </h2>
      <p className="support-hub-v2__inquiry-lead">
        {priceInquiryPrefill
          ? "선택하신 상품 정보가 미리 입력됩니다. 연락처와 문의 내용을 확인해 주세요."
          : "문의 유형을 선택하고 연락처와 내용을 남겨주세요."}
      </p>
      {inquirySubmitted ? (
        <p className="support-hub-v2__inquiry-success">
          문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.
        </p>
      ) : (
        <div className="support-hub-v2__inquiry-form">
          <SimpleInquiryForm
            contactInputId="support-inquiry-contact"
            chips={SUPPORT_INQUIRY_CHIPS}
            defaultChipId={priceInquiryPrefill ? "spec" : undefined}
            productHint={priceInquiryPrefill?.productHint}
            initialMessage={priceInquiryPrefill?.initialMessage}
            messageFirst={Boolean(priceInquiryPrefill)}
            submitLabel="문의 접수하기"
            submitting={submitting}
            optionalFields={["name", "vehicle"]}
            onSubmit={onSubmit}
            submitClassName="support-hub-v2__cta support-hub-v2__cta--primary simple-inquiry-form__submit w-full"
          />
        </div>
      )}
    </div>
  );
}
