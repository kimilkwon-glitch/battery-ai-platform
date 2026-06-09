"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { CheckoutDeliveryAddressSection } from "@/components/checkout/CheckoutDeliveryAddressSection";
import { CheckoutPriceSummaryPanel } from "@/components/checkout/CheckoutPriceSummaryPanel";
import { CheckoutProductSummary } from "@/components/checkout/CheckoutProductSummary";
import { CheckoutSafetyChecklist } from "@/components/checkout/CheckoutSafetyChecklist";
import { CheckoutSecurityNotice } from "@/components/checkout/CheckoutPaymentSection";
import { CheckoutStoreSection } from "@/components/checkout/CheckoutStoreSection";
import { CheckoutVehicleSection } from "@/components/checkout/CheckoutVehicleSection";
import { CheckoutVisitAddressSection } from "@/components/checkout/CheckoutVisitAddressSection";
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
import { CHECKOUT_PAGE_COPY } from "@/data/checkout-checklist";
import { saveCheckoutSession } from "@/lib/payment/checkout-session-storage";
import { isCommercePaymentLive } from "@/lib/payment/commerce-checkout-mode";
import { CHECKOUT_REVIEW_PAGE } from "@/lib/payment/payment-routes";
import { computeCheckoutTotal } from "@/lib/pricing/compute-checkout-total";
import { applyPricingToCartItem } from "@/lib/pricing/order-price";
import { CART_PAGE } from "@/lib/customer-center-routes";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { CUSTOMER_LOGIN_PAGE } from "@/lib/customer-auth-routes";
import { patchCustomerProfile } from "@/lib/auth/customer-auth-client";
import { memberPreferredStoreToUi } from "@/lib/auth/member-preferred-store";
import type { MemberPublic } from "@/lib/auth/member-types";
import { HUB_SEARCH } from "@/lib/customer-hub-routes";
import { getSearchHref } from "@/lib/battery-search";
import {
  initialUsedBatteryFromCart,
  isUsedBatterySelected,
  type UsedBatteryFormSelection,
} from "@/lib/order-request/order-request-form-helpers";
import { getCustomerProfile, type CustomerProfile } from "@/lib/customer-profile-storage";
import {
  checkoutContactFromFulfillment,
  checkoutContactValid,
  fulfillmentAddressValid,
} from "@/lib/checkout/checkout-address";
import type { OrderRequestFulfillment, OrderRequestVehicle } from "@/types/order-request";
import type { BatteryCartItem, FulfillmentMethod } from "@/types/cart";
import type { CheckoutSessionPayload } from "@/types/commerce-payment";
import { batteryDetailHref } from "@/lib/canonical-battery-code";
import { bm } from "@/lib/design-tokens";
import { formatPriceWon } from "@/lib/pricing/order-price";
import { CheckoutPromotionSection } from "@/components/checkout/CheckoutPromotionSection";
import type { AppliedPromotion } from "@/types/promotion";

function isCustomerProfile(source: MemberPublic | CustomerProfile): source is CustomerProfile {
  return "postalCode" in source || "address1" in source;
}

