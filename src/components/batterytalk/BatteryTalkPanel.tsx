"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Battery, Phone, Store, X } from "lucide-react";
import { SimpleInquiryForm, type SimpleInquiryFormValues } from "@/components/inquiry/SimpleInquiryForm";
import { submitBatteryTalk } from "@/lib/battery-talk/battery-talk-client";
import { inferBatteryTalkPageType } from "@/lib/battery-talk/battery-talk-context";
import { BATTERYTALK_INQUIRY_CHIPS } from "@/lib/inquiry/inquiry-form-shared";
import type { BatteryTalkOpenDetail } from "@/lib/batterytalk/batterytalk-constants";
import { CONTACT } from "@/lib/contact-info";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import type { ConsultationChannelSettings } from "@/lib/consultation/consultation-settings";
import { bm } from "@/lib/design-tokens";

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
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setFormKey((k) => k + 1);
  }, [open, preset?.topic, preset?.batteryCode]);

  const productHint = preset?.productName
    ? `${preset.productName} · 규격·장착 문의`
    : undefined;

  const handleSubmit = async (values: SimpleInquiryFormValues) => {
    setSubmitting(true);
    const pageUrl = typeof window !== "undefined" ? window.location.href : undefined;
    const result = await submitBatteryTalk({
      customerName: values.name?.trim() || "고객",
      phone: values.contact.trim(),
      message: values.message.trim(),
      userId: values.userId,
      isMember: values.isMember,
      context: {
        pageUrl,
        pageType: inferBatteryTalkPageType(pageUrl),
        topic: values.chipLabel,
        batteryCode: preset?.batteryCode,
        productCode: preset?.productCode ?? preset?.batteryCode,
        productName: preset?.productName,
        vehicleSlug: preset?.vehicleSlug,
        vehicleName: values.vehicle?.trim() || preset?.vehicleName,
        selectedFuel: preset?.fuelType,
        cartSummary: preset?.orderSummary,
        region: values.region?.trim() || undefined,
      },
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
                  <p className="text-sm font-medium text-slate-600">확인 후 순서대로 연락드립니다.</p>
                  <a href={CONTACT.customerCenter.tel} className="inline-block text-xl font-black text-blue-700">
                    {CONTACT.customerCenter.phone}
                  </a>
                  <Link href={HUB_STORE_DETAIL} className={`${bm.btnSecondary} w-full justify-center text-sm`}>
                    매장 안내 보기
                  </Link>
                </div>
              ) : (
                <>
                  <SimpleInquiryForm
                    key={formKey}
                    chips={BATTERYTALK_INQUIRY_CHIPS}
                    defaultChipId={preset?.topic ?? "spec"}
                    productHint={productHint}
                    submitLabel="상담 접수하기"
                    submitting={submitting}
                    optionalFields={["name", "vehicle", "region"]}
                    initialVehicle={preset?.vehicleName}
                    onSubmit={handleSubmit}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
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
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
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
                </>
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
