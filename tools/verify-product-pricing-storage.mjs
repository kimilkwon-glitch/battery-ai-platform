/**
 * 관리자 상품 가격 production 영속 저장 검증 (외부 API/DB 호출 없음)
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
let passed = 0;
let failed = 0;

function ok(label) {
  passed += 1;
  console.log(`  ✓ ${label}`);
}

function fail(label, detail) {
  failed += 1;
  console.error(`  ✗ ${label}${detail ? `: ${detail}` : ""}`);
}

function assert(cond, label, detail) {
  if (cond) ok(label);
  else fail(label, detail);
}

function fileIncludes(relPath, needle) {
  const full = join(root, relPath);
  if (!existsSync(full)) return false;
  return readFileSync(full, "utf8").includes(needle);
}

console.log("verify:product-pricing-storage");

assert(
  existsSync(join(root, "src/lib/admin/products/product-overrides-store.postgres.ts")),
  "postgres override store exists",
);
assert(
  fileIncludes("src/lib/db/ensure-operational-schema.ts", "product_price_overrides"),
  "product_price_overrides table in schema",
);
assert(
  fileIncludes("src/lib/db/ensure-operational-schema.ts", "product_price_history"),
  "product_price_history table in schema",
);
assert(
  fileIncludes("src/lib/admin/products/product-overrides-store.ts", "loadProductOverridesPg"),
  "facade routes to postgres store",
);
assert(
  fileIncludes("src/lib/admin/products/product-overrides-store.ts", "assertOperationalStoreAvailable"),
  "production save fail-closed without DB",
);
assert(
  fileIncludes("src/lib/admin/products/product-overrides-store.ts", "isOperationalJsonFallbackAllowed"),
  "JSON fallback limited to dev",
);
assert(
  fileIncludes("src/lib/db/operational-store-config.ts", "product_pricing"),
  "product_pricing operational domain registered",
);
assert(
  fileIncludes("src/app/api/admin/products/[productId]/route.ts", "await saveProductOverride"),
  "admin PATCH awaits async save",
);
assert(
  fileIncludes("src/app/api/public/catalog-prices/route.ts", "await loadProductOverrides"),
  "catalog prices API awaits postgres overrides",
);

console.log(`\nverify:product-pricing-storage — ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
