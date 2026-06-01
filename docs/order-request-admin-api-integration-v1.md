# Battery Manager — 관리자 주문 요청 API 연동 v1 (12차)

> **경로:** `/admin/order-requests?key={ADMIN_KEY}`  
> **API:** `GET/PATCH /api/admin/order-requests`, `GET/PATCH /api/admin/order-requests/[id]`  
> **선행:** [order-request-api-implementation-v1.md](./order-request-api-implementation-v1.md)

---

## 1. 연결 방식

| 영역 | 12차 동작 |
|------|-----------|
| 목록 | `GET /api/admin/order-requests` (필수 `?key=`) |
| 상세 | 선택 시 `GET /api/admin/order-requests/[id]` |
| 상태 | `PATCH` + optimistic update, 실패 시 롤백 |
| 직원 메모 | `PATCH` `internalMemo`, **저장 버튼** |
| reviewFlags | `PATCH` `reviewFlags`, 체크박스 + 저장 버튼 |
| 인증 | 페이지 `verifyAdminAccessKey` (content와 동일) + API `ADMIN_API_SECRET` |

---

## 2. 검색 / 필터

| 기능 | 구현 |
|------|------|
| 검색 `q` | API 서버 검색 + 클라이언트 추가 필터(상세 로드 전 필드) |
| 상태 필터 | `pending_review` 등 → API `status` 쿼리 |
| 수령·폐전지 필터 | **클라이언트** (`fulfillmentMethod`, `usedBatteryReturnOption`) |

**후속 API 확장:** `fulfillment`, `usedBattery`, `hasReviewFlags` 쿼리 파라미터.

---

## 3. localStorage fallback

| 모드 | 조건 |
|------|------|
| **API 전용 (기본)** | `?key=` 유효 시 |
| **개발 fallback** | `?key=...&fallback=local` — API 실패 시만 localStorage |

운영에서는 `fallback=local` 사용 금지 권장.

---

## 4. 개인정보 마스킹

| 위치 | 연락처 |
|------|--------|
| 목록 | `customerPhoneMasked` / `maskPhone()` |
| 상세 | 전체 번호 (관리자 API 인증 후) |

`console.log`에 고객 PII 출력 없음.

---

## 5. UI 상태

- 로딩: «관리자 주문 요청을 불러오는 중입니다.»
- 에러 + «다시 시도»
- 빈 목록 + `/order-request` 링크

---

## 6. 보안 (14차 ✅)

- [admin-auth-protection-v1.md](./admin-auth-protection-v1.md) — 세션 쿠키, `/admin/login`, `?key=` 제거

## 7. 남은 과제 (15차)

- [ ] Rate limit / audit log
- [ ] Vercel 프로덕션 영구 DB

---

## 7. 13차 제안

- 고객 접수번호 + lookup token 조회 (`GET /api/order-requests/[id]?token=`)
- 완료 화면에서 서버 접수 내역 요약

---

*12차 · Battery Manager*
