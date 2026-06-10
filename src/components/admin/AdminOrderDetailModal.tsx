"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatAdminCustomerName, formatAdminContact } from "@/lib/admin/admin-display-labels";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { formatPriceWon } from "@/lib/pricing/order-price";
import { COMMERCE_LIFECYCLE_LABELS } from "@/types/commerce-order";
import type { CommerceOrderRecord } from "@/types/commerce-payment";

type Props = {
  orderId: string | null;
  onClose: () => void;
};

type OrderPayload = {
  order: CommerceOrderRecord;
  adminMeta?: {
    shippingCarrier?: string;
    shippingTrackingNumber?: string;
    adminMemo?: string;
  } | null;
};

export function AdminOrderDetailModal({ orderId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OrderPayload | null>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/commerce-orders/${encodeURIComponent(id)}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.message ?? "주문을 불러오지 못했습니다.");
        setData(null);
        return;
      }
      setData({
        order: json.order as CommerceOrderRecord,
        adminMeta: json.adminMeta as OrderPayload["adminMeta"],
      });
    } catch {
      setError("주문을 불러오지 못했습니다.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (orderId) void load(orderId);
    else setData(null);
  }, [orderId, load]);

  if (!orderId) return null;

  const order = data?.order;
  const meta = data?.adminMeta;
  const address =
    [order?.address, order?.address1, order?.address2].filter(Boolean).join(" ").trim() || "—";
  const tracking = meta?.shippingTrackingNumber?.trim();
  const carrier = meta?.shippingCarrier?.trim() || "경동택배";

  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <button type="button" className="admin-modal__backdrop" aria-label="닫기" onClick={onClose} />
      <div className="admin-modal__panel admin-modal__panel--wide">
        <div className="admin-modal__header">
          <h3 className="admin-modal__title">주문 상세</h3>
          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="admin-modal__body">
          {loading ? (
            <p className="py-8 text-center text-sm font-semibold text-slate-500">불러오는 중…</p>
          ) : error ? (
            <p className="py-8 text-center text-sm font-bold text-red-600">{error}</p>
          ) : order ? (
            <div className="admin-order-detail-grid">
              <section className="admin-order-detail-card">
                <h4>주문 정보</h4>
                <Row label="주문번호" value={order.orderNumber} mono />
                <Row
                  label="주문일"
                  value={new Date(order.createdAt).toLocaleString("ko-KR")}
                />
                <Row
                  label="주문상태"
                  value={
                    COMMERCE_LIFECYCLE_LABELS[
                      order.orderStatus as keyof typeof COMMERCE_LIFECYCLE_LABELS
                    ] ?? order.orderStatus
                  }
                />
                <Row label="결제상태" value={order.paymentStatus} />
              </section>
              <section className="admin-order-detail-card">
                <h4>고객 정보</h4>
                <Row label="고객명" value={formatAdminCustomerName(order.customerName)} />
                <Row label="연락처" value={formatAdminContact(order.customerPhone)} />
              </section>
              <section className="admin-order-detail-card">
                <h4>상품 정보</h4>
                <Row label="상품명" value={order.productName} />
                <Row label="브랜드" value={order.brand ?? "—"} />
                <Row label="규격" value={order.batteryCode} mono />
                <Row label="수량" value="1" />
                <Row
                  label="결제금액"
                  value={order.finalAmount != null ? formatPriceWon(order.finalAmount) : "—"}
                />
              </section>
              <section className="admin-order-detail-card">
                <h4>배송·수령</h4>
                <Row label="수령방식" value={order.fulfillmentType} />
                <Row label="배송지 요약" value={address} />
                <Row label="요청사항" value={order.requestMemo?.trim() || "—"} />
                <Row label="송장번호" value={tracking || "미등록"} />
                <Row label="택배사" value={carrier} />
              </section>
            </div>
          ) : null}
        </div>
        {order ? (
          <div className="admin-modal__footer">
            <Link
              href={`${ADMIN_ROUTES.orders}?orderId=${encodeURIComponent(order.orderId)}`}
              className="admin-btn admin-btn--secondary admin-btn--md"
            >
              주문관리에서 열기
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="admin-order-detail-row">
      <span className="admin-order-detail-row__label">{label}</span>
      <span className={`admin-order-detail-row__value${mono ? " font-mono" : ""}`}>{value}</span>
    </div>
  );
}

/** 클릭 가능한 주문번호 링크 */
export function AdminOrderNumberButton({
  orderId,
  orderNumber,
  onOpen,
}: {
  orderId: string;
  orderNumber: string;
  onOpen: (orderId: string) => void;
}) {
  return (
    <button
      type="button"
      className="font-bold text-blue-700 hover:underline"
      onClick={() => onOpen(orderId)}
    >
      {orderNumber}
    </button>
  );
}
