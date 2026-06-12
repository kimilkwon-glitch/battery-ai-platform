"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import clsx from "clsx";
import { ReviewWritePhotoAttach } from "@/components/reviews/ReviewWritePhotoAttach";
import { batteryReviewHref } from "@/lib/battery-product-routes";
import { bm } from "@/lib/design-tokens";
import type { ReviewWriteOrderContext } from "@/lib/reviews/review-write-types";

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

function formatOrderDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function mergeBodyWithTags(body: string, tags: Set<string>): string {
  const trimmed = body.trim();
  const missing = [...tags].filter((tag) => !trimmed.includes(tag));
  if (missing.length === 0) return trimmed;
  return trimmed ? `${trimmed}\n${missing.join("\n")}` : missing.join("\n");
}

type Props = {
  orderId?: string;
  orderNumber?: string;
  batteryCode?: string;
  defaultVehicle?: string;
  defaultServiceType?: string;
  orderContext?: ReviewWriteOrderContext | null;
  contextLoading?: boolean;
  onContactVerified?: (contact: string) => void;
};

export function ReviewWriteForm({
  orderId,
  orderNumber,
  batteryCode,
  defaultVehicle = "",
  defaultServiceType = "",
  orderContext,
  contextLoading = false,
  onContactVerified,
}: Props) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [images, setImages] = useState<string[]>([]);
  const [vehicleName, setVehicleName] = useState(defaultVehicle);
  const [serviceType, setServiceType] = useState(defaultServiceType);
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedBattery = orderContext?.batteryCode ?? batteryCode;
  const productHref = resolvedBattery
    ? batteryReviewHref({ batteryCode: resolvedBattery, brandId: "rocket" })
    : "/vehicles";

  const summary = useMemo(() => {
    if (orderContext) return orderContext;
    if (!batteryCode) return null;
    return {
      productName: "구매하신 배터리",
      batteryCode,
      orderNumberShort: orderNumber ? orderNumber.slice(-8) : undefined,
    };
  }, [orderContext, batteryCode, orderNumber]);

  const toggleTag = (chip: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      return next;
    });
  };

  const handleContactBlur = () => {
    const trimmed = contact.trim();
    if (trimmed && onContactVerified) onContactVerified(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderContext?.alreadyReviewed) {
      setError("이미 작성한 후기가 있습니다.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/reviews/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        orderId: orderContext?.orderId ?? orderId,
        orderNumber: orderContext?.orderNumber ?? orderNumber,
        contact: contact.trim() || undefined,
        rating,
        title: title.trim(),
        body: mergeBodyWithTags(body, selectedTags),
        vehicleName: vehicleName.trim() || undefined,
        serviceType: serviceType || undefined,
        batteryCode: resolvedBattery,
        images,
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
      <div className="review-write-success">
        <div className="review-write-success__icon" aria-hidden>
          <CheckCircle2 className="size-10 text-emerald-600" />
        </div>
        <h2 className="text-xl font-black text-slate-950">후기가 접수되었습니다</h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          검수 후 상품 페이지에 표시될 수 있습니다.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {resolvedBattery ? (
            <Link href={productHref} className={`${bm.btnNavy} justify-center text-sm`}>
              상품 후기 보기
            </Link>
          ) : null}
          <Link
            href="/orders/lookup"
            className={`${bm.btnSecondary} justify-center text-sm`}
          >
            주문 조회
          </Link>
        </div>
      </div>
    );
  }

  if (orderContext?.alreadyReviewed) {
    return (
      <div className="review-write-success review-write-success--muted">
        <h2 className="text-lg font-black text-slate-900">이미 후기를 작성했습니다</h2>
        <p className="mt-2 text-sm font-medium text-slate-600">같은 주문에는 후기를 한 번만 작성할 수 있습니다.</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {resolvedBattery ? (
            <Link href={productHref} className={`${bm.btnNavy} justify-center text-sm`}>
              상품 후기 보기
            </Link>
          ) : null}
          <Link href="/orders/lookup" className={`${bm.btnSecondary} justify-center text-sm`}>
            주문 조회
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="review-write">
      <header className="review-write-hero">
        <p className="review-write-hero__eyebrow">후기 작성</p>
        <h1 className="review-write-hero__title">구매하신 배터리 후기를 남겨주세요.</h1>
      </header>

      {summary ? (
        <section className={`review-write-card review-write-summary ${bm.cardPad}`}>
          <p className="review-write-card__label">구매 상품</p>
          {contextLoading ? (
            <p className="mt-2 text-sm font-medium text-slate-500">주문 정보를 불러오는 중…</p>
          ) : (
            <dl className="review-write-summary__grid">
              <div>
                <dt>상품명</dt>
                <dd>
                  {summary.productName}
                  {"brand" in summary && summary.brand ? (
                    <span className="text-slate-500"> ({summary.brand})</span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt>배터리 규격</dt>
                <dd className="font-mono">{summary.batteryCode}</dd>
              </div>
              {"vehicleName" in summary && summary.vehicleName ? (
                <div>
                  <dt>차량명</dt>
                  <dd>{summary.vehicleName}</dd>
                </div>
              ) : null}
              {"fulfillmentLabel" in summary && summary.fulfillmentLabel ? (
                <div>
                  <dt>수령/장착</dt>
                  <dd>{summary.fulfillmentLabel}</dd>
                </div>
              ) : null}
              {"orderNumberShort" in summary && summary.orderNumberShort ? (
                <div>
                  <dt>주문번호</dt>
                  <dd className="font-mono">{summary.orderNumberShort}</dd>
                </div>
              ) : null}
              {"createdAt" in summary && summary.createdAt ? (
                <div>
                  <dt>주문일</dt>
                  <dd>{formatOrderDate(summary.createdAt)}</dd>
                </div>
              ) : null}
            </dl>
          )}
        </section>
      ) : null}

      <form className="review-write-form space-y-4" onSubmit={handleSubmit}>
        <section className={`review-write-card ${bm.cardPad}`}>
          <p className="review-write-card__label">별점</p>
          <p className="review-write-card__hint">구매 경험을 별점으로 알려주세요.</p>
          <div className="review-write-stars" role="group" aria-label="별점 선택">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={clsx("review-write-stars__btn", n <= rating && "review-write-stars__btn--on")}
                aria-label={`${n}점`}
                aria-pressed={n <= rating}
              >
                <Star
                  className={clsx(
                    "size-10 sm:size-11",
                    n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200",
                  )}
                />
              </button>
            ))}
          </div>
        </section>

        <section className={`review-write-card ${bm.cardPad} space-y-4`}>
          <label className="block">
            <span className="review-write-card__label">한 줄 제목</span>
            <input
              required
              className={`${bm.input} bm-input-field mt-2 w-full`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 빠른 배송에 만족합니다"
            />
          </label>

          <label className="block">
            <span className="review-write-card__label">상세 후기</span>
            <textarea
              required
              rows={5}
              className={`${bm.input} bm-input-field mt-2 w-full resize-y`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="배터리 교체·배송·상담 경험을 적어 주세요."
            />
          </label>

          <div>
            <p className="review-write-card__label">태그</p>
            <div className="review-write-tags">
              {QUICK_CHIPS.map((chip) => {
                const on = selectedTags.has(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleTag(chip)}
                    className={clsx("review-write-tags__chip", on && "review-write-tags__chip--on")}
                    aria-pressed={on}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>

          <ReviewWritePhotoAttach
            images={images}
            onChange={setImages}
            disabled={submitting}
          />
        </section>

        <section className={`review-write-card ${bm.cardPad} grid gap-4 sm:grid-cols-2`}>
          <label className="block sm:col-span-2">
            <span className="review-write-card__label">추가 정보</span>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-600">차량명</span>
            <input
              className={`${bm.input} bm-input-field mt-1.5 w-full`}
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-600">장착/수령 방식</span>
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
          {!orderId && !orderContext?.orderId && orderNumber ? (
            <label className="block sm:col-span-2">
              <span className="text-xs font-bold text-slate-600">연락처</span>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                주문 확인을 위해 연락처를 입력해 주세요.
              </p>
              <input
                required
                type="tel"
                className={`${bm.input} bm-input-field mt-1.5 w-full`}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                onBlur={handleContactBlur}
              />
            </label>
          ) : null}
        </section>

        <section className="review-write-submit">
          <label className="flex items-start gap-2.5 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 size-4 rounded border-slate-300"
              required
            />
            <span>
              작성한 후기는 상품 페이지에 표시될 수 있습니다.
            </span>
          </label>

          {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting || contextLoading}
            className={`${bm.btnNavy} review-write-submit__btn`}
          >
            {submitting ? "접수 중…" : "후기 제출"}
          </button>
        </section>
      </form>
    </div>
  );
}
