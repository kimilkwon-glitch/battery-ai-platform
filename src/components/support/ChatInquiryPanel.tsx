"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { addInquiry } from "@/lib/inquiry-storage";
import { INQUIRY_VEHICLE_OPTIONS } from "@/lib/inquiry-vehicle-options";
import type { ChatInquiryOpenDetail } from "@/lib/chat-inquiry-events";
import { bm } from "@/lib/design-tokens";

function isProductInquiry(preset?: ChatInquiryOpenDetail): boolean {
  return preset?.variant === "product" || Boolean(preset?.batteryCode);
}

export function ChatInquiryPanel({
  open,
  onClose,
  preset,
}: {
  open: boolean;
  onClose: () => void;
  preset?: ChatInquiryOpenDetail;
}) {
  const productMode = isProductInquiry(preset);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [vehicle, setVehicle] = useState(preset?.vehicle ?? "");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setVehicle(preset?.vehicle ?? "");
  }, [open, preset?.vehicle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInquiry({
      name: name.trim() || "고객",
      contact: contact.trim(),
      vehicle: vehicle.trim() || undefined,
      message: message.trim(),
      batteryCode: preset?.batteryCode,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      source: productMode ? "product_detail" : "chat",
      inquiryType: productMode ? "제품문의" : "채팅상담",
    });
    setSubmitted(true);
  };

  const title = productMode ? "제품 문의" : "채팅상담 문의";
  const subtitle = productMode
    ? "장착 가능 여부, 재고, 배송 관련 문의를 남겨주세요. 확인 후 연락드리겠습니다."
    : "실시간 채팅이 아닌 상담 접수입니다. 확인 후 연락드립니다.";

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[90] bg-slate-900/40"
            aria-label="문의창 닫기"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-labelledby="chat-inquiry-title"
            className="bm-inquiry-modal fixed bottom-0 left-0 right-0 z-[91] mx-auto max-w-lg rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:bottom-24 sm:left-auto sm:right-6 sm:max-h-[min(85vh,640px)] sm:rounded-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22 }}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3">
              <div className="min-w-0 pr-2">
                <h2 id="chat-inquiry-title" className="text-base font-black text-slate-950">
                  {title}
                </h2>
                <p className="mt-0.5 text-[11px] font-semibold leading-snug text-slate-500">
                  {subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="닫기"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-4">
              {submitted ? (
                <p className="rounded-xl bg-emerald-50 px-4 py-6 text-center text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
                  문의가 접수되었습니다. 확인 후 연락드리겠습니다.
                </p>
              ) : (
                <form className="space-y-3.5" onSubmit={handleSubmit}>
                  {preset?.batteryCode ? (
                    <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800">
                      문의 규격: {preset.batteryCode}
                    </p>
                  ) : null}
                  <label className="bm-inquiry-field">
                    이름 또는 닉네임
                    <input
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                  <label className="bm-inquiry-field">
                    연락처
                    <input
                      required
                      type="tel"
                      autoComplete="tel"
                      placeholder="010-0000-0000"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                    />
                  </label>
                  {productMode ? (
                    <label className="bm-inquiry-field">
                      차량명 (선택)
                      <select
                        value={vehicle}
                        onChange={(e) => setVehicle(e.target.value)}
                      >
                        {INQUIRY_VEHICLE_OPTIONS.map((opt) => (
                          <option key={opt.value || "empty"} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <label className="bm-inquiry-field">
                      차량명
                      <input value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
                    </label>
                  )}
                  <label className="bm-inquiry-field">
                    문의 내용
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        productMode
                          ? "장착 가능 여부, 재고, 배송 일정 등을 적어 주세요."
                          : undefined
                      }
                    />
                  </label>
                  <button type="submit" className={`${bm.btnPrimary} min-h-[3.25rem] w-full`}>
                    문의 접수하기
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
