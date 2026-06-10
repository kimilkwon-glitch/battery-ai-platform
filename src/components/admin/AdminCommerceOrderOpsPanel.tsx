"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminCommerceOrderClaimsPanel } from "@/components/admin/AdminCommerceOrderClaimsPanel";
import { AdminOrderRelatedActivityPanel } from "@/components/admin/AdminOrderRelatedActivityPanel";
import { CommercePaymentMetaPanel } from "@/components/admin/CommercePaymentMetaPanel";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { fulfillmentTypeLabel, paymentStatusLabel } from "@/lib/orders/commerce-order-mine";
import { returnBatteryLabel } from "@/lib/payment/commerce-order-admin-mapper";
import { formatPriceWon } from "@/lib/pricing/order-price";
import { COMMERCE_LIFECYCLE_LABELS } from "@/types/commerce-order";
import type { CommerceOrderAdminMeta } from "@/lib/admin/commerce-order-admin-meta-store";
import type { AdminCommercePaymentMeta } from "@/types/commerce-payment";
import type { CommerceOrderRecord, CommerceOrderStatus } from "@/types/commerce-payment";
import { bm } from "@/lib/design-tokens";

type Props = {
  orderId: string;
  onUpdated?: () => void;
};

function statusActions(order: CommerceOrderRecord): {
  primary: { status: CommerceOrderStatus; label: string }[];
  adminCorrection: { status: CommerceOrderStatus; label: string }[];
} {
  const s = order.orderStatus;
  const f = order.fulfillmentType;
  const primary: { status: CommerceOrderStatus; label: string }[] = [];
  const adminCorrection: { status: CommerceOrderStatus; label: string }[] = [];

  if (s === "payment_completed" || s === "payment_pending") {
    primary.push({ status: "order_confirmed", label: "발주확인" });
  }
  if (s === "order_confirmed") {
    primary.push({ status: "preparing", label: "상품준비중" });
  }
  if (s === "preparing" && f === "delivery") {
    primary.push({ status: "shipping_prep", label: "배송준비" });
  }
  if (f === "delivery" && ["shipping", "shipped", "in_transit"].includes(s)) {
    adminCorrection.push({ status: "delivered", label: "배송완료(관리자 보정)" });
  }
  if (f === "visit_install" || f === "store_install") {
    if (["order_confirmed", "preparing", "shipping_prep", "visit_scheduled", "store_visit_scheduled"].includes(s)) {
      primary.push({
        status: f === "visit_install" ? "visit_scheduled" : "store_visit_scheduled",
        label: "작업 예정",
      });
      primary.push({ status: "work_completed", label: "장착 완료" });
    }
  }
  if (f === "store_pickup_self" && ["order_confirmed", "preparing", "shipping_prep"].includes(s)) {
    primary.push({ status: "picked_up", label: "수령 완료" });
  }
  if (!["canceled", "refunded", "work_completed", "delivered", "picked_up", "payment_failed"].includes(s)) {
    primary.push({ status: "canceled", label: "주문 취소(내부)" });
  }
  return { primary, adminCorrection };
}

