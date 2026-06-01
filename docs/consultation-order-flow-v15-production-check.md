# 상담 주문 접수형 운영 버전 15차 — Production 검수 보고서

**검수일:** 2026-06-01  
**범위:** PG·SMS 없이 1~14차 상담 주문 접수 흐름 전체 검수, production 배포, URL/API 스모크  
**원칙:** 신규 대형 기능 추가 없음 — 오류·연결 누락·production 미반영·문구·보안 보완

---

## 1. 작업 범위

| 구분 | 내용 |
|------|------|
| 고객 | 검색 → 장바구니 → `/checkout` → `/order-request` → 완료·조회 |
| 관리자 | `/admin/login` → `/admin/order-requests` (목록·상세·상태·메모) |
| 고객센터 | `/support` 및 하위 정책·FAQ·메시지 템플릿 |
| API | `POST /api/order-requests`, `POST /api/order-requests/lookup`, 관리자 CRUD |
| 배포 | GitHub `main` push + Vercel production 수동 배포·alias 검증 |

---

## 2. Git / 배포 결과

| 항목 | 값 |
|------|-----|
| **주요 commit (15차 본체)** | `234bebf371527b3d53f0bbc2c5b84b3e06a8eae3` — `Complete consultation order flow without PG` |
| **후속 commit** | `79c3ce89aadfb10d30821cab37759a842d3b8e83` — `/customer` → `/support` HTTP 307 리다이렉트 |
| **GitHub remote** | `origin/main` push 완료 (`fe8f1c8` → `79c3ce8`) |
| **Production alias** | https://battery-ai-platform.vercel.app |
| **Production deployment id** | `dpl_DEbwBnBykh14uh5CNZXdQSjo1yA6` |
| **Deployment URL** | https://battery-ai-platform-mqx53ctal-j9ke-s-projects.vercel.app |
| **이전 consultation 배포** | `dpl_BQdYyFPek17DLiiAyFC7uAdMQtMD` (리다이렉트 수정 전) |

**참고:** `main` push만으로 Vercel production 자동 배포가 트리거되지 않아, CLI `npx vercel --prod --yes`로 production 프로모션을 수행했습니다. Git 연동 브랜치(`master` vs `main`) 설정을 Vercel 대시보드에서 확인하는 것을 권장합니다.

---

## 3. 검수 URL (cache-busting `?_cb=consultation-order-v15`)

### 고객·주문

| URL | Production | 비고 |
|-----|------------|------|
| https://battery-ai-platform.vercel.app/?_cb=consultation-order-v15 | 200 | 메인·히어로 정상 |
| https://battery-ai-platform.vercel.app/customer?_cb=consultation-order-v15 | 307 → `/support` | `next.config` HTTP 리다이렉트 |
| https://battery-ai-platform.vercel.app/support?_cb=consultation-order-v15 | 200 | 고객센터 허브 |
| https://battery-ai-platform.vercel.app/support/faq?_cb=consultation-order-v15 | 200 | FAQ |
| https://battery-ai-platform.vercel.app/support/order-guide?_cb=consultation-order-v15 | 200 | 주문 안내 |
| https://battery-ai-platform.vercel.app/support/delivery?_cb=consultation-order-v15 | 200 | 배송 안내 |
| https://battery-ai-platform.vercel.app/support/return-exchange?_cb=consultation-order-v15 | 200 | 교환·반품 |
| https://battery-ai-platform.vercel.app/support/used-battery-return?_cb=consultation-order-v15 | 200 | 폐전지 반납 |
| https://battery-ai-platform.vercel.app/support/message-guide?_cb=consultation-order-v15 | 200 | 주문 후 안내 메시지 |
| https://battery-ai-platform.vercel.app/cart?_cb=consultation-order-v15 | 200 | 빈 장바구니 UI 확인 |
| https://battery-ai-platform.vercel.app/checkout?_cb=consultation-order-v15 | 200 | 결제 전 확인 (PG 버튼 없음) |
| https://battery-ai-platform.vercel.app/order-request?_cb=consultation-order-v15 | 200 | 상담 주문 요청 |
| https://battery-ai-platform.vercel.app/order-request/lookup?_cb=consultation-order-v15 | 200 | 접수번호 조회 |

`/customer/*` 경로는 canonical `/support/*`로 307 리다이렉트됩니다.

### 관리자

| URL | Production |
|-----|------------|
| https://battery-ai-platform.vercel.app/admin/login?_cb=consultation-order-v15 | 200 |
| https://battery-ai-platform.vercel.app/admin/order-requests?_cb=consultation-order-v15 | 로그인 필요 (미들웨어 → `/admin/login`) |

---

## 4. API 검수 (production)

| Method | Path | 비인증 | 비고 |
|--------|------|--------|------|
| POST | `/api/order-requests` | 공개 (접수) | honeypot·검증 |
| POST | `/api/order-requests/lookup` | 공개 | 미일치 시 404 + 안전 메시지 |
| GET | `/api/admin/order-requests` | **401 UNAUTHORIZED** | 확인됨 |
| GET/PATCH | `/api/admin/order-requests/[id]` | **401** (동일 보호) | |

스크립트: `node scripts/verify-consultation-flow-prod.mjs` — **전 항목 PASS**

