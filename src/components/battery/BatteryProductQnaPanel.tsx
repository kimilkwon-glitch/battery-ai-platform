"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Lock } from "lucide-react";
import clsx from "clsx";
import { CustomerActionModal } from "@/components/common/CustomerActionModal";
import { submitInquiry } from "@/lib/inquiry-storage";
import type { ProductQnaPublicItem } from "@/lib/product-qna-public";
import { bm } from "@/lib/design-tokens";

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
  const [title, setTitle] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [message, setMessage] = useState("");
  const [isSecret, setIsSecret] = useState(false);
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

  const stats = useMemo(() => {
    const answered = items.filter((i) => i.statusLabel === "답변완료").length;
    return { total: items.length, answered, pending: items.length - answered };
  }, [items]);

  const handleWriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim() || !contact.trim() || !title.trim() || !message.trim()) {
      setSubmitError("필수 항목을 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    const result = await submitInquiry({
      name: name.trim(),
      contact: contact.trim(),
      vehicle: vehicle.trim() || undefined,
      title: title.trim(),
      message: message.trim(),
      batteryCode,
      productCode: batteryCode,
      productName: batteryCode,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      source: "product_qna",
      inquiryType: "상품문의",
      category: "battery",
      isSecret,
    });
    setSubmitting(false);
    if (result.ok) {
      setSubmitDone(true);
      setTitle("");
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
      <div className="battery-product-qna__head flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="battery-product-qna__title text-base font-black text-slate-900">상품 Q&A</h3>
          <div className="battery-product-qna__stats mt-2">
            <span className="battery-product-qna__stat">문의 {stats.total}</span>
            <span className="battery-product-qna__stat">답변완료 {stats.answered}</span>
            <span className="battery-product-qna__stat">답변대기 {stats.pending}</span>
          </div>
        </div>
        <button
          type="button"
          className={`${bm.btnNavy} text-xs`}
          onClick={() => setWriteOpen(true)}
        >
          상품 문의하기
        </button>
      </div>

      {loading ? (
        <p className="battery-product-qna__loading mt-4 text-sm font-medium text-slate-500">불러오는 중…</p>
      ) : items.length === 0 ? (
        <div className="battery-product-qna__empty mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center">
          <p className="text-sm font-black text-slate-800">등록된 상품 문의가 없습니다</p>
          <button
            type="button"
            className={`${bm.btnSecondary} mt-3 text-xs`}
            onClick={() => setWriteOpen(true)}
          >
            첫 문의 남기기
          </button>
        </div>
      ) : (
        <ul className="battery-product-qna__list mt-4">
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
                    {item.isSecret ? (
                      <span className="battery-product-qna__secret-badge inline-flex items-center gap-0.5">
                        <Lock className="size-3" aria-hidden />
                        비밀글
                      </span>
                    ) : null}
                    <span className="battery-product-qna__summary font-bold">{item.title}</span>
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
                        답변을 준비하고 있습니다.
                      </p>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <CustomerActionModal
        open={writeOpen}
        onClose={closeWriteModal}
        title="상품 문의하기"
        footer={
          submitDone ? (
            <button type="button" className={`${bm.btnPrimary} w-full justify-center text-sm font-black`} onClick={closeWriteModal}>
              확인
            </button>
          ) : (
            <>
              <button type="button" className={`${bm.btnSecondary} w-full justify-center text-sm font-black sm:flex-1`} onClick={closeWriteModal}>
                취소
              </button>
              <button type="submit" form="battery-product-qna-write-form" disabled={submitting} className={`${bm.btnPrimary} w-full justify-center text-sm font-black sm:flex-1`}>
                {submitting ? "접수 중…" : "문의 접수"}
              </button>
            </>
          )
        }
      >
        {submitDone ? (
          <p className="text-sm font-medium text-slate-600">문의가 접수되었습니다.</p>
        ) : (
          <form id="battery-product-qna-write-form" className="space-y-3" onSubmit={handleWriteSubmit}>
            <p className="text-xs font-bold text-slate-500">
              상품: <span className="text-slate-900">{batteryCode}</span>
            </p>
            {submitError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-800">{submitError}</p> : null}
            <label className="block text-sm font-bold text-slate-700">
              제목 <span className="text-red-600">*</span>
              <input required className={`${bm.input} bm-input-field mt-1 w-full`} value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              문의 내용 <span className="text-red-600">*</span>
              <textarea required rows={4} className={`${bm.input} bm-input-field mt-1 w-full resize-y`} value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              이름 <span className="text-red-600">*</span>
              <input required className={`${bm.input} bm-input-field mt-1 w-full`} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              연락처 <span className="text-red-600">*</span>
              <input required type="tel" className={`${bm.input} bm-input-field mt-1 w-full`} value={contact} onChange={(e) => setContact(e.target.value)} />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              차량명 (선택)
              <input className={`${bm.input} bm-input-field mt-1 w-full`} value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} />
              비밀글
            </label>
          </form>
        )}
      </CustomerActionModal>
    </div>
  );
}
