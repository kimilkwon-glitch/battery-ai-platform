"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckoutDeliveryAddressSection } from "@/components/checkout/CheckoutDeliveryAddressSection";
import { CheckoutPriceSummaryPanel } from "@/components/checkout/CheckoutPriceSummaryPanel";
import { CheckoutProductSummary } from "@/components/checkout/CheckoutProductSummary";
import { CheckoutSafetyChecklist } from "@/components/checkout/CheckoutSafetyChecklist";
import { CheckoutSecurityNotice } from "@/components/checkout/CheckoutPaymentSection";
import { CheckoutStoreSection } from "@/components/checkout/CheckoutStoreSection";
import { CheckoutVehicleSection, checkoutVehicleInfoValid } from "@/components/checkout/CheckoutVehicleSection";
import { CheckoutVisitAddressSection } from "@/components/checkout/CheckoutVisitAddressSection";
import { CommercePrePaymentNotice } from "@/components/commerce/CommercePrePaymentNotice";
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
import { createCartItemFromBattery } from "@/lib/cart/cart-item-factory";
import {
  createCartItemWithVehicleContext,
  enrichCartItemWithVehicleContext,
  formatCheckoutVehicleDisplay,
  orderVehicleFromCartItem,
  parseVehicleCheckoutContext,
} from "@/lib/checkout/vehicle-checkout-context";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import {
  OrderRequestCustomerFields,
  type CustomerFormValues,
} from "@/components/order-request/OrderRequestCustomerFields";
import { checkoutSubmitLabel } from "@/data/checkout-address-copy";
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
  resolveCheckoutUsedBatteryReturn,
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
  return orderVehicleFromCartItem(line);
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
      const vehicleCtx = parseVehicleCheckoutContext(searchParams);
      const fromSession = getBuyNowCheckoutItems();
      if (fromSession?.length) {
        const enriched = fromSession.map((item) =>
          enrichCartItemWithVehicleContext(item, vehicleCtx),
        );
        setBuyNowCheckoutItems(enriched);
        setBuyNowItems(enriched);
        setCheckoutItems(enriched);
        return;
      }
      const batteryRaw = searchParams.get("battery")?.trim();
      const batteryCode = batteryRaw ? canonicalBatteryCode(batteryRaw) || batteryRaw : "";
      if (batteryCode) {
        const brand = searchParams.get("brand")?.trim();
        const brandName =
          brand === "rocket" ? "로케트" : brand === "solite" ? "쏠라이트" : undefined;
        const seeded = createCartItemWithVehicleContext(
          {
            batteryCode,
            brandName,
            fulfillmentMethod: "delivery",
            source: vehicleCtx ? "vehicle_detail" : "battery_detail",
            fitmentStatus: vehicleCtx ? "confirmed" : "needs_customer_confirm",
          },
          vehicleCtx,
        );
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
    setFulfillment((prev) => {
      if (prev.method !== "undecided" && prev.method !== "delivery") return prev;
      const fromCart = initialFulfillmentFromCart(items);
      const hasUserShipping =
        Boolean(prev.recipientName?.trim()) ||
        Boolean(prev.recipientPhone?.trim()) ||
        Boolean(prev.postalCode?.trim()) ||
        Boolean(prev.address1?.trim()) ||
        Boolean(prev.address2?.trim()) ||
        Boolean(prev.deliveryMessage?.trim()) ||
        Boolean(prev.visitMessage?.trim());
      if (hasUserShipping) {
        return {
          ...fromCart,
          ...prev,
          method: fromCart.method ?? prev.method,
          storeId: fromCart.storeId ?? prev.storeId,
        };
      }
      return { ...fromCart, ...prev };
    });
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
    const needsItemSync =
      next.method !== "undecided" &&
      (patch.method != null ||
        patch.storeId != null ||
        patch.region != null ||
        patch.postalCode != null ||
        patch.address1 != null);
    if (needsItemSync) {
      applyFulfillmentToItems(next);
    }
  };

  const effectiveUsedBattery = useMemo(
    () => resolveCheckoutUsedBatteryReturn(usedBattery, items),
    [usedBattery, items],
  );

  const totals = computeCheckoutTotal(items, fulfillment.method, effectiveUsedBattery ?? undefined);
  const displayTotal = promotionFinalTotal ?? totals.finalAmount;
  const promotionDiscountLines = useMemo(
    () =>
      appliedPromotions.map((p) => ({
        title: p.title,
        amount: p.discountAmount,
      })),
    [appliedPromotions],
  );

  const vehicleConfirmState = useMemo(() => {
    const primary = items[0];
    const display = formatCheckoutVehicleDisplay(vehicle, primary);
    const confirmHref = display.vehicleSlug
      ? `/vehicle/${encodeURIComponent(display.vehicleSlug)}`
      : HUB_SEARCH;
    return { needsVehicleConfirm: display.needsVehicleConfirm, confirmHref };
  }, [items, vehicle]);

  const canConfirm =
    optionsComplete &&
    checkoutContactValid(fulfillment, customer) &&
    checkoutVehicleInfoValid(vehicle) &&
    isUsedBatterySelected(effectiveUsedBattery) &&
    fulfillment.method !== "undecided" &&
    fulfillmentAddressValid(fulfillment) &&
    checklistComplete;

  const handleGoToReview = () => {
    setValidationError(null);
    if (!canConfirm) {
      setValidationError(
        optionsComplete
          ? checkoutVehicleInfoValid(vehicle)
            ? "이름, 연락처, 주소·지점, 확인 항목을 점검해 주세요."
            : "공구 확인을 위해 차량명을 입력해 주세요."
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
      usedBatteryReturn: effectiveUsedBattery ?? "unknown",
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

  const submitLabel = checkoutSubmitLabel(fulfillment.method, paymentLive);

  const pricePanelAside = (
    <CheckoutPriceSummaryPanel
      items={items}
      fulfillment={fulfillment}
      usedBattery={effectiveUsedBattery}
      sticky
      panelPlacement="aside"
      finalAmountOverride={displayTotal}
      promotionDiscounts={promotionDiscountLines}
    />
  );

  return (
    <div className="checkout-order pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:pb-10" data-page="checkout">
      <div className="checkout-order__grid grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,400px)] lg:items-start">
        <form className="checkout-order__main space-y-4 lg:space-y-5" onSubmit={(e) => e.preventDefault()}>
          <section className="checkout-card checkout-card--intro" data-checkout-section="intro">
            <h1 className="text-base font-black text-[#0F172A] sm:text-lg lg:text-2xl">{CHECKOUT_PAGE_COPY.title}</h1>
            <p className="mt-1 hidden text-sm font-semibold text-[#475569] lg:block">
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

          <PaymentPreparingNotice compact />

          <CommercePrePaymentNotice
            variant="checkout"
            checkoutStep="order"
            totalAmount={displayTotal}
            fulfillmentMethod={fulfillment.method}
            usedBatteryReturn={effectiveUsedBattery}
            items={items}
          />

          <CheckoutProductSummary
            items={items}
            fulfillmentMethod={fulfillment.method}
            usedBattery={effectiveUsedBattery}
            totalAmount={totals.finalAmount}
            optionsComplete={optionsComplete}
            isBuyNow={isBuyNow}
          />

          {fulfillment.method === "delivery" ? (
            <CheckoutDeliveryAddressSection
              values={fulfillment}
              onChange={onFulfillmentChange}
              showMemberApply={isLoggedIn}
              onApplyMemberProfile={applyMemberProfileToShipping}
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

          <CheckoutVehicleSection
            values={vehicle}
            onChange={(p) => setVehicle((v) => ({ ...v, ...p }))}
            needsVehicleConfirm={vehicleConfirmState.needsVehicleConfirm}
            vehicleConfirmHref={vehicleConfirmState.confirmHref}
          />

          <CheckoutPromotionSection
            items={items}
            fulfillmentType={fulfillment.method}
            returnBatteryOption={effectiveUsedBattery ?? "unknown"}
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
              label={submitLabel}
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
            label={submitLabel}
            onClick={handleGoToReview}
            className="flex-[2]"
          />
        </div>
      </div>
    </div>
  );
}
