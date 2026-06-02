"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BatteryAutoDiscountHint } from "@/components/benefits/BatteryAutoDiscountHint";
import { CheckoutSafetyChecklist } from "@/components/checkout/CheckoutSafetyChecklist";
import { useBatteryCart } from "@/components/cart/BatteryCartProvider";
import {
  OrderRequestCustomerFields,
  type CustomerFormValues,
} from "@/components/order-request/OrderRequestCustomerFields";
import {
  OrderRequestFulfillmentFields,
  OrderRequestUsedBatteryFields,
} from "@/components/order-request/OrderRequestFulfillmentFields";
import { OrderRequestCartSummary } from "@/components/order-request/OrderRequestCartSummary";
import { OrderRequestVehicleFields } from "@/components/order-request/OrderRequestVehicleFields";
import { CHECKOUT_PAGE_COPY } from "@/data/checkout-checklist";
import { ORDER_REQUEST_MEMO_PLACEHOLDER } from "@/data/order-request-copy";
import {
  buildOrderRequestId,
  buildStaffSummary,
} from "@/lib/order-request/order-request-summary";
import { submitOrderRequest } from "@/lib/order-request/order-request-client-api";
import { saveLastApiOrderRequest } from "@/lib/order-request/order-request-last-api";
import { saveLastOrderRequest } from "@/lib/order-request/order-request-storage";
import {
  CART_PAGE,
  ORDER_REQUEST_COMPLETE_PAGE,
} from "@/lib/customer-center-routes";
import { HUB_SHOP } from "@/lib/customer-hub-routes";
import { getSearchHref } from "@/lib/battery-search";
import type { OrderRequestConfirmations } from "@/types/order-request";
import {
  initialUsedBatteryFromCart,
  isUsedBatterySelected,
  type UsedBatteryFormSelection,
} from "@/lib/order-request/order-request-form-helpers";
import type { OrderRequestFulfillment, OrderRequestVehicle } from "@/types/order-request";
import { bm } from "@/lib/design-tokens";

function phoneValid(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9;
}

function initialVehicleFromCart(
  items: ReturnType<typeof useBatteryCart>["items"],
): OrderRequestVehicle {
  const v = items.find((i) => i.vehicle?.displayName)?.vehicle;
  if (!v) return {};
  return {
    name: v.displayName,
    year: v.year,
    fuelType: v.fuelType,
    currentBatterySpec: items[0]?.batterySpec,
  };
}

function confirmationsFromChecklist(): OrderRequestConfirmations {
  return {
    fitmentNeedsFinalCheck: true,
    usedBatteryPriceMayDiffer: true,
    bankTransferDeadlineAware: true,
    orderWillBeGuidedSeparately: true,
  };
}

