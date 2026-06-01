# Battery Manager — 주문 요청 API / DB 저장 구조 설계 v1 (10차)

> **상태:** 11차 API·JSON 개발 저장소 구현 완료. **운영 DB·14차 인증 강화는 후속.**  
> **구현 문서:** [order-request-api-implementation-v1.md](./order-request-api-implementation-v1.md)
> **코드:** `src/types/order-request.ts`, `src/lib/order-request/order-request-api.ts`, `src/app/api/order-requests/*`, `src/app/api/admin/order-requests/*`

---

## 1. 현재 localStorage 구조 요약 (8~9차)

| 키 | 용도 |
|----|------|
| `battery-manager-cart-v1` | 장바구니 (`BatteryCartItem[]`) |
| `battery-manager-order-request-draft-v1` | 폼 초안 |
| `battery-manager-last-order-request-v1` | 최근 접수 1건 |
| `battery-manager-order-requests-v1` | 접수 목록 배열 |
| `battery-manager-order-request-admin-meta-v1` | 관리자 상태·메모 |

**한계:** 브라우저별·기기별 분리, 백업/감사/권한 불가, 개인정보가 클라이언트에만 존재.

**유사 패턴:** `bm-inquiries-v1` (`InquiryRecord`), `coupon-storage` — 모두 **localStorage + admin 임시 화면**.

---

## 2. 기존 프로젝트 저장 구조 조사 결과 (10차)

### 2.1 API routes

| 경로 | 역할 |
|------|------|
| `src/app/api/qa/search-quality/route.ts` | 검색 QA (GET, in-memory 평가) |

**없음:** `pages/api`, `src/server`, Server Actions (`"use server"`).

**패턴:** Next.js App Router `route.ts`, `dynamic = "force-dynamic"`, `NextResponse.json`.

### 2.2 DB / ORM / 외부 저장소

| 항목 | 결과 |
|------|------|
| package.json | Prisma, Supabase, Drizzle, Mongo, Firebase **미설치** |
| 운영 DB | **없음** — JSON 파일 (`vehicle-battery-db.json`, admin content JSON) |
| docs | `DATA_REQUIREMENTS.md` — 차량/배터리 **정적 JSON** 우선 |

### 2.3 관리자 인증 / 권한

| 항목 | 결과 |
|------|------|
| NextAuth / middleware auth | **없음** |
| `middleware.ts` | `/search`, `/batteries` 캐시 헤더만 |
| `admin/content` | `?key=` + `NEXT_PUBLIC_ADMIN_ACCESS_KEY` (`adminAccess.ts`) |
| `admin/inquiries`, `coupons`, `order-requests` | URL 직접 접근, **보안 없음** (주석 명시) |

**원칙 (10차):** 관리자 API는 **11차에서도 공개 엔드포인트로 두지 않음**. 세션/키/서버 secret 검증 후 구현.

### 2.4 기존 문의·상담 데이터

| 모델 | 저장 | 관리 UI |
|------|------|---------|
| `InquiryRecord` | `bm-inquiries-v1` | `/admin/inquiries` |
| `CouponRecord` | coupon localStorage | `/admin/coupons` |
| `OrderRequest` (8차) | order-request keys | `/admin/order-requests` |

**병합 방향:** `Inquiry` = 일반 문의, `OrderRequest` = **장바구니 기반 상담 주문** (별도 테이블 권장). 필드 중복 최소화, 통합 inbox는 후순위.

---

## 3. 추천 데이터 모델 (운영 DB)

