"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import clsx from "clsx";
import { submitInquiry } from "@/lib/inquiry-storage";
import { INQUIRY_VEHICLE_OPTIONS } from "@/lib/inquiry-vehicle-options";
import { SUPPORT_NOTICES } from "@/lib/support-notices-data";
import { CustomerFaqAccordion } from "@/components/support/CustomerFaqAccordion";
import { CUSTOMER_CENTER_FAQ } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

type TabId = "notices" | "faq" | "inquiry";
type InquiryKind = "general" | "return";

export function SupportCenterClient() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<TabId>("notices");
  const [query, setQuery] = useState("");
  const [inquiryKind, setInquiryKind] = useState<InquiryKind>("general");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [generalForm, setGeneralForm] = useState({
    name: "",
    contact: "",
    vehicle: "",
    message: "",
  });
  const [returnForm, setReturnForm] = useState({
    name: "",
    contact: "",
    region: "",
    message: "",
  });

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "faq" || t === "inquiry" || t === "notices") setTab(t);
    const kind = searchParams.get("kind");
    if (kind === "return") {
      setTab("inquiry");
      setInquiryKind("return");
    }
  }, [searchParams]);

  const q = query.trim().toLowerCase();

  const filteredNotices = useMemo(() => {
    if (!q) return SUPPORT_NOTICES;
    return SUPPORT_NOTICES.filter(
      (n) => n.title.toLowerCase().includes(q) || n.date.includes(q),
    );
  }, [q]);

  const submitGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingInquiry) return;
    setSubmittingInquiry(true);
    try {
      const result = await submitInquiry({
        name: generalForm.name.trim() || "고객",
        contact: generalForm.contact.trim(),
        vehicle: generalForm.vehicle.trim() || undefined,
        message: generalForm.message.trim(),
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        source: "support",
        inquiryType: "일반문의",
        category: "other",
      });
      if (result.ok) setInquirySubmitted(true);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const submitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingInquiry) return;
    setSubmittingInquiry(true);
    try {
      const region = returnForm.region.trim();
      const body = returnForm.message.trim();
      const result = await submitInquiry({
        name: returnForm.name.trim() || "고객",
        contact: returnForm.contact.trim(),
        message: [region ? `회수 지역: ${region}` : null, body || "폐배터리 회수 신청"]
          .filter(Boolean)
          .join("\n"),
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        source: "support",
        inquiryType: "폐배터리회수",
        category: "return",
      });
      if (result.ok) setInquirySubmitted(true);
    } finally {
      setSubmittingInquiry(false);
    }
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
                        <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-black text-red-700 ring-1 ring-red-100">
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
        <section className="space-y-3">
          <Link
            href={CUSTOMER_CENTER_FAQ}
            className="text-sm font-black text-blue-700 hover:underline"
          >
            FAQ 전체 페이지 보기 →
          </Link>
          <CustomerFaqAccordion externalQuery={query} showSearch={false} />
        </section>
      ) : null}

      {tab === "inquiry" ? (
        <section className={`${bm.card} ${bm.cardPad} max-w-xl`}>
          <p className="text-sm font-medium leading-relaxed text-slate-600">
            문의를 남겨주시면 확인 후 연락드리겠습니다. 정확한 안내를 위해 연락처를 남겨주세요.
          </p>

          {inquirySubmitted ? (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-6 text-center text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
              문의가 접수되었습니다. 확인 후 연락드리겠습니다.
            </p>
          ) : (
            <>
              <div className="bm-inquiry-tabs mt-4" role="tablist" aria-label="문의 목적">
                <button
                  type="button"
                  role="tab"
                  aria-selected={inquiryKind === "general"}
                  className={clsx(
                    "bm-inquiry-tabs__btn",
                    inquiryKind === "general" && "bm-inquiry-tabs__btn--active",
                  )}
                  onClick={() => setInquiryKind("general")}
                >
                  일반 문의
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={inquiryKind === "return"}
                  className={clsx(
                    "bm-inquiry-tabs__btn",
                    inquiryKind === "return" && "bm-inquiry-tabs__btn--active",
                  )}
                  onClick={() => setInquiryKind("return")}
                >
                  폐배터리 회수 신청
                </button>
              </div>

              {inquiryKind === "general" ? (
                <form className="mt-4 space-y-3.5" onSubmit={submitGeneral}>
                  <label className="bm-inquiry-field">
                    이름
                    <input
                      required
                      value={generalForm.name}
                      onChange={(e) =>
                        setGeneralForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </label>
                  <label className="bm-inquiry-field">
                    연락처
                    <input
                      required
                      type="tel"
                      placeholder="010-0000-0000"
                      value={generalForm.contact}
                      onChange={(e) =>
                        setGeneralForm((f) => ({ ...f, contact: e.target.value }))
                      }
                    />
                  </label>
                  <label className="bm-inquiry-field">
                    차량명 (선택)
                    <select
                      value={generalForm.vehicle}
                      onChange={(e) =>
                        setGeneralForm((f) => ({ ...f, vehicle: e.target.value }))
                      }
                    >
                      {INQUIRY_VEHICLE_OPTIONS.map((opt) => (
                        <option key={opt.value || "empty"} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="bm-inquiry-field">
                    문의 내용
                    <textarea
                      required
                      rows={5}
                      value={generalForm.message}
                      onChange={(e) =>
                        setGeneralForm((f) => ({ ...f, message: e.target.value }))
                      }
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className={`${bm.btnPrimary} min-h-[3.25rem] w-full disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {submittingInquiry ? "접수 중…" : "문의 접수하기"}
                  </button>
                </form>
              ) : (
                <form className="mt-4 space-y-3.5" onSubmit={submitReturn}>
                  <p className="text-sm font-medium text-slate-600">
                    회수 가능 지역 확인 후 안내드리겠습니다.
                  </p>
                  <label className="bm-inquiry-field">
                    이름
                    <input
                      required
                      value={returnForm.name}
                      onChange={(e) =>
                        setReturnForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </label>
                  <label className="bm-inquiry-field">
                    연락처
                    <input
                      required
                      type="tel"
                      placeholder="010-0000-0000"
                      value={returnForm.contact}
                      onChange={(e) =>
                        setReturnForm((f) => ({ ...f, contact: e.target.value }))
                      }
                    />
                  </label>
                  <label className="bm-inquiry-field">
                    회수 지역 또는 주소
                    <input
                      required
                      placeholder="예: 부산 북구, 덕천동"
                      value={returnForm.region}
                      onChange={(e) =>
                        setReturnForm((f) => ({ ...f, region: e.target.value }))
                      }
                    />
                  </label>
                  <label className="bm-inquiry-field">
                    요청 내용 (선택)
                    <textarea
                      rows={3}
                      placeholder="배터리 수량, 방문 가능 시간 등"
                      value={returnForm.message}
                      onChange={(e) =>
                        setReturnForm((f) => ({ ...f, message: e.target.value }))
                      }
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className={`${bm.btnPrimary} min-h-[3.25rem] w-full disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {submittingInquiry ? "접수 중…" : "회수 신청하기"}
                  </button>
                </form>
              )}
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}
