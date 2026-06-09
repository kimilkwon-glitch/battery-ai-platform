"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { SimpleInquiryForm, type SimpleInquiryFormValues } from "@/components/inquiry/SimpleInquiryForm";
import { BATTERYTALK_INQUIRY_CHIPS, getInquiryPageUrl } from "@/lib/inquiry/inquiry-form-shared";
import { submitInquiry } from "@/lib/inquiry-storage";
import type { ChatInquiryOpenDetail } from "@/lib/chat-inquiry-events";

function isProductInquiry(preset?: ChatInquiryOpenDetail): boolean {
  return preset?.topic === "product" || Boolean(preset?.batteryCode);
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
  const [submitted, setSubmitted] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setFormKey((k) => k + 1);
  }, [open, preset?.batteryCode]);

  const handleSubmit = async (values: SimpleInquiryFormValues) => {
    const result = await submitInquiry({
      name: values.name?.trim() || "고객",
      contact: values.contact.trim(),
      vehicle: values.vehicle?.trim() || preset?.vehicleName,
      message: values.message.trim(),
      batteryCode: preset?.batteryCode,
      productCode: preset?.productCode ?? preset?.batteryCode,
      productName: preset?.productName,
      pageUrl: getInquiryPageUrl(),
      source: productMode ? "product_detail" : "chat",
      inquiryType: values.chipLabel ?? (productMode ? "제품문의" : "채팅상담"),
      category: productMode ? "battery" : "other",
    });
    if (result.ok) setSubmitted(true);
  };

  const title = productMode ? "상품 문의" : "문의 접수";
  const productHint = preset?.productName ? `${preset.productName} 문의` : undefined;

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
              <h2 id="chat-inquiry-title" className="text-base font-black text-slate-950">
                {title}
              </h2>
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
                  문의가 접수되었습니다.
                </p>
              ) : (
                <SimpleInquiryForm
                  key={formKey}
                  chips={BATTERYTALK_INQUIRY_CHIPS}
                  productHint={productHint}
                  submitLabel="문의 접수하기"
                  optionalFields={["name", "vehicle"]}
                  initialVehicle={preset?.vehicleName}
                  onSubmit={handleSubmit}
                />
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
