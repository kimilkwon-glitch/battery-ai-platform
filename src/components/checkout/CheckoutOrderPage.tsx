"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BatteryAutoDiscountHint } from "@/components/benefits/BatteryAutoDiscountHint";
import { CheckoutPriceSummaryPanel } from "@/components/checkout/CheckoutPriceSummaryPanel";
import { CheckoutSafetyChecklist } from "@/components/checkout/CheckoutSafetyChecklist";
import {
  PaymentPreparingButton,
  PaymentPreparingNotice,
} from "@/components/checkout/PaymentPreparingNotice";
import { useBatteryCart } from "@/components/cart/BatteryCartProvider";
import {
  clearBuyNowCheckoutItems,
  getBuyNowCheckoutItems,
  resolveCheckoutFlowMode,
  setBuyNowCheckoutItems,
} from "@/lib/cart/checkout-flow";
import {
  createCartItemFromBattery,
  createCartItemFromVehicleBattery,
} from "@/lib/cart/cart-item-factory";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
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
import { OrderRequestVehicleGuidance } from "@/components/order-request/OrderRequestVehicleGuidance";
import { CHECKOUT_PAGE_COPY } from "@/data/checkout-checklist";
import { ORDER_REQUEST_MEMO_PLACEHOLDER } from "@/data/order-request-copy";
import { saveCheckoutSession } from "@/lib/payment/checkout-session-storage";
import { CHECKOUT_REVIEW_PAGE } from "@/lib/payment/payment-routes";
import { buildPriceSnapshots, sumPriceSnapshots } from "@/lib/pricing/commerce-order-snapshot";
import { applyPricingToCartItem } from "@/lib/pricing/order-price";
import {
  CART_PAGE,
} from "@/lib/customer-center-routes";
import { GUEST_ORDER_PAGE } from "@/lib/guest-order/guest-order-routes";
import { HUB_SHOP } from "@/lib/customer-hub-routes";
import { getSearchHref } from "@/lib/battery-search";
import {
  initialUsedBatteryFromCart,
  isUsedBatterySelected,
  type UsedBatteryFormSelection,
} from "@/lib/order-request/order-request-form-helpers";
import type { OrderRequestFulfillment, OrderRequestVehicle } from "@/types/order-request";
import type { BatteryCartItem, FulfillmentMethod } from "@/types/cart";
import type { CheckoutSessionPayload } from "@/types/commerce-payment";
import { batteryDetailHref } from "@/lib/canonical-battery-code";
import { bm } from "@/lib/design-tokens";

function phoneValid(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9;
}

function initialVehicleFromCart(items: BatteryCartItem[]): OrderRequestVehicle {
  const line = items.find((i) => i.vehicle?.displayName || i.customerMemo?.trim());
  if (!line) return {};
  const v = line.vehicle;
  const name = v?.displayName?.trim() || line.customerMemo?.trim();
  if (!name) return {};
  return {
    name,
    year: v?.year,
    fuelType: v?.fuelType ?? v?.generationName,
    currentBatterySpec: line.batterySpec ?? items[0]?.batterySpec,
  };
}

function initialFulfillmentFromCart(items: BatteryCartItem[]): OrderRequestFulfillment {
  const first = items.find((i) => i.fulfillment.method !== "undecided");
  if (first?.fulfillment.method && first.fulfillment.method !== "undecided") {
    return {
      method: first.fulfillment.method,
      storeId: first.fulfillment.storeId ?? "undecided",
      region: first.fulfillment.requestedRegion,
    };
  }
  return { method: "delivery", storeId: "undecided" };
}

function fulfillmentAddressValid(fulfillment: OrderRequestFulfillment): boolean {
  if (fulfillment.method === "undecided") return false;
  if (fulfillment.method === "delivery" || fulfillment.method === "visit_install") {
    return Boolean(fulfillment.region?.trim());
  }
  if (fulfillment.method === "store_install" || fulfillment.method === "store_pickup_self") {
    return fulfillment.storeId === "deokcheon" || fulfillment.storeId === "hakjang";
  }
  return true;
}

function syncItemsWithFulfillment(
  items: BatteryCartItem[],
  fulfillment: OrderRequestFulfillment,
): BatteryCartItem[] {
  if (fulfillment.method === "undecided") return items;
  const method = fulfillment.method as FulfillmentMethod;
  return items.map((item) => {
    const priced = applyPricingToCartItem(item, method);
    return {
      ...priced,
      fulfillment: {
        method,
        storeId:
          fulfillment.storeId && fulfillment.storeId !== "undecided"
            ? fulfillment.storeId
            : item.fulfillment.storeId,
        requestedRegion: fulfillment.region ?? item.fulfillment.requestedRegion,
      },
    };
  });
}

