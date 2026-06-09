"use client";

import Link from "next/link";
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

type Props = {
  variant?: "compact" | "default";
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

export function CommercePrePaymentNotice({
  variant = "default",
  totalAmount,
  fulfillmentMethod,
  usedBatteryReturn,
  items,
}: Props) {
  const resolvedTotal = resolveTotal(totalAmount, items, fulfillmentMethod, usedBatteryReturn);
  const compact = variant === "compact";

  return (
    <section
      className={`commerce-pre-payment-notice rounded-xl border border-slate-200 bg-slate-50/80 ${
        compact ? "p-3 space-y-2" : "p-4 space-y-3"
      }`}
      data-component="commerce-pre-payment-notice"
      aria-label="결제 전 확인 사항"
    >
      <h2 className={`font-black text-slate-900 ${compact ? "text-xs" : "text-sm"}`}>
        결제 전 확인 사항
      </h2>

      <dl className={`grid gap-2 ${compact ? "text-[11px]" : "text-xs"} font-medium text-slate-700`}>
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

      <ul
        className={`list-disc space-y-1 pl-4 leading-relaxed text-slate-600 ${
          compact ? "text-[11px]" : "text-xs"
        } font-medium`}
      >
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

      <p className={`font-bold text-slate-800 ${compact ? "text-[11px]" : "text-xs"}`}>
        문의: 고객센터{" "}
        <a href="tel:07079542143" className="text-blue-800 hover:underline">
          {CUSTOMER_CENTER_PHONE}
        </a>
      </p>

      <Link
        href={LEGAL_SHIPPING_RETURNS_PAGE}
        className={`inline-flex font-black text-blue-700 hover:underline ${
          compact ? "text-[11px]" : "text-xs"
        }`}
      >
        배송·교환·반품·환불 안내 전체 보기 →
      </Link>
    </section>
  );
}
