"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { OrderPriceBreakdown, OrderPriceTotalBar } from "@/components/pricing/OrderPriceBreakdown";
import { PaymentPreparingNotice } from "@/components/checkout/PaymentPreparingNotice";
import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import {
  apiCreateCommerceOrder,
  apiPrepareCommercePayment,
} from "@/lib/payment/commerce-order-client";
import {
  loadCheckoutSession,
  saveCheckoutOrderMeta,
} from "@/lib/payment/checkout-session-storage";
import { CHECKOUT_PAGE } from "@/lib/payment/payment-routes";
import { paymentReadyUrl } from "@/lib/payment/payment-routes";
import type { CheckoutSessionPayload, CreateOrderRequestBody } from "@/types/commerce-payment";
import { bm } from "@/lib/design-tokens";

const STORE_LABELS: Record<string, string> = {
  deokcheon: "덕천점",
  hakjang: "학장점",
};

function sessionToCreateBody(session: CheckoutSessionPayload): CreateOrderRequestBody {
  const storeId =
    session.fulfillment.storeId === "deokcheon" || session.fulfillment.storeId === "hakjang"
      ? session.fulfillment.storeId
      : undefined;

  return {
    cartItems: session.items,
    customerInfo: {
      name: session.customer.name,
      phone: session.customer.phone,
      email: session.customer.email,
      customerType: session.customer.customerType ?? "member",
      orderMemo: session.customer.orderMemo,
    },
    vehicleInfo: session.vehicle,
    fulfillmentType: session.fulfillment.method,
    returnBatteryOption: session.usedBatteryReturn,
    addressInfo: {
      deliveryAddress:
        session.fulfillment.method === "delivery" ? session.fulfillment.region : undefined,
      visitRegion:
        session.fulfillment.method === "visit_install" ? session.fulfillment.region : undefined,
      storeId,
      preferredTime: session.fulfillment.preferredTime,
    },
    selectedStore: storeId,
    requestMemo: session.memo,
    priceSummary: {
      clientFinalAmount: session.estimatedTotal,
      priceLines: session.priceLines,
    },
  };
}

function fulfillmentLocation(session: CheckoutSessionPayload): string {
  const { method, region, storeId } = session.fulfillment;
  if (method === "delivery" || method === "visit_install") {
    return region?.trim() || "—";
  }
  if (storeId === "deokcheon" || storeId === "hakjang") {
    return STORE_LABELS[storeId];
  }
  return "—";
}

