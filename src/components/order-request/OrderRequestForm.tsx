"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useBatteryCart } from "@/components/cart/BatteryCartProvider";
import {
  OrderRequestCustomerFields,
  type CustomerFormValues,
} from "@/components/order-request/OrderRequestCustomerFields";
import { OrderRequestCartSummary } from "@/components/order-request/OrderRequestCartSummary";
import {
  OrderRequestFulfillmentFields,
  OrderRequestUsedBatteryFields,
} from "@/components/order-request/OrderRequestFulfillmentFields";
import { OrderRequestVehicleFields } from "@/components/order-request/OrderRequestVehicleFields";
import { OrderRequestVehicleGuidance } from "@/components/order-request/OrderRequestVehicleGuidance";
import {
  ORDER_REQUEST_CONFIRMATION_ITEMS,
  ORDER_REQUEST_EMPTY_COPY,
  ORDER_REQUEST_MEMO_PLACEHOLDER,
  ORDER_REQUEST_PAGE_COPY,
} from "@/data/order-request-copy";
import {
  buildOrderRequestId,
  buildStaffSummary,
} from "@/lib/order-request/order-request-summary";
import { submitOrderRequest } from "@/lib/order-request/order-request-client-api";
import { saveLastApiOrderRequest } from "@/lib/order-request/order-request-last-api";
import { saveLastOrderRequest } from "@/lib/order-request/order-request-storage";
import {
  CART_PAGE,
  CHECKOUT_PAGE,
  ORDER_REQUEST_COMPLETE_PAGE,
} from "@/lib/customer-center-routes";
import {
  initialUsedBatteryFromCart,
  isUsedBatterySelected,
  type UsedBatteryFormSelection,
} from "@/lib/order-request/order-request-form-helpers";
import type { OrderRequestConfirmations } from "@/types/order-request";
import type { OrderRequestFulfillment, OrderRequestVehicle } from "@/types/order-request";
import { bm } from "@/lib/design-tokens";

function phoneValid(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9;
}

function initialVehicleFromCart(
  items: ReturnType<typeof useBatteryCart>["items"],
): OrderRequestVehicle {
  const line = items.find((i) => i.vehicle?.displayName || i.customerMemo?.trim());
  if (!line) return {};
  const v = line.vehicle;
  const name = v?.displayName?.trim() || line.customerMemo?.trim();
  if (!name) return {};
  return {
    name,
    year: v?.year,
    fuelType: v?.fuelType,
    currentBatterySpec: line.batterySpec ?? items[0]?.batterySpec,
    photoCheckNeeded: items.some((i) => i.fitmentStatus === "needs_photo_check"),
  };
}

