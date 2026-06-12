"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AdminCommerceOrderClaimsPanel } from "@/components/admin/AdminCommerceOrderClaimsPanel";
import { AdminOrderAlimtalkPanel } from "@/components/admin/AdminOrderAlimtalkPanel";
import type { NotificationLogRecord } from "@/lib/notifications/alimtalk-types";
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
import { DeliveryTrackingPanel } from "@/components/delivery/DeliveryTrackingPanel";
import { AdminDeliverySyncButton } from "@/components/admin/AdminDeliverySyncButton";
import { DELIVERY_CARRIERS, deliveryCarrierName } from "@/lib/delivery/delivery-carriers";

type Props = {
  orderId: string;
  onUpdated?: () => void;
  layout?: "panel" | "page";
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

function orderStatusBadgeClass(status: string): string {
  if (["canceled", "refunded", "payment_failed"].includes(status)) {
    return "admin-ops-status-badge admin-ops-status-badge--danger";
  }
  if (["work_completed", "delivered", "picked_up"].includes(status)) {
    return "admin-ops-status-badge admin-ops-status-badge--success";
  }
  if (["shipping", "shipped", "in_transit", "visit_scheduled", "store_visit_scheduled"].includes(status)) {
    return "admin-ops-status-badge admin-ops-status-badge--info";
  }
  if (["order_confirmed", "preparing", "shipping_prep", "payment_completed"].includes(status)) {
    return "admin-ops-status-badge admin-ops-status-badge--warning";
  }
  return "admin-ops-status-badge admin-ops-status-badge--neutral";
}

function paymentStatusBadgeClass(status: string): string {
  if (["failed", "canceled"].includes(status)) {
    return "admin-ops-status-badge admin-ops-status-badge--danger";
  }
  if (["refunded"].includes(status)) {
    return "admin-ops-status-badge admin-ops-status-badge--neutral";
  }
  if (["completed"].includes(status)) {
    return "admin-ops-status-badge admin-ops-status-badge--success";
  }
  return "admin-ops-status-badge admin-ops-status-badge--warning";
}

function vehicleSummary(order: CommerceOrderRecord): string | null {
  const parts = [order.vehicleName, order.vehicleYear, order.vehicleFuel].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function OpsCard({
  title,
  children,
  variant = "default",
}: {
  title?: string;
  children: ReactNode;
  variant?: "default" | "hero" | "actions" | "shipping";
}) {
  return (
    <section className={`admin-ops-card admin-ops-card--${variant}`}>
      {title ? <h3 className="admin-ops-card__title">{title}</h3> : null}
      {children}
    </section>
  );
}

function OpsField({
  label,
  value,
  highlight,
  mono,
}: {
  label: string;
  value: ReactNode;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="admin-ops-field">
      <span className="admin-ops-field__label">{label}</span>
      <span
        className={`admin-ops-field__value${highlight ? " admin-ops-field__value--highlight" : ""}${mono ? " admin-ops-field__value--mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function OpsCollapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="admin-ops-collapsible" open={defaultOpen ? true : undefined}>
      <summary className="admin-ops-collapsible__summary">{title}</summary>
      <div className="admin-ops-collapsible__body">{children}</div>
    </details>
  );
}

export function AdminCommerceOrderOpsPanel({ orderId, onUpdated, layout = "panel" }: Props) {
  const [order, setOrder] = useState<CommerceOrderRecord | null>(null);
  const [paymentMeta, setPaymentMeta] = useState<AdminCommercePaymentMeta | null>(null);
  const [adminMeta, setAdminMeta] = useState<CommerceOrderAdminMeta | null>(null);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [courierCode, setCourierCode] = useState("");
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
      setNotificationLogs(Array.isArray(data.notificationLogs) ? data.notificationLogs : []);
      setMemo(data.adminMeta?.adminMemo ?? "");
      setCourierCode(data.adminMeta?.courierCode ?? "");
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
      setNotificationLogs(Array.isArray(data.notificationLogs) ? data.notificationLogs : []);
      onUpdated?.();
    } catch {
      setError("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="admin-ops-loading">주문 상세 불러오는 중…</p>;
  }

  if (error && !order) {
    return (
      <p className="admin-ops-error" role="alert">
        {error}
      </p>
    );
  }

  if (!order) return null;

  const { primary: actions, adminCorrection } = statusActions(order);
  const address =
    order.address1 || order.address
      ? [order.postalCode, order.address1, order.address2].filter(Boolean).join(" ")
      : (order.address ?? "—");
  const vehicle = vehicleSummary(order);
  const orderDate = new Date(order.createdAt).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const phoneDigits = order.customerPhone.replace(/\D/g, "");
  const deliverySyncStatuses = new Set(["shipping", "shipped", "in_transit"]);
  const invoiceForSync = tracking.trim() || adminMeta?.shippingTrackingNumber?.trim() || "";
  const courierForSync = courierCode.trim() || adminMeta?.courierCode?.trim() || "";
  const canShowDeliverySync =
    deliverySyncStatuses.has(order.orderStatus) &&
    Boolean(invoiceForSync && courierForSync);

  const preDiscountAmount =
    (order.internetPrice ?? 0) + (order.deliveryFee ?? 0) + (order.batteryReturnFee ?? 0);
  const discountTotal = order.promotionDiscountTotal ?? 0;

  const heroCard = (
    <OpsCard variant="hero">
      <p className="admin-ops-hero__order">{order.orderNumber}</p>
      <div className="admin-ops-hero__badges">
        <span className={orderStatusBadgeClass(order.orderStatus)}>
          {COMMERCE_LIFECYCLE_LABELS[order.orderStatus] ?? order.orderStatus}
        </span>
        <span className={paymentStatusBadgeClass(order.paymentStatus)}>
          {paymentStatusLabel(order.paymentStatus)}
        </span>
        <span className="admin-ops-status-badge admin-ops-status-badge--neutral">
          {order.customerType === "guest" ? "비회원" : "회원"}
        </span>
      </div>
      <div className="admin-ops-hero__meta">
        <OpsField label="주문일시" value={orderDate} />
        {layout === "panel" ? (
          <OpsField
            label="고객"
            value={
              <>
                {order.customerName}
                {phoneDigits ? (
                  <>
                    {" · "}
                    <a href={`tel:${phoneDigits}`} className="admin-ops-phone-link">
                      {order.customerPhone}
                    </a>
                  </>
                ) : (
                  order.customerPhone
                )}
              </>
            }
          />
        ) : null}
      </div>
    </OpsCard>
  );

  const statusCard = (
    <OpsCard variant="actions" title="상태 처리">
      <div className="admin-ops-action-row">
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
            className="admin-ops-action-btn admin-ops-action-btn--primary"
          >
            {a.label}
          </button>
        ))}
      </div>
      {adminCorrection.length > 0 ? (
        <div className="admin-ops-correction">
          <button
            type="button"
            className="admin-ops-correction__toggle"
            onClick={() => setShowAdminCorrection((v) => !v)}
          >
            {showAdminCorrection ? "관리자 보정 닫기" : "관리자 상태 보정"}
          </button>
          {showAdminCorrection ? (
            <div className="admin-ops-action-row admin-ops-action-row--secondary">
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
                  className="admin-ops-action-btn admin-ops-action-btn--secondary"
                >
                  {a.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </OpsCard>
  );

  const customerCard = (
    <OpsCard title="고객 정보">
      <div className="admin-ops-fields">
        <OpsField label="주문자" value={order.customerName} />
        <OpsField
          label="연락처"
          value={
            phoneDigits ? (
              <a href={`tel:${phoneDigits}`} className="admin-ops-phone-link">
                {order.customerPhone}
              </a>
            ) : (
              order.customerPhone
            )
          }
        />
        <OpsField label="수령인" value={order.customerName} />
        <OpsField
          label="수령인 연락처"
          value={
            phoneDigits ? (
              <a href={`tel:${phoneDigits}`} className="admin-ops-phone-link">
                {order.customerPhone}
              </a>
            ) : (
              order.customerPhone
            )
          }
        />
        <OpsField label="주소" value={address} />
        {order.requestMemo ? <OpsField label="배송메모" value={order.requestMemo} /> : null}
      </div>
    </OpsCard>
  );

  const productCard = (
    <OpsCard title="주문 상품">
      <div className="admin-ops-fields">
        <OpsField label="상품명" value={order.productName} />
        {order.brand ? <OpsField label="브랜드" value={order.brand} /> : null}
        <OpsField label="배터리 규격" value={order.batteryCode} mono highlight />
        {vehicle ? <OpsField label="차량" value={vehicle} /> : null}
        <OpsField label="수령/장착" value={fulfillmentTypeLabel(order.fulfillmentType)} />
        <OpsField label="폐배터리 반납" value={returnBatteryLabel(order.returnBatteryOption)} />
        <OpsField label="수량" value={`${order.itemsJson?.length ?? 1}건`} />
      </div>
    </OpsCard>
  );

  const paymentCard = (
    <OpsCard title="결제 정보">
      <div className="admin-ops-fields">
        <OpsField label="할인 전 주문금액" value={formatPriceWon(preDiscountAmount)} />
        {discountTotal > 0 ? (
          <OpsField label="쿠폰/회원혜택 할인" value={`-${formatPriceWon(discountTotal)}`} />
        ) : null}
        <OpsField
          label="배송비"
          value={order.deliveryFee > 0 ? formatPriceWon(order.deliveryFee) : "—"}
        />
        {(order.batteryReturnFee ?? 0) > 0 ? (
          <OpsField label="폐배터리 미반납 추가금" value={formatPriceWon(order.batteryReturnFee)} />
        ) : null}
        <OpsField label="최종 결제금액" value={formatPriceWon(order.finalAmount)} highlight />
        <OpsField label="결제상태" value={paymentStatusLabel(order.paymentStatus)} />
        {order.paymentMethod ? <OpsField label="결제수단" value={order.paymentMethod} /> : null}
      </div>
    </OpsCard>
  );

  const legacyOrderCard = (
    <OpsCard title="주문 정보">
      <div className="admin-ops-fields">
        <OpsField label="상품" value={order.productName} />
        <OpsField label="배터리 규격" value={order.batteryCode} mono highlight />
        {order.brand ? <OpsField label="브랜드" value={order.brand} /> : null}
        {vehicle ? <OpsField label="차량" value={vehicle} /> : null}
        <OpsField label="수령방식" value={fulfillmentTypeLabel(order.fulfillmentType)} />
        <OpsField label="폐배터리" value={returnBatteryLabel(order.returnBatteryOption)} />
        <OpsField label="결제금액" value={formatPriceWon(order.finalAmount)} highlight />
      </div>
      <details className="admin-ops-price-detail">
        <summary>금액 상세</summary>
        <div className="admin-ops-fields admin-ops-fields--compact">
          <OpsField label="제품 구매가" value={formatPriceWon(order.internetPrice)} />
          <OpsField
            label="택배/장착비"
            value={order.deliveryFee > 0 ? `+${formatPriceWon(order.deliveryFee)}` : "—"}
          />
          {(order.batteryReturnFee ?? 0) > 0 ? (
            <OpsField label="미반납 추가금" value={`+${formatPriceWon(order.batteryReturnFee)}`} />
          ) : null}
        </div>
      </details>
    </OpsCard>
  );

  const shippingCard =
    order.fulfillmentType === "delivery" ? (
      <OpsCard variant="shipping" title="배송 · 발송">
        {adminMeta?.shippingTrackingNumber ? (
          <p className="admin-ops-shipping-current">
            {adminMeta.shippingCarrier ?? deliveryCarrierName(adminMeta.courierCode ?? "") ?? "택배"} ·{" "}
            <span className="admin-ops-field__value--mono">{adminMeta.shippingTrackingNumber}</span>
            {adminMeta.shippedAt
              ? ` · ${new Date(adminMeta.shippedAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}`
              : ""}
          </p>
        ) : null}
        <label className="admin-ops-input-label">
          택배사
          <select
            value={courierCode}
            onChange={(e) => {
              const code = e.target.value;
              setCourierCode(code);
              setCarrier(code ? (deliveryCarrierName(code) ?? "") : "");
            }}
            className="admin-ops-input admin-ops-input--select"
          >
            <option value="">택배사 선택</option>
            {DELIVERY_CARRIERS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-ops-input-label">
          송장번호
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            className="admin-ops-input admin-ops-input--mono"
            placeholder="숫자·하이픈"
            inputMode="text"
            autoComplete="off"
          />
        </label>
        <button
          type="button"
          disabled={saving || !courierCode.trim() || !tracking.trim()}
          onClick={() =>
            void patch({
              adminMemo: memo,
              courierCode: courierCode.trim(),
              shippingCarrier: carrier.trim() || deliveryCarrierName(courierCode.trim()),
              shippingTrackingNumber: tracking.trim(),
              shippedAt: new Date().toISOString(),
              orderStatus: "shipping",
              statusNote: `송장 등록: ${carrier || deliveryCarrierName(courierCode)} ${tracking.trim()}`,
            })
          }
          className="admin-ops-action-btn admin-ops-action-btn--ship"
        >
          저장 / 발송처리
        </button>
        <div className="admin-ops-track-test">
          <p className="admin-ops-track-test__label">배송조회 테스트</p>
          <p className="admin-ops-track-test__sublabel">화면 확인용 · DB 반영 없음 · 1회만 확인 권장</p>
          <DeliveryTrackingPanel
            courierCode={courierCode}
            courierName={carrier || deliveryCarrierName(courierCode) || ""}
            invoiceNumber={tracking}
            trackButtonLabel="배송조회 테스트"
            variant="admin"
          />
        </div>
        {canShowDeliverySync ? (
          <div className="admin-ops-track-sync">
            <p className="admin-ops-track-sync__label">스윗트래커 조회 → DB 반영</p>
            <p className="admin-ops-track-sync__hint">수동 조회 시 조회 건수가 사용됩니다.</p>
            {adminMeta?.lastDeliveryCheckedAt ? (
              <p className="admin-ops-track-meta">
                마지막 재조회:{" "}
                {new Date(adminMeta.lastDeliveryCheckedAt).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {adminMeta.lastDeliveryStatus ? ` · ${adminMeta.lastDeliveryStatus}` : ""}
              </p>
            ) : null}
            <AdminDeliverySyncButton
              mode="selected"
              orderIds={[order.orderId]}
              label="조회 후 상태 반영"
              confirmMessage="이 주문을 조회합니다. 조회 건수가 사용됩니다. 테스트 목적으로 여러 번 누르지 마세요."
              hint="배송완료일 때만 DB 반영 · 조회 건수 소모"
              variant="primary"
              onReload={true}
              onComplete={() => onUpdated?.()}
            />
          </div>
        ) : null}
      </OpsCard>
    ) : null;

  const legacyCustomerCard = (
    <OpsCard title="고객 · 배송지">
      <div className="admin-ops-fields">
        <OpsField label="수령인" value={order.customerName} />
        <OpsField
          label="연락처"
          value={
            phoneDigits ? (
              <a href={`tel:${phoneDigits}`} className="admin-ops-phone-link">
                {order.customerPhone}
              </a>
            ) : (
              order.customerPhone
            )
          }
        />
        <OpsField label="주소" value={address} />
        {order.requestMemo ? <OpsField label="배송메모" value={order.requestMemo} /> : null}
      </div>
    </OpsCard>
  );

  const memoCard = (
    <OpsCard title="관리자 메모">
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        rows={layout === "page" ? 5 : 3}
        className="admin-ops-textarea"
        placeholder="내부 참고 메모"
      />
      <button
        type="button"
        disabled={saving}
        onClick={() =>
          void patch({
            adminMemo: memo,
            courierCode: courierCode.trim() || undefined,
            shippingCarrier: carrier,
            shippingTrackingNumber: tracking,
          })
        }
        className="admin-ops-action-btn admin-ops-action-btn--secondary admin-ops-action-btn--block"
      >
        메모 저장
      </button>
    </OpsCard>
  );

  const collapsibles = (
    <>
      <OpsCollapsible title="관련 고객 활동">
        <AdminOrderRelatedActivityPanel order={order} adminMeta={adminMeta} embedded defaultOpen={false} />
      </OpsCollapsible>

      <OpsCollapsible title="취소 · 반품 · 환불">
        <AdminCommerceOrderClaimsPanel orderId={order.orderId} />
        <Link
          href={`${ADMIN_ROUTES.commerceClaims}?orderId=${encodeURIComponent(order.orderId)}`}
          className="admin-ops-link"
        >
          클레임 관리 화면 →
        </Link>
      </OpsCollapsible>

      {paymentMeta ? (
        <OpsCollapsible title="결제 상세">
          <CommercePaymentMetaPanel meta={paymentMeta} />
        </OpsCollapsible>
      ) : null}

      <AdminOrderAlimtalkPanel logs={notificationLogs} />
    </>
  );

  if (layout === "page") {
    return (
      <div className="admin-order-ops-panel admin-order-ops-panel--page">
        {error ? <p className="admin-ops-inline-error">{error}</p> : null}
        {heroCard}
        <div className="admin-order-ops-page__grid">
          <div className="admin-order-ops-page__col admin-order-ops-page__col--left">
            {customerCard}
            {productCard}
            {paymentCard}
          </div>
          <div className="admin-order-ops-page__col admin-order-ops-page__col--right">
            {statusCard}
            {shippingCard}
            {memoCard}
          </div>
        </div>
        <div className="admin-order-ops-page__extras">{collapsibles}</div>
      </div>
    );
  }

  return (
    <div className="admin-order-ops-panel">
      {error ? <p className="admin-ops-inline-error">{error}</p> : null}

      {heroCard}
      {statusCard}
      {legacyOrderCard}
      {shippingCard}
      {legacyCustomerCard}
      {memoCard}
      {collapsibles}
    </div>
  );
}
