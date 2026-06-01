# Battery Manager — 관리자 보호 / 인증 v1 (14차)

> **방식:** `ADMIN_ACCESS_KEY` (서버 env) + `/admin/login` + **httpOnly 세션 쿠키**  
> **미도입:** NextAuth, Supabase Auth, Firebase, `NEXT_PUBLIC_*` 관리자 키

---

## 1. 기존 구조 조사 (14차 이전)

| 항목 | 상태 |
|------|------|
| NextAuth / Supabase / Firebase | 없음 |
| middleware | `/search`, `/batteries` 캐시만 |
| admin/content, order-requests | URL `?key=` + **NEXT_PUBLIC_ADMIN_ACCESS_KEY** (노출 위험) |
| admin API | `?key=` / `x-admin-key` / Bearer |

---

## 2. 14차 선택 방식

1. **`ADMIN_ACCESS_KEY`** — `process.env` 서버 전용 (production 미설정 시 로그인 불가)
2. **`POST /api/admin/auth/login`** — 키 검증 후 `bm_admin_session` httpOnly 쿠키 (8시간)
3. **`middleware`** — `/admin/*` (login 제외) 세션 없으면 `/admin/login?next=` 리다이렉트
4. **관리자 API** — 쿠키 세션 또는 Bearer 세션 토큰; CI는 `x-admin-key` (env만)
5. **URL `?key=` 제거** — Referer/로그 유출 방지

---

## 3. 보호 대상

### 페이지
- `/admin`, `/admin/order-requests`, `/admin/content`, `/admin/inquiries`, `/admin/coupons`
- **공개:** `/admin/login`

### API
- `GET/PATCH /api/admin/order-requests*`
- `POST /api/admin/auth/login` (공개)
- `POST /api/admin/auth/logout` (쿠키 삭제)

### 고객 API (비보호)
- `POST /api/order-requests`
- `POST /api/order-requests/lookup` — requestNumber + phone

---

## 4. env 설정

```bash
# .env.local (커밋 금지)
ADMIN_ACCESS_KEY=your-strong-random-secret
```

`.env.example` 참고. **절대 `NEXT_PUBLIC_ADMIN_ACCESS_KEY` 사용 금지.**

---

## 5. 수동 검수

```bash
npm run dev

# 1) 비인증 — 리다이렉트
curl -sI http://localhost:3000/admin/order-requests

# 2) 로그인
curl -s -c cookies.txt -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"accessKey":"battery-manager-admin"}'

# 3) 인증 후 API
curl -s -b cookies.txt http://localhost:3000/api/admin/order-requests

# 4) 고객 lookup (200/404)
curl -s -X POST http://localhost:3000/api/order-requests/lookup \
  -H "Content-Type: application/json" \
  -d '{"requestNumber":"BM-...","phone":"010-..."}'

# 5) 비인증 admin API → 401
curl -s http://localhost:3000/api/admin/order-requests
```

---

## 6. 개인정보 점검 (14차)

- [x] 관리자 목록 연락처 마스킹
- [x] 고객 lookup — internalMemo/reviewFlags 미노출
- [x] API 401 응답 최소 정보 (`UNAUTHORIZED`)
- [x] 관리자 키 클라이언트 번들 미포함

---

## 7. 운영 전 교체 / 15차

- [ ] production `ADMIN_ACCESS_KEY` 강력 랜덤 값
- [ ] 정식 인증 (NextAuth 등) 후보 검토
- [ ] lookup/admin API rate limit
- [ ] HTTPS only cookie (`secure: true`)

---

## 8. 정식 인증 도입 후보

- NextAuth Credentials + DB 사용자
- 사내 SSO (OAuth)
- Vercel Protection + 별도 admin 서브도메인

---

*14차 · Battery Manager*
