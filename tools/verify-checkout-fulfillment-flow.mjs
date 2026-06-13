#!/usr/bin/env node
/**
 * Checkout fulfillment flow 검증 — 실제 주문/결제/SOLAPI 호출 없음
 * Usage: npx tsx tools/verify-checkout-fulfillment-flow.mjs
 */
import "../scripts/register-server-only.mjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const {
  mergeCheckoutFulfillmentState,
  fulfillmentFromCartItems,
  shouldSyncCartItemsForFulfillmentPatch,
  checkoutFormPanelsForMethod,
  checkoutVehicleInfoRequired,
  buildCheckoutSessionFulfillment,
  parseFulfillmentMethodFromQuery,
} = await import("../src/lib/checkout/checkout-fulfillment-state.ts");
const { checkoutFulfillmentStepValid } = await import("../src/lib/checkout/checkout-address.ts");
const { computeCheckoutTotal } = await import("../src/lib/pricing/compute-checkout-total.ts");
const { applyPricingToCartItem } = await import("../src/lib/pricing/order-price.ts");
const { createCartItemFromBattery } = await import("../src/lib/cart/cart-item-factory.ts");

let passed = 0;
let failed = 0;

function assert(name, cond, detail = "") {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function mockCartItem(method) {
  const base = createCartItemFromBattery({
    batteryCode: "CMF80L",
    brandName: "쏠라이트",
    fulfillmentMethod: method,
    usedBatteryReturnOption: "return",
  });
  return applyPricingToCartItem(base, method);
}

const METHODS = ["delivery", "visit_install", "store_install", "store_pickup_self"];

console.log("verify-checkout-fulfillment-flow: merge & init\n");

const storePickupCart = [mockCartItem("store_pickup_self")];
const fromCart = fulfillmentFromCartItems(storePickupCart);

// 재현: 기존 버그 — prev.method delivery + spread prev second → delivery wins
const buggyMerge = { ...fromCart, ...{ method: "delivery", storeId: "undecided" } };
assert("buggy merge would force delivery", buggyMerge.method === "delivery");

const fixed = mergeCheckoutFulfillmentState(
  { method: "delivery", storeId: "undecided" },
  fromCart,
  "init",
);
assert("init merge keeps store_pickup_self", fixed.method === "store_pickup_self");

assert(
  "cart external sync applies cart method when returning from product page",
  mergeCheckoutFulfillmentState(
    { method: "delivery", storeId: "undecided" },
    fromCart,
    "cart_external_sync",
  ).method === "store_pickup_self",
);

console.log("\nverify-checkout-fulfillment-flow: patch sync guard\n");

assert(
  "address patch does not sync items",
  !shouldSyncCartItemsForFulfillmentPatch({ postalCode: "12345" }, { method: "store_pickup_self", storeId: "deokcheon" }),
);
assert(
  "method patch syncs items",
  shouldSyncCartItemsForFulfillmentPatch({ method: "delivery" }, { method: "store_pickup_self", storeId: "deokcheon" }),
);

console.log("\nverify-checkout-fulfillment-flow: form panels\n");

for (const method of METHODS) {
  const panels = checkoutFormPanelsForMethod(method);
  if (method === "delivery") {
    assert("delivery shows address", panels.deliveryAddress && !panels.storePickup);
  }
  if (method === "visit_install") {
    assert("visit shows visit address", panels.visitAddress && !panels.deliveryAddress);
  }
  if (method === "store_install") {
    assert("store install hides address", !panels.deliveryAddress && !panels.visitAddress && panels.storeInstall);
  }
  if (method === "store_pickup_self") {
    assert("store pickup shows vehicle", panels.vehicle && panels.storePickup);
    assert("store pickup vehicle required", checkoutVehicleInfoRequired(method));
  }
}

console.log("\nverify-checkout-fulfillment-flow: pricing (CMF80L return)\n");

const INTERNET = 62_000;
const ONSITE = 85_000;
const DELIVERY_FEE = 15_000;
const STORE_DISCOUNT = 5_000;

const priceExpect = {
  delivery: INTERNET + DELIVERY_FEE,
  visit_install: ONSITE,
  store_install: ONSITE - STORE_DISCOUNT,
  store_pickup_self: INTERNET,
};

for (const method of METHODS) {
  const item = mockCartItem(method);
  const totals = computeCheckoutTotal([item], method, "return");
  assert(
    `${method} price`,
    totals.finalAmount === priceExpect[method],
    `got ${totals.finalAmount} want ${priceExpect[method]}`,
  );
}

console.log("\nverify-checkout-fulfillment-flow: validation & session payload\n");

const storePickupValid = checkoutFulfillmentStepValid(
  { method: "store_pickup_self", storeId: "deokcheon" },
  { name: "홍길동", phone: "01012345678" },
  { name: "쏘렌토" },
);
assert("store pickup valid with store contact and vehicle", storePickupValid);

const storePickupSession = buildCheckoutSessionFulfillment({
  method: "store_pickup_self",
  storeId: "deokcheon",
  postalCode: "12345",
  address1: "should-not-leak",
});
assert(
  "store pickup session strips address",
  !storePickupSession.postalCode && !storePickupSession.address1,
);

const deliverySession = buildCheckoutSessionFulfillment({
  method: "delivery",
  storeId: "undecided",
  postalCode: "48000",
  address1: "부산",
  address2: "101",
  recipientName: "A",
  recipientPhone: "01011112222",
});
assert("delivery session keeps address", deliverySession.postalCode === "48000");

assert(
  "query parse store_pickup legacy",
  parseFulfillmentMethodFromQuery("store_pickup") === "store_pickup_self",
);

// CheckoutOrderPage must not reintroduce delivery default overwrite
const pageSrc = readFileSync(
  join(process.cwd(), "src/components/checkout/CheckoutOrderPage.tsx"),
  "utf8",
);
assert(
  "CheckoutOrderPage initial method undecided",
  pageSrc.includes('method: "undecided"') && !pageSrc.includes('method: "delivery",\n    storeId: "undecided"'),
);
assert(
  "CheckoutOrderPage uses mergeCheckoutFulfillmentState",
  pageSrc.includes("mergeCheckoutFulfillmentState"),
);
assert(
  "CheckoutOrderPage guards item sync on address",
  pageSrc.includes("shouldSyncCartItemsForFulfillmentPatch"),
);

console.log("\nverify-checkout-fulfillment-flow: vehicle/request copy\n");

const {
  checkoutVehicleSectionCopy,
  checkoutRequestMessageCopy,
  CHECKOUT_VEHICLE_FORBIDDEN_PHRASES,
  CHECKOUT_REQUEST_FORBIDDEN_PLACEHOLDERS,
} = await import("../src/data/checkout-vehicle-copy.ts");

assert(
  "delivery vehicle title suffix",
  checkoutVehicleSectionCopy("delivery").titleSuffix === "공구확인용" &&
    checkoutVehicleSectionCopy("delivery").emptyHint === null,
);
assert(
  "visit vehicle copy",
  checkoutVehicleSectionCopy("visit_install").titleSuffix === "교체 준비용" &&
    checkoutVehicleSectionCopy("visit_install").emptyHint?.includes("원활한 교체 준비"),
);
assert(
  "store install vehicle copy",
  checkoutVehicleSectionCopy("store_install").titleSuffix === "교체 준비용",
);
assert(
  "store pickup vehicle title",
  checkoutVehicleSectionCopy("store_pickup_self").titleSuffix === "공구확인용",
);
assert(
  "request labels",
  checkoutRequestMessageCopy("delivery")?.label === "배송메시지 (선택)" &&
    checkoutRequestMessageCopy("visit_install")?.label === "출장 요청사항 (선택)" &&
    checkoutRequestMessageCopy("store_install")?.label === "방문 요청사항 (선택)" &&
    checkoutRequestMessageCopy("store_pickup_self")?.label === "방문 요청사항 (선택)",
);

const componentSources = [
  "src/components/checkout/CheckoutDeliveryAddressSection.tsx",
  "src/components/checkout/CheckoutVisitAddressSection.tsx",
  "src/components/checkout/CheckoutStoreSection.tsx",
  "src/components/checkout/CheckoutVehicleSection.tsx",
].map((p) => readFileSync(join(process.cwd(), p), "utf8"));

for (const phrase of CHECKOUT_REQUEST_FORBIDDEN_PLACEHOLDERS) {
  assert(`no request placeholder: ${phrase.slice(0, 12)}`, !componentSources.some((s) => s.includes(phrase)));
}
for (const phrase of CHECKOUT_VEHICLE_FORBIDDEN_PHRASES) {
  assert(`no forbidden vehicle phrase: ${phrase}`, !componentSources.some((s) => s.includes(phrase)));
}
assert(
  "delivery message label in component",
  componentSources[0].includes("배송메시지 (선택)"),
);
assert(
  "visit request label in component",
  componentSources[1].includes("출장 요청사항 (선택)"),
);
assert(
  "store request label in component",
  componentSources[2].includes("방문 요청사항 (선택)"),
);

console.log(`\nverify-checkout-fulfillment-flow: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
