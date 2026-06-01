# Battery Manager — 고객 접수번호 조회 v1 (13차)

> **URL:** `/order-request/lookup`  
> **API:** `POST /api/order-requests/lookup`  
> **구분:** 결제·배송 주문조회가 **아님** — 상담 주문 요청(consultation) 상태 조회

---

## 1. 조회 흐름

1. 고객이 `/order-request` 폼 제출 → 접수번호 발급
2. `/order-request/complete`에서 접수번호 확인·복사
3. `/order-request/lookup`에서 **접수번호 + 연락처** 입력
4. `POST /api/order-requests/lookup` → 고객 공개 DTO만 반환

연락처는 **POST body**만 사용 (query string 미사용).

---

## 2. API

### `POST /api/order-requests/lookup`

**Request:**

```json
{
  "requestNumber": "BM-20260530-0001",
  "phone": "010-1234-5678",
  "website": ""
}
```

**Success (200):**

```json
{ "ok": true, "lookup": { ...CustomerOrderRequestLookup } }
```

**Failure:** `404` — 통합 메시지 (번호만 맞고 연락처 틀림 등 세부 사유 미노출)

---

## 3. 공개 / 비공개 필드

| 공개 | 비공개 |
|------|--------|
| requestNumber, status, statusLabel, customerGuide | internalMemo |
| createdAt, updatedAt | reviewFlags |
| customerNameMasked | 서버 id |
| vehicleName, vehicleYear, batterySpecSummary | 전체 연락처 |
| productSummaries, usedBattery*, fulfillment* | confirmationsJson |
| storeLabel, region, preferredTime, customerMemo | |

`customerMemo` = 고객이 폼에 입력한 `memo`만.

---

## 4. 상태 라벨 (고객용)

| status | 고객 라벨 |
|--------|-----------|
| pending_review | 접수 확인 중 |
| contacted | 상담 연락 완료 |
| waiting_customer | 고객 확인 대기 |
| quoted | 안내 완료 |
| closed | 상담 종료 |
| canceled | 접수 취소 |

코드: `src/lib/order-request/order-request-customer-status.ts`

---

## 5. 고객센터 연동

- `CUSTOMER_CENTER_HUB_CARDS` — «상담 주문 요청 조회» 카드
- `CUSTOMER_SERVICE_FAQ_ITEMS` — 조회 카테고리 FAQ 3건
- 완료 화면 CTA — 조회·복사·고객센터

---

## 6. 개인정보 / 보안

- 목록·조회 응답에 전체 연락처 없음
- `console.log` PII 금지
- honeypot `website` (스팸)
- **14차:** rate limit, lookup 시도 제한

---

## 7. 14차 제안

- 관리자 인증·RBAC 강화
- lookup rate limit
- 운영 DB + lookup audit (성공/실패 카운트만)

---

*13차 · Battery Manager*
