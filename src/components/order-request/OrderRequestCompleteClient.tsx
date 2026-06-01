"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderRequestCartSummary } from "@/components/order-request/OrderRequestCartSummary";
import { OrderRequestReviewCard } from "@/components/order-request/OrderRequestReviewCard";
import { ORDER_REQUEST_COMPLETE_COPY } from "@/data/order-request-copy";
import { loadLastApiOrderRequest } from "@/lib/order-request/order-request-last-api";
import { maskPhone } from "@/lib/order-request/order-request-summary";
import { loadLastOrderRequest } from "@/lib/order-request/order-request-storage";
import {
  CART_PAGE,
  CUSTOMER_CENTER_HUB,
  CUSTOMER_CENTER_ORDER_GUIDE,
  ORDER_REQUEST_LOOKUP_PAGE,
} from "@/lib/customer-center-routes";
import type { OrderRequest } from "@/types/order-request";
import { bm } from "@/lib/design-tokens";

const USED_BATTERY_DISPLAY = {
  return: "폐전지 반납 예정",
  no_return: "폐전지 미반납",
  unknown: "아직 모르겠음",
} as const;

export function OrderRequestCompleteClient() {
  const searchParams = useSearchParams();
  const requestNumberFromUrl = searchParams.get("requestNumber");
  const [request, setRequest] = useState<OrderRequest | null>(null);
  const [requestNumber, setRequestNumber] = useState<string | null>(requestNumberFromUrl);
  const [hydrated, setHydrated] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  useEffect(() => {
    const apiSnap = loadLastApiOrderRequest();
    if (requestNumberFromUrl) {
      setRequestNumber(requestNumberFromUrl);
    } else if (apiSnap?.requestNumber) {
      setRequestNumber(apiSnap.requestNumber);
    }
    setRequest(loadLastOrderRequest());
    setHydrated(true);
  }, [requestNumberFromUrl]);

  const handleCopyRequestNumber = async () => {
    if (!requestNumber) return;
    try {
      await navigator.clipboard.writeText(requestNumber);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2500);
    } catch {
      setCopyDone(false);
    }
  };

  const lookupHref = requestNumber
    ? `${ORDER_REQUEST_LOOKUP_PAGE}?requestNumber=${encodeURIComponent(requestNumber)}`
    : ORDER_REQUEST_LOOKUP_PAGE;

  if (!hydrated) {
    return (
      <div className={`${bm.card} ${bm.cardPad} text-center text-sm text-slate-500`}>
        불러오는 중…
      </div>
    );
  }

  if (!request && !requestNumber) {
    return (
      <div className={`${bm.card} ${bm.cardPad} space-y-4 text-center`}>
        <p className="text-sm font-medium text-slate-600">
          최근 상담 주문 요청 정보가 없습니다. 먼저 요청 폼을 작성해 주세요.
        </p>
        <Link href="/checkout" className={`${bm.btnNavy} text-sm`}>
          상담 주문 요청하기
        </Link>
      </div>
    );
  }

  const vehicleDisplay = request
    ? [request.vehicle?.name, request.vehicle?.year, request.vehicle?.fuelType]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <div className="order-request-complete space-y-5" data-page="order-request-complete">
      <section
        className={`${bm.card} ${bm.cardPad} border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/25`}
      >
        <p className="text-[10px] font-black uppercase tracking-wide text-emerald-800">접수 완료</p>
        <h1 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">
          {ORDER_REQUEST_COMPLETE_COPY.title}
        </h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          {ORDER_REQUEST_COMPLETE_COPY.body}
        </p>
        {requestNumber ? (
          <div className="mt-3 space-y-2">
            <p className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-black text-emerald-950">
              접수번호: {requestNumber}
            </p>
            <button
              type="button"
              onClick={() => void handleCopyRequestNumber()}
              className={`${bm.btnSecondary} w-full text-xs sm:w-auto`}
            >
              접수번호 복사
            </button>
            {copyDone ? (
              <p className="text-[11px] font-bold text-emerald-800" role="status">
                접수번호가 복사되었습니다.
              </p>
            ) : null}
          </div>
        ) : null}
        <p className="mt-3 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-xs font-bold text-amber-950">
          {ORDER_REQUEST_COMPLETE_COPY.paymentNotice}
        </p>
        {request ? (
          <p className="mt-2 text-[10px] font-bold text-slate-500">
            {new Date(request.createdAt).toLocaleString("ko-KR")}
          </p>
        ) : null}
      </section>

      {request ? (
        <>
          <section className={`${bm.card} ${bm.cardPad} space-y-2`}>
            <h2 className="text-sm font-black text-slate-900">접수 정보 요약</h2>
            <dl className="grid gap-2 text-xs font-medium text-slate-700 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <dt className="font-bold text-slate-500">고객명</dt>
                <dd className="font-black">{request.customer.name || "(미입력)"}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <dt className="font-bold text-slate-500">연락처</dt>
                <dd className="font-black">{maskPhone(request.customer.phone)}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 sm:col-span-2">
                <dt className="font-bold text-slate-500">차량</dt>
                <dd className="font-black">{vehicleDisplay || "차량 정보 미입력"}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <dt className="font-bold text-slate-500">폐전지</dt>
                <dd className="font-black">
                  {USED_BATTERY_DISPLAY[request.usedBatteryReturnOption]}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <dt className="font-bold text-slate-500">수령·설치</dt>
                <dd className="font-black">{request.staffSummary.fulfillmentLine}</dd>
              </div>
            </dl>
            {request.memo ? (
              <p className="rounded-lg border border-slate-200 px-3 py-2 text-xs whitespace-pre-wrap text-slate-700">
                <span className="font-black text-slate-900">요청사항: </span>
                {request.memo}
              </p>
            ) : null}
          </section>

          <OrderRequestCartSummary items={request.items} />

          <OrderRequestReviewCard summary={request.staffSummary} />
        </>
      ) : null}

      <section className={`${bm.card} ${bm.cardPad}`}>
        <div className="flex flex-wrap gap-2">
          <Link href={lookupHref} className={`${bm.btnNavy} text-xs`}>
            접수번호 조회하기
          </Link>
          <Link href={CUSTOMER_CENTER_HUB} className={`${bm.btnSecondary} text-xs`}>
            고객센터 문의하기
          </Link>
          <Link href={CUSTOMER_CENTER_ORDER_GUIDE} className={`${bm.btnTertiary} text-xs`}>
            주문 안내 보기
          </Link>
          <Link href={CART_PAGE} className={`${bm.btnTertiary} text-xs`}>
            장바구니로 돌아가기
          </Link>
          <Link href="/" className={`${bm.btnTertiary} text-xs`}>
            메인으로 이동
          </Link>
        </div>
      </section>
    </div>
  );
}
