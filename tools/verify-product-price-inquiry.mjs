/**
 * 상품 카드·가격문의 정적 검증 (외부 API 호출 없음)
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

console.log("verify:product-price-inquiry");

for (const p of [
  "src/app/product-inquiry/page.tsx",
  "src/components/inquiry/ProductPriceInquiryClient.tsx",
  "src/lib/pricing/price-inquiry-link.ts",
  "src/app/api/public/catalog-prices/route.ts",
]) {
  assert(existsSync(join(root, p)), `file exists: ${p}`);
}

assert(
  fileIncludes("src/lib/pricing/price-inquiry-link.ts", 'PRODUCT_PRICE_INQUIRY_ROUTE = "/product-inquiry"'),
  "price inquiry route is /product-inquiry",
);
assert(
  !fileIncludes("src/lib/pricing/price-inquiry-link.ts", "CUSTOMER_CENTER_HUB"),
  "price inquiry does not route to customer center hub",
);
assert(
  fileIncludes("src/components/home/HomeSpecCardDisplayMeta.tsx", "가격문의"),
  "card shows 가격문의 label",
);
assert(
  fileIncludes("src/components/home/HomeSpecCardDisplayMeta.tsx", "home-spec-card-price--clickable"),
  "whole price box is clickable link",
);
assert(
  fileIncludes("src/components/home/HomeSpecExploreCard.tsx", "home-spec-card-title-anchor"),
  "spec title uses center anchor layout",
);
assert(
  fileIncludes("src/components/inquiry/ProductPriceInquiryClient.tsx", 'inquiryType: "가격문의"'),
  "inquiry type 가격문의",
);
assert(
  fileIncludes("src/components/inquiry/ProductPriceInquiryClient.tsx", 'source: "product_qna"'),
  "inquiry source product_qna",
);
assert(
  fileIncludes("src/lib/pricing/price-inquiry-link.ts", "isCatalogPriceMissing"),
  "isCatalogPriceMissing helper exported",
);
assert(
  fileIncludes("src/components/home/HomeSpecExploreCard.tsx", "allPricesMissing"),
  "order disabled when all prices missing",
);

console.log(`\nverify:product-price-inquiry — ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
