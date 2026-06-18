#!/usr/bin/env node
/**
 * 주문 생성 카탈로그 검증 mock — DB/Production/외부 API 호출 없음
 */
import { ensureTsxVerify } from "../scripts/ensure-tsx-verify.mjs";

ensureTsxVerify(import.meta.url);

await import("../scripts/register-server-only.mjs");

const {
  validateCartItemCatalogRules,
  validateOrderCatalogForCreate,
  ORDER_CATALOG_UNAVAILABLE_MESSAGE,
} = await import("../src/lib/payment/validate-order-catalog.server.ts");

const { isCatalogProductKnown } = await import(
  "../src/lib/admin/products/products-admin-service.ts"
);

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

const sellableRow = {
  productId: "solite:CMF80L",
  brand: "solite",
  batteryCode: "CMF80L",
  sellable: true,
  saleStatus: "selling",
  visible: true,
  reviewStatus: "ok",
};

const rocketSellableRow = {
  productId: "rocket:GB80L",
  brand: "rocket",
  batteryCode: "GB80L",
  sellable: true,
  saleStatus: "selling",
  visible: true,
  reviewStatus: "ok",
};

const stoppedRow = {
  productId: "solite:CMF80L",
  brand: "solite",
  batteryCode: "CMF80L",
  sellable: false,
  saleStatus: "stopped",
  visible: true,
  reviewStatus: "ok",
};

const baseItem = {
  brandId: "solite",
  brandName: "쏠라이트",
  productId: "solite:CMF80L",
  batterySpec: "CMF80L",
  terminalDirection: "L",
};

console.log("order catalog guard (mock)\n");

assert(
  "active CMF80L solite is known in catalog",
  isCatalogProductKnown("solite", "CMF80L"),
);

assert(
  "active GB80L rocket is known in catalog",
  isCatalogProductKnown("rocket", "GB80L"),
);

assert(
  "unknown product code is not known",
  !isCatalogProductKnown("rocket", "ZZZNOTREAL99"),
);

assert(
  "active sellable cart item passes",
  validateCartItemCatalogRules(baseItem, sellableRow).ok === true,
);

assert(
  "missing product row blocked",
  validateCartItemCatalogRules(baseItem, null).ok === false,
);

assert(
  "stopped product blocked",
  validateCartItemCatalogRules(baseItem, stoppedRow).ok === false,
);

assert(
  "rocket GB80L sellable cart item passes",
  validateCartItemCatalogRules(
    {
      brandId: "rocket",
      productId: "rocket:GB80L",
      batterySpec: "GB80L",
    },
    rocketSellableRow,
  ).ok === true,
);

assert(
  "CMF prefix on solite passes when catalog row is valid",
  validateCartItemCatalogRules(baseItem, sellableRow).ok === true,
);

assert(
  "spec-prefixed productId passes when brand matches row",
  validateCartItemCatalogRules(
    {
      brandId: "solite",
      productId: "spec-solite-cmf80l",
      batterySpec: "CMF80L",
    },
    sellableRow,
  ).ok === true,
);

assert(
  "L/R terminal string mismatch does not block",
  validateCartItemCatalogRules(
    {
      brandId: "solite",
      productId: "solite:CMF80R",
      batterySpec: "CMF80R",
      terminalDirection: "L",
    },
    { ...sellableRow, productId: "solite:CMF80R", batteryCode: "CMF80R" },
  ).ok === true,
);

assert(
  "niro-sg2 vehicle slug does not block order catalog validation",
  (
    await validateOrderCatalogForCreate({
      cartItems: [
        {
          ...baseItem,
          id: "1",
          quantity: 1,
          fitmentStatus: "confirmed",
          vehicle: { vehicleId: "niro-sg2", fuelType: "하이브리드" },
        },
      ],
      customerInfo: { name: "t", phone: "01012345678" },
      fulfillmentType: "delivery",
      returnBatteryOption: "return",
      addressInfo: { deliveryAddress: "부산" },
    })
  ).ok === true,
);

assert(
  "manipulated brandId vs productId blocked",
  (
    await validateOrderCatalogForCreate({
      cartItems: [
        {
          ...baseItem,
          brandId: "rocket",
          productId: "solite:CMF80L",
          id: "1",
          quantity: 1,
          fitmentStatus: "confirmed",
        },
      ],
      customerInfo: { name: "t", phone: "01012345678" },
      fulfillmentType: "delivery",
      returnBatteryOption: "return",
      addressInfo: { deliveryAddress: "부산" },
    })
  ).ok === false,
);

assert(
  "unknown product blocked on full create validation",
  (
    await validateOrderCatalogForCreate({
      cartItems: [
        {
          brandId: "rocket",
          productId: "rocket:ZZZNOTREAL99",
          batterySpec: "ZZZNOTREAL99",
          id: "1",
          quantity: 1,
          fitmentStatus: "confirmed",
        },
      ],
      customerInfo: { name: "t", phone: "01012345678" },
      fulfillmentType: "delivery",
      returnBatteryOption: "return",
      addressInfo: { deliveryAddress: "부산" },
    })
  ).ok === false,
);

assert(
  "user-facing message is generic",
  ORDER_CATALOG_UNAVAILABLE_MESSAGE.includes("장바구니"),
);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
