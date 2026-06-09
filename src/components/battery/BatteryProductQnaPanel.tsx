"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { CustomerActionModal } from "@/components/common/CustomerActionModal";
import { submitInquiry } from "@/lib/inquiry-storage";
import type { ProductQnaPublicItem } from "@/lib/product-qna-public";
import { bm } from "@/lib/design-tokens";

const INQUIRY_TYPES = [
  "장착 가능 여부",
  "재고/가격 문의",
  "출장/방문 문의",
  "기타",
] as const;

type Props = {
  batteryCode: string;
};

function formatQnaDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export function BatteryProductQnaPanel({ batteryCode }: Props) {
  const [items, setItems] = useState<ProductQnaPublicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [writeOpen, setWriteOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [inquiryType, setInquiryType] = useState<string>(INQUIRY_TYPES[0]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitDone, setSubmitDone] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/support/inquiries?battery=${encodeURIComponent(batteryCode)}&public=1`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as { ok?: boolean; items?: ProductQnaPublicItem[] };
      if (res.ok && data.ok && Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [batteryCode]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const handleWriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim() || !contact.trim() || !message.trim()) {
      setSubmitError("이름, 연락처, 문의 내용을 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    const memo = [
      `[상품문의] ${batteryCode}`,
      `문의 유형: ${inquiryType}`,
      `내용: ${message.trim()}`,
    ].join("\n");
    const result = await submitInquiry({
      name: name.trim(),
      contact: contact.trim(),
      message: memo,
      batteryCode,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      source: "product_detail",
      inquiryType,
      category: "battery",
    });
    setSubmitting(false);
    if (result.ok) {
      setSubmitDone(true);
      setMessage("");
      void loadItems();
    } else {
      setSubmitError("문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const closeWriteModal = () => {
    setWriteOpen(false);
    setSubmitDone(false);
    setSubmitError(null);
  };

  return (
    <div className="battery-product-qna" data-battery-product-qna={batteryCode}>
      <div className="battery-product-qna__head">
        <h3 className="battery-product-qna__title">상품 문의</h3>
        <p className="battery-product-qna__desc">
          이 규격({batteryCode})에 대한 문의와 답변을 확인할 수 있습니다.
        </p>
      </div>

      {loading ? (
        <p className="battery-product-qna__loading text-sm font-medium text-slate-500">불러오는 중…</p>
      ) : items.length === 0 ? (
        <div className="battery-product-qna__empty">
          <p className="text-sm font-bold text-slate-700">등록된 상품 문의가 없습니다.</p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            규격 확인이 필요하면 아래에서 이 상품 문의를 남겨 주세요.
          </p>
        </div>
      ) : (
        <ul className="battery-product-qna__list">
          {items.map((item) => {
            const open = expandedId === item.id;
            return (
              <li key={item.id} className={clsx("battery-product-qna__item", open && "battery-product-qna__item--open")}>
                <button
                  type="button"
                  className="battery-product-qna__trigger"
                  aria-expanded={open}
                  onClick={() => setExpandedId(open ? null : item.id)}
                >
                  <span className="battery-product-qna__trigger-main">
                    <span
                      className={clsx(
                        "battery-product-qna__status",
                        item.statusLabel === "답변완료"
                          ? "battery-product-qna__status--done"
                          : "battery-product-qna__status--pending",
                      )}
                    >
                      {item.statusLabel}
                    </span>
                    <span className="battery-product-qna__summary">{item.summary}</span>
                  </span>
                  <span className="battery-product-qna__meta">
                    <span>{item.authorMasked}</span>
                    <span aria-hidden>·</span>
                    <span>{formatQnaDate(item.createdAt)}</span>
                    <ChevronDown
                      className={clsx("battery-product-qna__chevron size-4", open && "rotate-180")}
                      aria-hidden
                    />
                  </span>
                </button>
                {open ? (
                  <div className="battery-product-qna__panel">
                    <p className="battery-product-qna__question">
                      <span className="battery-product-qna__panel-label">질문</span>
                      {item.question}
                    </p>
                    {item.answer ? (
                      <p className="battery-product-qna__answer">
                        <span className="battery-product-qna__panel-label">답변</span>
                        {item.answer}
                      </p>
                    ) : (
                      <p className="battery-product-qna__answer-pending text-xs font-medium text-slate-500">
                        답변 준비 중입니다.
                      </p>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        className={`${bm.btnSecondary} battery-product-qna__write-btn mt-4 w-full justify-center text-sm font-black`}
        onClick={() => setWriteOpen(true)}
      >
        이 상품 문의하기
      </button>

      <CustomerActionModal
        open={writeOpen}
        onClose={closeWriteModal}
        title="이 상품 문의하기"
        footer={
          submitDone ? (
            <button
              type="button"
              className={`${bm.btnPrimary} w-full justify-center text-sm font-black`}
              onClick={closeWriteModal}
            >
              확인
            </button>
          ) : (
            <>
              <button
                type="button"
                autoFocus
                className={`${bm.btnSecondary} w-full justify-center text-sm font-black sm:flex-1`}
                onClick={closeWriteModal}
              >
                취소
              </button>
              <button
                type="submit"
                form="battery-product-qna-write-form"
                disabled={submitting}
                className={`${bm.btnPrimary} w-full justify-center text-sm font-black sm:flex-1`}
              >
                {submitting ? "접수 중…" : "문의 접수"}
              </button>
            </>
          )
        }
      >
        {submitDone ? (
          <p className="text-sm font-medium leading-relaxed text-slate-600">
            문의가 접수되었습니다. 확인 후 답변이 등록됩니다.
          </p>
        ) : (
          <form id="battery-product-qna-write-form" className="space-y-3" onSubmit={handleWriteSubmit}>
            <p className="text-sm font-medium text-slate-600">
              문의 규격: <span className="font-black text-slate-900">{batteryCode}</span>
            </p>
            {submitError ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-800">{submitError}</p>
            ) : null}
            <label className="block text-sm font-bold text-slate-700">
              이름 <span className="text-red-600">*</span>
              <input
                required
                type="text"
                className={`${bm.input} bm-input-field mt-1 w-full`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              연락처 <span className="text-red-600">*</span>
              <input
                required
                type="tel"
                placeholder="010-0000-0000"
                className={`${bm.input} bm-input-field mt-1 w-full`}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              문의 유형
              <select
                className={`${bm.input} bm-input-field mt-1 w-full`}
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
              >
                {INQUIRY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-700">
              문의 내용 <span className="text-red-600">*</span>
              <textarea
                required
                rows={4}
                className={`${bm.input} bm-input-field mt-1 w-full resize-y`}
                placeholder="차량명, 연식, 장착 공간 등 궁금한 내용을 적어 주세요."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
          </form>
        )}
      </CustomerActionModal>
    </div>
  );
}
