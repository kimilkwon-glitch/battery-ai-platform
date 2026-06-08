"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckoutBatteryReturnSummary } from "@/components/checkout/CheckoutBatteryReturnSummary";
import { OrderPriceBreakdown, OrderPriceTotalBar } from "@/components/pricing/OrderPriceBreakdown";
import {
  CheckoutPaymentSection,
  CheckoutSecurityNotice,
} from "@/components/checkout/CheckoutPaymentSection";
import {
  PaymentPreparingButton,
  PaymentPreparingNotice,
} from "@/components/checkout/PaymentPreparingNotice";
import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import { formatDeliveryAddress } from "@/lib/checkout/checkout-address";
import { isCommercePaymentLive } from "@/lib/payment/commerce-checkout-mode";
import {
  apiCreateCommerceOrder,
  apiPrepareCommercePayment,
} from "@/lib/payment/commerce-order-client";
import {
  loadCheckoutSession,
  saveCheckoutOrderMeta,
} from "@/lib/payment/checkout-session-storage";
import { CHECKOUT_PAGE } from "@/lib/payment/payment-routes";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { CheckoutSessionPayload, CreateOrderRequestBody, PaymentPrepareResponse } from "@/types/commerce-payment";
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
  const f = session.fulfillment;

  return {
    cartItems: session.items,
    customerInfo: {
      name: session.customer.name,
      phone: session.customer.phone,
      customerType: session.customer.customerType ?? "member",
      userId: session.customer.userId,
    },
    vehicleInfo: session.vehicle,
    fulfillmentType: session.fulfillment.method,
    returnBatteryOption: session.usedBatteryReturn,
    addressInfo: {
      deliveryAddress:
        session.fulfillment.method === "delivery" ? formatDeliveryAddress(f) : undefined,
      visitRegion:
        session.fulfillment.method === "visit_install" ? formatDeliveryAddress(f) : undefined,
      storeId,
      preferredTime: f.preferredTime,
      recipientName: f.recipientName,
      recipientPhone: f.recipientPhone,
      postalCode: f.postalCode,
      address1: f.address1,
      address2: f.address2,
      deliveryMessage: f.deliveryMessage,
      visitMessage: f.visitMessage,
      storeMessage: f.storeMessage,
    },
    selectedStore: storeId,
    requestMemo: session.memo,
    priceSummary: {
      clientFinalAmount: session.estimatedTotal,
      priceLines: session.priceLines,
    },
    promotion: {
      couponCode: session.couponCode,
    },
  };
}

function fulfillmentLocation(session: CheckoutSessionPayload): string {
  const { method, region, storeId } = session.fulfillment;
  if (method === "delivery" || method === "visit_install") {
    return formatDeliveryAddress(session.fulfillment) || region?.trim() || "—";
  }
  if (storeId === "deokcheon" || storeId === "hakjang") {
    return STORE_LABELS[storeId];
  }
  return "—";
}

