"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { OwnedCouponHint } from "@/components/benefits/CouponIssuerPanel";
import { addInquiry } from "@/lib/inquiry-storage";
import { getUserCouponForBenefit } from "@/lib/coupon-storage";
import type { ChatInquiryOpenDetail } from "@/lib/chat-inquiry-events";
import {
  BATTERY_RETURN_OPTIONS,
  type BatteryReturnOption,
} from "@/lib/shop-order-types";
import { bm } from "@/lib/design-tokens";

export function ChatInquiryPanel({
  open,
  onClose,
  preset,
}: {
  open: boolean;
  onClose: () => void;
  preset?: ChatInquiryOpenDetail;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [vehicle, setVehicle] = useState(preset?.vehicle ?? "");
  const [message, setMessage] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [returnOption, setReturnOption] = useState<BatteryReturnOption>(
    (preset?.returnOption as BatteryReturnOption) ?? "return",
  );
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setSubmitted(false);
      if (preset?.vehicle) setVehicle(preset.vehicle);
      const held = getUserCouponForBenefit("first-order-3")?.code;
      setCouponCode(held ?? "");
    }
  }, [open, preset?.vehicle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInquiry({
      name: name.trim() || "고객",
      contact: contact.trim(),
      vehicle: vehicle.trim() || undefined,
      message: message.trim(),
      batteryCode: preset?.batteryCode,
      returnOption,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      source: "chat",
      inquiryType: "채팅상담",
      couponCode: couponCode.trim() || undefined,
    });
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[90] bg-slate-900/40"
            aria-label="상담창 닫기"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-labelledby="chat-inquiry-title"
            className="fixed bottom-0 left-0 right-0 z-[91] mx-auto max-h-[85vh] max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:bottom-24 sm:left-auto sm:right-6 sm:rounded-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2 id="chat-inquiry-title" className="text-base font-black text-slate-950">
                  채팅상담 문의
                </h2>
                <p className="text-[11px] font-semibold text-slate-500">
                  실시간 채팅이 아닌 상담 접수입니다. 확인 후 연락드립니다.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
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
                <form className="space-y-3" onSubmit={handleSubmit}>
                  {preset?.batteryCode ? (
                    <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800">
                      선택 규격: {preset.batteryCode}
                      {preset.returnOption ? ` · 반납옵션 ${preset.returnOption}` : ""}
                    </p>
                  ) : null}
                  <label className="block text-xs font-bold text-slate-600">
                    이름 또는 닉네임
                    <input
                      required
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                  <label className="block text-xs font-bold text-slate-600">
                    연락처
                    <input
                      required
                      type="tel"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"
                      placeholder="010-0000-0000"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                    />
                  </label>
                  <label className="block text-xs font-bold text-slate-600">
                    차량명
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                    />
                  </label>
                  <label className="block text-xs font-bold text-slate-600">
                    쿠폰 코드 (선택)
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm font-semibold"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="BM-FIRST3-XXXX"
                    />
                  </label>
                  <label className="block text-xs font-bold text-slate-600">
                    문의 내용
                    <textarea
                      required
                      rows={4}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </label>
                  <fieldset>
                    <legend className="text-xs font-bold text-slate-600">폐배터리 반납</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {BATTERY_RETURN_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setReturnOption(opt.id)}
                          className={`rounded-lg border px-3 py-1.5 text-[11px] font-black ${
                            returnOption === opt.id
                              ? "border-blue-400 bg-blue-50 text-blue-800"
                              : "border-slate-200 text-slate-600"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <button type="submit" className={`${bm.btnPrimary} w-full`}>
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