export function CheckoutReviewPage() {
  const router = useRouter();
  const [session, setSession] = useState<CheckoutSessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadCheckoutSession();
    setSession(loaded);
    setLoading(false);
  }, []);

  const primary = session?.items[0];
  const usedLabel = session
    ? session.usedBatteryReturn === "return"
      ? "반납"
      : session.usedBatteryReturn === "no_return"
        ? "미반납"
        : "상담 시 확인"
    : "—";

  const fulfillmentLabel = session
    ? FULFILLMENT_METHOD_LABELS[session.fulfillment.method] ?? session.fulfillment.method
    : "—";

  const checkoutBackHref = useMemo(() => {
    if (session?.flow === "buy_now") return `${CHECKOUT_PAGE}?flow=buy_now`;
    return CHECKOUT_PAGE;
  }, [session?.flow]);

  const handlePreparePayment = async () => {
    if (!session) return;
    setSubmitting(true);
    setError(null);

    const createRes = await apiCreateCommerceOrder(sessionToCreateBody(session));
    if (!createRes.ok) {
      setError(createRes.message);
      setSubmitting(false);
      return;
    }

    const prepareRes = await apiPrepareCommercePayment({
      orderId: createRes.order.orderId,
      clientAmount: session.estimatedTotal,
    });

    if (!prepareRes.ok) {
      setError(prepareRes.message);
      setSubmitting(false);
      return;
    }

    saveCheckoutOrderMeta({
      orderId: prepareRes.data.orderId,
      orderNumber: prepareRes.data.orderNumber,
      paymentRequestId: prepareRes.data.paymentRequestId,
      finalAmount: prepareRes.data.amount,
    });

    router.push(paymentReadyUrl(prepareRes.data.orderId, prepareRes.data.paymentRequestId));
  };

  if (loading) {
    return (
      <div className={`${bm.card} ${bm.cardPad} text-center`} role="status">
        <p className="text-sm font-bold text-slate-800">주문 정보를 불러오는 중입니다</p>
      </div>
    );
  }

  if (!session || session.items.length === 0) {
    return (
      <div className={`${bm.card} ${bm.cardPad} space-y-4 text-center`}>
        <h2 className="text-base font-black text-slate-900">확인할 주문 정보가 없습니다</h2>
        <p className="text-sm font-medium text-slate-600">
          주문서를 다시 작성한 뒤 결제 전 확인을 진행해 주세요.
        </p>
        <Link href={CHECKOUT_PAGE} className={`${bm.btnNavy} inline-flex justify-center text-sm`}>
          주문서 작성으로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-review pb-28 lg:pb-8" data-page="checkout-review">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-5">
          <section className={`${bm.card} ${bm.cardPad}`}>
            <h1 className="text-lg font-black text-slate-950">결제 전 최종 확인</h1>
            <p className="mt-2 text-sm font-medium text-slate-600">
              아래 내용을 확인하신 뒤 결제 준비 단계로 이동합니다.
            </p>
          </section>

          <PaymentPreparingNotice compact />

          <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
            <h2 className="text-sm font-black text-slate-900">상품 정보</h2>
            <dl className="grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="font-bold text-slate-500">상품명</dt>
                <dd className="font-black text-slate-900">{primary?.productName ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">브랜드</dt>
                <dd className="font-black text-slate-900">{primary?.brandName ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">배터리 규격</dt>
                <dd className="font-black text-slate-900">{primary?.batterySpec ?? "—"}</dd>
              </div>
            </dl>
          </section>

          <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
            <h2 className="text-sm font-black text-slate-900">차량 정보</h2>
            <dl className="grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="font-bold text-slate-500">차량명</dt>
                <dd className="font-black text-slate-900">{session.vehicle.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">연식</dt>
                <dd className="font-black text-slate-900">{session.vehicle.year ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">연료</dt>
                <dd className="font-black text-slate-900">{session.vehicle.fuelType ?? "—"}</dd>
              </div>
            </dl>
          </section>

          <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
            <h2 className="text-sm font-black text-slate-900">수령·고객 정보</h2>
            <dl className="grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="font-bold text-slate-500">수령/장착 방식</dt>
                <dd className="font-black text-slate-900">{fulfillmentLabel}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">반납/미반납</dt>
                <dd className="font-black text-slate-900">{usedLabel}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">고객명</dt>
                <dd className="font-black text-slate-900">{session.customer.name}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">연락처</dt>
                <dd className="font-black text-slate-900">{session.customer.phone}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-bold text-slate-500">
                  {session.fulfillment.method === "delivery"
                    ? "배송지"
                    : session.fulfillment.method === "visit_install"
                      ? "출장지"
                      : "방문 지점"}
                </dt>
                <dd className="font-black text-slate-900">{fulfillmentLocation(session)}</dd>
              </div>
              {session.memo ? (
                <div className="sm:col-span-2">
                  <dt className="font-bold text-slate-500">요청사항</dt>
                  <dd className="whitespace-pre-wrap font-medium text-slate-800">{session.memo}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          {error ? (
            <p className="text-xs font-bold text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="hidden flex-col gap-2 lg:flex sm:flex-row">
            <Link href={checkoutBackHref} className={`${bm.btnTertiary} justify-center text-sm`}>
              이전으로 돌아가기
            </Link>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handlePreparePayment()}
              className={`${bm.btnNavy} flex-1 justify-center text-sm font-black disabled:opacity-50`}
              data-checkout-review-submit
            >
              {submitting ? "준비 중…" : "결제 준비하기"}
            </button>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="space-y-3 lg:sticky lg:top-4">
            <h2 className="text-sm font-black text-slate-900">가격 계산 내역</h2>
            {session.items.map((item) => (
              <OrderPriceBreakdown
                key={item.id}
                item={item}
                fulfillmentMethod={session.fulfillment.method}
              />
            ))}
            <OrderPriceTotalBar items={session.items} fulfillmentMethod={session.fulfillment.method} />
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <OrderPriceTotalBar items={session.items} fulfillmentMethod={session.fulfillment.method} />
        <div className="mt-2 flex gap-2">
          <Link href={checkoutBackHref} className={`${bm.btnTertiary} flex-1 justify-center text-xs`}>
            이전
          </Link>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handlePreparePayment()}
            className={`${bm.btnNavy} flex-[2] justify-center text-xs font-black disabled:opacity-50`}
          >
            {submitting ? "준비 중…" : "결제 준비하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
