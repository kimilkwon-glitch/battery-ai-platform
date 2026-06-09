"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { COMMERCE_PRICING_POLICY } from "@/data/commerce-pricing-policy";
import { CUSTOMER_CENTER_PHONE } from "@/lib/contact-info";
import { LEGAL_SHIPPING_RETURNS_PAGE } from "@/lib/legal/legal-routes";
import {
  BATTERY_NO_RETURN_FEE,
  DELIVERY_FEE,
  formatPriceWon,
  computeLineAmountWithReturnFee,
  FULFILLMENT_PRICE_LABELS,
  normalizeFulfillmentPriceType,
} from "@/lib/pricing/order-price";
import { CUSTOMER_PRICE_LABELS } from "@/lib/pricing/customer-price-labels";
import type { BatteryCartItem, FulfillmentMethod, UsedBatteryReturnOption } from "@/types/cart";
import type { OrderRequestUsedBatteryOption } from "@/types/order-request";

type ReturnOptionInput = UsedBatteryReturnOption | OrderRequestUsedBatteryOption | null;

export type CommercePrePaymentNoticeVariant = "compact" | "checkout" | "full";

type Props = {
  variant?: CommercePrePaymentNoticeVariant;
  /** variant=checkout 전용 — review는 결제 직전 최소 표시 */
  checkoutStep?: "order" | "review";
  totalAmount?: number | null;
  fulfillmentMethod?: FulfillmentMethod;
  usedBatteryReturn?: ReturnOptionInput;
  items?: BatteryCartItem[];
};

function resolveTotal(
  totalAmount: number | null | undefined,
  items: BatteryCartItem[] | undefined,
  fulfillmentMethod: FulfillmentMethod | undefined,
  usedBatteryReturn: ReturnOptionInput | undefined,
): number | null {
  if (totalAmount != null) return totalAmount;
  if (!items?.length || !fulfillmentMethod) return null;
  const returnOverride =
    usedBatteryReturn === "undecided"
      ? null
      : (usedBatteryReturn as OrderRequestUsedBatteryOption | undefined);
  let sum = 0;
  let hasPrice = false;
  for (const item of items) {
    const line = computeLineAmountWithReturnFee(item, fulfillmentMethod, returnOverride ?? undefined);
    const amount = line.finalAmount ?? line.fulfillmentSubtotal;
    if (amount != null) {
      sum += amount;
      hasPrice = true;
    }
  }
  return hasPrice ? sum : null;
}

function fulfillmentLabel(method: FulfillmentMethod | undefined): string {
  if (!method) return "선택 후 표시";
  const priceType = normalizeFulfillmentPriceType(method);
  if (priceType === "undecided") return "선택 필요";
  return FULFILLMENT_PRICE_LABELS[priceType];
}

function usedBatteryReturnLabel(option: ReturnOptionInput | undefined): string {
  if (option === "return") return "반납";
  if (option === "no_return") return "미반납";
  return "선택 필요";
}

function deliveryFeeNote(method: FulfillmentMethod | undefined): string {
  if (method === "delivery") {
    return `택배비 ${DELIVERY_FEE.toLocaleString("ko-KR")}원 포함`;
  }
  if (method === "store_pickup_self") {
    return "택배비 없음";
  }
  return "택배비 해당 없음";
}

function fulfillmentBasisLabel(method: FulfillmentMethod | undefined): string {
  if (!method) return "수령/장착 방식 선택 후 가격 기준이 적용됩니다.";
  const priceType = normalizeFulfillmentPriceType(method);
  if (priceType === "undecided") return "수령/장착 방식을 선택해 주세요.";
  const policyKey =
    priceType === "onsite_install"
      ? "visitInstall"
      : priceType === "store_install"
        ? "storeInstall"
        : priceType === "store_pickup_self"
          ? "storePickupSelf"
          : "delivery";
  const policy = COMMERCE_PRICING_POLICY[policyKey];
  return `${FULFILLMENT_PRICE_LABELS[priceType]}: ${policy.formula}`;
}

function usedBatteryNote(option: ReturnOptionInput | undefined): string {
  if (option === "no_return") {
    return `폐전지 미반납 선택 시 추가금 ${BATTERY_NO_RETURN_FEE.toLocaleString("ko-KR")}원이 적용될 수 있습니다.`;
  }
  if (option === "return") {
    return "폐전지 반납 조건 가격입니다. 미반납 시 추가 비용이 발생할 수 있습니다.";
  }
  return "폐전지 반납 여부에 따라 금액과 회수 절차가 달라집니다.";
}

const CHECKOUT_CORE_LINES = [
  `택배 발송 시 배송비 ${DELIVERY_FEE.toLocaleString("ko-KR")}원이 적용됩니다.`,
  "폐전지 미반납 시 추가 비용이 발생할 수 있습니다.",
  "장착/사용 후에는 상품 특성상 반품이 제한될 수 있습니다.",
] as const;

function PolicyLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href={LEGAL_SHIPPING_RETURNS_PAGE}
      className={clsx("font-bold text-blue-700 hover:underline", className)}
    >
      배송·교환·반품 기준 보기 →
    </Link>
  );
}

function CompactNotice() {
  return (
    <div
      className="commerce-pre-payment-notice commerce-pre-payment-notice--compact border-t border-slate-100 pt-2.5 text-[11px] leading-snug text-slate-500"
      data-component="commerce-pre-payment-notice"
      data-variant="compact"
      aria-label="주문 안내"
    >
      <p>폐전지 반납 기준 상품입니다.</p>
      <p>수령방식에 따라 최종 금액이 달라질 수 있습니다.</p>
      <PolicyLink className="mt-1 inline-block text-[11px]" />
    </div>
  );
}

function CheckoutReviewNotice({
  resolvedTotal,
  fulfillmentMethod,
  usedBatteryReturn,
}: {
  resolvedTotal: number | null;
  fulfillmentMethod?: FulfillmentMethod;
  usedBatteryReturn?: ReturnOptionInput;
}) {
  return (
    <div
      className="commerce-pre-payment-notice commerce-pre-payment-notice--review rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5"
      data-component="commerce-pre-payment-notice"
      data-variant="checkout"
      data-checkout-step="review"
      aria-label="결제 요약"
    >
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
        <div>
          <dt className="font-bold text-slate-500">최종 결제금액</dt>
          <dd className="font-black tabular-nums text-slate-900">
            {resolvedTotal != null ? formatPriceWon(resolvedTotal) : "—"}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">수령방식</dt>
          <dd className="font-bold text-slate-800">{fulfillmentLabel(fulfillmentMethod)}</dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">폐전지 반납</dt>
          <dd className="font-bold text-slate-800">{usedBatteryReturnLabel(usedBatteryReturn)}</dd>
        </div>
        <div className="col-span-2">
          <PolicyLink className="text-[11px]" />
        </div>
      </dl>
    </div>
  );
}

