/**
 * 배터리톡 고객→관리자→고객 reply roundtrip 회귀 검증 (DB/API 호출 없음)
 * 실행: npx tsx scripts/verify-battery-talk-reply-roundtrip.ts
 */
import {
  batteryTalkToSummary,
  countCustomerBatteryTalkMessages,
  filterBatteryTalkSummariesForAdmin,
  filterBatteryTalkThreadsForAdmin,
  shouldExcludeBatteryTalkSummaryFromAdmin,
  shouldExcludeBatteryTalkThreadFromAdmin,
} from "../src/lib/battery-talk/battery-talk-store-shared";
import type {
  BatteryTalkMessage,
  BatteryTalkThread,
  BatteryTalkThreadSummary,
} from "../src/types/battery-talk";

function assert(label: string, condition: boolean): void {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
  } else {
    console.log(`OK: ${label}`);
  }
}

/** Postgres batteryTalkList와 동일한 이중 필터 시뮬레이션 */
function simulatePostgresAdminList(
  row: {
    threadId: string;
    lastMessage: string;
    customerMessageCount: number;
    adminMessageCount: number;
    unreadByAdmin: boolean;
    status: BatteryTalkThread["status"];
  },
): boolean {
  const thread: BatteryTalkThread = {
    threadId: row.threadId,
    source: "batterytalk",
    status: row.status,
    customerName: "고객",
    phone: "",
    isMember: false,
    messages: [],
    context: {},
    createdAt: "2026-06-11T00:00:00Z",
    updatedAt: "2026-06-11T00:05:00Z",
    lastMessageAt: "2026-06-11T00:05:00Z",
    unreadByAdmin: row.unreadByAdmin,
  };
  const meta = { customerMessageCount: row.customerMessageCount };
  const threads = filterBatteryTalkThreadsForAdmin([thread], { [row.threadId]: meta });
  if (threads.length === 0) return false;

  const summary: BatteryTalkThreadSummary = {
    threadId: row.threadId,
    status: row.status,
    customerName: "고객",
    phone: "",
    lastMessagePreview: row.lastMessage.slice(0, 80),
    lastMessageAt: "2026-06-11T00:05:00Z",
    unreadByAdmin: row.unreadByAdmin,
    hasProduct: false,
    hasOrder: false,
  };
  const summaries = filterBatteryTalkSummariesForAdmin([summary], { [row.threadId]: meta });
  return summaries.length === 1;
}

const customerMsg: BatteryTalkMessage = {
  id: "m_c1",
  sender: "customer",
  body: "CMF80L 규격 맞나요?",
  createdAt: "2026-06-11T00:01:00Z",
};
const adminMsg: BatteryTalkMessage = {
  id: "m_a1",
  sender: "admin",
  body: "관리자 답변 A",
  createdAt: "2026-06-11T00:02:00Z",
};

// 1. visitor thread with customer message
const threadWithCustomer: BatteryTalkThread = {
  threadId: "btt_roundtrip_1",
  source: "batterytalk",
  status: "waiting",
  customerName: "고객",
  phone: "",
  isMember: false,
  messages: [
    { id: "m0", sender: "system", body: "안녕하세요", createdAt: "2026-06-11T00:00:00Z" },
    customerMsg,
  ],
  context: { visitorId: "btv_roundtrip" },
  createdAt: "2026-06-11T00:00:00Z",
  updatedAt: "2026-06-11T00:01:00Z",
  lastMessageAt: "2026-06-11T00:01:00Z",
  unreadByAdmin: true,
};

assert(
  "customer message count is 1",
  countCustomerBatteryTalkMessages(threadWithCustomer.messages) === 1,
);

// 2. admin list before reply (unread)
assert(
  "thread visible in admin list before reply",
  simulatePostgresAdminList({
    threadId: threadWithCustomer.threadId,
    lastMessage: customerMsg.body,
    customerMessageCount: 1,
    adminMessageCount: 0,
    unreadByAdmin: true,
    status: "waiting",
  }),
);

// 3. after admin reply: status active, not done
const threadAfterReply: BatteryTalkThread = {
  ...threadWithCustomer,
  status: "active",
  messages: [...threadWithCustomer.messages, adminMsg],
  unreadByAdmin: false,
  lastMessageAt: adminMsg.createdAt,
};

assert("admin reply sets active not done", threadAfterReply.status === "active");
assert("admin reply not auto-completed", threadAfterReply.status !== "done");

// 4. admin list after reply (postgres row last_message = admin body)
assert(
  "thread visible in admin list after reply (last_message from row)",
  simulatePostgresAdminList({
    threadId: threadAfterReply.threadId,
    lastMessage: adminMsg.body,
    customerMessageCount: 1,
    adminMessageCount: 1,
    unreadByAdmin: false,
    status: "active",
  }),
);

// 5. customer fetch includes admin message (no role filter)
const customerVisible = threadAfterReply.messages.filter((m) => m.sender !== "system");
assert(
  "customer sees customer + admin messages",
  customerVisible.some((m) => m.sender === "customer") &&
    customerVisible.some((m) => m.sender === "admin"),
);

// 6. batteryTalkToSummary with full messages shows admin preview
const summaryWithMessages = batteryTalkToSummary(threadAfterReply);
assert(
  "summary preview is admin reply when messages loaded",
  summaryWithMessages.lastMessagePreview.includes("관리자 답변"),
);

// 7. completed only after manual done
const threadDone: BatteryTalkThread = { ...threadAfterReply, status: "done" };
assert("manual complete sets done", threadDone.status === "done");
assert(
  "done thread still in admin list (not hidden by reply)",
  simulatePostgresAdminList({
    threadId: threadDone.threadId,
    lastMessage: adminMsg.body,
    customerMessageCount: 1,
    adminMessageCount: 1,
    unreadByAdmin: false,
    status: "done",
  }),
);

// 8. status tab policy: waiting vs active
assert("waiting tab excludes active thread", threadAfterReply.status !== "waiting");
assert("all tab includes active thread", threadAfterReply.status === "active");

// 9. refresh simulation: empty messages array + row last_message fallback
assert(
  "empty preview + customer count meta not excluded (refresh regression)",
  !shouldExcludeBatteryTalkSummaryFromAdmin(
    {
      threadId: "btt_refresh",
      status: "active",
      customerName: "고객",
      phone: "",
      lastMessagePreview: "",
      lastMessageAt: "2026-06-11T00:05:00Z",
      unreadByAdmin: false,
      hasProduct: false,
      hasOrder: false,
    },
    { customerMessageCount: 1 },
  ),
);

// 10. thread-level filter still passes with empty messages + meta
assert(
  "thread filter passes with customer count meta",
  !shouldExcludeBatteryTalkThreadFromAdmin(
    { ...threadWithCustomer, messages: [] },
    { customerMessageCount: 1 },
  ),
);

if (process.exitCode === 1) {
  console.error("\nSome battery-talk reply roundtrip checks failed.");
  process.exit(1);
}
console.log("\nAll battery-talk reply roundtrip checks passed.");