### 3.1 테이블 `order_requests` (정규화 + JSON 보조)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid / cuid | PK |
| `request_number` | text unique | 고객 표시용 `BM-OR-YYYYMMDD-####` |
| `status` | enum | 아래 상태값 |
| `customer_name` | text | |
| `customer_phone` | text | E.164 또는 정규화 저장 |
| `customer_email` | text nullable | |
| `vehicle_name` | text nullable | |
| `vehicle_year` | text nullable | |
| `vehicle_fuel_type` | text nullable | |
| `current_battery_spec` | text nullable | |
| `battery_spec_summary` | text | 목록용 요약 (복수 규격) |
| `terminal_direction` | text nullable | L/R/unknown |
| `used_battery_return_option` | enum | return / no_return / unknown |
| `fulfillment_method` | enum | delivery / store_pickup / visit_install / undecided |
| `store_id` | text nullable | deokcheon / hakjang |
| `requested_region` | text nullable | |
| `preferred_time` | text nullable | |
| `items_json` | jsonb | `BatteryCartItem[]` 스냅샷 |
| `memo` | text nullable | 고객 요청 |
| `internal_memo` | text nullable | 직원 메모 |
| `review_flags` | text[] / jsonb | enum 배열 |
| `confirmations_json` | jsonb | 8차 체크 4종 |
| `source` | text | web_form / admin_manual |
| `client_ip_hash` | text nullable | rate limit용 (원문 IP 저장 최소화) |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `contacted_at` | timestamptz nullable | |
| `closed_at` | timestamptz nullable | |

### 3.2 상태값 (운영 — 9차 UI와 매핑)

| DB `status` | 9차 `adminStatus` | 설명 |
|-------------|-------------------|------|
| `pending_review` | pending_review | 접수·확인 필요 |
| `contacted` | contacted | 연락 완료 |
| `waiting_customer` | — (신규) | 고객 회신 대기 |
| `quoted` | — (신규) | 견적 안내 |
| `closed` | closed | 종료 |
| `canceled` | canceled | 취소 |

8차 `prepared` → 제출 시 DB에는 **`pending_review`** 로 통일.

### 3.3 확인 필요 플래그 (`review_flags`)

- `vehicle_info_missing`
- `terminal_direction_unknown`
- `battery_spec_unknown`
- `used_battery_return_undecided`
- `visit_region_check_needed`
- `photo_check_needed`
- `phone_check_needed`

생성 시 서버에서 `items` + 폼 입력으로 **자동 계산** (클라이언트 신뢰 X).

### 3.4 TypeScript 매핑

- 클라이언트: `OrderRequest` (8차) — 유지
- API 입력: `CreateOrderRequestInput`
- DB/API 응답: `PersistedOrderRequest`, `AdminOrderRequestListItem`
- 정의: `src/types/order-request.ts` (10차 확장)

---

## 4. API route 설계

### 4.1 고객용

#### `POST /api/order-requests`

- **Body:** `CreateOrderRequestInput` (고객 정보, vehicle, fulfillment, items, confirmations, honeypot)
- **검증:** 아래 §5
- **처리:** requestNumber 발급, review_flags 계산, DB insert, **알림톡/SMS는 11차 이후**
- **응답 201:** `{ requestNumber, id, status, lookupToken? }`  
  - `lookupToken`: 단건 조회용 opaque token (선택, 11차)

#### `GET /api/order-requests/:id?token=`

- 고객 본인 확인용 (인증 없이 **token 필수**)
- 10차: 설계만, 구현 11차

### 4.2 관리자용 (보호 필수)

#### `GET /api/admin/order-requests`

- Query: `status`, `q`, `usedBattery`, `fulfillment`, `page`, `limit`
- 응답: `AdminOrderRequestListItem[]` (연락처 마스킹)

#### `GET /api/admin/order-requests/:id`

- 상세 (연락처 전체 — **인증된 관리자만**)

#### `PATCH /api/admin/order-requests/:id`

- Body: `UpdateOrderRequestInput` (status, internalMemo, reviewFlags)
- 감사: `updated_at`, optional `admin_user_id` (후순위)

### 4.3 10차 스캐폴드

실제 저장 없음. 모든 route는 **`503` + `NOT_IMPLEMENTED_PHASE_11`** (설계 문서 링크).  
`POST`는 body 스키마 검증만 수행해 **422** 반환 가능 (개발용).

---

## 5. 입력 검증 설계 (`POST`)

| 항목 | 규칙 |
|------|------|
| 연락처 | 필수, 한국 휴대폰 기본 패턴 (10~11자리) |
| 이름 | 선택 또는 필수 — **운영 정책: 이름 선택, 연락처 필수** |
| items | 1개 이상, 각 `batterySpec` 필수 |
| usedBatteryReturnOption | enum 필수 |
| fulfillment.method | enum 필수 |
| confirmations | 4개 모두 true |
| memo | max 2000자 |
| honeypot | 비어 있어야 함 (`website` 등 hidden) |
| rate limit | IP hash 기준 분당 N건 (11차) |

