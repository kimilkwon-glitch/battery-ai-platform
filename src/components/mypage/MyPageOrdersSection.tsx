"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import type { MallOrderMineListItemExtended } from "@/lib/orders/commerce-order-mine";
import {
  fetchMyCommerceOrders,
  formatOrderAmount,
  formatOrderDate,
  MYPAGE_ORDER_CTAS,
} from "@/lib/mypage/mypage-orders-section";
import { HUB_SUPPORT } from "@/lib/customer-hub-routes";

type Props = {
  isLoggedIn: boolean;
  authReady: boolean;
};

function OrderCard({ order }: { order: MallOrderMineListItemExtended }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-slate-500">{formatOrderDate(order.createdAt)}</p>
          <p className="mt-1 text-sm font-black text-slate-900">{order.orderNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-blue-700">{formatOrderAmount(order.finalAmount)}</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            {order.paymentStatusLabel}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-sm">
        <p className="font-bold text-slate-800">
          {order.productName}
          {order.brand ? (
            <span className="ml-1 font-medium text-slate-500">({order.brand})</span>
          ) : null}
        </p>
        <p className="text-xs font-medium text-slate-600">
          규격 {order.batteryCode} · {order.fulfillmentLabel}
        </p>
        <p className="text-xs font-medium text-slate-600">
          폐배터리 {order.returnBatteryLabel}
          {order.batteryReturnFee != null && order.batteryReturnFee > 0
            ? ` · 미반납 추가 ${order.batteryReturnFee.toLocaleString("ko-KR")}원`
            : null}
        </p>
        <p className="text-xs font-semibold text-slate-500">주문 상태: {order.orderStatusLabel}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`${HUB_SUPPORT}?tab=inquiry`}
          className="bm-auth-inline-btn no-underline text-xs"
        >
          주문 문의
        </Link>
      </div>
    </article>
  );
}

export function MyPageOrdersSection({ isLoggedIn, authReady }: Props) {
  const [orders, setOrders] = useState<MallOrderMineListItemExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!authReady || !isLoggedIn) {
      setOrders([]);
      setFetched(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetchMyCommerceOrders().then((result) => {
      if (cancelled) return;
      setLoading(false);
      setFetched(true);
      if (!result.ok) {
        setOrders([]);
        setError(result.message);
        return;
      }
      setOrders(result.orders);
    });

    return () => {
      cancelled = true;
    };
  }, [authReady, isLoggedIn]);

  return (
    <section id="orders" className="bm-mypage-orders scroll-mt-24">
      <h2 className="text-base font-black text-slate-900">내 주문내역</h2>
      <p className="mt-1 text-xs font-medium text-slate-500">
        결제·배송·장착 진행 상태를 확인할 수 있습니다.
      </p>

      {!authReady || loading ? (
        <div className="bm-mypage-orders__empty">
          <p className="text-sm font-medium text-slate-500">주문 내역을 불러오는 중…</p>
        </div>
      ) : !isLoggedIn ? (
        <div className="bm-mypage-orders__empty">
          <Package className="mx-auto size-8 text-slate-300" aria-hidden />
          <p className="mt-2">로그인 후 주문 내역을 확인하세요.</p>
        </div>
      ) : error ? (
        <div className="bm-mypage-orders__empty">
          <p className="text-sm font-semibold text-red-700" role="alert">
            {error}
          </p>
        </div>
      ) : orders.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {orders.map((order) => (
            <li key={order.orderId}>
              <OrderCard order={order} />
            </li>
          ))}
        </ul>
      ) : fetched ? (
        <div className="bm-mypage-orders__empty">
          <Package className="mx-auto size-8 text-slate-300" aria-hidden />
          <p className="mt-2">
            표시할 주문이 없습니다. 주문 후 여기에서 진행 상태를 확인할 수 있습니다.
          </p>
          <div className="bm-mypage-orders__actions">
            <Link
              href={MYPAGE_ORDER_CTAS.guestOrderLookup}
              className="bm-auth-submit inline-flex w-auto px-5 no-underline"
            >
              비회원 주문 조회
            </Link>
            <Link
              href={MYPAGE_ORDER_CTAS.consultationLookup}
              className="bm-auth-inline-btn no-underline"
            >
              상담 접수 조회
            </Link>
            <Link
              href={MYPAGE_ORDER_CTAS.search}
              className="bm-auth-inline-btn no-underline"
            >
              배터리 찾기
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
