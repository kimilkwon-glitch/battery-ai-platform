"use client";

import { useState } from "react";
import { CustomerActionModal } from "@/components/common/CustomerActionModal";
import {
  actionButtonLabel,
  claimTypeForAction,
  type ClaimUiAction,
} from "@/lib/claims/claim-eligibility";
import { claimRefundPolicyLines } from "@/lib/claims/claim-refund-estimate";
import { LEGAL_SHIPPING_RETURNS_PAGE } from "@/lib/legal/legal-routes";
import { formatPriceWon } from "@/lib/pricing/order-price";
import { bm } from "@/lib/design-tokens";
import {
  CLAIM_REASON_LABELS,
  CLAIM_REASON_OPTIONS,
  CLAIM_TYPE_LABELS,
  type ClaimReasonCode,
  type ClaimType,
} from "@/types/commerce-claim";
import type { CommerceOrderRecord } from "@/types/commerce-payment";
import "@/styles/order-claim.css";

type OrderSnapshot = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  finalAmount: number | null;
  deliveryFee?: number;
  promotionDiscountTotal?: number;
  returnBatteryOption?: string;
  batteryReturnFee?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  action: ClaimUiAction;
  order: OrderSnapshot;
  onSubmitted?: () => void;
};

const TYPE_OPTIONS: ClaimType[] = ["CANCEL", "RETURN", "REFUND", "EXCHANGE", "OTHER"];

export function OrderClaimFormModal({ open, onClose, action, order, onSubmitted }: Props) {
  const defaultType = claimTypeForAction(action);
  const [claimType, setClaimType] = useState<ClaimType>(defaultType);
  const [reasonCode, setReasonCode] = useState<ClaimReasonCode>("need_consult");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState(order.customerPhone);
  const [attachments, setAttachments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceLines = claimRefundPolicyLines({
    finalAmount: order.finalAmount,
    deliveryFee: order.deliveryFee ?? 0,
    promotionDiscountTotal: order.promotionDiscountTotal,
    returnBatteryOption: order.returnBatteryOption as CommerceOrderRecord["returnBatteryOption"],
    batteryReturnFee: order.batteryReturnFee,
  } as CommerceOrderRecord);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/orders/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        orderId: order.orderId,
        claimType,
        reasonCode,
        customerMessage: message.trim(),
        customerPhone: phone.trim(),
        customerName: order.customerName,
        attachmentUrls: attachments
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok && data.ok) {
      setDone(true);
      onSubmitted?.();
    } else {
      setError(data.message ?? "접수에 실패했습니다.");
    }
  };

  const resetClose = () => {
    setDone(false);
    setError(null);
    onClose();
  };

  return (
    <CustomerActionModal
      open={open}
      onClose={resetClose}
      title={actionButtonLabel(action)}
      footer={
        done ? (
          <button type="button" className={`${bm.btnPrimary} w-full justify-center text-sm font-black`} onClick={resetClose}>
            확인
          </button>
        ) : (
          <>
            <button type="button" className={`${bm.btnSecondary} w-full justify-center text-sm font-black sm:flex-1`} onClick={resetClose}>
              취소
            </button>
            <button
              type="submit"
              form="order-claim-form"
              disabled={submitting}
              className={`${bm.btnPrimary} w-full justify-center text-sm font-black sm:flex-1`}
            >
              {submitting ? "접수 중…" : "요청 접수"}
            </button>
          </>
        )
      }
    >
      {done ? (
        <p className="text-sm font-medium text-slate-700">
          요청이 접수되었습니다. 확인 후 고객센터에서 안내드리겠습니다.
        </p>
      ) : (
        <form id="order-claim-form" className="order-claim-form" onSubmit={handleSubmit}>
          <p className="text-xs font-bold text-slate-500">
            주문 {order.orderNumber}
            {order.finalAmount != null ? ` · ${formatPriceWon(order.finalAmount)}` : ""}
          </p>
          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-800">{error}</p> : null}
          <label className="order-claim-form__field">
            요청 유형
            <select value={claimType} onChange={(e) => setClaimType(e.target.value as ClaimType)}>
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {CLAIM_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="order-claim-form__field">
            요청 사유
            <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value as ClaimReasonCode)}>
              {CLAIM_REASON_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {CLAIM_REASON_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
          <label className="order-claim-form__field">
            상세 내용
            <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
          </label>
          <label className="order-claim-form__field">
            연락처
            <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="order-claim-form__field">
            이미지 URL (선택)
            <textarea
              value={attachments}
              onChange={(e) => setAttachments(e.target.value)}
              rows={2}
              placeholder="사진 링크가 있으면 한 줄에 하나씩 입력"
            />
          </label>
          <div className="order-claim-form__price-lines">
            {priceLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <p className="order-claim-form__policy">
            자세한 배송·교환·반품·환불 기준은{" "}
            <a href={LEGAL_SHIPPING_RETURNS_PAGE} className="font-bold text-blue-700 hover:underline">
              정책 안내
            </a>
            에서 확인할 수 있습니다.
          </p>
        </form>
      )}
    </CustomerActionModal>
  );
}