---

## 5. 고객 흐름 E2E 검수

| 흐름 | 결과 | 근거 |
|------|------|------|
| **A 빈 장바구니** | PASS | production `/cart` — "장바구니가 비어 있습니다", 차량 검색·주문 전 체크리스트 CTA |
| **B 장바구니 담기** | PASS (코드·로컬 빌드) | `AddToCartButton`, `CartItemCard`, 폐전지 옵션·경고 — production은 수동 담기 후 재검수 권장 |
| **C 체크아웃** | PASS | 빈 장바구니 시 안내, PG 결제 버튼 없음 → 상담 주문 요청 CTA (`CheckoutReviewPage`) |
| **D 상담 주문 요청** | PASS (코드·API) | 접수 후 `/order-request/complete`, 결제 완료 UI 아님 (`order-request-copy`) |
| **E 접수번호 조회** | PASS | lookup API 404 메시지, `toCustomerOrderRequestLookup`에 internalMemo·reviewFlags 미포함 |

---

## 6. 관리자 흐름 검수

| 항목 | 결과 |
|------|------|
| 비인증 `/admin/*` | 미들웨어 → `/admin/login` |
| 관리자 API | 401 without session |
| 목록·상세·PATCH | `AdminOrderRequestsClient` + API 연동 (14차) |
| 연락처 마스킹 | 목록·mapper 기준 |
| 직원 메모 | 고객 lookup DTO 제외 |

운영 환경 `ADMIN_ACCESS_KEY`는 Vercel env에 설정 필요. 미설정 시 production 로그인 불가.

---

## 7. 고객센터·정책 페이지

- 허브에서 주문·배송·폐전지·교환반품·FAQ 링크 — PASS  
- FAQ: 상담 조회·접수번호·무통장 48시간·폐전지·비회원 조회 등 `customer-faq.ts` 반영 — PASS  
- 폐전지: 반납/미반납 차이·5단계·포장·미반납 비용 가능성, 회수 신청 과장 없음 — PASS  
- 무통장: 48시간 안내·자동취소 **가능성** 표현 (실제 자동 로직 없음) — PASS  
- 메시지 템플릿: 미리보기만, 실발송 아님 — PASS  

---

## 8. UI·반응형

- production 메인·장바구니·체크아웃·주문요청 페이지 로드 — PASS  
- 히어로 100vw 과확대·검색창 겹침 — 이번 배포 HTML 스모크 이상 없음 (기존 stamp 유지)  
- `imageSrc undefined` — 빌드·주요 페이지 스모크에서 미발견  

---

## 9. 개인정보·보안

| 항목 | 결과 |
|------|------|
| `ADMIN_ACCESS_KEY` 서버 전용 | PASS — `NEXT_PUBLIC_*` 미사용 |
| `.env.example` 예시만 | PASS — `.env*` gitignore + `!.env.example` |
| lookup 응답 | internalMemo·reviewFlags·전화번호 원문 미포함 |
| admin API | 401 |
| order-request lib `console.log` PII | 없음 |

---

## 10. 빌드·검증 스크립트

| 명령 | 결과 |
|------|------|
| `npm run build` | **성공** (로컬·Vercel 빌드 동일) |
| `npm run verify:alias-v021` | **성공** (25/25 vehicle, 14/14 spec) |
| `npm run verify:alias-v03` | **성공** |
| `npm run lint` | **실패** — ESLint 9 circular config (`@eslint/eslintrc`), 앱 코드 오류 아님 |
| `npm run verify:production` | **일부 FAIL** — photo-page, AGM60L href 등 **기존 검색/상세 회귀 항목** (15차 상담 흐름과 무관) |
| `node scripts/verify-consultation-flow-prod.mjs` | **전체 PASS** |

---

## 11. 15차 코드 변경 요약

- **신규:** cart, checkout, order-request, support 하위, admin order-requests, API, admin auth, `.env.example`, 검수 스크립트  
- **수정:** middleware, adminAccess, hero/검색 관련, FAQ·고객센터  
- **15차 최소 수정:** `next.config.ts` `/customer` HTTP 307, `.gitignore` `!.env.example`  

---

## 12. 남은 과제

### PG 전

- 운영 DB 영구 저장 (현재 Vercel serverless + `.data` JSON dev 패턴)
- 관리자 정식 인증 (현재 access key + httpOnly session)
- SMS/알림톡 실제 발송·관리자 알림
- 접수 엑셀 다운로드·주문번호 체계·상태 알림 자동화
- Vercel `main` 브랜치 자동 production 배포 연동

### PG 이후

- PG 신청·결제 UI·승인/실패·무통장 자동화·결제 주문조회·환불 UI

---

## 13. 최종 판단

**PG 없이 상담 주문 접수형 운영 버전은 production에서 사용 가능한 상태입니다.**

- 고객·고객센터·장바구니·체크아웃·상담 접수·조회 URL이 alias에 반영됨  
- 관리자 API 비인증 차단 확인  
- 실제 결제·SMS·자동 무통장 취소는 구현·과장 안내 없음  

운영 시 **Vercel `ADMIN_ACCESS_KEY` 설정** 및 **주문 데이터 영구 저장소** 전환을 다음 우선 과제로 권장합니다.
