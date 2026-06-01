# Battery Manager — 주문 요청 API 11차 구현 v1

> **상태:** 11차 1차 운영 구조 완료 (PG·SMS·운영 DB 없음)  
> **설계:** [order-request-api-db-design-v1.md](./order-request-api-db-design-v1.md)

---

## 1. 저장 방식 (11차)

| 항목 | 내용 |
|------|------|
| 저장소 | `src/lib/order-request/order-request-store.ts` |
| 파일 | `.data/order-requests.json` (gitignore) |
| 메모리 | dev HMR용 `globalThis` 캐시 |
| 운영 | **Vercel serverless 부적합** — Supabase/Postgres로 교체 필요 |

**계층:**

- `order-request-store.ts` — read/write
- `order-request-service.ts` — create/list/get/update
- `order-request-validation.ts` — POST 검증
- `order-request-api.ts` — 영속 레코드 매핑
- `route.ts` — HTTP만

---

## 2. 구현 API

| Method | Path | 인증 | 역할 |
|--------|------|------|------|
| POST | `/api/order-requests` | 없음 | 상담 주문 생성 |
| GET | `/api/order-requests/[id]?token=` | token (12차) | 고객 조회 스텁 |
| GET | `/api/admin/order-requests` | admin key | 목록 (마스킹) |
| GET | `/api/admin/order-requests/[id]` | admin key | 상세 (전화번호 전체) |
| PATCH | `/api/admin/order-requests/[id]` | admin key | 상태·메모 |

**접수번호:** `BM-YYYYMMDD-NNNN` (당일 건수 +1, DB unique index 전 임시)

**관리자 키:** `ADMIN_API_SECRET` 또는 `ADMIN_ACCESS_KEY` — 헤더 `x-admin-key`, `?key=`, `Bearer`

**14차 예정:** 세션·RBAC, 공개 admin API 금지 유지

---

## 3. UI 연동

| 화면 | 변경 |
|------|------|
| `/order-request` | POST API 제출, honeypot, localStorage는 완료 백업 |
| `/order-request/complete` | `?requestNumber=` + 접수번호·결제 안내 문구 |
| `/admin/order-requests` | `?key=` 시 API 우선, 실패 시 localStorage |

---

## 4. 수동 API 검수

```bash
# 1) 개발 서버
npm run dev

# 2) 접수 (다른 터미널)
node scripts/test-order-request-api.mjs

# 3) 관리자 목록 (기본 키 battery-manager-admin)
curl "http://localhost:3000/api/admin/order-requests?key=battery-manager-admin"
```

---

## 5. 운영 전 교체 체크리스트

- [ ] Supabase 또는 Postgres + Drizzle/Prisma
- [ ] `order-request-store.ts` DB 구현체 교체
- [ ] `request_number` UNIQUE index
- [ ] `ADMIN_API_SECRET` 필수 (NEXT_PUBLIC 키 제거)
- [ ] Rate limit / Turnstile
- [ ] Vercel에서 `.data` 파일 쓰기 불가 → 반드시 외부 DB

---

## 6. 12차 ✅

- [order-request-admin-api-integration-v1.md](./order-request-admin-api-integration-v1.md) 참고
- 관리자 목록/상세/PATCH API 완전 연동, `?key=` 필수

## 7. 13차 제안

- 고객 접수번호 + lookup token 조회
- API 필터 확장 (fulfillment, usedBattery)

---

*11차 구현 · Battery Manager*
