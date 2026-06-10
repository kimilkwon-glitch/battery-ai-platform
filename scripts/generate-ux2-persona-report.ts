/**
 * UX2 운영검수 리포트 생성
 * npm run ux2:report
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import {
  UX2_ADMIN_MEMO,
  UX2_NAME_PREFIX,
  UX2_ORDER_TYPE,
  isUx2AdminReviewRecord,
} from "../src/lib/admin/ux2-admin-review-marker";
import {
  buildUx2Personas,
  storeLabel,
  ux2StoreDisplayLabel,
  type Ux2Persona,
} from "./ux2-persona-definitions";

function loadEnvLocal(): void {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvLocal();

const FULFILLMENT_LABELS: Record<string, string> = {
  delivery: "택배",
  visit_install: "출장교체",
  store_install: "매장교체",
  store_pickup_self: "매장수령",
};

function personaTableRow(p: Ux2Persona): string {
  const dataTypes = p.features.filter((f) => f !== "order").join("+") || "주문만";
  return `| ${p.id} | ${p.name} | ${p.maker} ${p.vehicle} | ${p.acquisitionChannel} | ${p.customerArchetype} | ${FULFILLMENT_LABELS[p.fulfillment] ?? p.fulfillment} | ${ux2StoreDisplayLabel(p)} | ${p.returnBattery === "no_return" ? "미반납" : "반납"} | ${p.orderStatus} | ${dataTypes} | ${p.priorityToday ? "Y" : ""} | ${p.phoneCallbackNeeded ? "Y" : ""} |`;
}

async function fetchDbCounts(): Promise<Record<string, unknown>> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return { dbConnected: false };

  const sql = neon(url);
  const orders = (await sql`
    SELECT order_number, customer_name, customer_phone, request_memo
    FROM commerce_orders WHERE order_number LIKE 'BM-UX2-%'
  `) as Array<{ order_number: string; customer_name: string; customer_phone: string; request_memo: string }>;

  const inquiries = (await sql`SELECT id, name, contact, admin_memo FROM customer_inquiries`) as Array<{
    name: string;
    contact: string;
    admin_memo: string | null;
  }>;
  const ux2Inq = inquiries.filter((i) =>
    isUx2AdminReviewRecord({ name: i.name, contact: i.contact, adminMemo: i.admin_memo }),
  );

  const sessions = (await sql`SELECT id, customer_phone, admin_memo FROM battery_talk_sessions`) as Array<{
    id: string;
    customer_phone: string;
    admin_memo: string | null;
  }>;
  const ux2Talk = sessions.filter((s) =>
    isUx2AdminReviewRecord({ phone: s.customer_phone, adminMemo: s.admin_memo }),
  );

  const claims = (await sql`SELECT id, order_number, customer_phone FROM commerce_claims`) as Array<{
    order_number: string;
    customer_phone: string;
  }>;
  const ux2Claims = claims.filter((c) =>
    isUx2AdminReviewRecord({ phone: c.customer_phone, orderNumber: c.order_number }),
  );

  return {
    dbConnected: true,
    ordersInDb: orders.length,
    orderNumbers: orders.map((o) => o.order_number).sort(),
    inquiriesInDb: ux2Inq.length,
    batteryTalkSessionsInDb: ux2Talk.length,
    claimsInDb: ux2Claims.length,
  };
}

async function main(): Promise<void> {
  const personas = buildUx2Personas();
  const db = await fetchDbCounts();
  const generatedAt = new Date().toISOString();

  const byMaker = new Map<string, number>();
  const byChannel = new Map<string, number>();
  const byFulfillment = new Map<string, number>();
  const byStore = new Map<string, number>();
  const byStatus = new Map<string, number>();

  for (const p of personas) {
    byMaker.set(p.maker, (byMaker.get(p.maker) ?? 0) + 1);
    byChannel.set(p.acquisitionChannel, (byChannel.get(p.acquisitionChannel) ?? 0) + 1);
    byFulfillment.set(p.fulfillment, (byFulfillment.get(p.fulfillment) ?? 0) + 1);
    byStore.set(ux2StoreDisplayLabel(p), (byStore.get(ux2StoreDisplayLabel(p)) ?? 0) + 1);
    byStatus.set(p.orderStatus, (byStatus.get(p.orderStatus) ?? 0) + 1);
  }

  const batteryTalk = personas.filter((p) => p.features.includes("battery_talk"));
  const inquiries = personas.filter((p) => p.features.includes("inquiry"));
  const productQna = personas.filter((p) => p.features.includes("product_qna"));
  const claims = personas.filter((p) => p.features.includes("claim"));
  const noReturn = personas.filter((p) => p.returnBattery === "no_return");

  const md = `# UX2 운영검수 30명 페르소나 — 관리자 검수 리포트

생성 시각: ${generatedAt}

## 1. 작업 요약

- UX2 운영검수용 30명 페르소나 정의 및 Postgres 시드 시스템 구축
- 식별자: \`BM-UX2-\`, \`${UX2_NAME_PREFIX}\`, \`010-9100-0001~0030\`, \`order_type:${UX2_ORDER_TYPE}\`, \`${UX2_ADMIN_MEMO}\`
- Toss/PG 결제 **미호출** — statusHistory에 시뮬레이션 메모 기록
- 기존 Postgres store 재사용 (commerce_orders, customer_inquiries, battery_talk, commerce_claims)

## 2. 삭제한 기존 파일/자료 목록

- \`scripts/ux-persona-definitions.ts\`
- \`scripts/seed-ux-persona-test.ts\`
- \`scripts/cleanup-ux-persona-test.ts\`
- \`scripts/verify-ux-persona-admin-filter.ts\`
- \`src/lib/admin/ux-persona-test-marker.ts\`
- \`screenshots/full-ux-audit/*\` (기존 UX 비주얼 캡처)
- package.json: \`ux:seed-personas\`, \`ux:cleanup-personas\` 명령 제거
- DB: 레거시 UX1 데이터 (BM-UX-, 010-9000) cleanup 완료

## 3. 새로 만든 파일 목록

| 파일 | 역할 |
|------|------|
| \`src/lib/admin/ux2-admin-review-marker.ts\` | UX2 식별자 공용 |
| \`scripts/ux2-persona-definitions.ts\` | 30명 페르소나 정의 |
| \`scripts/seed-ux2-admin-review.ts\` | DB 시드 |
| \`scripts/cleanup-ux2-admin-review.ts\` | dry-run cleanup |
| \`scripts/generate-ux2-persona-report.ts\` | 리포트 생성 |
| \`scripts/register-server-only.mjs\` | tsx server-only 우회 (재사용) |

## 4. npm 명령 목록

\`\`\`bash
npm run ux2:seed
npm run ux2:cleanup -- --dry-run
npm run ux2:cleanup
npm run ux2:report
npm run ux2:reset   # dry-run → cleanup → seed → report
\`\`\`

## 5. 30명 페르소나 전체 표

| ID | 이름 | 차량 | 유입 | 고객유형 | 수령 | 지점 | 미반납 | 주문상태 | 부가데이터 | 오늘우선 | 전화 |
|----|------|------|------|----------|------|------|--------|----------|------------|----------|------|
${personas.map(personaTableRow).join("\n")}

## 6. 제조사/차종 분산

${[...byMaker.entries()].map(([k, v]) => `- ${k}: ${v}명`).join("\n")}

## 7. 유입경로 분산

${[...byChannel.entries()].map(([k, v]) => `- ${k}: ${v}명`).join("\n")}

## 8. 수령방식 분산

${[...byFulfillment.entries()].map(([k, v]) => `- ${FULFILLMENT_LABELS[k] ?? k}: ${v}건`).join("\n")}

## 9. 지점/운영 분산

${[...byStore.entries()].map(([k, v]) => `- ${k}: ${v}건`).join("\n")}

## 10. 주문상태 분산

${[...byStatus.entries()].map(([k, v]) => `- ${k}: ${v}건`).join("\n")}

## 11. 미반납 고객 목록

${noReturn.map((p) => `- ${p.id} ${p.name} — ${p.vehicle} (${p.batteryCode})`).join("\n")}

## 12. 배터리톡 고객 목록 (${batteryTalk.length}건)

${batteryTalk.map((p) => `- ${p.id}: ${p.vehicle} — "${p.batteryTalkMessage?.slice(0, 60)}..."`).join("\n")}

## 13. 상담문의 고객 목록 (${inquiries.length}건)

${inquiries.map((p) => `- ${p.id}: ${p.inquiryMessage?.slice(0, 80)}`).join("\n")}

## 14. 상품문의 고객 목록 (${productQna.length}건)

${productQna.map((p) => `- ${p.id}: ${p.productQnaMessage?.slice(0, 80)}`).join("\n")}

## 15. 클레임 고객 목록 (${claims.length}건)

${claims.map((p) => `- ${p.id}: ${p.claimType} / ${p.claimReason} — ${p.claimMessage}`).join("\n")}

## 16. 관리자 화면 확인 방법

운영 관리자 로그인 후 아래 페이지에서 검색:

| 페이지 | URL |
|--------|-----|
| 주문관리 | \`/admin/orders\` |
| 문의관리 | \`/admin/inquiries\` |
| 상담문의 | \`/admin/inquiries?type=consultation\` |
| 클레임 | \`/admin/commerce-claims\` |
| 대시보드 | \`/admin\` |

### 주문관리 체크리스트

- [ ] 수령 방식(택배/출장/매장교체/매장수령) 구분 표시
- [ ] 지점(덕천점/학장점/미정) 표시
- [ ] 미반납 주문 식별 (adminMemo: 미반납)
- [ ] 클레임 연결 주문 (UX2-024~030) 확인
- [ ] 문의/배터리톡 동일 전화번호 연계 검색
- [ ] 오늘처리우선 / 전화콜백필요 adminMemo 확인

### 문의관리 체크리스트

- [ ] 배터리톡 / 상담문의 / 상품문의 탭 분리
- [ ] 동일 고객 전화번호로 주문 연계 검색
- [ ] 답변 대기(new) 상태 확인

### 클레임 체크리스트

- [ ] 취소/반품/교환 유형 구분
- [ ] 원 주문번호 BM-UX2-* 연결
- [ ] 미반납(battery_return) / 오주문(order_mistake) / 규격착오(wrong_spec) 사유

### 대시보드 체크리스트

- [ ] 신규/발주확인/상품준비 카운트에 UX2 주문 반영 여부
- [ ] 문의/클레임 카운트 과도한 숨김 없음
- [ ] UX2 데이터가 운영 통계를 왜곡하지 않는지 (테스트 식별자로 구분)

## 17. 검색어

- \`BM-UX2\`
- \`010-9100\`
- \`${UX2_NAME_PREFIX}\`
- \`${UX2_ADMIN_MEMO}\`
- \`UX2-001\` ~ \`UX2-030\`

## 18. cleanup dry-run 결과 예시

\`\`\`json
{
  "dryRun": true,
  "orders": 30,
  "orderNumbers": ["BM-UX2-YYYYMMDD-0001", "..."],
  "inquiries": 14,
  "batteryTalkSessions": 10,
  "claims": 5
}
\`\`\`

## 19. 실제 PG/Toss 미호출 확인

- seed 스크립트는 \`pgStoreCommerceOrderCreate\`만 호출
- paymentStatus는 DB 시뮬레이션 값만 설정
- statusHistory note: \`UX2 운영검수 시뮬레이션, PG/Toss 미호출\`

## 20. 운영 실데이터 보호 조건

cleanup 삭제 조건 (AND):

1. 전화 \`010-9100-0001\`~\`0030\` **필수**
2. AND (고객명 \`${UX2_NAME_PREFIX}\` OR 주문번호 \`BM-UX2-\` OR requestMemo \`order_type:${UX2_ORDER_TYPE}\` OR adminMemo \`${UX2_ADMIN_MEMO}\`)

010-9100 대역이지만 마커 불완전 → **ABORT exit 2**

## 21. 비주얼 캡처

**자동 캡처 불가:** 운영 admin은 프로덕션 세션 시크릿 필요 — 로컬 스크립트로 자동 로그인 불가.

### 수동 캡처 가이드

1. https://www.batterymanager.co.kr/admin 로그인
2. 검색 \`BM-UX2\` 후 스크린샷 → \`reports/ux2-screenshots/admin-orders.png\`
3. 주문 상세 1건 → \`admin-order-detail.png\`
4. \`/admin/inquiries\` → \`admin-inquiries.png\`
5. \`/admin/commerce-claims\` → \`admin-claims.png\`
6. \`/admin\` 대시보드 → \`admin-dashboard.png\`

## 22. 발견된 관리자 UX 문제 (검수 시 확인)

- UX2 고객명에 \`검수\` 문자열 포함 → 배포 전 admin-test-data-filter 예외 필수
- 주문-문의-클레임 크로스 링크 UI 부재 가능 → 전화번호 검색으로 우회
- 미반납/오늘우선은 adminMemo 텍스트 의존 → 전용 뱃지 개선 여지

## 23. 다음 개선 제안

- 관리자 주문 목록에 \`UX2_ADMIN_REVIEW\` 전용 필터 탭
- 동일 고객 주문·문의·클레임 통합 패널
- 미반납/전화콜백/오늘우선 뱃지 UI화

---

## DB 실측 (리포트 생성 시점)

\`\`\`json
${JSON.stringify(db, null, 2)}
\`\`\`

## 시나리오 요약 (persona별)

${personas.map((p) => `### ${p.id} — ${p.scenarioSummary}\n- 차량: ${p.maker} ${p.vehicle} ${p.year} ${p.fuel}\n- 배터리: ${p.batteryCode} (${p.specConfidence}${p.specNote ? `, ${p.specNote}` : ""})\n`).join("\n")}
`;

  const json = {
    generatedAt,
    identifiers: {
      orderPrefix: "BM-UX2-",
      namePrefix: UX2_NAME_PREFIX,
      phoneRange: "010-9100-0001 ~ 010-9100-0030",
      orderType: UX2_ORDER_TYPE,
      adminMemo: UX2_ADMIN_MEMO,
    },
    counts: {
      personas: personas.length,
      orders: personas.length,
      batteryTalk: batteryTalk.length,
      inquiries: inquiries.length,
      productQna: productQna.length,
      claims: claims.length,
      noReturn: noReturn.length,
    },
    distributions: {
      maker: Object.fromEntries(byMaker),
      channel: Object.fromEntries(byChannel),
      fulfillment: Object.fromEntries(byFulfillment),
      store: Object.fromEntries(byStore),
      orderStatus: Object.fromEntries(byStatus),
    },
    personas,
    db,
    adminChecklist: {
      searchTerms: ["BM-UX2", "010-9100", UX2_NAME_PREFIX, UX2_ADMIN_MEMO],
      pages: ["/admin/orders", "/admin/inquiries", "/admin/commerce-claims", "/admin"],
    },
  };

  mkdirSync("reports", { recursive: true });
  writeFileSync("reports/ux2-persona-admin-review.md", md, "utf8");
  writeFileSync("reports/ux2-persona-admin-review.json", JSON.stringify(json, null, 2), "utf8");
  console.log("Wrote reports/ux2-persona-admin-review.md");
  console.log("Wrote reports/ux2-persona-admin-review.json");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
