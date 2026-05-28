# PLATFORM-FINAL-V1 완료 보고서

**Build stamp:** `BM-UX-REV-20260528-PLATFORM-FINAL-V1`  
**Cache-busting query:** `platform-final-v1-20260528`  
**Production:** https://battery-ai-platform.vercel.app

---

## 1. 수정·추가 핵심 파일

| 영역 | 파일 |
|------|------|
| Stamp | `build-stamp.json`, `src/lib/build-stamp.ts`, `src/app/layout.tsx` |
| 허브 데이터 | `src/lib/platform-hub-routes.ts`, `src/lib/platform-hub-content.ts` |
| 허브 UI | `src/components/platform/hub/*` |
| 라우트 | `src/app/order-checklist/page.tsx`, `symptoms/page.tsx`, `photo-check/page.tsx`, `service/page.tsx` |
| 메인 | `src/components/home/HomePlatformTools.tsx`, `src/app/page.tsx`, `src/lib/home-upgrade-v2-data.ts` |
| 연결 | `SearchResultsView.tsx`, `BatteryDetailHub.tsx`, `CompareClient.tsx`, `GuidesHubClient.tsx`, `community/page.tsx`, `HomeOrderGuide.tsx`, `PortalHeaderNav.tsx`, `navigationGraph.ts`, `compare-utils.ts` |
| 검증 | `scripts/probe-production-stamp.mjs`, `scripts/probe-production-qna.mjs` |

---

## 2. 새 페이지 실제 경로

| 페이지 | 경로 |
|--------|------|
| 오주문 방지 체크리스트 | `/order-checklist` |
| 증상 진단 허브 | `/symptoms` |
| 사진 확인 안내 | `/photo-check` |
| 매장·택배 선택 | `/service` |
| 규격 비교 (고도화) | `/compare` (기존) |

기존 분석 도구 `/analysis/photo`, 매장 허브 `/service-center`는 유지. `/photo-check`는 **안내 페이지**(업로드 없음).

---

## 3–7. 페이지 구성 요약

### 오주문 방지 (`OrderChecklistClient`)
- 주문 전 5가지 체크 카드 (차종·연식·연료·ISG·사진)
- 단자 L/R, AGM/DIN/CMF, CMF80L≠80L, 90R/100R, 하이브리드·EV 섹션
- 사진 확인 필요 시점, 문의 전 준비, `COMPARE_PRESET`·검색·가이드 CTA

### 증상 진단 (`SymptomsHubClient`)
- 10개 증상 카드: 원인·배터리 가능성·바로 확인·추천 행동·검색 CTA·Q&A 링크
- `/diagnosis/[symptom]` 및 검색으로 연결

### 사진 확인 (`PhotoCheckClient`)
- 필요 시점, 촬영 5종, 피해야 할 촬영, 전송 전 확인, 차종 재확인 이유
- 아이콘형 placeholder (외부/AI 이미지 없음)

### 비교 센터 (`ComparePresetHub` + `CompareClient`)
- 90R vs 100R, 100R vs AGM95L, AGM70L vs AGM80L, AGM60L vs EV 12V, DIN74L vs CMF80L, AGM80L vs AGM95L, CMF80L vs 100R
- 단자 방향 경고 배지, 상세·비교 CTA, 오주문·사진 링크

### 매장·택배 (`ServiceHubClient`)
- 덕천·학장 내방, 부산 출장, 택배·자가장착, 사진 후 상담
- 상황별 추천 시나리오 카드

---

## 8. 네비게이션

- **Primary:** 통합검색, 차종검색, 규격 비교, 증상 진단
- **More 메뉴:** 오주문 방지, 사진 확인, 매장·택배, Q&A, 가이드 등 (헤더 과밀 방지)
- `navigationGraph` battery/search/compare/symptom/home 풀에 허브 URL 반영

---

## 9–12. 연결 방식

| 출발 | 연결 |
|------|------|
| 메인 | `HomePlatformTools`, `HomeOrderGuide`, hero chip → `/symptoms` |
| 검색 결과 | 하단 `PlatformHubLinks` |
| 배터리 상세 | 하단 `PlatformHubLinks` |
| Q&A | `community` 하단 `PlatformHubLinks` |
| 가이드 | 사이드바 플랫폼 허브 패널 |
| 비교 | `ComparePresetHub`, 오주문·사진 CTA |

---

## 13–15. 디자인·모바일·모션

- `HubBadge` (ok/warn/check/neutral), `bm.section-title`, 카드 radius/shadow 통일
- Primary/Secondary/Ghost CTA 구분, 파란 버튼 도배 완화
- 카드 hover·섹션 reveal 경량 (`design-tokens` / globals)
- viewport 390/430/768: 1열 카드, 가로 스크롤 없음, 터치 CTA 확보 (빌드·로컬 검수)

---

## 16–17. 기존 동작 유지

- 검색 매칭·`search-page-results` 로직 **미변경** (UI·navigation만)
- `/batteries/[code]` → `BatteryDetailHub` 구조 **유지**

---

## 18–22. Build stamp (배포 후 기입)

| 항목 | 값 |
|------|-----|
| Stamp | `BM-UX-REV-20260528-PLATFORM-FINAL-V1` |
| `data-build-rev` | `platform-final-v1` |
| Deployment ID | _(배포 후 업데이트)_ |
| 일반 URL stamp | _(curl 검증 후)_ |
| Cache-busting stamp | _(curl 검증 후)_ |

---

## 23. 검수용 링크 목록 (cache-busting)

**일반 URL** — `?_cb=platform-final-v1-20260528`  
**검색 URL** — `&_cb=platform-final-v1-20260528`

### 기존 페이지

- https://battery-ai-platform.vercel.app/?_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/search?q=포터2&_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/search?q=포터2%2020년식&_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/search?q=레이%20블랙박스%20방전&_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/search?q=100R%20vs%20AGM95L&_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/search?q=CMF80L&_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/batteries/CMF80L?_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/batteries/AGM60L?_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/batteries/100R?_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/batteries/AGM80L?_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/batteries/AGM95L?_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/batteries/DIN74L?_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/compare?_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/community?_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/guides?_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/vehicle/sportage-nq5?fuel=하이브리드&_cb=platform-final-v1-20260528

### 신규·고도화 페이지

- https://battery-ai-platform.vercel.app/order-checklist?_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/symptoms?_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/photo-check?_cb=platform-final-v1-20260528
- https://battery-ai-platform.vercel.app/service?_cb=platform-final-v1-20260528

---

## 24. 실패·수정 이력

| 항목 | 조치 |
|------|------|
| `SearchResultsView` 허브 미연결 | `PlatformHubLinks` 하단 추가 |
| `navigationGraph` 구 URL | 플랫폼 허브 URL로 교체, `home` 케이스 추가 |
| Build stamp ASSET 잔류 | `PLATFORM-FINAL-V1`로 일괄 갱신 |
| reports 실수 삭제 | `git restore reports/` 후 커밋 제외 |
