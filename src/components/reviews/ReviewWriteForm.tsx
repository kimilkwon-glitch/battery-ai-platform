"use client";

import Link from "next/link";
import { useState } from "react";
import { Star } from "lucide-react";
import clsx from "clsx";
import { bm } from "@/lib/design-tokens";

const QUICK_CHIPS = [
  "배송이 빨랐어요",
  "가격이 괜찮았어요",
  "상담이 친절했어요",
  "장착이 빨랐어요",
  "배터리 상태가 좋아요",
  "재구매 의사 있어요",
] as const;

const FULFILLMENT_OPTIONS = [
  { value: "delivery", label: "택배 주문" },
  { value: "visit_install", label: "출장 교체" },
  { value: "store_install", label: "매장 교체" },
  { value: "store_pickup_self", label: "매장 수령" },
] as const;

type Props = {
  orderId?: string;
  orderNumber?: string;
  batteryCode?: string;
  defaultVehicle?: string;
  defaultServiceType?: string;
};

export function ReviewWriteForm({
  orderId,
  orderNumber,
  batteryCode,
  defaultVehicle = "",
  defaultServiceType = "",
}: Props) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [vehicleName, setVehicleName] = useState(defaultVehicle);
  const [serviceType, setServiceType] = useState(defaultServiceType);
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appendChip = (chip: string) => {
    setBody((prev) => (prev.includes(chip) ? prev : prev ? `${prev}\n${chip}` : chip));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/reviews/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        orderId,
        orderNumber,
        contact: contact.trim() || undefined,
        rating,
        title: title.trim(),
        body: body.trim(),
        vehicleName: vehicleName.trim() || undefined,
        serviceType: serviceType || undefined,
        batteryCode,
        consent,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setSubmitting(false);
    if (res.ok && data.ok) {
      setDone(true);
      return;
    }
    setError(data.message ?? "후기 접수에 실패했습니다.");
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-8 text-center">
        <p className="text-lg font-black text-emerald-900">후기가 접수되었습니다</p>
        <p className="mt-2 text-sm font-medium text-emerald-800">검수 후 상품 후기에 게시됩니다.</p>
        {batteryCode ? (
          <Link
            href={`/batteries/${encodeURIComponent(batteryCode)}#battery-reviews`}
            className={`${bm.btnNavy} mt-4 inline-flex text-sm`}
          >
            상품 후기 보기
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <form className="review-write-form space-y-5" onSubmit={handleSubmit}>
      <div className={`${bm.card} ${bm.cardPad}`}>
        <p className="text-sm font-black text-slate-900">별점</p>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="rounded-lg p-1 transition hover:scale-110"
              aria-label={`${n}점`}
            >
              <Star
                className={clsx("size-9", n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200")}
              />
            </button>
          ))}
        </div>
      </div>

      <div className={`${bm.card} ${bm.cardPad} space-y-3`}>
        <label className="block text-sm font-black text-slate-800">
          한 줄 제목
          <input
            required
            className={`${bm.input} bm-input-field mt-1.5 w-full`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 빠른 배송에 만족합니다"
          />
        </label>
        <label className="block text-sm font-black text-slate-800">
          상세 후기
          <textarea
            required
            rows={5}
            className={`${bm.input} bm-input-field mt-1.5 w-full resize-y`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => appendChip(chip)}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-800"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className={`${bm.card} ${bm.cardPad} grid gap-3 sm:grid-cols-2`}>
        <label className="block text-sm font-black text-slate-800">
          차량명
          <input
            className={`${bm.input} bm-input-field mt-1.5 w-full`}
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
          />
        </label>
        <label className="block text-sm font-black text-slate-800">
          장착/수령 방식
          <select
            className={`${bm.input} bm-input-field mt-1.5 w-full`}
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
          >
            <option value="">선택</option>
            {FULFILLMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        {!orderId && orderNumber ? (
          <label className="block text-sm font-black text-slate-800 sm:col-span-2">
            연락처 (주문 조회 확인)
            <input
              required
              type="tel"
              className={`${bm.input} bm-input-field mt-1.5 w-full`}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </label>
        ) : null}
      </div>

      <label className="flex items-start gap-2 text-xs font-semibold text-slate-600">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
          required
        />
        후기를 상품 페이지에 공개하는 것에 동의합니다.
      </label>

      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className={`${bm.btnNavy} w-full justify-center py-3.5 text-base font-black`}
      >
        {submitting ? "접수 중…" : "후기 제출"}
      </button>
    </form>
  );
}
