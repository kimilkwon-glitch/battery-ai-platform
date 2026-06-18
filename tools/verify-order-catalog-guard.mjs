#!/usr/bin/env node
/**
 * 주문 생성 카탈로그·차량 검증 mock — DB/Production/외부 API 호출 없음
 */
import { ensureTsxVerify } from "../scripts/ensure-tsx-verify.mjs";

ensureTsxVerify(import.meta.url);

await import("../scripts/register-server-only.mjs");

const {
  validateCartItemCatalogRules,
  validateVehicleSalesPolicyForOrder,
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
  sellable: true,
  saleStatus: "selling",
  visible: true,
  reviewStatus: "ok",
};

const stoppedRow = {
  sellable: false,
  saleStatus: "stopped",
  visible: true,
  reviewStatus: "ok",
};

const baseItem = {
  brandId: "solite",
  brandName: "쏠라이트",
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
  validateCartItemCatalogRules(baseItem, "CMF80L", sellableRow).ok === true,
);

assert(
  "missing product row blocked",
  validateCartItemCatalogRules(baseItem, "CMF80L", null).ok === false,
);

assert(
  "stopped product blocked",
  validateCartItemCatalogRules(baseItem, "CMF80L", stoppedRow).ok === false,
);

assert(
  "rocket GB80L sellable cart item passes",
  validateCartItemCatalogRules(
    { brandId: "rocket", brandName: "로케트", batterySpec: "GB80L", terminalDirection: "L" },
    "GB80L",
    sellableRow,
  ).ok === true,
);

assert(
  "rocket brand with CMF code blocked",
  validateCartItemCatalogRules(
    { brandId: "rocket", brandName: "로케트", batterySpec: "CMF80L", terminalDirection: "L" },
    "CMF80L",
    sellableRow,
  ).ok === false,
);

const soliteGbConflict = validateCartItemCatalogRules(
  { brandId: "solite", brandName: "쏠라이트", batterySpec: "GB80", terminalDirection: "L" },
  "GB80",
  sellableRow,
);
assert(
  "solite GB short code brand conflict blocked",
  soliteGbConflict.ok === false && soliteGbConflict.code === "PRODUCT_BRAND_MISMATCH",
);

const terminalConflict = validateCartItemCatalogRules(
  { ...baseItem, batterySpec: "CMF80R", terminalDirection: "L" },
  "CMF80R",
  sellableRow,
);
assert(
  "L/R terminal mismatch blocked",
  terminalConflict.ok === false && terminalConflict.code === "TERMINAL_MISMATCH",
);

const vehicleExcluded = validateVehicleSalesPolicyForOrder({
  cartItems: [
    {
      ...baseItem,
      id: "1",
      quantity: 1,
      vehicle: { vehicleId: "niro-sg2", fuelType: "하이브리드" },
    },
  ],
  customer: { name: "t", phone: "01012345678" },
  fulfillment: { method: "delivery" },
});

assert(
  "sales-excluded vehicle slug blocked",
  vehicleExcluded.ok === false && vehicleExcluded.code === "VEHICLE_SALES_EXCLUDED",
);

const fuelExcluded = validateVehicleSalesPolicyForOrder({
  cartItems: [
    {
      ...baseItem,
      id: "1",
      quantity: 1,
      vehicle: { vehicleId: "kona-sx2", fuelType: "하이브리드" },
    },
  ],
  customer: { name: "t", phone: "01012345678" },
  fulfillment: { method: "delivery" },
});

assert(
  "fuel sales-excluded vehicle blocked",
  fuelExcluded.ok === false && fuelExcluded.code === "VEHICLE_FUEL_SALES_EXCLUDED",
);

const vehicleOk = validateVehicleSalesPolicyForOrder({
  cartItems: [
    {
      ...baseItem,
      id: "1",
      quantity: 1,
      vehicle: { vehicleId: "hyundai-avante", fuelType: "가솔린" },
    },
  ],
  customer: { name: "t", phone: "01012345678" },
  fulfillment: { method: "delivery" },
});

assert(
  "normal vehicle cart passes sales policy",
  vehicleOk.ok === true,
);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
