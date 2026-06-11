/**
 * Review write flow verification (no payment / no prod data mutation beyond test review).
 * Usage: npx tsx tools/verify-review-write-flow.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  isAllowedReviewImageMime,
  isReviewImageRef,
  normalizeReviewImages,
  REVIEW_IMAGE_MAX_COUNT,
} from "../src/lib/reviews/review-image-policy";

function testImagePolicy() {
  assert.equal(REVIEW_IMAGE_MAX_COUNT, 5);
  assert.equal(isAllowedReviewImageMime("image/jpeg"), true);
  assert.equal(isAllowedReviewImageMime("image/gif"), false);

  const tiny =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";
  assert.equal(isReviewImageRef(tiny), true);
  assert.equal(normalizeReviewImages([tiny, tiny, "not-valid"]).length, 1);
  const unique = Array.from({ length: 6 }, (_, i) => tiny.replace("/9k=", `/9k=${i}`));
  assert.equal(normalizeReviewImages(unique).length, 5);
  console.log("✓ review-image-policy");
}

function testSourceFiles() {
  const form = readFileSync(
    path.join(process.cwd(), "src/components/reviews/ReviewWriteForm.tsx"),
    "utf8",
  );
  assert.match(form, /ReviewWritePhotoAttach/);
  assert.match(form, /images,/);
  assert.match(form, /review-write-hero/);

  const submit = readFileSync(
    path.join(process.cwd(), "src/app/api/reviews/submit/route.ts"),
    "utf8",
  );
  assert.match(submit, /normalizeReviewImages/);
  assert.match(submit, /reviewPrimaryImageUrl/);

  const upload = readFileSync(
    path.join(process.cwd(), "src/lib/reviews/review-image-upload.server.ts"),
    "utf8",
  );
  assert.match(upload, /saveReviewImageToBlob/);
  assert.match(upload, /isProductionRuntime/);

  const storage = readFileSync(
    path.join(process.cwd(), "src/lib/reviews/review-image-storage.server.ts"),
    "utf8",
  );
  assert.match(storage, /BLOB_READ_WRITE_TOKEN/);
  assert.match(storage, /put\(/);

  const blobUrl =
    "https://abc123.public.blob.vercel-storage.com/reviews/test.jpg";
  assert.equal(isReviewImageRef(blobUrl), true);

  console.log("✓ source wiring + blob storage abstraction");
}

testImagePolicy();
testSourceFiles();
console.log("\nAll review write static checks passed.");
