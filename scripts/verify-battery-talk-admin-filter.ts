/**
 * 배터리톡 관리자 필터 회귀 검증 (DB/API 호출 없음)
 * 실행: npx tsx scripts/verify-battery-talk-admin-filter.ts
 */
import {
  shouldExcludeBatteryTalkSummaryFromAdmin,
  shouldExcludeBatteryTalkThreadFromAdmin,
} from "../src/lib/battery-talk/battery-talk-store-shared";
import { BATTERY_TALK_SYSTEM_WELCOME } from "../src/lib/battery-talk/battery-talk-chat-copy";
import type { BatteryTalkThread, BatteryTalkThreadSummary } from "../src/types/battery-talk";

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
    { id: "m1", sender: "system", body: "안녕하세요. 배터리매니저입니다.", createdAt: "2026-06-11T00:00:00Z" },
    { id: "m2", sender: "customer", body: "CMF80L 규격 맞나요?", createdAt: "2026-06-11T00:01:00Z" },
  ],
  context: {},
  createdAt: "2026-06-11T00:00:00Z",
  updatedAt: "2026-06-11T00:01:00Z",
  lastMessageAt: "2026-06-11T00:01:00Z",
  unreadByAdmin: true,
  ...overrides,
});

const baseSummary = (overrides: Partial<BatteryTalkThreadSummary> = {}): BatteryTalkThreadSummary => ({
  threadId: "btt_test_1",
  status: "waiting",
  customerName: "고객",
  phone: "",
  lastMessagePreview: "CMF80L 규격 맞나요?",
  lastMessageAt: "2026-06-11T00:01:00Z",
  unreadByAdmin: true,
  hasProduct: false,
  hasOrder: false,
  ...overrides,
});

// 1. 고객명 "고객", 연락처 없음, 고객 메시지 있음 → 표시
assert(
  "real customer message with generic name is visible",
  !shouldExcludeBatteryTalkThreadFromAdmin(baseThread()),
);

// 2. 고객명 없음 대신 빈 이름 + 고객 메시지 → 표시
assert(
  "empty name with customer message is visible",
  !shouldExcludeBatteryTalkThreadFromAdmin(baseThread({ customerName: "" })),
);

// 3. 시스템 환영만 → 숨김
assert(
  "system-only shell is hidden",
  shouldExcludeBatteryTalkThreadFromAdmin(
    baseThread({
      messages: [
        { id: "m1", sender: "system", body: "안녕하세요. 배터리매니저입니다.", createdAt: "2026-06-11T00:00:00Z" },
      ],
      unreadByAdmin: false,
    }),
  ),
);

// 4. UX2 마커 → 숨김
assert(
  "UX2 marked thread is hidden",
  shouldExcludeBatteryTalkThreadFromAdmin(
    baseThread({
      customerName: "[UX2-운영검수] 테스트 · UX2-001",
      phone: "010-9100-0001",
    }),
  ),
);

// 5. Postgres 목록처럼 messages=[] + customerMessageCount>0 → 표시
assert(
  "empty messages array with customer count meta still visible",
  !shouldExcludeBatteryTalkThreadFromAdmin(baseThread({ messages: [] }), { customerMessageCount: 1 }),
);

// 6. summary: 고객 preview → 표시
assert(
  "summary with customer preview is visible",
  !shouldExcludeBatteryTalkSummaryFromAdmin(baseSummary()),
);

// 7. summary: welcome only → 숨김
assert(
  "welcome-only summary hidden",
  shouldExcludeBatteryTalkSummaryFromAdmin(
    baseSummary({
      lastMessagePreview: BATTERY_TALK_SYSTEM_WELCOME,
      unreadByAdmin: false,
    }),
  ),
);

// 8. Postgres 목록: messages=[] + customerMessageCount>0 + unread=false → 표시 (summary 이중 필터 회귀)
assert(
  "empty preview with customer count meta still visible after admin read",
  !shouldExcludeBatteryTalkSummaryFromAdmin(
    baseSummary({ lastMessagePreview: "", unreadByAdmin: false }),
    { customerMessageCount: 1 },
  ),
);

if (process.exitCode === 1) {
  console.error("\nSome battery-talk filter checks failed.");
  process.exit(1);
}
console.log("\nAll battery-talk filter checks passed.");
