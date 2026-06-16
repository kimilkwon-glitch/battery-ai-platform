/**
 * 상품 Q&A 비밀글·가격문의 저장 정적 검증
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

function fileExcludes(relPath, needle) {
  return !fileIncludes(relPath, needle);
}

console.log("verify:product-qna-privacy");

assert(
  fileIncludes("src/lib/inquiry/product-qna-submit.server.ts", "submitProductQnaFromRequest"),
  "product qna submit server helper",
);
assert(
  fileIncludes("src/lib/inquiry/product-qna-viewer.server.ts", "canViewSecretProductQna"),
  "secret qna viewer check",
);
assert(
  fileIncludes("src/lib/product-qna-public.ts", "canViewContent"),
  "public qna masks secret content",
);
assert(
  fileIncludes("src/app/api/support/inquiries/route.ts", "submitProductQnaFromRequest"),
  "product qna POST branch",
);
assert(
  fileIncludes("src/app/api/support/inquiries/route.ts", "parseProductQnaViewerContext"),
  "GET uses viewer context",
);
assert(
  fileExcludes("src/components/inquiry/ProductPriceInquiryClient.tsx", "SimpleInquiryForm"),
  "price inquiry page has no SimpleInquiryForm",
);
assert(
  fileExcludes("src/components/inquiry/ProductPriceInquiryClient.tsx", "optionalFields"),
  "price inquiry page has no name/contact optional fields",
);
assert(
  fileIncludes("src/components/inquiry/ProductPriceInquiryClient.tsx", "비밀글로 등록"),
  "price inquiry secret checkbox",
);
assert(
  fileIncludes("src/components/inquiry/ProductPriceInquiryClient.tsx", "submitProductQna"),
  "price inquiry uses submitProductQna",
);
assert(
  fileIncludes("src/components/inquiry/ProductPriceInquiryClient.tsx", "buildProductQnaDetailUrl"),
  "redirect to product qna tab",
);
assert(
  fileIncludes("src/lib/inquiry-storage.ts", "submitProductQna"),
  "client submitProductQna helper",
);
assert(
  fileIncludes("src/types/customer-inquiry.ts", "authorUserId"),
  "author user id on inquiry record",
);
assert(
  fileIncludes("src/lib/db/ensure-operational-schema.ts", "author_user_id"),
  "schema author_user_id column",
);

console.log(`\nverify:product-qna-privacy — ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