export function CheckoutReviewPage() {
  const paymentLive = isCommercePaymentLive();
  const [session] = useState<CheckoutSessionPayload | null>(() => loadCheckoutSession());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [amountConfirmed, setAmountConfirmed] = useState(false);
  const [prepare, setPrepare] = useState<PaymentPrepareResponse | null>(null);

  const primary = session?.items[0];

  const fulfillmentLabel = session
    ? FULFILLMENT_METHOD_LABELS[session.fulfillment.method] ?? session.fulfillment.method
    : "—";

  const checkoutBackHref = useMemo(() => {
    if (session?.flow === "buy_now") return `${CHECKOUT_PAGE}?flow=buy_now`;
    return CHECKOUT_PAGE;
  }, [session?.flow]);

  const handleStartPayment = async () => {
    if (!session) return;

    if (!paymentLive) {
      setAmountConfirmed(true);
      return;
    }

    setSubmitting(true);
    setError(null);
    setPayError(null);

    const createRes = await apiCreateCommerceOrder(sessionToCreateBody(session));
    if (!createRes.ok) {
      setError(createRes.message);
      setSubmitting(false);
      return;
    }

    if (
      session.estimatedTotal != null &&
      createRes.order.finalAmount != null &&
      Math.abs(session.estimatedTotal - createRes.order.finalAmount) >= 1
    ) {
      console.error("[checkout] AMOUNT_MISMATCH", {
        client: session.estimatedTotal,
        server: createRes.order.finalAmount,
      });
      setError("결제 예정금액이 변경되었습니다. 주문서를 다시 확인해 주세요.");
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

    if (
      session.estimatedTotal != null &&
      Math.abs(session.estimatedTotal - prepareRes.data.amount) >= 1
    ) {
      console.error("[checkout] TOSS_AMOUNT_MISMATCH", {
        client: session.estimatedTotal,
        toss: prepareRes.data.amount,
      });
      setError("결제 금액이 일치하지 않습니다. 주문서를 다시 확인해 주세요.");
      setSubmitting(false);
      return;
    }

    saveCheckoutOrderMeta({
      orderId: prepareRes.data.orderId,
      orderNumber: prepareRes.data.orderNumber,
      paymentRequestId: prepareRes.data.paymentRequestId,
      finalAmount: prepareRes.data.amount,
    });

    setPrepare(prepareRes.data);
    setSubmitting(false);
  };

  if (!session || session.items.length === 0) {
    return (
      <div className={`${bm.card} ${bm.cardPad} space-y-4 text-center`}>
        <h2 className="text-base font-black text-slate-900">확인할 주문 정보가 없습니다</h2>
        <Link href={CHECKOUT_PAGE} className={`${bm.btnNavy} inline-flex justify-center text-sm`}>
          주문서 작성으로 이동
        </Link>
      </div>
    );
  }

  if (amountConfirmed) {
    return (
      <div className="checkout-review-confirmed space-y-5 pb-8">
        <section className="checkout-card space-y-4 text-center">
          <h1 className="text-lg font-black text-slate-950">주문 금액 확인 완료</h1>
          <p className="text-2xl font-black tabular-nums text-slate-950">
            {session.estimatedTotal != null ? formatPriceWon(session.estimatedTotal) : "—"}
          </p>
        </section>
      </div>
    );
  }

  const priceAside = (
    <div className="space-y-4 lg:sticky lg:top-4">
      <div className="checkout-summary-card rounded-2xl p-4">
        <h2 className="text-sm font-black text-slate-900">결제금액 요약</h2>
        <div className="mt-3">
          <CheckoutBatteryReturnSummary value={session.usedBatteryReturn} />
        </div>
        <div className="mt-3 space-y-3">
          {session.items.map((item) => (
            <OrderPriceBreakdown
              key={item.id}
              item={item}
              fulfillmentMethod={session.fulfillment.method}
              compact
            />
          ))}
        </div>
        {(session.batteryReturnFee ?? 0) > 0 ? (
          <p className="mt-2 text-xs font-black text-red-600">
            미반납 추가금 +{formatPriceWon(session.batteryReturnFee ?? 0)}
          </p>
        ) : null}
        {(session.appliedPromotions ?? []).map((p) => (
          <p key={p.promotionId} className="mt-1 text-xs font-black text-red-600">
            {p.title}: -{formatPriceWon(p.discountAmount)}
          </p>
        ))}
        <div className="mt-4">
          <OrderPriceTotalBar
            items={session.items}
            fulfillmentMethod={session.fulfillment.method}
            returnBatteryOption={session.usedBatteryReturn}
          />
        </div>
      </div>

      {paymentLive ? (
        <CheckoutPaymentSection
          prepare={prepare}
          preparing={submitting}
          onStartPayment={() => void handleStartPayment()}
          canStartPayment={!prepare}
          payError={payError}
          onPayError={setPayError}
        />
      ) : (
        <PaymentPreparingButton
          disabled={submitting}
          loading={submitting}
          label="결제금액 확인"
          onClick={() => void handleStartPayment()}
        />
      )}
    </div>
  );

  return (
    <div className="checkout-order checkout-review pb-28 lg:pb-10" data-page="checkout-review">
      <div className="mb-5 lg:hidden">{priceAside}</div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,400px)] lg:items-start">
        <div className="space-y-5">
          <section className="checkout-card">
            <h1 className="text-xl font-black text-slate-950">주문 및 결제</h1>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              주문 내용을 확인한 뒤 결제를 진행해 주세요.
            </p>
          </section>

          <section className="checkout-card space-y-3">
            <h2 className="checkout-card__title">주문 상품</h2>
            <dl className="grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="font-bold text-slate-500">상품명</dt>
                <dd className="font-black text-slate-900">{primary?.productName ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">배터리 규격</dt>
                <dd className="font-black text-slate-900">{primary?.batterySpec ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">수령/장착 방식</dt>
                <dd className="font-black text-slate-900">{fulfillmentLabel}</dd>
              </div>
            </dl>
            <CheckoutBatteryReturnSummary value={session.usedBatteryReturn} />
          </section>

          <section className="checkout-card space-y-3">
            <h2 className="checkout-card__title">차량 정보</h2>
            <dl className="grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="font-bold text-slate-500">차량명</dt>
                <dd className="font-black text-slate-900">{session.vehicle.name ?? "미입력"}</dd>
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

          <section className="checkout-card space-y-3">
            <h2 className="checkout-card__title">고객·수령 정보</h2>
            <dl className="grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="font-bold text-slate-500">주문자</dt>
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
                      ? "방문 주소"
                      : "방문 지점"}
                </dt>
                <dd className="font-black text-slate-900">{fulfillmentLocation(session)}</dd>
              </div>
              {session.memo ? (
                <div className="sm:col-span-2">
                  <dt className="font-bold text-slate-500">전달사항</dt>
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

          <Link href={checkoutBackHref} className={`${bm.btnTertiary} hidden lg:inline-flex text-sm`}>
            주문서 수정하기
          </Link>
        </div>

        <aside className="hidden lg:block">{priceAside}</aside>
      </div>

      <div className="checkout-order__mobile-total fixed inset-x-0 bottom-0 z-40 border-t p-3 backdrop-blur lg:hidden">
        <p className="mb-2 text-right text-lg font-black tabular-nums text-slate-900">
          {session.estimatedTotal != null ? formatPriceWon(session.estimatedTotal) : "—"}
        </p>
        {!prepare && paymentLive ? (
          <PaymentPreparingButton
            disabled={submitting}
            loading={submitting}
            label="결제하기"
            onClick={() => void handleStartPayment()}
          />
        ) : null}
      </div>
    </div>
  );
}
