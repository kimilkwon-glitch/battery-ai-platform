/**
 * 스윗트래커 배송조회 연동 검증 (외부 API 호출 없음)
 * npx tsx scripts/verify-delivery-track.ts
 */
import {
  DELIVERY_CARRIERS,
  isKnownDeliveryCarrierCode,
  isValidInvoiceNumber,
} from "../src/lib/delivery/delivery-carriers";
import {
  mockDeliveryTrackResult,
  normalizeSweetTrackerResponse,
} from "../src/lib/delivery/sweettracker-normalize";

function assert(label: string, condition: boolean): void {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
  } else {
    console.log(`OK: ${label}`);
  }
}

assert("경동택배 code 23 included", DELIVERY_CARRIERS.some((c) => c.code === "23"));
assert("대신택배 code 22 included", DELIVERY_CARRIERS.some((c) => c.code === "22"));
assert("codes stay string with leading zero", DELIVERY_CARRIERS.find((c) => c.code === "01")?.code === "01");
assert("valid invoice 1234567890", isValidInvoiceNumber("1234567890"));
assert("invalid invoice empty", !isValidInvoiceNumber(""));
assert("invalid invoice special chars", !isValidInvoiceNumber("abc@123"));
assert("known carrier 23", isKnownDeliveryCarrierCode("23"));
assert("unknown carrier 99", !isKnownDeliveryCarrierCode("99"));

const fail = normalizeSweetTrackerResponse("23", "1234567890", {
  status: false,
  msg: "운송장 번호 오류",
});
assert("normalize failure message", !fail.ok && fail.message.includes("운송장"));

const success = normalizeSweetTrackerResponse("23", "1234567890", {
  status: true,
  complete: false,
  trackingDetails: [
    { timeString: "2026-06-11 10:00", where: "부산", kind: "집화" },
    { timeString: "2026-06-11 14:00", where: "대구", kind: "배송중" },
  ],
});
assert("normalize success", success.ok === true);
if (success.ok) {
  assert("success has progresses", success.progresses.length === 2);
  assert("success status in transit", success.status.includes("배송중"));
}

const delivered = normalizeSweetTrackerResponse("22", "9876543210", {
  status: true,
  complete: true,
  trackingDetails: [{ timeString: "2026-06-11 18:00", where: "서울", kind: "배송완료" }],
});
assert("normalize delivered", delivered.ok === true);
if (delivered.ok) {
  assert("delivered status label", delivered.status.includes("배송완료"));
}

const mockInTransit = mockDeliveryTrackResult("23", "1234567890", "in_transit");
assert("mock in_transit", mockInTransit.status.includes("배송중"));
const mockDelivered = mockDeliveryTrackResult("23", "1234567890", "delivered");
assert("mock delivered", mockDelivered.status.includes("배송완료"));

if (process.exitCode) {
  console.error("\nSome delivery track checks failed.");
  process.exit(process.exitCode);
}
console.log("\nAll delivery track checks passed (no external API calls).");