---

## 6. 관리자 UI ↔ API 연결 계획 (11차)

| 현재 (9차) | 11차 |
|------------|------|
| `listOrderRequestRecords()` | `GET /api/admin/order-requests` |
| `updateOrderRequestAdminMeta()` | `PATCH /api/admin/order-requests/:id` |
| localStorage meta | DB `status`, `internal_memo` |
| 새로고침 버튼 | SWR/React Query refetch |
| — | loading / error / empty UI 유지 |
| 목록 마스킹 | API list DTO에 `phoneMasked` |

**파일:** `AdminOrderRequestsClient.tsx` — fetch 레이어만 교체 (`order-request-admin-api.ts` 신규).

---

## 7. 고객 폼 ↔ API 연결 계획 (11차)

| 현재 (8차) | 11차 |
|------------|------|
| `saveLastOrderRequest()` | `POST /api/order-requests` |
| redirect complete | `?no={requestNumber}` |
| complete localStorage | GET by token 또는 sessionStorage 1회 |
| draft | localStorage 유지 (오프라인 초안) |
| 실패 | 폼 상단 에러 + 재시도 |

**파일:** `OrderRequestForm.tsx` — submit 핸들러만 교체.

---

## 8. 보안 / 개인정보

- 관리자 API: **서버 secret / 세션 / Vercel middleware** — 공개 금지
- 목록: `customerPhoneMasked` only
- 상세: 전체 phone — audit log 최소화
- 수집 최소화: 주소·주민번호·결제정보 **수집 안 함**
- honeypot + rate limit + (선택) Turnstile
- 로그: requestNumber + id만, phone 마스킹
- RLS (Supabase) 또는 row-level app check
- GDPR/개인정보처리방침 링크는 기존 고객센터와 연결 (UI 변경 없음)

---

## 9. 저장 방식 비교 및 추천

| 안 | 장점 | 단점 | 적합도 |
|----|------|------|--------|
| **A Supabase** | 빠른 CRUD, 대시보드, RLS | RLS·키 관리, 벤더 lock-in | ★★★ 소규모 운영 |
| **B Neon/Vercel Postgres + Drizzle** | 확장·마이그레이션 명확 | 초기 설정·마이그레이션 CI | ★★★ 장기 |
| **C 파일/mock** | 10차까지와 동일 | 운영 부적합 | 검수만 |

### 추천 (11차 결정용)

**1순위: Supabase (Postgres + RLS)** — 팀이 빠르게 admin·API 연동, 문의/주문 요청 테이블 분리.  
**2순위: Vercel Postgres + Drizzle** — 장기적으로 API·배치·리포트 확장 시.

**10차에서는 도입하지 않음.**

### 기존 JSON DB와의 관계

- 차량/배터리 **카탈로그** → JSON 유지 (읽기 전용)
- **트랜잭션 데이터** (주문 요청, 문의) → RDBMS 신규

---

## 10. 구현 단계별 계획

| 단계 | 내용 |
|------|------|
| **10차** ✅ | 본 문서, 타입 확장, API 스캐폴드 |
| **11차** ✅ | JSON store, POST/GET/PATCH, 폼·관리자 UI API 연동 (개발용) |
| **12차** | 운영 DB, rate limit, 관리자 UI API-only 정리 |
| **12차** | 관리자 인증 통합, 알림톡 템플릿 연동(발송), audit |
| **13차** | 결제/주문 본편 (PG 별도) |

---

## 11. 11차 작업 범위 제안

1. Supabase vs Neon **결정** (환경변수·스테이징)
2. `order_requests` 테이블 + enum
3. `POST /api/order-requests` — 실제 insert
4. `GET/PATCH /api/admin/order-requests` — admin guard (`ADMIN_API_SECRET` 최소)
5. `OrderRequestForm` → API submit
6. `AdminOrderRequestsClient` → API list/detail/patch
7. `requestNumber` 생성 유틸
8. localStorage → **마이그레이션 스크립트 선택** (수동 export만)

**11차에서 하지 않을 것:** PG, SMS 실발송, 공개 admin API, hero/alias/고객센터 UI 변경.

---

*작성: 10차 설계 · Battery Manager*