export function AdminCommerceOrderOpsPanel({ orderId, onUpdated }: Props) {
  const [order, setOrder] = useState<CommerceOrderRecord | null>(null);
  const [paymentMeta, setPaymentMeta] = useState<AdminCommercePaymentMeta | null>(null);
  const [adminMeta, setAdminMeta] = useState<CommerceOrderAdminMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [showAdminCorrection, setShowAdminCorrection] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/commerce-orders/${encodeURIComponent(orderId)}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? "상세를 불러오지 못했습니다.");
        setOrder(null);
        return;
      }
      setOrder(data.order);
      setPaymentMeta(data.paymentMeta);
      setAdminMeta(data.adminMeta ?? null);
      setMemo(data.adminMeta?.adminMemo ?? "");
      setCarrier(data.adminMeta?.shippingCarrier ?? "");
      setTracking(data.adminMeta?.shippingTrackingNumber ?? "");
    } catch {
      setError("상세를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/commerce-orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? "저장에 실패했습니다.");
        return;
      }
      setOrder(data.order);
      setPaymentMeta(data.paymentMeta);
      setAdminMeta(data.adminMeta ?? null);
      onUpdated?.();
    } catch {
      setError("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className={`${bm.card} ${bm.cardPad} text-xs font-medium text-slate-500`}>
        주문 상세 불러오는 중…
      </p>
    );
  }

  if (error && !order) {
    return (
      <p className={`${bm.card} ${bm.cardPad} text-xs font-bold text-red-700`} role="alert">
        {error}
      </p>
    );
  }

  if (!order) return null;

  const { primary: actions, adminCorrection } = statusActions(order);
  const address =
    order.address1 || order.address
      ? [order.postalCode, order.address1, order.address2].filter(Boolean).join(" ")
      : order.address ?? "—";

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-800">{error}</p>
      ) : null}

      <section className={`${bm.card} ${bm.cardPad} space-y-2 text-xs`}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-black text-slate-900">{order.orderNumber}</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-700">
            {order.customerType === "guest" ? "비회원" : "회원"}
          </span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 font-bold text-blue-800">
            자사몰 결제
          </span>
        </div>
        <p>
          <span className="font-bold text-slate-500">고객 </span>
          {order.customerName} · {order.customerPhone}
        </p>
        <p>
          <span className="font-bold text-slate-500">상품 </span>
          {order.productName} ({order.batteryCode})
          {order.brand ? ` · ${order.brand}` : ""}
        </p>
        <p>
          <span className="font-bold text-slate-500">수령/장착 </span>
          {fulfillmentTypeLabel(order.fulfillmentType)}
        </p>
        <p>
          <span className="font-bold text-slate-500">폐배터리 </span>
          {returnBatteryLabel(order.returnBatteryOption)}
        </p>
        <p>
          <span className="font-bold text-slate-500">주소/지역 </span>
          {address}
        </p>
        {order.requestMemo ? (
          <p>
            <span className="font-bold text-slate-500">고객 요청 </span>
            {order.requestMemo}
          </p>
        ) : null}
        <dl className="grid grid-cols-2 gap-1 border-t border-slate-100 pt-2">
          <dt className="text-slate-500">제품 구매가</dt>
          <dd className="text-right font-bold">{formatPriceWon(order.internetPrice)}</dd>
          <dt className="text-slate-500">택배/장착비</dt>
          <dd className="text-right font-bold">
            {order.deliveryFee > 0 ? `+${formatPriceWon(order.deliveryFee)}` : "—"}
          </dd>
          {(order.batteryReturnFee ?? 0) > 0 ? (
            <>
              <dt className="text-slate-500">미반납 추가금</dt>
              <dd className="text-right font-bold text-amber-800">
                +{formatPriceWon(order.batteryReturnFee)}
              </dd>
            </>
          ) : null}
          <dt className="font-black text-slate-800">최종 결제금액</dt>
          <dd className="text-right font-black">{formatPriceWon(order.finalAmount)}</dd>
        </dl>
        <p className="pt-1">
          <span className="font-bold text-slate-500">결제 </span>
          {paymentStatusLabel(order.paymentStatus)} ·{" "}
          <span className="font-bold text-slate-500">주문 </span>
          {COMMERCE_LIFECYCLE_LABELS[order.orderStatus] ?? order.orderStatus}
        </p>
        {adminMeta?.shippingCarrier || adminMeta?.shippingTrackingNumber ? (
          <p>
            <span className="font-bold text-slate-500">송장 </span>
            {adminMeta.shippingCarrier ?? "—"} · {adminMeta.shippingTrackingNumber ?? "—"}
          </p>
        ) : null}
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-2`}>
        <h3 className="text-sm font-black text-slate-900">처리</h3>
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <button
              key={`${a.status}-${a.label}`}
              type="button"
              disabled={saving || order.orderStatus === a.status}
              onClick={() =>
                void patch({
                  orderStatus: a.status,
                  statusNote: `관리자: ${a.label}`,
                })
              }
              className="admin-row-action-btn admin-row-action-btn--primary"
            >
              {a.label}
            </button>
          ))}
        </div>
        {adminCorrection.length > 0 ? (
          <div className="border-t border-slate-100 pt-2">
            <button
              type="button"
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
              onClick={() => setShowAdminCorrection((v) => !v)}
            >
              {showAdminCorrection ? "관리자 상태 보정 닫기" : "관리자 상태 보정"}
            </button>
            {showAdminCorrection ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {adminCorrection.map((a) => (
                  <button
                    key={`${a.status}-${a.label}`}
                    type="button"
                    disabled={saving || order.orderStatus === a.status}
                    onClick={() =>
                      void patch({
                        orderStatus: a.status,
                        statusNote: `관리자 보정: ${a.label}`,
                      })
                    }
                    className="admin-row-action-btn admin-row-action-btn--secondary"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <Link
          href={`${ADMIN_ROUTES.commerceClaims}?orderId=${encodeURIComponent(order.orderId)}`}
          className="inline-block text-[11px] font-bold text-blue-700 hover:underline"
        >
          취소/반품/환불 관리 →
        </Link>
      </section>

      {order.fulfillmentType === "delivery" ? (
        <section className={`${bm.card} ${bm.cardPad} space-y-2`}>
          <h3 className="text-sm font-black text-slate-900">송장 등록 / 발송처리</h3>
          <p className="text-xs font-medium text-slate-500">
            택배 배송완료는 택배사 스캔·추적 연동 후 자동 반영됩니다. 운영자는 송장 등록 중심으로 처리하세요.
          </p>
          <label className="block text-[11px] font-bold text-slate-600">
            택배사
            <input
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              placeholder="예: CJ대한통운"
            />
          </label>
          <label className="block text-[11px] font-bold text-slate-600">
            송장번호
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-mono"
            />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              void patch({
                adminMemo: memo,
                shippingCarrier: carrier,
                shippingTrackingNumber: tracking,
                orderStatus: tracking.trim() ? "shipping" : undefined,
                statusNote: tracking.trim() ? `송장 등록: ${carrier} ${tracking}` : undefined,
              })
            }
            className={`${bm.btnNavy} w-full justify-center text-xs`}
          >
            발송처리
          </button>
        </section>
      ) : null}

      <AdminOrderRelatedActivityPanel order={order} adminMeta={adminMeta} />

      <section className={`${bm.card} ${bm.cardPad} space-y-2`}>
        <h3 className="text-xs font-black text-slate-900">관리자 메모</h3>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
        />
        <button
          type="button"
          disabled={saving}
          onClick={() => void patch({ adminMemo: memo, shippingCarrier: carrier, shippingTrackingNumber: tracking })}
          className={`${bm.btnSecondary} w-full justify-center text-xs`}
        >
          메모 저장
        </button>
      </section>

      <AdminCommerceOrderClaimsPanel orderId={order.orderId} />
      {paymentMeta ? <CommercePaymentMetaPanel meta={paymentMeta} /> : null}
    </div>
  );
}