function checkoutProfileFields(source: MemberPublic | CustomerProfile) {
  if (!isCustomerProfile(source)) {
    return {
      name: source.name || "",
      phone: source.phone === "미입력" ? "" : source.phone || "",
      postalCode: source.zonecode,
      address1: source.address,
      address2: source.detailAddress,
      vehicleName: source.vehicleInfo?.name,
      vehicleYear: source.vehicleInfo?.year,
      vehicleFuel: source.vehicleInfo?.fuel,
      preferredStore: memberPreferredStoreToUi(source.preferredStore),
    };
  }
  return {
    name: source.name || "",
    phone: source.phone || "",
    postalCode: source.postalCode,
    address1: source.address1,
    address2: source.address2,
    vehicleName: source.vehicleName,
    vehicleYear: source.vehicleYear,
    vehicleFuel: source.vehicleFuel,
    preferredStore: source.preferredStore ?? "undecided",
  };
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

function resolveRequestMemo(fulfillment: OrderRequestFulfillment): string | undefined {
  if (fulfillment.method === "delivery") return fulfillment.deliveryMessage?.trim() || undefined;
  if (fulfillment.method === "visit_install") return fulfillment.visitMessage?.trim() || undefined;
  if (fulfillment.method === "store_install" || fulfillment.method === "store_pickup_self") {
    return fulfillment.storeMessage?.trim() || undefined;
  }
  return undefined;
}

export function CheckoutOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flow = resolveCheckoutFlowMode(searchParams);
  const isBuyNow = flow === "buy_now";
  const paymentLive = isCommercePaymentLive();
  const { items: cartItems, hydrated, updateItem } = useBatteryCart();
  const [buyNowItems, setBuyNowItems] = useState<BatteryCartItem[] | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<BatteryCartItem[]>([]);
  const { isLoggedIn, ready: customerAuthReady, userId, member } = useCustomerAuth();
  const checkoutReady = hydrated && customerAuthReady;

  useEffect(() => {
    if (!checkoutReady) return;
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
  }, [checkoutReady, isBuyNow, searchParams, cartItems]);

  const items = useMemo(() => {
    if (isBuyNow) return checkoutItems.length ? checkoutItems : buyNowItems ?? [];
    return checkoutItems.length ? checkoutItems : cartItems;
  }, [isBuyNow, buyNowItems, checkoutItems, cartItems]);

  const [customer, setCustomer] = useState<CustomerFormValues>({ name: "", phone: "" });
  const [vehicle, setVehicle] = useState<OrderRequestVehicle>({});
  const [usedBattery, setUsedBattery] = useState<UsedBatteryFormSelection>(null);
  const [fulfillment, setFulfillment] = useState<OrderRequestFulfillment>({
    method: "delivery",
    storeId: "undecided",
  });
  const [checklistComplete, setChecklistComplete] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedPromotions, setAppliedPromotions] = useState<AppliedPromotion[]>([]);
  const [promotionDiscountTotal, setPromotionDiscountTotal] = useState(0);
  const [promotionFinalTotal, setPromotionFinalTotal] = useState<number | null>(null);
  const [eligibleAutomaticTitles, setEligibleAutomaticTitles] = useState<string[]>([]);

  const usedBatteryFromCart = useMemo(() => initialUsedBatteryFromCart(items), [items]);
  const optionsComplete = useMemo(
    () =>
      items.length > 0 &&
      usedBatteryFromCart != null &&
      items.every((i) => i.fulfillment.method !== "undecided"),
    [items, usedBatteryFromCart],
  );

  useEffect(() => {
    if (!hydrated || items.length === 0) return;
    setVehicle((prev) => (prev.name ? prev : initialVehicleFromCart(items)));
    setUsedBattery((prev) => (prev != null ? prev : usedBatteryFromCart));
    setFulfillment((prev) =>
      prev.method !== "undecided" && prev.method !== "delivery"
        ? prev
        : initialFulfillmentFromCart(items),
    );
  }, [hydrated, items, usedBatteryFromCart]);

  const applyMemberFieldsToCheckout = useCallback(
    (source: MemberPublic | CustomerProfile | null) => {
      if (!source) return;
      const {
        name,
        phone,
        postalCode,
        address1,
        address2,
        vehicleName,
        vehicleYear,
        vehicleFuel,
        preferredStore,
      } = checkoutProfileFields(source);

      setCustomer({ name, phone });
      if (postalCode || address1) {
        setFulfillment((f) => ({
          ...f,
          recipientName: name,
          recipientPhone: phone,
          postalCode,
          address1,
          address2,
          region: [postalCode, address1].filter(Boolean).join(" ").trim() || f.region,
        }));
      }
      if (vehicleName) {
        setVehicle((v) =>
          v.name
            ? v
            : {
                name: vehicleName,
                year: vehicleYear,
                fuelType: vehicleFuel,
              },
        );
      }
      if (preferredStore && preferredStore !== "undecided") {
        setFulfillment((f) =>
          f.storeId === "undecided" ? { ...f, storeId: preferredStore } : f,
        );
      }
    },
    [],
  );

  useEffect(() => {
    if (!checkoutReady || !isLoggedIn || profileLoaded) return;
    const source = member ?? getCustomerProfile();
    applyMemberFieldsToCheckout(source);
    setProfileLoaded(true);
  }, [checkoutReady, isLoggedIn, profileLoaded, member, applyMemberFieldsToCheckout]);

  const applyMemberProfileToShipping = useCallback(() => {
    const source = member ?? getCustomerProfile();
    applyMemberFieldsToCheckout(source);
  }, [member, applyMemberFieldsToCheckout]);

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
    if (
      patch.method === "store_install" ||
      patch.method === "store_pickup_self"
    ) {
      setCustomer((c) => ({
        name: c.name || next.recipientName || fulfillment.recipientName || "",
        phone: c.phone || next.recipientPhone || fulfillment.recipientPhone || "",
      }));
    }
    if (next.method !== "undecided") {
      applyFulfillmentToItems(next);
    }
  };

  const totals = computeCheckoutTotal(items, fulfillment.method, usedBattery ?? undefined);
  const displayTotal = promotionFinalTotal ?? totals.finalAmount;

  const canConfirm =
    optionsComplete &&
    checkoutContactValid(fulfillment, customer) &&
    isUsedBatterySelected(usedBattery) &&
    fulfillment.method !== "undecided" &&
    fulfillmentAddressValid(fulfillment) &&
    checklistComplete;

  const handleGoToReview = () => {
    setValidationError(null);
    if (!canConfirm) {
      setValidationError(
        optionsComplete
          ? "이름, 연락처, 주소·지점, 확인 항목을 점검해 주세요."
          : "이전 단계에서 수령 방식과 폐배터리 반납을 선택한 뒤 다시 진행해 주세요.",
      );
      return;
    }

    if (saveAddressToProfile && fulfillment.postalCode?.trim() && fulfillment.address1?.trim()) {
      void patchCustomerProfile({
        zonecode: fulfillment.postalCode.trim(),
        address: fulfillment.address1.trim(),
        detailAddress: fulfillment.address2?.trim() || undefined,
      });
    }

    if (
      totals.finalAmount != null &&
      paymentLive &&
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.info("[checkout] clientFinalAmount", totals.finalAmount);
    }

    const contact = checkoutContactFromFulfillment(fulfillment, customer);

    const session: CheckoutSessionPayload = {
      version: 1,
      flow: isBuyNow ? "buy_now" : "cart",
      items,
      customer: {
        name: contact.name,
        phone: contact.phone,
        customerType: isLoggedIn ? "member" : "guest",
        userId: isLoggedIn ? (userId ?? undefined) : undefined,
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
        recipientName: fulfillment.recipientName,
        recipientPhone: fulfillment.recipientPhone,
        postalCode: fulfillment.postalCode,
        address1: fulfillment.address1,
        address2: fulfillment.address2,
        deliveryMessage: fulfillment.deliveryMessage,
        visitMessage: fulfillment.visitMessage,
        storeMessage: fulfillment.storeMessage,
      },
      usedBatteryReturn: usedBattery ?? "unknown",
      memo: resolveRequestMemo(fulfillment),
      priceLines: totals.priceLines,
      batteryReturnFee: totals.batteryReturnFee,
      estimatedTotal: displayTotal,
      promotionDiscountTotal,
      appliedPromotions,
      couponCode: couponCode.trim() || null,
      eligibleAutomaticTitles,
      savedAt: new Date().toISOString(),
    };

    saveCheckoutSession(session);
    setNavigating(true);
    router.push(CHECKOUT_REVIEW_PAGE);
  };

  if (!checkoutReady) {
    return (
      <div className={`${bm.card} ${bm.cardPad} text-center`} role="status" aria-live="polite">
        <p className="text-sm font-bold text-slate-800">주문 정보를 불러오는 중입니다</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${bm.card} ${bm.cardPad} space-y-4 text-center`} data-page="checkout">
        <h2 className="text-base font-black text-slate-900">
          {isBuyNow ? "주문 상품 정보가 없습니다" : "장바구니가 비어 있습니다"}
        </h2>
        <Link href={HUB_SEARCH} className={`${bm.btnNavy} inline-flex justify-center text-sm`}>
          차량·배터리 검색하기
        </Link>
      </div>
    );
  }

  const pricePanelAside = (
    <CheckoutPriceSummaryPanel
      items={items}
      fulfillment={fulfillment}
      usedBattery={usedBattery}
      sticky
      panelPlacement="aside"
    />
  );
  const pricePanelInline = (
    <CheckoutPriceSummaryPanel
      items={items}
      fulfillment={fulfillment}
      usedBattery={usedBattery}
      panelPlacement="inline"
    />
  );

  return (
    <div className="checkout-order pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-10" data-page="checkout">
      <div className="checkout-order__grid grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,400px)] lg:items-start">
        <form className="checkout-order__main space-y-4 lg:space-y-5" onSubmit={(e) => e.preventDefault()}>
          <section className="checkout-card checkout-card--intro" data-checkout-section="intro">
            <h1 className="text-lg font-black text-[#0F172A] lg:text-2xl">{CHECKOUT_PAGE_COPY.title}</h1>
            <p className="mt-1 hidden text-sm font-semibold text-[#475569] sm:block">
              {CHECKOUT_PAGE_COPY.description}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-lg bg-[#0F1B33] px-2.5 py-1 text-[11px] font-bold text-white">
                {isLoggedIn ? "회원 주문" : "비회원 주문"}
              </span>
              {!isLoggedIn ? (
                <Link
                  href={`${CUSTOMER_LOGIN_PAGE}?redirect=${encodeURIComponent(
                    searchParams.toString() ? `/checkout?${searchParams.toString()}` : "/checkout",
                  )}`}
                  className="text-[11px] font-bold text-blue-700 hover:underline"
                >
                  로그인 후 정보 불러오기
                </Link>
              ) : null}
            </div>
          </section>

          <PaymentPreparingNotice />

          <CheckoutOrderSummary
            items={items}
            fulfillment={fulfillment}
            usedBattery={usedBattery}
            totalAmount={displayTotal}
            optionsComplete={optionsComplete}
            isBuyNow={isBuyNow}
          />

          {fulfillment.method === "delivery" ? (
            <CheckoutDeliveryAddressSection
              values={fulfillment}
              onChange={onFulfillmentChange}
              showMemberApply={isLoggedIn}
              onApplyMemberProfile={applyMemberProfileToShipping}
              showDefaultShipping={isLoggedIn}
              onApplyDefaultShipping={applyMemberProfileToShipping}
              showSaveAsDefault={isLoggedIn}
              saveAsDefaultAddress={saveAddressToProfile}
              onSaveAsDefaultAddressChange={setSaveAddressToProfile}
            />
          ) : null}

          {fulfillment.method === "visit_install" ? (
            <CheckoutVisitAddressSection
              values={fulfillment}
              onChange={onFulfillmentChange}
              showMemberApply={isLoggedIn}
              onApplyMemberProfile={applyMemberProfileToShipping}
            />
          ) : null}

          {fulfillment.method === "store_pickup_self" ? (
            <div className="space-y-5" data-checkout-info-panel="store_pickup_self">
              <CheckoutStoreSection values={fulfillment} onChange={onFulfillmentChange} />
              <OrderRequestCustomerFields
                values={customer}
                onChange={(p) => setCustomer((c) => ({ ...c, ...p }))}
                variant="orderer"
              />
            </div>
          ) : null}

          {fulfillment.method === "store_install" ? (
            <div className="space-y-5" data-checkout-info-panel="store_install">
              <CheckoutStoreSection values={fulfillment} onChange={onFulfillmentChange} />
              <OrderRequestCustomerFields
                values={customer}
                onChange={(p) => setCustomer((c) => ({ ...c, ...p }))}
                variant="visitor"
              />
            </div>
          ) : null}

          <CheckoutProductSummary items={items} fulfillmentMethod={fulfillment.method} />

          <CheckoutVehicleSection values={vehicle} onChange={(p) => setVehicle((v) => ({ ...v, ...p }))} />

          <div className="lg:hidden">{pricePanelInline}</div>

          <CheckoutPromotionSection
            items={items}
            fulfillmentType={fulfillment.method}
            returnBatteryOption={usedBattery ?? "unknown"}
            baseTotal={totals.finalAmount}
            couponCode={couponCode}
            onCouponCodeChange={setCouponCode}
            appliedPromotions={appliedPromotions}
            promotionDiscountTotal={promotionDiscountTotal}
            finalTotal={displayTotal}
            eligibleAutomaticTitles={eligibleAutomaticTitles}
            onPromotionUpdate={(data) => {
              setAppliedPromotions(data.appliedPromotions);
              setPromotionDiscountTotal(data.promotionDiscountTotal);
              setPromotionFinalTotal(data.finalTotal);
              setEligibleAutomaticTitles(data.eligibleAutomaticTitles);
            }}
          />

          <CheckoutSafetyChecklist onAllRequiredCheckedChange={setChecklistComplete} />

          {validationError ? (
            <p className="text-xs font-bold text-red-600" role="alert">
              {validationError}
            </p>
          ) : null}

          <div className="hidden flex-col gap-2 lg:flex sm:flex-row sm:items-center">
            <Link href={CART_PAGE} className={`${bm.btnTertiary} justify-center text-sm`}>
              {CHECKOUT_PAGE_COPY.backToCart}
            </Link>
            <PaymentPreparingButton
              disabled={!canConfirm}
              loading={navigating}
              label={paymentLive ? CHECKOUT_PAGE_COPY.submitLabel : "결제금액 확인"}
              onClick={handleGoToReview}
            />
          </div>
        </form>

        <aside className="checkout-order__aside hidden space-y-4 lg:block">
          {pricePanelAside}
          {paymentLive ? <CheckoutSecurityNotice /> : null}
        </aside>
      </div>

      <div className="checkout-order__mobile-total fixed inset-x-0 bottom-0 z-40 border-t p-3 backdrop-blur lg:hidden">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[#64748B]">총 결제금액</span>
          <span className="checkout-order__mobile-total-amount tabular-nums">
            {displayTotal != null ? formatPriceWon(displayTotal) : "—"}
          </span>
        </div>
        <div className="flex gap-2">
          <Link href={CART_PAGE} className={`${bm.btnTertiary} flex-1 justify-center text-xs`}>
            장바구니
          </Link>
          <PaymentPreparingButton
            disabled={!canConfirm}
            loading={navigating}
            label={paymentLive ? "주문 확인 및 결제" : "금액 확인"}
            onClick={handleGoToReview}
            className="flex-[2]"
          />
        </div>
      </div>
    </div>
  );
}