export function CheckoutOrderPage() {
  const router = useRouter();
  const { items, hydrated } = useBatteryCart();
  const [customer, setCustomer] = useState<CustomerFormValues>({
    name: "",
    phone: "",
    email: "",
    orderMemo: "",
  });
  const [vehicle, setVehicle] = useState<OrderRequestVehicle>({});
  const [usedBattery, setUsedBattery] = useState<UsedBatteryFormSelection>(null);
  const [fulfillment, setFulfillment] = useState<OrderRequestFulfillment>({
    method: "undecided",
    storeId: "undecided",
  });
  const [memo, setMemo] = useState("");
  const [checklistComplete, setChecklistComplete] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [website, setWebsite] = useState("");

  useEffect(() => {
    if (!hydrated || items.length === 0) return;
    setVehicle((prev) => (prev.name ? prev : initialVehicleFromCart(items)));
    setUsedBattery((prev) => (prev != null ? prev : initialUsedBatteryFromCart(items)));
  }, [hydrated, items]);

  const canSubmit =
    customer.name.trim().length > 0 &&
    phoneValid(customer.phone) &&
    isUsedBatterySelected(usedBattery) &&
    checklistComplete &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!canSubmit) {
      setSubmitError("이름, 연락처, 폐전지 반납 여부, 체크리스트를 확인해 주세요.");
      return;
    }
    const usedBatteryOption = usedBattery;
    setSubmitting(true);
    const now = new Date().toISOString();
    const confirmations = confirmationsFromChecklist();
    const staffSummary = buildStaffSummary({
      items,
      customerName: customer.name.trim(),
      customerPhone: customer.phone.trim(),
      vehicle,
      usedBatteryReturnOption: usedBatteryOption,
      fulfillment,
      memo: [memo, customer.orderMemo].filter(Boolean).join("\n"),
    });

    const request = {
      id: buildOrderRequestId(),
      items,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email.trim() || undefined,
        orderMemo: customer.orderMemo.trim() || undefined,
      },
      vehicle: Object.keys(vehicle).length ? vehicle : undefined,
      usedBatteryReturnOption: usedBatteryOption,
      fulfillment,
      memo: memo.trim() || undefined,
      confirmations,
      staffSummary,
      status: "prepared" as const,
      createdAt: now,
      updatedAt: now,
    };

    const apiPayload = {
      customerName: customer.name.trim(),
      customerPhone: customer.phone.trim(),
      customerEmail: customer.email.trim() || undefined,
      customerOrderMemo: customer.orderMemo.trim() || undefined,
      vehicle: Object.keys(vehicle).length ? vehicle : undefined,
      usedBatteryReturnOption: usedBatteryOption,
      fulfillment,
      items,
      memo: memo.trim() || undefined,
      confirmations,
      website,
    };

    try {
      const result = await submitOrderRequest(apiPayload);
      if (result.ok && result.request) {
        saveLastApiOrderRequest(result.request);
        saveLastOrderRequest(request);
        const sp = new URLSearchParams({
          requestNumber: result.request.requestNumber,
          id: result.request.id,
        });
        router.push(`${ORDER_REQUEST_COMPLETE_PAGE}?${sp.toString()}`);
        return;
      }
      setSubmitError(
        result.errors?.join(" ") ?? "접수에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } catch {
      setSubmitError("네트워크 오류로 접수하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <div
        className={`${bm.card} ${bm.cardPad} text-center`}
        role="status"
        aria-live="polite"
        data-checkout-state="loading"
      >
        <p className="text-sm font-bold text-slate-800">주문 정보를 불러오는 중입니다</p>
        <p className="mt-1 text-xs font-medium text-slate-500">잠시만 기다려 주세요.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className={`${bm.card} ${bm.cardPad} space-y-4 text-center`}
        data-checkout-state="empty"
      >
        <h2 className="text-base font-black text-slate-900">장바구니가 비어 있습니다</h2>
        <p className="text-sm font-medium text-slate-600">
          담은 배터리가 없습니다. 상품을 선택한 뒤 다시 주문해 주세요.
        </p>
        <p className="text-xs font-medium text-slate-500">
          차량명 또는 배터리 규격으로 먼저 검색해 주세요.
        </p>
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <Link href={HUB_SHOP} className={`${bm.btnNavy} w-full justify-center text-sm sm:w-auto`}>
            배터리 쇼핑 둘러보기
          </Link>
          <Link
            href={getSearchHref("")}
            className={`${bm.btnSecondary} w-full justify-center text-sm sm:w-auto`}
          >
            차량·규격 검색
          </Link>
        </div>
        <Link href={CART_PAGE} className="inline-block text-xs font-bold text-blue-700 hover:underline">
          장바구니로 이동
        </Link>
      </div>
    );
  }

  return (
    <form className="checkout-order space-y-5 pb-8" onSubmit={handleSubmit} data-page="checkout">
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h1 className="text-lg font-black text-slate-950">{CHECKOUT_PAGE_COPY.title}</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">{CHECKOUT_PAGE_COPY.description}</p>
      </section>

      <OrderRequestCartSummary items={items} />

      <BatteryAutoDiscountHint variant="checkout" />

      <OrderRequestCustomerFields
        values={customer}
        onChange={(p) => setCustomer((c) => ({ ...c, ...p }))}
      />

      <OrderRequestVehicleFields
        cartItems={items}
        values={vehicle}
        onChange={(p) => setVehicle((v) => ({ ...v, ...p }))}
        compact
      />

      <OrderRequestFulfillmentFields
        values={fulfillment}
        onChange={(p) => setFulfillment((f) => ({ ...f, ...p }))}
        compact
      />

      <OrderRequestUsedBatteryFields value={usedBattery} onChange={setUsedBattery} />

      <section className={`${bm.card} ${bm.cardPad} space-y-2`}>
        <h2 className="text-sm font-black text-slate-900">{CHECKOUT_PAGE_COPY.consultationTitle}</h2>
        <p className="text-xs font-medium text-slate-600">{CHECKOUT_PAGE_COPY.consultationBody}</p>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-2`}>
        <h2 className="text-sm font-black text-slate-900">요청사항 (선택)</h2>
        <textarea
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder={ORDER_REQUEST_MEMO_PLACEHOLDER}
        />
      </section>

      <CheckoutSafetyChecklist onAllRequiredCheckedChange={setChecklistComplete} />

      {submitError ? (
        <p className="text-xs font-bold text-red-600" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Link href={CART_PAGE} className={`${bm.btnTertiary} justify-center text-sm`}>
          {CHECKOUT_PAGE_COPY.backToCart}
        </Link>
        <button
          type="submit"
          disabled={!canSubmit}
          className={`${bm.btnNavy} flex-1 justify-center text-sm disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {submitting ? "접수 중…" : CHECKOUT_PAGE_COPY.submitLabel}
        </button>
      </div>
    </form>
  );
}
