"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminCommerceOrdersTable } from "@/components/admin/AdminCommerceOrdersTable";
import { CommercePaymentMetaPanel } from "@/components/admin/CommercePaymentMetaPanel";
import type { AdminCommerceOrderListItem } from "@/lib/payment/commerce-order-admin-mapper";
import type { AdminCommercePaymentMeta } from "@/types/commerce-payment";
import type { CommerceOrderRecord } from "@/types/commerce-payment";
import { bm } from "@/lib/design-tokens";

type Props = {
  orders: AdminCommerceOrderListItem[];
};

export function AdminCommerceOrdersClient({ orders }: Props) {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("orderId")?.trim() ?? "";
  const [detail, setDetail] = useState<{
    order: CommerceOrderRecord;
    paymentMeta: AdminCommercePaymentMeta;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/commerce-orders/${encodeURIComponent(orderId)}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.message ?? "상세 정보를 불러오지 못했습니다.");
        setDetail(null);
        return;
      }
      setDetail({ order: data.order, paymentMeta: data.paymentMeta });
    } catch {
      setError("상세 정보를 불러오지 못했습니다.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
      <AdminCommerceOrdersTable orders={orders} selectedOrderId={selectedId} />
      <aside className="space-y-3 lg:sticky lg:top-4">
        {!selectedId ? (
          <p className={`${bm.card} ${bm.cardPad} text-xs font-medium text-slate-500`}>
            목록에서 주문을 선택하면 결제 상세가 표시됩니다.
          </p>
        ) : loading ? (
          <p className={`${bm.card} ${bm.cardPad} text-xs font-medium text-slate-500`}>
            상세 불러오는 중…
          </p>
        ) : error ? (
          <p className={`${bm.card} ${bm.cardPad} text-xs font-bold text-red-700`} role="alert">
            {error}
          </p>
        ) : detail ? (
          <>
            <CommercePaymentMetaPanel meta={detail.paymentMeta} />
            <section className={`${bm.card} ${bm.cardPad} space-y-2 text-xs`}>
              <h3 className="font-black text-slate-900">주문 요약</h3>
              <p>
                <span className="font-bold text-slate-500">고객 </span>
                {detail.order.customerName} · {detail.order.customerPhone}
              </p>
              <p>
                <span className="font-bold text-slate-500">차량 </span>
                {detail.order.vehicleName ?? "—"}
              </p>
              <p>
                <span className="font-bold text-slate-500">상품 </span>
                {detail.order.productName} ({detail.order.batteryCode})
              </p>
              <p>
                <span className="font-bold text-slate-500">택배비 </span>
                {detail.order.deliveryFee.toLocaleString("ko-KR")}원
              </p>
              <p>
                <span className="font-bold text-slate-500">미반납 추가금 </span>
                {(detail.order.batteryReturnFee ?? 0).toLocaleString("ko-KR")}원
              </p>
              <p>
                <span className="font-bold text-slate-500">총 결제금액 </span>
                {detail.order.finalAmount?.toLocaleString("ko-KR") ?? "—"}원
              </p>
            </section>
          </>
        ) : null}
      </aside>
    </div>
  );
}
