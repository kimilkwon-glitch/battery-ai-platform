/**
 * 배터리톡 visitor 문의내역 회귀 검증 (DB/API 호출 없음)
 * 실행: npx tsx scripts/verify-battery-talk-visitor-history.ts
 */
import {
  shouldExcludeBatteryTalkThreadFromVisitorHistory,
  shouldExcludeBatteryTalkThreadFromAdmin,
} from "../src/lib/battery-talk/battery-talk-store-shared";
import { BATTERY_TALK_SYSTEM_WELCOME } from "../src/lib/battery-talk/battery-talk-chat-copy";
import type { BatteryTalkThread } from "../src/types/battery-talk";

function assert(label: string, condition: boolean): void {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
  } else {
    console.log(`OK: ${label}`);
  }
}

const baseThread = (overrides: Partial<BatteryTalkThread> = {}): BatteryTalkThread => ({
  threadId: "btt_test_1",
  source: "batterytalk",
  status: "waiting",
  customerName: "고객",
  phone: "",
  isMember: false,
  messages: [
    { id: "m1", sender: "system", body: BATTERY_TALK_SYSTEM_WELCOME, createdAt: "2026-06-11T00:00:00Z" },
    { id: "m2", sender: "customer", body: "새로고침 후에도 보여야 합니다", createdAt: "2026-06-11T00:01:00Z" },
  ],
  context: { visitorId: "btv_test_visitor" },
  createdAt: "2026-06-11T00:00:00Z",
  updatedAt: "2026-06-11T00:01:00Z",
  lastMessageAt: "2026-06-11T00:01:00Z",
  unreadByAdmin: true,
  ...overrides,
});

// 1. 고객 메시지 있는 thread → visitor history 포함
assert(
  "customer thread visible in visitor history",
  !shouldExcludeBatteryTalkThreadFromVisitorHistory(baseThread()),
);

// 2. 시스템 환영만 → visitor history 제외
assert(
  "system-only shell hidden from visitor history",
  shouldExcludeBatteryTalkThreadFromVisitorHistory(
    baseThread({
      messages: [{ id: "m1", sender: "system", body: BATTERY_TALK_SYSTEM_WELCOME, createdAt: "2026-06-11T00:00:00Z" }],
    }),
  ),
);

// 3. visitorId 없는 과거 thread + 고객 메시지 → visitor history 포함 (threadIds fallback용)
assert(
  "legacy thread without visitorId still visible in visitor history",
  !shouldExcludeBatteryTalkThreadFromVisitorHistory(baseThread({ context: {} })),
);

// 4. 고객명 '고객', 연락처 없음 → visitor history 포함 (관리자 필터와 달리 이름만으로 숨기지 않음)
assert(
  "generic customer name not hidden from visitor history",
  !shouldExcludeBatteryTalkThreadFromVisitorHistory(baseThread({ customerName: "고객", phone: "" })),
);

// 5. UX2 마커 → 관리자에서는 숨김, visitor history는 고객 메시지 기준 유지
const ux2Thread = baseThread({
  customerName: "[UX2-운영검수] 테스트 · UX2-001",
  phone: "010-9100-0001",
});
assert("UX2 thread hidden from admin", shouldExcludeBatteryTalkThreadFromAdmin(ux2Thread));
assert(
  "UX2 thread with customer message still in visitor history filter (customer browser)",
  !shouldExcludeBatteryTalkThreadFromVisitorHistory(ux2Thread),
);

// 6. messages=[] + customerMessageCount>0 → visitor history 포함
assert(
  "empty messages with customer count meta visible in visitor history",
  !shouldExcludeBatteryTalkThreadFromVisitorHistory(baseThread({ messages: [] }), { customerMessageCount: 1 }),
);

// 7. GET sessions API 파라미터 규칙 (로직 미러)
function sessionsRequestAllowed(visitorId: string, threadIds: string[]): boolean {
  return Boolean(visitorId.trim()) || threadIds.some((id) => id.trim());
}

assert("sessions API allows visitorId only", sessionsRequestAllowed("btv_1", []));
assert("sessions API allows threadIds only", sessionsRequestAllowed("", ["btt_1"]));
assert("sessions API rejects empty both", !sessionsRequestAllowed("", []));

if (process.exitCode === 1) {
  console.error("\nSome battery-talk visitor history checks failed.");
  process.exit(1);
}
console.log("\nAll battery-talk visitor history checks passed.");
