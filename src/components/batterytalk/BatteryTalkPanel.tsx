"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Battery, MessageCircle, Phone, Store, X } from "lucide-react";
import clsx from "clsx";
import { submitInquiry } from "@/lib/inquiry-storage";
import {
  BATTERYTALK_TOPIC_LABELS,
  type BatteryTalkOpenDetail,
  type BatteryTalkTopic,
} from "@/lib/batterytalk/batterytalk-constants";
import { CONTACT } from "@/lib/contact-info";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import type { ConsultationChannelSettings } from "@/lib/consultation/consultation-settings";
import { bm } from "@/lib/design-tokens";

const TOPICS: BatteryTalkTopic[] = [
  "spec",
  "visit",
  "order",
  "battery_return",
  "product",
  "other",
];

export function BatteryTalkPanel({
  open,
  onClose,
  preset,
  settings,
}: {
  open: boolean;
  onClose: () => void;
  preset?: BatteryTalkOpenDetail;
  settings?: ConsultationChannelSettings | null;
}) {
  const [topic, setTopic] = useState<BatteryTalkTopic>(preset?.topic ?? "spec");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [vehicle, setVehicle] = useState(preset?.vehicleName ?? "");
  const [region, setRegion] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setTopic(preset?.topic ?? "spec");
    setVehicle(preset?.vehicleName ?? "");
  }, [open, preset?.topic, preset?.vehicleName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const contextLines = [
      preset?.batteryCode ? `규격: ${preset.batteryCode}` : null,
      preset?.productName ? `상품: ${preset.productName}` : null,
      preset?.vehicleSlug ? `차량: ${preset.vehicleSlug}` : null,
      preset?.fuelType ? `연료: ${preset.fuelType}` : null,
      preset?.orderSummary ? `주문: ${preset.orderSummary}` : null,
    ].filter(Boolean);

    const body = [
      `[배터리톡] ${BATTERYTALK_TOPIC_LABELS[topic]}`,
      ...contextLines,
      region.trim() ? `지역: ${region.trim()}` : null,
      message.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    const result = await submitInquiry({
      name: name.trim() || "고객",
      contact: contact.trim(),
      vehicle: vehicle.trim() || undefined,
      region: region.trim() || undefined,
      message: body,
      batteryCode: preset?.batteryCode,
      productCode: preset?.productCode ?? preset?.batteryCode,
      productName: preset?.productName,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      source: "batterytalk",
      inquiryType: BATTERYTALK_TOPIC_LABELS[topic],
      category:
        topic === "order"
          ? "order"
          : topic === "visit"
            ? "shipping"
            : topic === "battery_return"
              ? "return"
              : topic === "spec" || topic === "product"
                ? "battery"
                : "other",
    });
    setSubmitting(false);
    if (result.ok) setSubmitted(true);
  };

  const ext = settings?.externalChannelsEnabled;
  const naverUrl = settings?.naverTalkUrl?.trim();
  const kakaoUrl = settings?.kakaoChannelUrl?.trim();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[90] bg-slate-900/45 backdrop-blur-[1px]"
            aria-label="배터리톡 닫기"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-labelledby="batterytalk-title"
            className="batterytalk-panel fixed bottom-0 left-0 right-0 z-[91] mx-auto flex max-h-[min(88vh,720px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-slate-200/80 bg-white shadow-2xl sm:bottom-6 sm:left-auto sm:right-6 sm:rounded-2xl"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.22 }}
          >
            <header className="batterytalk-panel__head flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#0891B2] px-4 py-4 text-white">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-white/15">
                    <Battery className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h2 id="batterytalk-title" className="text-base font-black">
                      배터리톡
                    </h2>
                    <p className="text-[11px] font-semibold text-white/80">규격·장착·주문 상담</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-white/80 hover:bg-white/10"
                aria-label="닫기"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
              {submitted ? (
                <div className="batterytalk-panel__done space-y-4 text-center">
                  <p className="text-lg font-black text-slate-900">상담 접수 완료</p>
                  <p className="text-sm font-medium text-slate-600">
                    확인 후 순서대로 연락드립니다.
                  </p>
                  <a
                    href={CONTACT.customerCenter.tel}
                    className="inline-block text-xl font-black text-blue-700"
                  >
                    {CONTACT.customerCenter.phone}
                  </a>
                  <Link href={HUB_STORE_DETAIL} className={`${bm.btnSecondary} w-full justify-center text-sm`}>
                    매장 안내 보기
                  </Link>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <p className="text-xs font-black text-slate-800">빠른 선택</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {TOPICS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTopic(t)}
                          className={clsx(
                            "rounded-full px-3 py-1.5 text-[11px] font-black transition",
                            topic === t
                              ? "bg-gradient-to-r from-[#0F172A] to-[#2563EB] text-white shadow-md"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                          )}
                        >
                          {BATTERYTALK_TOPIC_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {preset?.batteryCode ? (
                    <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800">
                      {preset.batteryCode}
                      {preset.productName ? ` · ${preset.productName}` : ""}
                    </p>
                  ) : null}

                  <label className="bm-inquiry-field">
                    이름
                    <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
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
                  <label className="bm-inquiry-field">
                    차량명
                    <input value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="예: 쏘렌토 TM" />
                  </label>
                  <label className="bm-inquiry-field">
                    지역
                    <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="예: 부산 사상구" />
                  </label>
                  <label className="bm-inquiry-field">
                    문의 내용
                    <textarea required rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="batterytalk-panel__submit w-full rounded-xl bg-gradient-to-r from-[#0F172A] via-[#2563EB] to-[#06B6D4] px-4 py-3.5 text-sm font-black text-white shadow-lg transition hover:scale-[1.01] disabled:opacity-60"
                  >
                    {submitting ? "접수 중…" : "상담 접수하기"}
                  </button>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={CONTACT.customerCenter.tel}
                      className={`${bm.btnTertiary} flex-1 justify-center gap-1.5 text-xs font-black`}
                    >
                      <Phone className="size-3.5" />
                      전화 문의
                    </a>
                    <Link
                      href={HUB_STORE_DETAIL}
                      className={`${bm.btnTertiary} flex-1 justify-center gap-1.5 text-xs font-black`}
                    >
                      <Store className="size-3.5" />
                      매장 안내
                    </Link>
                  </div>

                  {ext && (naverUrl || kakaoUrl) ? (
                    <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                      {naverUrl ? (
                        <a
                          href={naverUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${bm.btnSecondary} flex-1 justify-center text-xs`}
                        >
                          네이버 톡톡
                        </a>
                      ) : null}
                      {kakaoUrl ? (
                        <a
                          href={kakaoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${bm.btnSecondary} flex-1 justify-center text-xs`}
                        >
                          카카오 채널
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </form>
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