export function CheckoutOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flow = resolveCheckoutFlowMode(searchParams);
  const isBuyNow = flow === "buy_now";
  const { items: cartItems, hydrated, updateItem } = useBatteryCart();
  const [buyNowItems, setBuyNowItems] = useState<BatteryCartItem[] | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<BatteryCartItem[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    if (isBuyNow) {
      const fromSession = getBuyNowCheckoutItems();
      if (fromSession?.length) {
        setBuyNowItems(fromSession);
        setCheckoutItems(fromSession);
        return;
      }
      const batteryRaw = searchParams.get("battery")?.trim();
      const batteryCode = batteryRaw ? canonicalBatteryCode(batteryRaw) || batteryRaw : "";
      if (batteryCode) {
        const vehicleSlug = searchParams.get("vehicle")?.trim() || "";
        const brand = searchParams.get("brand")?.trim();
        const brandName =
          brand === "rocket" ? "로케트" : brand === "solite" ? "쏠라이트" : undefined;
        const seeded =
          vehicleSlug.length > 0
            ? createCartItemFromVehicleBattery({
                batteryCode,
                vehicleSlug,
                vehicleTitle: searchParams.get("vehicleTitle")?.trim() || vehicleSlug,
                fuelLabel: searchParams.get("fuel")?.trim() || undefined,
              })
            : createCartItemFromBattery({
                batteryCode,
                brandName,
                fulfillmentMethod: "delivery",
                source: "vehicle_detail",
              });
        setBuyNowCheckoutItems([seeded]);
        setBuyNowItems([seeded]);
        setCheckoutItems([seeded]);
        return;
      }
      setBuyNowItems(null);
      setCheckoutItems([]);
    } else {
      clearBuyNowCheckoutItems();
      setBuyNowItems(null);
      setCheckoutItems(cartItems);
    }
  }, [hydrated, isBuyNow, searchParams, cartItems]);

  const items = useMemo(() => {
    if (isBuyNow) return checkoutItems.length ? checkoutItems : buyNowItems ?? [];
    return checkoutItems.length ? checkoutItems : cartItems;
  }, [isBuyNow, buyNowItems, checkoutItems, cartItems]);

  const [customer, setCustomer] = useState<CustomerFormValues>({
    name: "",
    phone: "",
    email: "",
    orderMemo: "",
  });
  const [vehicle, setVehicle] = useState<OrderRequestVehicle>({});
  const [usedBattery, setUsedBattery] = useState<UsedBatteryFormSelection>(null);
  const [fulfillment, setFulfillment] = useState<OrderRequestFulfillment>({
    method: "delivery",
    storeId: "undecided",
  });
  const [memo, setMemo] = useState("");
  const [checklistComplete, setChecklistComplete] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    if (!hydrated || items.length === 0) return;
    setVehicle((prev) => (prev.name ? prev : initialVehicleFromCart(items)));
    setUsedBattery((prev) => (prev != null ? prev : initialUsedBatteryFromCart(items)));
    setFulfillment((prev) =>
      prev.method !== "undecided" && prev.method !== "delivery"
        ? prev
        : initialFulfillmentFromCart(items),
    );
  }, [hydrated, items]);

  const applyFulfillmentToItems = useCallback(
    (next: OrderRequestFulfillment) => {
      const synced = syncItemsWithFulfillment(items, next);
      setCheckoutItems(synced);
      if (!isBuyNow) {
        synced.forEach((item) => {
          updateItem(item.id, {
            fulfillment: item.fulfillment,
            finalPrice: item.finalPrice,
          });
        });
      }
    },
    [items, isBuyNow, updateItem],
  );

  const onFulfillmentChange = (patch: Partial<OrderRequestFulfillment>) => {
    const next = { ...fulfillment, ...patch };
    setFulfillment(next);
    if (next.method !== "undecided") {
      applyFulfillmentToItems(next);
    }
  };

  const canConfirm =
    customer.name.trim().length > 0 &&
    phoneValid(customer.phone) &&
    isUsedBatterySelected(usedBattery) &&
    fulfillment.method !== "undecided" &&
    fulfillmentAddressValid(fulfillment) &&
    checklistComplete;

  const handleGoToReview = () => {
    setValidationError(null);
    if (!canConfirm) {
      setValidationError(
        "이름, 연락처, 폐전지 반납, 수령/장착 방식, 주소·지점, 체크리스트를 확인해 주세요.",
      );
      return;
    }

    const priceLines = buildPriceSnapshots(items, fulfillment.method);
    const estimatedTotal = sumPriceSnapshots(priceLines);

    const session: CheckoutSessionPayload = {
      version: 1,
      flow: isBuyNow ? "buy_now" : "cart",
      items,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email.trim() || undefined,
        customerType: "member",
        orderMemo: customer.orderMemo.trim() || undefined,
      },
      vehicle,
      fulfillment: {
        method: fulfillment.method,
        storeId:
          fulfillment.storeId === "deokcheon" || fulfillment.storeId === "hakjang"
            ? fulfillment.storeId
            : undefined,
        region: fulfillment.region,
        preferredTime: fulfillment.preferredTime,
      },
      usedBatteryReturn: usedBattery ?? "unknown",
      memo: [memo, customer.orderMemo].filter(Boolean).join("\n") || undefined,
      priceLines,
      estimatedTotal,
      savedAt: new Date().toISOString(),
    };

    saveCheckoutSession(session);
    setNavigating(true);
    router.push(CHECKOUT_REVIEW_PAGE);
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
        <h2 className="text-base font-black text-slate-900">
          {isBuyNow ? "주문 상품 정보가 없습니다" : "장바구니가 비어 있습니다"}
        </h2>
        <p className="text-sm font-medium text-slate-600">
          {isBuyNow
            ? "상품 상세에서 바로 주문하기를 다시 눌러 주세요."
            : "담은 배터리가 없습니다. 상품을 선택한 뒤 다시 주문해 주세요."}
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
    <div className="checkout-order pb-28 lg:pb-8" data-page="checkout">
      <div className="checkout-order__grid grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
        <form className="checkout-order__main space-y-5" onSubmit={(e) => e.preventDefault()}>
          <section className={`${bm.card} ${bm.cardPad}`}>
            <h1 className="text-lg font-black text-slate-950">{CHECKOUT_PAGE_COPY.title}</h1>
            <p className="mt-2 text-sm font-medium text-slate-600">{CHECKOUT_PAGE_COPY.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">
                회원 주문
              </span>
              <Link
                href={GUEST_ORDER_PAGE}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                비회원 주문으로 전환
              </Link>
            </div>
            {isBuyNow ? (
              <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-900 ring-1 ring-blue-100">
                바로 주문 — 선택하신 상품으로 주문서를 작성합니다.
              </p>
            ) : (
              <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-100">
                장바구니 주문 — 담긴 상품 기준으로 주문합니다.
              </p>
            )}
          </section>

          <PaymentPreparingNotice />

          <OrderRequestCartSummary items={items} fulfillmentMethod={fulfillment.method} />

          <BatteryAutoDiscountHint variant="checkout" />

          <OrderRequestCustomerFields
            values={customer}
            onChange={(p) => setCustomer((c) => ({ ...c, ...p }))}
          />

          <OrderRequestVehicleGuidance />

          <OrderRequestVehicleFields
            cartItems={items}
            values={vehicle}
            onChange={(p) => setVehicle((v) => ({ ...v, ...p }))}
            compact
          />

          <OrderRequestFulfillmentFields values={fulfillment} onChange={onFulfillmentChange} />

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

          {validationError ? (
            <p className="text-xs font-bold text-red-600" role="alert">
              {validationError}
            </p>
          ) : null}

          <div className="hidden flex-col gap-2 lg:flex sm:flex-row sm:items-center">
            {isBuyNow && items[0]?.batterySpec ? (
              <Link
                href={batteryDetailHref(items[0].batterySpec)}
                className={`${bm.btnTertiary} justify-center text-sm`}
              >
                ← 상품 상세
              </Link>
            ) : (
              <Link href={CART_PAGE} className={`${bm.btnTertiary} justify-center text-sm`}>
                {CHECKOUT_PAGE_COPY.backToCart}
              </Link>
            )}
            <PaymentPreparingButton
              disabled={!canConfirm}
              loading={navigating}
              label="주문 정보 확인하기"
              onClick={handleGoToReview}
            />
          </div>
        </form>

        <div className="checkout-order__aside hidden lg:block">
          <CheckoutPriceSummaryPanel items={items} fulfillment={fulfillment} sticky />
        </div>
      </div>

      <div className="checkout-order__mobile-total fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <CheckoutPriceSummaryPanel items={items} fulfillment={fulfillment} />
        <div className="mt-2 flex gap-2">
          <Link href={CART_PAGE} className={`${bm.btnTertiary} flex-1 justify-center text-xs`}>
            장바구니
          </Link>
          <PaymentPreparingButton
            disabled={!canConfirm}
            loading={navigating}
            label="주문 정보 확인하기"
            onClick={handleGoToReview}
            className="flex-[2]"
          />
        </div>
      </div>
    </div>
  );
}