function CheckoutOrderNotice({
  resolvedTotal,
  fulfillmentMethod,
  usedBatteryReturn,
}: {
  resolvedTotal: number | null;
  fulfillmentMethod?: FulfillmentMethod;
  usedBatteryReturn?: ReturnOptionInput;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      className="commerce-pre-payment-notice commerce-pre-payment-notice--checkout rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5"
      data-component="commerce-pre-payment-notice"
      data-variant="checkout"
      data-checkout-step="order"
      aria-label="주문 전 확인"
    >
      <ul className="space-y-1 text-[11px] font-medium leading-snug text-slate-600">
        {CHECKOUT_CORE_LINES.map((line) => (
          <li key={line} className="flex gap-1.5">
            <span className="text-slate-400" aria-hidden>
              ·
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-2 flex w-full items-center gap-1 text-left text-[11px] font-bold text-slate-600 hover:text-slate-900"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        자세히 보기
        <ChevronDown className={clsx("size-3.5 transition", expanded && "rotate-180")} aria-hidden />
      </button>

      {expanded ? (
        <div className="mt-2 space-y-2 border-t border-slate-100 pt-2 text-[11px] font-medium text-slate-600">
          <dl className="grid gap-1.5">
            <div>
              <dt className="font-black text-slate-700">총 결제금액</dt>
              <dd className="tabular-nums font-black text-slate-900">
                {resolvedTotal != null ? formatPriceWon(resolvedTotal) : "수령 방식·반납 조건 선택 후 표시"}
              </dd>
            </div>
            <div>
              <dt className="font-black text-slate-700">수령방식별 가격 기준</dt>
              <dd className="leading-relaxed">{fulfillmentBasisLabel(fulfillmentMethod)}</dd>
            </div>
            <div>
              <dt className="font-black text-slate-700">택배비</dt>
              <dd>{deliveryFeeNote(fulfillmentMethod)}</dd>
            </div>
            <div>
              <dt className="font-black text-slate-700">폐전지 반납 조건</dt>
              <dd className="leading-relaxed">{usedBatteryNote(usedBatteryReturn)}</dd>
            </div>
          </dl>
          <ul className="list-disc space-y-1 pl-4 leading-relaxed">
            <li>
              자동차 배터리는 차량정보·규격·단자 방향을 반드시 확인해 주세요. 오주문 방지를 위해 주문 전
              상담을 권장합니다.
            </li>
            <li>
              장착·사용 흔적이 있는 배터리는 상품 특성상 반품이 제한될 수 있으며, 단순 변심 반품 시 반품
              배송비 또는 왕복 배송비가 차감될 수 있습니다.
            </li>
            <li>
              택배: {CUSTOMER_PRICE_LABELS.productPurchase} + 택배비{" "}
              {DELIVERY_FEE.toLocaleString("ko-KR")}원 · 내방교체: 출장가에서 5,000원 할인 · 매장
              수령/셀프교체: {CUSTOMER_PRICE_LABELS.productPurchase} 기준(택배비 없음)
            </li>
          </ul>
          <p className="font-bold text-slate-700">
            문의: 고객센터{" "}
            <a href="tel:07079542143" className="text-blue-800 hover:underline">
              {CUSTOMER_CENTER_PHONE}
            </a>
          </p>
          <PolicyLink className="text-[11px]" />
        </div>
      ) : null}
    </section>
  );
}

function FullNotice({
  resolvedTotal,
  fulfillmentMethod,
  usedBatteryReturn,
}: {
  resolvedTotal: number | null;
  fulfillmentMethod?: FulfillmentMethod;
  usedBatteryReturn?: ReturnOptionInput;
}) {
  return (
    <section
      className="commerce-pre-payment-notice commerce-pre-payment-notice--full rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3"
      data-component="commerce-pre-payment-notice"
      data-variant="full"
      aria-label="결제 전 확인 사항"
    >
      <h2 className="text-sm font-black text-slate-900">결제 전 확인 사항</h2>

      <dl className="grid gap-2 text-xs font-medium text-slate-700">
        <div>
          <dt className="font-black text-slate-800">총 결제금액</dt>
          <dd className="mt-0.5 tabular-nums font-black text-slate-950">
            {resolvedTotal != null ? formatPriceWon(resolvedTotal) : "수령 방식·반납 조건 선택 후 표시"}
          </dd>
        </div>
        <div>
          <dt className="font-black text-slate-800">수령방식별 가격 기준</dt>
          <dd className="mt-0.5 leading-relaxed">{fulfillmentBasisLabel(fulfillmentMethod)}</dd>
        </div>
        <div>
          <dt className="font-black text-slate-800">택배비</dt>
          <dd className="mt-0.5">{deliveryFeeNote(fulfillmentMethod)}</dd>
        </div>
        <div>
          <dt className="font-black text-slate-800">폐전지 반납 조건</dt>
          <dd className="mt-0.5 leading-relaxed">{usedBatteryNote(usedBatteryReturn)}</dd>
        </div>
      </dl>

      <ul className="list-disc space-y-1 pl-4 text-xs font-medium leading-relaxed text-slate-600">
        <li>
          자동차 배터리는 차량정보·규격·단자 방향을 반드시 확인해 주세요. 오주문 방지를 위해 주문 전
          상담을 권장합니다.
        </li>
        <li>
          장착·사용 흔적이 있는 배터리는 상품 특성상 반품이 제한될 수 있으며, 단순 변심 반품 시 반품
          배송비 또는 왕복 배송비가 차감될 수 있습니다.
        </li>
        <li>
          택배: {CUSTOMER_PRICE_LABELS.productPurchase} + 택배비 {DELIVERY_FEE.toLocaleString("ko-KR")}
          원 · 내방교체: 출장가에서 5,000원 할인 · 매장 수령/셀프교체: {CUSTOMER_PRICE_LABELS.productPurchase}{" "}
          기준(택배비 없음)
        </li>
      </ul>

      <p className="text-xs font-bold text-slate-800">
        문의: 고객센터{" "}
        <a href="tel:07079542143" className="text-blue-800 hover:underline">
          {CUSTOMER_CENTER_PHONE}
        </a>
      </p>

      <PolicyLink className="text-xs" />
    </section>
  );
}

export function CommercePrePaymentNotice({
  variant = "full",
  checkoutStep = "order",
  totalAmount,
  fulfillmentMethod,
  usedBatteryReturn,
  items,
}: Props) {
  const resolvedTotal = resolveTotal(totalAmount, items, fulfillmentMethod, usedBatteryReturn);

  if (variant === "compact") {
    return <CompactNotice />;
  }

  if (variant === "checkout") {
    if (checkoutStep === "review") {
      return (
        <CheckoutReviewNotice
          resolvedTotal={resolvedTotal}
          fulfillmentMethod={fulfillmentMethod}
          usedBatteryReturn={usedBatteryReturn}
        />
      );
    }
    return (
      <CheckoutOrderNotice
        resolvedTotal={resolvedTotal}
        fulfillmentMethod={fulfillmentMethod}
        usedBatteryReturn={usedBatteryReturn}
      />
    );
  }

  return (
    <FullNotice
      resolvedTotal={resolvedTotal}
      fulfillmentMethod={fulfillmentMethod}
      usedBatteryReturn={usedBatteryReturn}
    />
  );
}