export function OrderRequestForm() {
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
  const [confirmations, setConfirmations] = useState<OrderRequestConfirmations>({
    fitmentNeedsFinalCheck: false,
    usedBatteryPriceMayDiffer: false,
    bankTransferDeadlineAware: false,
    orderWillBeGuidedSeparately: false,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [website, setWebsite] = useState("");

  useEffect(() => {
    if (!hydrated || items.length === 0) return;
    setVehicle((prev) => (prev.name ? prev : initialVehicleFromCart(items)));
    setUsedBattery((prev) => (prev != null ? prev : initialUsedBatteryFromCart(items)));
  }, [hydrated, items]);

  const allConfirmationsChecked = useMemo(
    () => Object.values(confirmations).every(Boolean),
    [confirmations],
  );

  const canSubmit =
    customer.name.trim().length > 0 &&
    phoneValid(customer.phone) &&
    isUsedBatterySelected(usedBattery) &&
    allConfirmationsChecked &&
    !submitting;

  const toggleConfirmation = (key: keyof OrderRequestConfirmations) => {
    setConfirmations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!canSubmit) {
      setSubmitError("이름, 연락처, 폐전지 반납 여부, 필수 확인 항목을 확인해 주세요.");
      return;
    }
    const usedBatteryOption = usedBattery;
    setSubmitting(true);
    const now = new Date().toISOString();
    const staffSummary = buildStaffSummary({
      items,
      customerName: customer.name.trim(),
      customerPhone: customer.phone.trim(),
      vehicle,
      usedBatteryReturnOption: usedBatteryOption,
      fulfillment,
      memo: [memo, customer.orderMemo ?? ""].filter(Boolean).join("\n"),
    });

    const request = {
      id: buildOrderRequestId(),
      items,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim() || undefined,
        orderMemo: customer.orderMemo?.trim() || undefined,
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
      customerEmail: customer.email?.trim() || undefined,
      customerOrderMemo: customer.orderMemo?.trim() || undefined,
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
      setSubmitError("네트워크 오류로 접수하지 못했습니다. 연결을 확인해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <div className={`${bm.card} ${bm.cardPad} text-center text-sm text-slate-500`}>
        불러오는 중…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${bm.card} ${bm.cardPad} space-y-4 text-center`} data-order-request-empty>
        <h2 className="text-lg font-black text-slate-950">{ORDER_REQUEST_EMPTY_COPY.title}</h2>
        <p className="text-sm font-medium text-slate-600">{ORDER_REQUEST_EMPTY_COPY.body}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/" className={`${bm.btnNavy} text-sm`}>
            차량 배터리 검색하기
          </Link>
          <Link href={CART_PAGE} className={`${bm.btnSecondary} text-sm`}>
            장바구니 보기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="order-request-form space-y-5 pb-8" onSubmit={handleSubmit} data-page="order-request">
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
      <section className={`${bm.card} ${bm.cardPad} border-blue-100/80`}>
        <p className="text-[10px] font-black uppercase tracking-wide text-blue-700">상담 접수</p>
        <h1 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">
          {ORDER_REQUEST_PAGE_COPY.title}
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-600">
          {ORDER_REQUEST_PAGE_COPY.description}
        </p>
        <p className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-600">
          {ORDER_REQUEST_PAGE_COPY.integrationNotice}
        </p>
      </section>

      <OrderRequestCartSummary items={items} />

      <OrderRequestCustomerFields values={customer} onChange={(p) => setCustomer((c) => ({ ...c, ...p }))} />

      <OrderRequestVehicleGuidance />

      <OrderRequestVehicleFields
        cartItems={items}
        values={vehicle}
        onChange={(p) => setVehicle((v) => ({ ...v, ...p }))}
      />

      <OrderRequestUsedBatteryFields value={usedBattery} onChange={setUsedBattery} />

      <OrderRequestFulfillmentFields
        values={fulfillment}
        onChange={(p) => setFulfillment((f) => ({ ...f, ...p }))}
      />

      <section className={`${bm.card} ${bm.cardPad} space-y-3`} id="order-request-memo">
        <h2 className="text-sm font-black text-slate-900">요청사항</h2>
        <textarea
          rows={5}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium leading-relaxed"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder={ORDER_REQUEST_MEMO_PLACEHOLDER}
        />
        <p className="text-[10px] font-medium text-slate-500">
          차량 증상, 방전 여부, 기존 배터리 사진 여부, 희망 시간 등을 적어 주세요.
        </p>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-3`} id="order-request-confirmations">
        <h2 className="text-sm font-black text-slate-900">개인정보·상담 안내 확인</h2>
        <ul className="space-y-2">
          {ORDER_REQUEST_CONFIRMATION_ITEMS.map((item) => {
            const key = item.id;
            const checked = confirmations[key];
            return (
              <li key={key}>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-3 py-3 hover:bg-slate-50/80 has-[:checked]:border-blue-200 has-[:checked]:bg-blue-50/30">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 size-5 shrink-0 accent-blue-600"
                    checked={checked}
                    onChange={() => toggleConfirmation(key)}
                  />
                  <span className="text-xs font-bold leading-relaxed text-slate-800">{item.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
        <div className="flex flex-wrap gap-2">
          <Link href={CHECKOUT_PAGE} className={`${bm.btnTertiary} text-xs`}>
            ← 주문 전 확인
          </Link>
          <Link href={CART_PAGE} className={`${bm.btnTertiary} text-xs`}>
            장바구니
          </Link>
        </div>
        {submitError ? (
          <p className="text-xs font-bold text-red-600" role="alert">
            {submitError}
          </p>
        ) : null}
        {!allConfirmationsChecked ? (
          <p className="text-[11px] font-bold text-amber-800">
            필수 확인 항목을 모두 체크해 주세요.
          </p>
        ) : null}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`${bm.btnNavy} w-full justify-center text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto`}
        >
          {submitting ? "접수 중…" : ORDER_REQUEST_PAGE_COPY.submitLabel}
        </button>
      </section>
    </form>
  );
}
